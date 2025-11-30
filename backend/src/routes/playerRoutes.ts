import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendRegistrationEmail } from '../services/emailService';
import { generatePlayoffs } from '../utils/matchGenerator';
import { generateUniqueCode } from '../utils/codeGenerator';
import { generateKnockoutTournament } from '../utils/tournamentGenerator';

const router = Router();
const prisma = new PrismaClient();

// Register a new player
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, address, league, club } = req.body;

        // Check if email already exists
        const existingPlayerByEmail = await prisma.player.findUnique({
            where: { email },
        });

        if (existingPlayerByEmail) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Check if club is already registered by another player (case-insensitive)
        const clubTrimmed = club.trim();
        const allPlayers = await prisma.player.findMany({
            select: { club: true },
        });

        // Check if any existing player has the same club (case-insensitive comparison)
        const clubAlreadyTaken = allPlayers.some(player => 
            player.club && player.club.trim().toLowerCase() === clubTrimmed.toLowerCase()
        );

        if (clubAlreadyTaken) {
            return res.status(400).json({ 
                error: `The club "${club}" has already been registered by another player. Each club can only be registered once.` 
            });
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

// Get all registered clubs
router.get('/registered-clubs', async (req, res) => {
    try {
        const players = await prisma.player.findMany({
            select: {
                club: true,
            },
            where: {
                club: {
                    not: null,
                },
            },
        });

        // Extract unique clubs (normalized to lowercase for consistency)
        const registeredClubs = [...new Set(
            players
                .map(p => p.club?.trim())
                .filter(c => c && c !== '')
                .map(c => c!)
        )];
        
        res.json({ registeredClubs });
    } catch (error) {
        console.error('Error fetching registered clubs:', error);
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
// Only uses fully registered players (with all required fields including code)
router.get('/team-pairings', async (req, res) => {
    try {
        // Fetch all players from database
        const allPlayers = await prisma.player.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // STRICT FILTER: Only include players with ALL required registration fields
        // A registered player must have: firstName, lastName, email, address, league, club, and code
        const registeredPlayers = allPlayers.filter(player => {
            const hasFirstName = player.firstName && player.firstName.trim() !== '';
            const hasLastName = player.lastName && player.lastName.trim() !== '';
            const hasEmail = player.email && player.email.trim() !== '';
            const hasAddress = player.address && player.address.trim() !== '';
            const hasLeague = player.league && player.league.trim() !== '';
            const hasClub = player.club && player.club.trim() !== '';
            const hasCode = player.code && player.code.trim() !== '';
            
            // All fields must be present and non-empty
            return hasFirstName && hasLastName && hasEmail && hasAddress && hasLeague && hasClub && hasCode;
        });

        // Log for debugging
        console.log(`Total players: ${allPlayers.length}, Registered players: ${registeredPlayers.length}`);

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

        // Generate knockout tournament (each team plays once per stage, winners advance)
        if (teams.length < 2) {
            return res.json({ 
                rounds: [], 
                pairings: [], 
                total: 0,
                registeredPlayersCount: registeredPlayers.length,
                totalPlayersCount: allPlayers.length,
                teamsCount: teams.length
            });
        }

        // Generate knockout tournament bracket
        const tournamentResult = generateKnockoutTournament(teams);

        // Convert tournament stages to the expected format
        const rounds = tournamentResult.stages.map(stage => ({
            round: stage.stage,
            matchday: stage.stageName,
            matches: stage.matches.map(match => ({
                team1: match.team1,
                team2: match.team2 || {
                    club: 'Bye',
                    players: [],
                    league: ''
                },
                matchId: match.matchId,
                isBye: match.team2 === null
            }))
        }));

        // Flatten all pairings for backward compatibility
        const flatPairings = rounds.flatMap(r => r.matches.filter(m => !m.isBye));

        res.json({ 
            rounds: rounds,
            pairings: flatPairings, // Keep for backward compatibility
            total: tournamentResult.totalMatches,
            totalRounds: tournamentResult.totalStages,
            registeredPlayersCount: tournamentResult.registeredPlayersCount,
            totalPlayersCount: allPlayers.length,
            teamsCount: tournamentResult.teamsCount,
            tournamentType: 'knockout',
            message: `Generated knockout tournament with ${tournamentResult.totalMatches} matches across ${tournamentResult.totalStages} stages using ${tournamentResult.registeredPlayersCount} registered players from ${tournamentResult.teamsCount} teams`
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
