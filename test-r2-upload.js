// test-r2-upload.js
// Quick test to verify Cloudflare R2 upload functionality

// Load environment variables from .env file
require('dotenv').config();

const { uploadToR2, getContentType } = require('./src/lib/r2-storage.js');
const fs = require('fs');

async function testR2Upload() {
    console.log('🧪 Testing Cloudflare R2 upload...\n');

    try {
        // Create a test file
        const testContent = Buffer.from('Test file for R2 upload - AgonyBeats Store Migration');
        const filename = `test-${Date.now()}.txt`;

        console.log(`📤 Uploading test file: ${filename}...`);

        const r2Url = await uploadToR2(testContent, filename, 'test', 'text/plain');

        console.log(`✅ Upload successful!`);
        console.log(`📍 File URL: ${r2Url}\n`);

        console.log('🎉 Cloudflare R2 migration successful!');
        console.log('✅ File upload is operational\n');
        console.log('ℹ️  You can test accessing the file at:');
        console.log(`   ${r2Url}\n`);

    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        console.error('\n⚠️  Common issues:');
        console.error('   - R2 public access not enabled');
        console.error('   - Invalid credentials');
        console.error('   - Bucket name mismatch\n');
        process.exit(1);
    }
}

testR2Upload();
