const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAnalyticsQuery() {
    try {
        console.log('🧪 Testing Analytics Queries...\n');

        // Test 1: Simple count
        console.log('1. Testing Purchase count...');
        const count = await prisma.purchase.count();
        console.log(`   Result: ${count} purchases\n`);

        // Test 2: Count with status filter
        console.log('2. Testing Purchase count with status="completed"...');
        const completedCount = await prisma.purchase.count({
            where: { status: 'completed' }
        });
        console.log(`   Result: ${completedCount} completed purchases\n`);

        // Test 3: Aggregate sum
        console.log('3. Testing aggregate sum of amount...');
        const totalRevenue = await prisma.purchase.aggregate({
            _sum: { amount: true },
            where: { status: 'completed' }
        });
        console.log(`   Result:`, totalRevenue);
        console.log(`   Revenue: €${totalRevenue._sum.amount || 0}\n`);

        // Test 4: Find all purchases
        console.log('4. Finding all purchases...');
        const allPurchases = await prisma.purchase.findMany({
            take: 5,
            select: {
                id: true,
                amount: true,
                status: true,
                purchasedAt: true,
                beatId: true
            }
        });
        console.log(`   Found ${allPurchases.length} purchases:`);
        allPurchases.forEach(p => {
            console.log(`   - ID: ${p.id}, Amount: €${p.amount}, Status: ${p.status}`);
        });

        console.log('\n✅ All queries completed successfully!');

    } catch (error) {
        console.error('\n❌ Query failed:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAnalyticsQuery();
