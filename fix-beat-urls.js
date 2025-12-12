// fix-beat-urls.js
// Fix the wrongURLs in existing beats

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WRONG_PREFIX = 'https://pub-7f7f591728479f321413f430b84d3af4.r2.dev/';
const CORRECT_PREFIX = process.env.R2_PUBLIC_URL + '/';

async function fixUrls() {
    try {
        console.log('🔧 Fixing beat URLs...\n');

        const beats = await prisma.beat.findMany();

        for (const beat of beats) {
            const updates = {};

            // Fix each URL field
            if (beat.cover && beat.cover.startsWith(WRONG_PREFIX)) {
                updates.cover = beat.cover.replace(WRONG_PREFIX, CORRECT_PREFIX);
            }

            if (beat.audio && beat.audio.startsWith(WRONG_PREFIX)) {
                updates.audio = beat.audio.replace(WRONG_PREFIX, CORRECT_PREFIX);
            }

            if (beat.taggedAudio && beat.taggedAudio.startsWith(WRONG_PREFIX)) {
                updates.taggedAudio = beat.taggedAudio.replace(WRONG_PREFIX, CORRECT_PREFIX);
            }

            if (beat.wav && beat.wav.startsWith(WRONG_PREFIX)) {
                updates.wav = beat.wav.replace(WRONG_PREFIX, CORRECT_PREFIX);
            }

            if (beat.stems && beat.stems.startsWith(WRONG_PREFIX)) {
                updates.stems = beat.stems.replace(WRONG_PREFIX, CORRECT_PREFIX);
            }

            // Update if there are changes
            if (Object.keys(updates).length > 0) {
                await prisma.beat.update({
                    where: { id: beat.id },
                    data: updates
                });
                console.log(`✅ Fixed URLs for beat: ${beat.title}`);
            }
        }

        console.log('\n🎉 All URLs fixed!\n');
        console.log('Now refresh the page (F5) and check if images/audio work.\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixUrls();
