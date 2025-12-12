const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAdminRole() {
    try {
        console.log('🔧 Fixing admin role...\n');

        // Find current user (assuming email admin)
        const adminEmail = 'admin@agonybeats.com'; //  Change if different

        const user = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!user) {
            console.log(`❌ User not found: ${adminEmail}`);
            console.log('\nTrying to find any users...');
            const allUsers = await prisma.user.findMany({
                select: { id: true, email: true, role: true }
            });
            console.log('All users:', allUsers);
            return;
        }

        console.log(`Found user: ${user.email}`);
        console.log(`Current role: ${user.role || 'NOT SET'}\n`);

        if (user.role !== 'admin') {
            console.log('Setting role to "admin"...');
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'admin' }
            });
            console.log('✅ Role updated to admin!');
        } else {
            console.log('✅ User is already admin!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixAdminRole();
