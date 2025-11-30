import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a unique alphanumeric code (1-9 and a-z, max 5 characters)
 * @returns A unique 5-character code
 */
export async function generateUniqueCode(): Promise<string> {
    // Characters: 1-9 (no 0) and a-z (lowercase)
    const chars = '123456789abcdefghijklmnopqrstuvwxyz';
    const codeLength = 5;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        // Generate random code
        let code = '';
        for (let i = 0; i < codeLength; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Check if code already exists
        const existing = await prisma.player.findUnique({
            where: { code },
        });

        if (!existing) {
            return code;
        }

        attempts++;
    }

    // Fallback: if we can't generate a unique code after max attempts,
    // append a random suffix (very unlikely scenario)
    const timestamp = Date.now().toString(36).slice(-2);
    let code = '';
    for (let i = 0; i < 3; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return (code + timestamp).slice(0, codeLength);
}

