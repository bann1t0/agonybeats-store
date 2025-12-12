const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateLicenseFeatures() {
    try {
        console.log('📝 Updating license features to include stems...\n');

        const licenses = await prisma.license.findMany({
            select: { id: true, name: true }
        });

        for (const license of licenses) {
            let features = [];

            switch (license.name) {
                case 'MP3 Lease':
                    features = [
                        'MP3 Format (320kbps)',
                        'Trackout/Stems included',
                        'Up to 5,000 streams',
                        'Up to 2,000 downloads',
                        '1 music video',
                        'Non-exclusive rights',
                        'Credit required'
                    ];
                    break;

                case 'WAV Lease':
                    features = [
                        'WAV Format (uncompressed)',
                        'Trackout/Stems included',
                        'Up to 20,000 streams',
                        'Up to 5,000 downloads',
                        '2 music videos',
                        'Non-exclusive rights',
                        'Credit required'
                    ];
                    break;

                case 'Premium Lease':
                    features = [
                        'WAV + MP3 Formats',
                        'Trackout/Stems included',
                        'Up to 100,000 streams',
                        'Up to 10,000 downloads',
                        '5 music videos',
                        'Radio broadcasting rights',
                        'Non-exclusive rights',
                        'Credit required'
                    ];
                    break;

                case 'Unlimited Lease':
                    features = [
                        'WAV + MP3 Formats',
                        'Trackout/Stems included',
                        'Unlimited streams',
                        'Unlimited downloads',
                        'Unlimited music videos',
                        'Radio + TV broadcasting',
                        'Paid performances allowed',
                        'Non-exclusive rights',
                        'Credit optional'
                    ];
                    break;

                case 'Exclusive Rights':
                    features = [
                        'Full exclusive ownership',
                        'All formats (WAV, MP3, MIDI)',
                        'Trackout/Stems included',
                        'Unlimited everything',
                        'Beat removed from store',
                        'Contract agreement included',
                        'No credit required',
                        'Publishing royalties negotiable'
                    ];
                    break;
            }

            if (features.length > 0) {
                await prisma.license.update({
                    where: { id: license.id },
                    data: { features: JSON.stringify(features) }
                });
                console.log(`✅ Updated ${license.name}`);
            }
        }

        console.log('\n🎉 All licenses updated with stems!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

updateLicenseFeatures();
