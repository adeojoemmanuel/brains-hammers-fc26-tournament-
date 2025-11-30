interface Player {
    id: number;
    firstName: string;
    lastName: string;
    league: string;
    club: string;
}

interface Team {
    club: string;
    players: Player[];
    league: string;
}

interface TournamentMatch {
    matchId: string;
    team1: Team;
    team2: Team | null; // null for bye
    winner?: Team;
    stage: number;
    matchNumber: number;
}

interface TournamentStage {
    stage: number;
    stageName: string;
    matches: TournamentMatch[];
    isComplete: boolean;
}

interface TournamentResult {
    stages: TournamentStage[];
    totalStages: number;
    totalMatches: number;
    registeredPlayersCount: number;
    teamsCount: number;
}

/**
 * Generates a knockout tournament bracket
 * Each team plays only once per stage, winners advance to next stage
 */
export function generateKnockoutTournament(teams: Team[]): TournamentResult {
    if (teams.length < 2) {
        return {
            stages: [],
            totalStages: 0,
            totalMatches: 0,
            registeredPlayersCount: 0,
            teamsCount: teams.length,
        };
    }

    const stages: TournamentStage[] = [];
    let currentParticipants: (Team | null)[] = [...teams];
    let stageNumber = 1;
    let totalMatches = 0;

    // Shuffle teams for random pairing (optional, can be removed for deterministic pairing)
    const shuffled = [...currentParticipants];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    currentParticipants = shuffled;

    // Generate stages until we have a winner
    while (currentParticipants.length > 1) {
        const stageMatches: TournamentMatch[] = [];
        const nextStageParticipants: (Team | null)[] = [];
        let matchNumber = 1;

        // Pair up teams for this stage
        for (let i = 0; i < currentParticipants.length; i += 2) {
            const team1 = currentParticipants[i];
            const team2 = i + 1 < currentParticipants.length ? currentParticipants[i + 1] : null;

            if (team1) {
                const match: TournamentMatch = {
                    matchId: `stage-${stageNumber}-match-${matchNumber}`,
                    team1: team1,
                    team2: team2,
                    stage: stageNumber,
                    matchNumber: matchNumber,
                };

                stageMatches.push(match);

                // For knockout: winner advances (we'll simulate winner as team1 for now)
                // In a real system, you'd track actual match results
                if (team2) {
                    // Both teams play, winner advances (simulated as team1 for now)
                    nextStageParticipants.push(team1);
                } else {
                    // Bye - team1 advances automatically
                    nextStageParticipants.push(team1);
                }

                matchNumber++;
            }
        }

        const stageName = getStageName(stageNumber, currentParticipants.length);
        
        stages.push({
            stage: stageNumber,
            stageName: stageName,
            matches: stageMatches,
            isComplete: false, // Would be true when all matches have results
        });

        totalMatches += stageMatches.length;
        currentParticipants = nextStageParticipants;
        stageNumber++;
    }

    return {
        stages: stages,
        totalStages: stages.length,
        totalMatches: totalMatches,
        registeredPlayersCount: teams.reduce((sum, team) => sum + team.players.length, 0),
        teamsCount: teams.length,
    };
}

/**
 * Get a human-readable name for the tournament stage
 */
function getStageName(stageNumber: number, participantCount: number): string {
    if (participantCount === 2) {
        return 'Final';
    } else if (participantCount === 4) {
        return 'Semi-Finals';
    } else if (participantCount === 8) {
        return 'Quarter-Finals';
    } else if (participantCount <= 16) {
        return `Round of ${participantCount}`;
    } else {
        return `Stage ${stageNumber}`;
    }
}

