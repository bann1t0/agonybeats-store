// migrate-to-postgresql.js
// Script to migrate data from SQLite to PostgreSQL

const { PrismaClient: SQLiteClient } = require('@prisma/client');
const { PrismaClient: PostgresClient } = require('@prisma/client');

// Create two separate Prisma clients
// NOTE: This script expects you to temporarily switch between datasources

async function migrateData() {
    console.log('🚀 Starting SQLite to PostgreSQL migration...\n');

    try {
        // Step 1: Export data from SQLite
        console.log('📊 Step 1: Connecting to SQLite database...');
        process.env.DATABASE_URL = 'file:./dev.db';
        const sqliteDb = new SQLiteClient();

        console.log('📤 Exporting data from SQLite...');
        const users = await sqliteDb.user.findMany({ include: { accounts: true, sessions: true } });
        const beats = await sqliteDb.beat.findMany({ include: { licenses: true } });
        const soundkits = await sqliteDb.soundkit.findMany();
        const licenses = await sqliteDb.license.findMany({ include: { beats: true } });
        const discountCodes = await sqliteDb.discountCode.findMany();
        const newsletterSubscribers = await sqliteDb.newsletterSubscriber.findMany();

        console.log(`✅ Exported ${users.length} users`);
        console.log(`✅ Exported ${beats.length} beats`);
        console.log(`✅ Exported ${soundkits.length} soundkits`);
        console.log(`✅ Exported ${licenses.length} licenses`);
        console.log(`✅ Exported ${discountCodes.length} discount codes`);
        console.log(`✅ Exported ${newsletterSubscribers.length} newsletter subscribers\n`);

        await sqliteDb.$disconnect();

        // Step 2: Import to PostgreSQL
        console.log('📊 Step 2: Connecting to PostgreSQL database...');
        process.env.DATABASE_URL = process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_rp7LB2dCZvNS@ep-dawn-moon-agzvb48m-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
        const postgresDb = new PostgresClient();

        console.log('📥 Importing data to PostgreSQL...');

        // Import licenses first (no dependencies)
        console.log('Importing licenses...');
        for (const license of licenses) {
            await postgresDb.license.create({
                data: {
                    id: license.id,
                    name: license.name,
                    description: license.description,
                    defaultPrice: license.defaultPrice,
                    features: license.features,
                    order: license.order,
                    isRecommended: license.isRecommended,
                    createdAt: license.createdAt,
                    updatedAt: license.updatedAt,
                }
            });
        }
        console.log(`✅ Imported ${licenses.length} licenses`);

        // Import beats
        console.log('Importing beats...');
        for (const beat of beats) {
            await postgresDb.beat.create({
                data: {
                    id: beat.id,
                    title: beat.title,
                    bpm: beat.bpm,
                    key: beat.key,
                    price: beat.price,
                    cover: beat.cover,
                    audio: beat.audio,
                    taggedAudio: beat.taggedAudio,
                    wav: beat.wav,
                    stems: beat.stems,
                    genre: beat.genre,
                    artist: beat.artist,
                    isFeatured: beat.isFeatured,
                    createdAt: beat.createdAt,
                }
            });
        }
        console.log(`✅ Imported ${beats.length} beats`);

        // Import beat licenses relationships
        console.log('Importing beat-license relationships...');
        for (const beat of beats) {
            for (const beatLicense of beat.licenses) {
                await postgresDb.beatLicense.create({
                    data: {
                        id: beatLicense.id,
                        beatId: beatLicense.beatId,
                        licenseId: beatLicense.licenseId,
                        price: beatLicense.price,
                        active: beatLicense.active,
                    }
                });
            }
        }
        console.log(`✅ Imported beat-license relationships`);

        // Import users
        console.log('Importing users...');
        for (const user of users) {
            await postgresDb.user.create({
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    image: user.image,
                    password: user.password,
                    role: user.role,
                    isSubscribed: user.isSubscribed,
                    resetToken: user.resetToken,
                    resetTokenExpiry: user.resetTokenExpiry,
                }
            });
        }
        console.log(`✅ Imported ${users.length} users`);

        // Import accounts
        console.log('Importing OAuth accounts...');
        for (const user of users) {
            for (const account of user.accounts) {
                await postgresDb.account.create({
                    data: {
                        id: account.id,
                        userId: account.userId,
                        type: account.type,
                        provider: account.provider,
                        providerAccountId: account.providerAccountId,
                        refresh_token: account.refresh_token,
                        access_token: account.access_token,
                        expires_at: account.expires_at,
                        token_type: account.token_type,
                        scope: account.scope,
                        id_token: account.id_token,
                        session_state: account.session_state,
                    }
                });
            }
        }
        console.log(`✅ Imported OAuth accounts`);

        // Import soundkits
        console.log('Importing soundkits...');
        for (const soundkit of soundkits) {
            await postgresDb.soundkit.create({
                data: {
                    id: soundkit.id,
                    title: soundkit.title,
                    description: soundkit.description,
                    price: soundkit.price,
                    cover: soundkit.cover,
                    audioPreview: soundkit.audioPreview,
                    file: soundkit.file,
                    genre: soundkit.genre,
                    createdAt: soundkit.createdAt,
                }
            });
        }
        console.log(`✅ Imported ${soundkits.length} soundkits`);

        // Import discount codes
        console.log('Importing discount codes...');
        for (const code of discountCodes) {
            await postgresDb.discountCode.create({
                data: {
                    id: code.id,
                    code: code.code,
                    percentage: code.percentage,
                    uses: code.uses,
                    active: code.active,
                    createdAt: code.createdAt,
                }
            });
        }
        console.log(`✅ Imported ${discountCodes.length} discount codes`);

        // Import newsletter subscribers
        console.log('Importing newsletter subscribers...');
        for (const sub of newsletterSubscribers) {
            await postgresDb.newsletterSubscriber.create({
                data: {
                    id: sub.id,
                    email: sub.email,
                    createdAt: sub.createdAt,
                }
            });
        }
        console.log(`✅ Imported ${newsletterSubscribers.length} newsletter subscribers`);

        await postgresDb.$disconnect();

        console.log('\n🎉 Migration completed successfully!');
        console.log('✅ All data has been migrated from SQLite to PostgreSQL');
        console.log('\n📝 Next steps:');
        console.log('1. Verify data in PostgreSQL');
        console.log('2. Run: npm run dev');
        console.log('3. Test the application');
        console.log('4. Backup dev.db and delete it when confident\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run migration
migrateData();
