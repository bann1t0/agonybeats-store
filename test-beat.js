const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Attempting to create a beat...");
    const beat = await prisma.beat.create({
        data: {
            title: "Test Beat",
            bpm: 140,
            key: "Cm",
            price: 29.99,
            cover: "/uploads/test.jpg",
            audio: "/uploads/test.mp3",
        },
    });
    console.log("Success! Created beat:", beat);
}

main()
    .catch(e => {
        console.error("Error creating beat:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
