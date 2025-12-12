
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({ where: { isSubscribed: true } });
        const guests = await prisma.newsletterSubscriber.findMany();

        console.log('--- DB CHECK ---');
        console.log('Subscribed Users:', users.length, users);
        console.log('Guest Subscribers:', guests.length, guests);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
