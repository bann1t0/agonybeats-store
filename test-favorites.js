// Quick test to check beats in database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFavorites() {
    try {
        console.log('Fetching beats...');
        const beats = await prisma.beat.findMany({
            select: {
                id: true,
                title: true
            },
            take: 5
        });

        console.log(`Found ${beats.length} beats:`);
        beats.forEach(beat => {
            console.log(`  - ID: ${beat.id}, Title: ${beat.title}`);
        });

        if (beats.length === 0) {
            console.log('\n❌ No beats found in database!');
            console.log('Solution: Go to Admin panel and create some beats first.');
        } else {
            console.log('\n✅ Beats exist. Testing with first beat...');
            console.log(`Try favoriting beat with ID: ${beats[0].id}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testFavorites();
