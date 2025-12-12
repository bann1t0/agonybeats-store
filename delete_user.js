const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUser() {
    const emailToDelete = 'andrea.delfoco@itsrizzoli.it';

    try {
        // First, check if user exists
        const user = await prisma.user.findUnique({
            where: { email: emailToDelete }
        });

        if (!user) {
            console.log(`❌ User ${emailToDelete} not found in database.`);
            return;
        }

        console.log(`\nFound user: ${user.email} (ID: ${user.id})`);
        console.log(`Deleting user...`);

        // Delete the user (will cascade delete accounts and sessions)
        await prisma.user.delete({
            where: { email: emailToDelete }
        });

        console.log(`✅ User ${emailToDelete} deleted successfully!\n`);
        console.log('You can now try logging in with Google again.');

    } catch (error) {
        console.error('❌ Error deleting user:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

deleteUser();
