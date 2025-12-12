// Test favorites API directly
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDirectFavorite() {
    try {
        // Get first beat
        const beat = await prisma.beat.findFirst();

        if (!beat) {
            console.log('❌ No beats in database');
            return;
        }

        console.log('✓ Testing with beat:', beat.id);
        console.log('  Title:', beat.title || '(no title)');

        // Get first user
        const user = await prisma.user.findFirst();

        if (!user) {
            console.log('❌ No users in database - you need to be logged in');
            return;
        }

        console.log('✓ Testing with user:', user.email);

        // Try to create favorite
        console.log('\nAttempting to create favorite...');
        const favorite = await prisma.favorite.create({
            data: {
                userId: user.id,
                beatId: beat.id
            }
        });

        console.log('✅ SUCCESS! Favorite created:', favorite.id);

        // Clean up
        await prisma.favorite.delete({
            where: { id: favorite.id }
        });
        console.log('✓ Cleanup complete');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('\nFull error:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testDirectFavorite();
