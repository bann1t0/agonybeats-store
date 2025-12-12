// show-full-urls.js
// Show complete URLs for debugging

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showUrls() {
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

        console.log('\n📊 Beat:', beat.title);
        console.log('\n🔗 FULL URLs:\n');
        console.log('COVER URL:');
        console.log(beat.cover);
        console.log('\nAUDIO URL:');
        console.log(beat.audio);

        if (beat.wav) {
            console.log('\nWAV URL:');
            console.log(beat.wav);
        }

        console.log('\n\n💡 Test these URLs:');
        console.log('1. Copy the AUDIO URL above');
        console.log('2. Paste it in your browser');
        console.log('3. Check if it downloads/plays\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

showUrls();
