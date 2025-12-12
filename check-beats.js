const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const beats = await prisma.beat.findMany();
    console.log('--- BEATS IN DB ---');
    beats.forEach(b => {
        console.log(`ID: ${b.id}, Title: ${b.title}, Audio: '${b.audio}'`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
