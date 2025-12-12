const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAccounts() {
    try {
        const accounts = await prisma.account.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        console.log('\n=== OAuth Accounts ===\n');

        if (accounts.length === 0) {
            console.log('❌ No OAuth accounts found!');
            console.log('\nThis means Google login is NOT saving accounts to database.');
            console.log('Possible issues:');
            console.log('- PrismaAdapter not working correctly');
            console.log('- Database connection issue');
            console.log('- Missing migration');
        } else {
            console.log(`Found ${accounts.length} OAuth account(s):\n`);
            accounts.forEach((acc, index) => {
                console.log(`${index + 1}. Provider: ${acc.provider}`);
                console.log(`   User Email: ${acc.user.email}`);
                console.log(`   User Name: ${acc.user.name}`);
                console.log(`   Account Type: ${acc.type}`);
                console.log();
            });
        }

        console.log('===================\n');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkAccounts();
