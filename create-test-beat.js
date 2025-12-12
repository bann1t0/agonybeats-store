const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestBeat() {
    try {
        console.log('🎵 Creating test beat at €0...\n');

        const testBeat = await prisma.beat.create({
            data: {
                title: 'Test Beat FREE',
                artist: 'AgonyBeats',
                bpm: 140,
                key: 'C Minor',
                audio: '/placeholder-audio.mp3', // Placeholder
                cover: '/placeholder-cover.jpg', // Placeholder
                price: 0.00,
                tags: 'test, free, demo',
                isActive: true
            }
        });

        console.log('✅ Created test beat:', testBeat.title);
        console.log('   ID:', testBeat.id);
        console.log('   Price: €0.00');
        console.log('\n💡 You can now test the email system by purchasing this beat!');
        console.log('   It will trigger the order confirmation email with license attachment.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createTestBeat();
