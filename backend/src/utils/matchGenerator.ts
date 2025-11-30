interface Player {
    id: number;
    firstName: string;
    lastName: string;
    club: string;
}

interface Match {
    player1: string;
    player2: string;
}

interface PlayoffResult {
    round: string;
    matches: Match[];
    bye?: { player: string };
}

export const generatePlayoffs = (players: Player[], seed?: string): PlayoffResult => {
    // Simple randomization (Fisher-Yates shuffle)
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const matches: Match[] = [];
    let bye: { player: string } | undefined;

    if (shuffled.length % 2 !== 0) {
        const byePlayer = shuffled.pop();
        if (byePlayer) {
            bye = { player: `${byePlayer.firstName} ${byePlayer.lastName} – ${byePlayer.club}` };
        }
    }

    for (let i = 0; i < shuffled.length; i += 2) {
        const p1 = shuffled[i];
        const p2 = shuffled[i + 1];
        matches.push({
            player1: `${p1.firstName} ${p1.lastName} – ${p1.club}`,
            player2: `${p2.firstName} ${p2.lastName} – ${p2.club}`,
        });
    }

    return {
        round: 'Playoffs Round 1',
        matches,
        bye,
    };
};
