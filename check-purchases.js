const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPurchases() {
    try {
        console.log('🔍 Checking Purchase records...\n');

        const purchases = await prisma.purchase.findMany({
            take: 10,
            orderBy: { purchasedAt: 'desc' },
            include: {
                beat: { select: { title: true } },
                user: { select: { email: true, name: true } }
            }
        });

        console.log(`Found ${purchases.length} purchases:\n`);

        purchases.forEach((p, idx) => {
            console.log(`${idx + 1}. ${p.beat?.title || 'N/A'}`);
            console.log(`   User: ${p.user?.email || p.buyerEmail || 'N/A'}`);
            console.log(`   Amount: €${p.amount}`);
            console.log(`   Status: ${p.status}`);
            console.log(`   Date: ${p.purchasedAt}`);
            console.log('');
        });

        // Test analytics aggregation
        const totalRevenue = await prisma.purchase.aggregate({
            _sum: { amount: true },
            where: { status: 'completed' }
        });

        console.log('📊 Analytics Data:');
        console.log(`Total Revenue: €${totalRevenue._sum.amount || 0}`);
        console.log(`Total Purchases: ${purchases.length}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPurchases();
