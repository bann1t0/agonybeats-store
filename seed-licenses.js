const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedLicenses() {
    try {
        console.log('🎵 Creating beat licenses...\n');

        const licenses = [
            {
                name: 'MP3 Lease',
                defaultPrice: 29.99,
                features: '["MP3 Format (320kbps)","Up to 5,000 streams","Up to 2,000 downloads","1 music video","Non-exclusive rights","Credit required"]',
                isRecommended: false
            },
            {
                name: 'WAV Lease',
                defaultPrice: 49.99,
                features: '["WAV Format (uncompressed)","Trackout/Stems","Up to 20,000 streams","Up to 5,000 downloads","2 music videos","Non-exclusive rights","Credit required"]',
                isRecommended: true
            },
            {
                name: 'Premium Lease',
                defaultPrice: 99.99,
                features: '["WAV + MP3","Trackout/Stems","Up to 100,000 streams","Up to 10,000 downloads","5 music videos","Radio broadcasting","Credit required"]',
                isRecommended: false
            },
            {
                name: 'Unlimited Lease',
                defaultPrice: 199.99,
                features: '["WAV + MP3","Trackout/Stems","Unlimited streams","Unlimited downloads","Unlimited videos","Radio + TV","Paid performances","Credit optional"]',
                isRecommended: false
            },
            {
                name: 'Exclusive Rights',
                defaultPrice: 499.99,
                features: '["Full exclusive ownership","All formats","Trackout/Stems/MIDI","Unlimited everything","Beat removed from store","Contract included","No credit required"]',
                isRecommended: false
            }
        ];

        for (const license of licenses) {
            try {
                const created = await prisma.license.create({
                    data: license
                });
                console.log(`✅ ${created.name} - €${created.defaultPrice}`);
            } catch (e) {
                if (e.code === 'P2002') {
                    console.log(`⚠️  ${license.name} already exists, skipping...`);
                } else {
                    throw e;
                }
            }
        }

        console.log('\n🎉 Licenses setup complete!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

seedLicenses();
