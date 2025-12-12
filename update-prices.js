const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePrices() {
    try {
        console.log('💰 Updating license prices...\n');

        // Check current licenses
        const licenses = await prisma.license.findMany({
            select: { id: true, name: true, defaultPrice: true }
        });

        console.log('Current licenses:');
        licenses.forEach(l => console.log(`  - ${l.name}: €${l.defaultPrice}`));
        console.log('');

        // Update by ID instead of name
        const unlimited = licenses.find(l => l.name === 'Unlimited Lease');
        const exclusive = licenses.find(l => l.name === 'Exclusive Rights');

        if (unlimited) {
            await prisma.license.update({
                where: { id: unlimited.id },
                data: { defaultPrice: 149.99 }
            });
            console.log(`✅ Updated ${unlimited.name}: €${unlimited.defaultPrice} → €149.99`);
        } else {
            console.log('⚠️  Unlimited Lease not found');
        }

        if (exclusive) {
            await prisma.license.update({
                where: { id: exclusive.id },
                data: { defaultPrice: 349.99 }
            });
            console.log(`✅ Updated ${exclusive.name}: €${exclusive.defaultPrice} → €349.99`);
        } else {
            console.log('⚠️  Exclusive Rights not found');
        }

        console.log('\n🎉 Prices updated!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

updatePrices();
