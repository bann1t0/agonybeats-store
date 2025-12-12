// test-r2-simple.js
// Minimal test to verify R2 connection

require('dotenv').config();

const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

console.log('🔍 Testing R2 Connection...\n');

// Show config
console.log('Configuration:');
console.log(`  Endpoint: ${process.env.R2_ENDPOINT}`);
console.log(`  Access Key: ${process.env.R2_ACCESS_KEY_ID?.substring(0, 10)}...`);
console.log(`  Bucket: ${process.env.R2_BUCKET_NAME}\n`);

// Create S3 client
const client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

async function testConnection() {
    try {
        console.log('📤 Attempting to upload test file...\n');

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: 'test/test-file.txt',
            Body: Buffer.from('Test upload from AgonyBeats Store'),
            ContentType: 'text/plain',
        });

        const response = await client.send(command);

        console.log('✅ Upload successful!');
        console.log(`Response:`, response);

        const publicUrl = `${process.env.R2_PUBLIC_URL}/test/test-file.txt`;
        console.log(`\n📍 File URL: ${publicUrl}`);
        console.log('\n🎉 R2 is working correctly!\n');

    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

testConnection();
