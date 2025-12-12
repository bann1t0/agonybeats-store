// check-beat-details.js
// Check the uploaded beat details including file URLs

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBeat() {
    try {
        const beats = await prisma.beat.findMany({
            orderBy: { createdAt: 'desc' },
            take: 1
        });

        if (beats.length === 0) {
            console.log('No beats found in database');
            return;
        }

        const beat = beats[0];

        console.log('📊 Latest Beat Details:\n');
        console.log(`Title: ${beat.title}`);
        console.log(`ID: ${beat.id}`);
        console.log(`\n📁 File Paths:`);
        console.log(`  Cover: ${beat.cover}`);
        console.log(`  Audio: ${beat.audio}`);
        console.log(`  Tagged Audio: ${beat.taggedAudio || 'N/A'}`);
        console.log(`  WAV: ${beat.wav || 'N/A'}`);
        console.log(`  Stems: ${beat.stems || 'N/A'}`);

        console.log(`\n🔍 URL Analysis:`);
        const isR2Url = (url) => url && (url.includes('.r2.dev') || url.includes('r2.cloudflarestorage.com'));

        console.log(`  Cover is R2 URL: ${isR2Url(beat.cover) ? '✅ Yes' : '❌ No (local path)'}`);
        console.log(`  Audio is R2 URL: ${isR2Url(beat.audio) ? '✅ Yes' : '❌ No (local path)'}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkBeat();
