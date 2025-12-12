const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                email: true,
                name: true,
                resetToken: true,
                resetTokenExpiry: true
            }
        });

        console.log('\n=== Users in Database ===');
        if (users.length === 0) {
            console.log('No users found!');
        } else {
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. Email: ${user.email}`);
                console.log(`   Name: ${user.name || 'N/A'}`);
                if (user.resetToken) {
                    console.log(`   Reset Token: ${user.resetToken}`);
                    console.log(`   Token Expiry: ${user.resetTokenExpiry}`);
                }
            });
        }
        console.log('\n========================\n');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
