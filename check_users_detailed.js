const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsersDetailed() {
    try {
        const users = await prisma.user.findMany({
            include: {
                accounts: true,
                sessions: true
            }
        });

        console.log('\n=== Detailed User Information ===\n');

        if (users.length === 0) {
            console.log('No users found!');
        } else {
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. USER DETAILS:`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Name: ${user.name || 'N/A'}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Has Password: ${user.password ? 'Yes (Email/Password)' : 'No (OAuth only)'}`);
                console.log(`   Email Verified: ${user.emailVerified || 'Not verified'}`);
                console.log(`   Subscribed: ${user.isSubscribed ? 'Yes' : 'No'}`);

                if (user.accounts && user.accounts.length > 0) {
                    console.log(`   Linked Accounts:`);
                    user.accounts.forEach(acc => {
                        console.log(`     - ${acc.provider} (${acc.type})`);
                    });
                } else {
                    console.log(`   Linked Accounts: None`);
                }

                console.log(`   Active Sessions: ${user.sessions?.length || 0}`);
            });
        }

        console.log('\n================================\n');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsersDetailed();
