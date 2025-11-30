import { PrismaClient } from '@prisma/client';
import { generateUniqueCode } from '../src/utils/codeGenerator';

const prisma = new PrismaClient();

// Sample data for 15 players with unique clubs
const playersData = [
    { firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', address: '123 Main St, London', league: 'Premier League', club: 'Arsenal' },
    { firstName: 'Emma', lastName: 'Johnson', email: 'emma.johnson@example.com', address: '456 Oak Ave, Manchester', league: 'Premier League', club: 'Liverpool' },
    { firstName: 'Michael', lastName: 'Williams', email: 'michael.williams@example.com', address: '789 Pine Rd, Birmingham', league: 'Premier League', club: 'Chelsea' },
    { firstName: 'Sarah', lastName: 'Brown', email: 'sarah.brown@example.com', address: '321 Elm St, Leeds', league: 'La Liga', club: 'Real Madrid' },
    { firstName: 'David', lastName: 'Jones', email: 'david.jones@example.com', address: '654 Maple Dr, Barcelona', league: 'La Liga', club: 'Barcelona' },
    { firstName: 'Lisa', lastName: 'Garcia', email: 'lisa.garcia@example.com', address: '987 Cedar Ln, Madrid', league: 'La Liga', club: 'Atlético Madrid' },
    { firstName: 'Robert', lastName: 'Miller', email: 'robert.miller@example.com', address: '147 Birch Way, Milan', league: 'Serie A', club: 'AC Milan' },
    { firstName: 'Jennifer', lastName: 'Davis', email: 'jennifer.davis@example.com', address: '258 Spruce St, Rome', league: 'Serie A', club: 'Inter Milan' },
    { firstName: 'William', lastName: 'Rodriguez', email: 'william.rodriguez@example.com', address: '369 Willow Ave, Turin', league: 'Serie A', club: 'Juventus' },
    { firstName: 'Amanda', lastName: 'Martinez', email: 'amanda.martinez@example.com', address: '741 Ash Blvd, Munich', league: 'Bundesliga', club: 'Bayern Munich' },
    { firstName: 'James', lastName: 'Hernandez', email: 'james.hernandez@example.com', address: '852 Poplar Rd, Dortmund', league: 'Bundesliga', club: 'Borussia Dortmund' },
    { firstName: 'Michelle', lastName: 'Lopez', email: 'michelle.lopez@example.com', address: '963 Fir St, Paris', league: 'Ligue 1', club: 'Paris Saint-Germain' },
    { firstName: 'Christopher', lastName: 'Wilson', email: 'christopher.wilson@example.com', address: '159 Oakwood Dr, Lyon', league: 'Ligue 1', club: 'Lyon' },
    { firstName: 'Jessica', lastName: 'Anderson', email: 'jessica.anderson@example.com', address: '357 Pinecrest Ave, Marseille', league: 'Ligue 1', club: 'Marseille' },
    { firstName: 'Daniel', lastName: 'Thomas', email: 'daniel.thomas@example.com', address: '468 Elmwood Ln, Monaco', league: 'Ligue 1', club: 'AS Monaco' },
];

async function insertPlayers() {
    try {
        console.log('Starting to insert 15 players...');
        
        for (const playerData of playersData) {
            // Check if email already exists
            const existing = await prisma.player.findUnique({
                where: { email: playerData.email },
            });

            if (existing) {
                console.log(`Player with email ${playerData.email} already exists, skipping...`);
                continue;
            }

            // Generate unique code
            const code = await generateUniqueCode();

            // Insert player
            const player = await prisma.player.create({
                data: {
                    firstName: playerData.firstName,
                    lastName: playerData.lastName,
                    email: playerData.email,
                    address: playerData.address,
                    league: playerData.league,
                    club: playerData.club,
                    code: code,
                },
            });

            console.log(`✓ Inserted: ${player.firstName} ${player.lastName} - ${player.club} (${player.league})`);
        }

        console.log('\n✅ Successfully inserted all players!');
        
        // Verify unique clubs
        const allPlayers = await prisma.player.findMany({
            select: { club: true },
        });
        
        const uniqueClubs = new Set(allPlayers.map(p => p.club));
        console.log(`\n📊 Total players: ${allPlayers.length}`);
        console.log(`📊 Unique clubs: ${uniqueClubs.size}`);
        console.log(`📊 Clubs: ${Array.from(uniqueClubs).join(', ')}`);
        
    } catch (error) {
        console.error('Error inserting players:', error);
    } finally {
        await prisma.$disconnect();
    }
}

insertPlayers();

