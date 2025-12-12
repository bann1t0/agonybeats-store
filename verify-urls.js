//verify-urls.js
// Verify the URLs are now correct

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    try {
        const beats = await prisma.beat.findMany({
            orderBy: { createdAt: 'desc' },
            take: 1
        });

        if (beats.length === 0) {
            console.log('No beats found');
            return;
        }

        const beat = beats[0];
        const correctUrl = process.env.R2_PUBLIC_URL;

        console.log(`\n✅ Verification for: ${beat.title}\n`);
        console.log(`Expected URL prefix: ${correctUrl}/uploads/\n`);

        console.log('COVER:');
        console.log(beat.cover);
        console.log(beat.cover.startsWith(correctUrl) ? '✅ CORRECT' : '❌ WRONG');

        console.log('\nAUDIO:');
        console.log(beat.audio);
        console.log(beat.audio.startsWith(correctUrl) ? '✅ CORRECT' : '❌ WRONG');

        if (beat.wav) {
            console.log('\nWAV:');
            console.log(beat.wav);
            console.log(beat.wav.startsWith(correctUrl) ? '✅ CORRECT' : '❌ WRONG');
        }

        console.log('\n📝 Next steps:');
        console.log('1. Refresh the page in your browser (F5)');
        console.log('2. Check if images load');
        console.log('3. Try playing audio\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
