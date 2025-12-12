const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const deleteUser = await prisma.user.deleteMany({
        where: {
            email: 'andreadelfoco5@gmail.com',
        },
    });
    console.log("Deleted users:", deleteUser);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
