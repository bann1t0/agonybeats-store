// Check admin account in database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
    try {
        const admin = await prisma.user.findFirst({
            where: { role: 'admin' },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true
            }
        });

        if (!admin) {
            console.log('❌ No admin account found in database!');
            console.log('Create one with: npm run create-admin');
        } else {
            console.log('✅ Admin account found:');
            console.log('Email:', admin.email);
            console.log('Name:', admin.name);
            console.log('Password hash exists:', !!admin.password);
            console.log('Hash length:', admin.password?.length || 0);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmin();
