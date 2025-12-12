// test-r2-list-buckets.js
// Test if credentials can list buckets

require('dotenv').config();

const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

console.log('🔍 Testing R2 Credentials by Listing Buckets...\n');

const client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

async function listBuckets() {
    try {
        const command = new ListBucketsCommand({});
        const response = await client.send(command);

        console.log('✅ Credentials are valid!\n');
        console.log('📦 Available buckets:');

        if (response.Buckets && response.Buckets.length > 0) {
            response.Buckets.forEach(bucket => {
                console.log(`   - ${bucket.Name}`);
            });
        } else {
            console.log('   (No buckets found)');
        }

        console.log('\n✅ Test passed! Credentials work.\n');

    } catch (error) {
        console.error('❌ Failed to list buckets:', error.message);
        console.error('\nThis means the credentials are invalid or don\'t have permissions.\n');
        process.exit(1);
    }
}

listBuckets();
