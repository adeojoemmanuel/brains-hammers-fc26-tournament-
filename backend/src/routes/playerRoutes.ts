import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendRegistrationEmail } from '../services/emailService';
import { generatePlayoffs } from '../utils/matchGenerator';
import { generateUniqueCode } from '../utils/codeGenerator';

const router = Router();
const prisma = new PrismaClient();

// Register a new player
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, address, league, club } = req.body;

        // Check if email already exists
        const existingPlayer = await prisma.player.findUnique({
            where: { email },
        });

        if (existingPlayer) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Generate unique code
        const code = await generateUniqueCode();

        const player = await prisma.player.create({
            data: {
                firstName,
                lastName,
                email,
                address,
                league,
                club,
                code,
            },
        });

        // Send email (fire and forget) with code
        sendRegistrationEmail(email, `${firstName} ${lastName}`, code);

        res.status(201).json({ message: 'Registration successful', player });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all players (paginated)
router.get('/players', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [players, total] = await prisma.$transaction([
            prisma.player.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.player.count(),
        ]);

        res.json({
            players,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate playoffs
router.get('/playoffs', async (req, res) => {
    try {
        const players = await prisma.player.findMany();
        const result = generatePlayoffs(players);
        res.json(result);
    } catch (error) {
        console.error('Error generating playoffs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get team pairings (grouped by club, avoiding duplicates)
router.get('/team-pairings', async (req, res) => {
    try {
        // Fetch only registered players with complete data
        const allPlayers = await prisma.player.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // Filter to only include players with all required registration fields
        const registeredPlayers = allPlayers.filter(player => {
            return (
                player.firstName &&
                player.firstName.trim() !== '' &&
                player.lastName &&
                player.lastName.trim() !== '' &&
                player.email &&
                player.email.trim() !== '' &&
                player.address &&
                player.address.trim() !== '' &&
                player.league &&
                player.league.trim() !== '' &&
                player.club &&
                player.club.trim() !== '' &&
                player.code &&
                player.code.trim() !== ''
            );
        });

        // Group players by club - ensure each player is only added to their own club
        const teamsMap = new Map<string, Array<{ id: number; firstName: string; lastName: string; league: string; club: string }>>();
        
        registeredPlayers.forEach(player => {
            const club = player.club.trim();
            // Only process if club is not empty
            if (club) {
                if (!teamsMap.has(club)) {
                    teamsMap.set(club, []);
                }
                // Add player only to their own club
                teamsMap.get(club)!.push({
                    id: player.id,
                    firstName: player.firstName.trim(),
                    lastName: player.lastName.trim(),
                    league: player.league.trim(),
                    club: club,
                });
            }
        });

        // Convert to array of teams, filtering out teams with no registered players
        // Only include teams that have at least one registered player
        const teams = Array.from(teamsMap.entries())
            .map(([club, players]) => {
                const clubTrimmed = club.trim();
                // Filter players to ensure they belong ONLY to this specific club
                const validPlayers = players
                    .filter(p => {
                        // Ensure player has all required fields AND their club matches this team's club exactly
                        return p.id && 
                               p.firstName && 
                               p.lastName && 
                               p.club && 
                               p.league &&
                               p.club.trim() === clubTrimmed; // Critical: player's club must match team's club
                    })
                    .map(p => ({
                        id: p.id,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        league: p.league,
                        club: p.club,
                    }));
                
                return {
                    club: clubTrimmed,
                    players: validPlayers,
                    league: validPlayers[0]?.league || '',
                };
            })
            .filter(team => {
                // Only include teams with at least one valid registered player
                return team.players.length > 0 && 
                       team.club.trim() !== '' &&
                       team.players.every(p => p.club === team.club);
            });

        // Generate round-robin tournament schedule (each team plays every other team exactly once)
        // Organize matches into rounds/matchdays like professional football leagues
        
        if (teams.length < 2) {
            return res.json({ rounds: [], pairings: [], total: 0 });
        }

        // Create all unique pairings (each team plays every other team once)
        const allPairings: Array<{
            team1: { club: string; players: Array<{ id: number; firstName: string; lastName: string; league: string; club: string }>; league: string };
            team2: { club: string; players: Array<{ id: number; firstName: string; lastName: string; league: string; club: string }>; league: string };
        }> = [];

        // Generate all unique pairings without duplicates
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const team1 = teams[i];
                const team2 = teams[j];
                
                // Only create pairings for teams with registered players
                if (team1.players.length > 0 && 
                    team2.players.length > 0 &&
                    team1.club.trim() !== '' &&
                    team2.club.trim() !== '' &&
                    team1.club !== team2.club) {
                    
                    // Create deep copies of teams to avoid reference sharing
                    const team1Copy = {
                        club: team1.club,
                        players: team1.players.map(p => ({
                            id: p.id,
                            firstName: p.firstName,
                            lastName: p.lastName,
                            league: p.league,
                            club: p.club,
                        })),
                        league: team1.league,
                    };
                    
                    const team2Copy = {
                        club: team2.club,
                        players: team2.players.map(p => ({
                            id: p.id,
                            firstName: p.firstName,
                            lastName: p.lastName,
                            league: p.league,
                            club: p.club,
                        })),
                        league: team2.league,
                    };
                    
                    allPairings.push({ team1: team1Copy, team2: team2Copy });
                }
            }
        }

        // Organize pairings into rounds using round-robin algorithm (circle method)
        // Each team plays every other team exactly once, organized into matchdays
        const rounds: Array<{
            round: number;
            matchday: string;
            matches: Array<{
                team1: { club: string; players: Array<{ id: number; firstName: string; lastName: string; league: string; club: string }>; league: string };
                team2: { club: string; players: Array<{ id: number; firstName: string; lastName: string; league: string; club: string }>; league: string };
            }>;
        }> = [];

        const numTeams = teams.length;
        
        if (numTeams < 2) {
            return res.json({ rounds: [], pairings: [], total: 0 });
        }

        // Create a map for quick pairing lookup
        const pairingMap = new Map<string, {
            team1: { club: string; players: Array<{ id: number; firstName: string; lastName: string; league: string; club: string }>; league: string };
            team2: { club: string; players: Array<{ id: number; firstName: string; lastName: string; league: string; club: string }>; league: string };
        }>();
        
        allPairings.forEach(pairing => {
            const key = [pairing.team1.club, pairing.team2.club].sort().join('|');
            pairingMap.set(key, pairing);
        });

        // Round-robin algorithm: For n teams, we need n-1 rounds (if even) or n rounds (if odd)
        const numRounds = numTeams % 2 === 0 ? numTeams - 1 : numTeams;
        const matchesPerRound = Math.floor(numTeams / 2);
        
        // Create team indices array for scheduling (circle method)
        const teamIndices = teams.map((_, idx) => idx);
        
        // Generate rounds using circle method (Berger pairing)
        for (let round = 0; round < numRounds; round++) {
            const roundMatches: Array<{
                team1: { club: string; players: Array<{ id: number; firstName: string; lastName: string; league: string; club: string }>; league: string };
                team2: { club: string; players: Array<{ id: number; firstName: string; lastName: string; league: string; club: string }>; league: string };
            }> = [];
            
            // Circle method: Pair teams
            // For even number of teams: pair team[0] with team[n-1], team[1] with team[n-2], etc.
            // For odd number of teams: one team gets a bye (we'll skip team[0] in this case)
            const isEven = numTeams % 2 === 0;
            const startIdx = isEven ? 0 : 1;
            
            for (let i = 0; i < matchesPerRound; i++) {
                const idx1 = teamIndices[startIdx + i];
                const idx2 = teamIndices[numTeams - 1 - i];
                
                // Skip if indices are invalid
                if (idx1 >= teams.length || idx2 >= teams.length || idx1 === idx2) {
                    continue;
                }
                
                const team1 = teams[idx1];
                const team2 = teams[idx2];
                
                // Find the pairing for these two teams
                const pairKey = [team1.club, team2.club].sort().join('|');
                const pairing = pairingMap.get(pairKey);
                
                if (pairing) {
                    roundMatches.push(pairing);
                }
            }
            
            // Rotate teams for next round (circle method)
            // Keep first team fixed (or skip for odd), rotate the rest clockwise
            if (isEven) {
                // For even: rotate all except first
                const last = teamIndices.pop();
                if (last !== undefined) {
                    teamIndices.splice(1, 0, last);
                }
            } else {
                // For odd: rotate all teams
                const last = teamIndices.pop();
                if (last !== undefined) {
                    teamIndices.splice(0, 0, last);
                }
            }
            
            if (roundMatches.length > 0) {
                rounds.push({
                    round: round + 1,
                    matchday: `Matchday ${round + 1}`,
                    matches: roundMatches,
                });
            }
        }

        // Flatten all pairings for backward compatibility
        const flatPairings = rounds.flatMap(r => r.matches);

        res.json({ 
            rounds: rounds,
            pairings: flatPairings, // Keep for backward compatibility
            total: flatPairings.length,
            totalRounds: rounds.length
        });
    } catch (error) {
        console.error('Error fetching team pairings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Clear all players from the database
router.delete('/clear-all', async (req, res) => {
    try {
        const result = await prisma.player.deleteMany({});
        res.json({ 
            message: 'All players cleared successfully',
            deletedCount: result.count 
        });
    } catch (error) {
        console.error('Error clearing database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
