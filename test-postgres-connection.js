// test-postgres-connection.js
// Quick test to verify PostgreSQL database connection

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
    console.log('🧪 Testing PostgreSQL connection...\n');

    try {
        // Test connection
        await prisma.$connect();
        console.log('✅ Successfully connected to PostgreSQL database!');

        // Count records
        const userCount = await prisma.user.count();
        const beatCount = await prisma.beat.count();
        const soundkitCount = await prisma.soundkit.count();
        const licenseCount = await prisma.license.count();

        console.log('\n📊 Database Stats:');
        console.log(`   Users: ${userCount}`);
        console.log(`   Beats: ${beatCount}`);
        console.log(`   Soundkits: ${soundkitCount}`);
        console.log(`   Licenses: ${licenseCount}`);

        console.log('\n🎉 PostgreSQL migration successful!');
        console.log('✅ Database is operational\n');

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
