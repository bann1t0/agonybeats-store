// migrate-to-r2.js
// Script to migrate existing files from public/uploads to Cloudflare R2

const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const prisma = new PrismaClient();

// Initialize R2 Client
const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Helper to get content type
function getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'flac': 'audio/flac',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// Upload file to R2
async function uploadToR2(fileBuffer, filename, folder = 'uploads') {
    const key = `${folder}/${filename}`;
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: getContentType(filename),
    });
    await r2Client.send(command);
    return `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${key}`;
}

async function migrateFiles() {
    console.log('🚀 Starting file migration to Cloudflare R2...\n');

    try {
        // Check if uploads directory exists
        try {
            await fs.access(UPLOADS_DIR);
        } catch {
            console.log('⚠️  No public/uploads directory found. Skipping file migration.');
            console.log('✅ This is normal if you haven\'t uploaded any files yet.');
            return;
        }

        // Read all files from uploads directory
        const files = await fs.readdir(UPLOADS_DIR);
        console.log(`📁 Found ${files.length} files in public/uploads\n`);

        if (files.length === 0) {
            console.log('ℹ️  No files to migrate.');
            return;
        }

        const uploadedFiles = [];
        const failedFiles = [];

        // Upload each file to R2
        for (const filename of files) {
            const filePath = path.join(UPLOADS_DIR, filename);
            const stats = await fs.stat(filePath);

            if (stats.isFile()) {
                try {
                    console.log(`📤 Uploading: ${filename}...`);
                    const fileBuffer = await fs.readFile(filePath);
                    const r2Url = await uploadToR2(fileBuffer, filename, 'uploads');
                    uploadedFiles.push({ local: `/uploads/${filename}`, r2: r2Url });
                    console.log(`   ✅ Uploaded to: ${r2Url}`);
                } catch (uploadError) {
                    console.error(`   ❌ Failed to upload ${filename}:`, uploadError.message);
                    failedFiles.push(filename);
                }
            }
        }

        console.log(`\n📊 Upload Summary:`);
        console.log(`✅ Successful: ${uploadedFiles.length} files`);
        console.log(`❌ Failed: ${failedFiles.length} files\n`);

        // Update database paths
        if (uploadedFiles.length > 0) {
            console.log('🔄 Updating database paths...\n');

            // Update beats
            const beats = await prisma.beat.findMany();
            for (const beat of beats) {
                const updates = {};

                // Check each field that might contain old paths
                for (const { local, r2 } of uploadedFiles) {
                    if (beat.cover === local) updates.cover = r2;
                    if (beat.audio === local) updates.audio = r2;
                    if (beat.taggedAudio === local) updates.taggedAudio = r2;
                    if (beat.wav === local) updates.wav = r2;
                    if (beat.stems === local) updates.stems = r2;
                }

                if (Object.keys(updates).length > 0) {
                    await prisma.beat.update({
                        where: { id: beat.id },
                        data: updates
                    });
                    console.log(`✅ Updated beat: ${beat.title}`);
                }
            }

            // Update soundkits
            const soundkits = await prisma.soundkit.findMany();
            for (const soundkit of soundkits) {
                const updates = {};

                for (const { local, r2 } of uploadedFiles) {
                    if (soundkit.cover === local) updates.cover = r2;
                    if (soundkit.audioPreview === local) updates.audioPreview = r2;
                    if (soundkit.file === local) updates.file = r2;
                }

                if (Object.keys(updates).length > 0) {
                    await prisma.soundkit.update({
                        where: { id: soundkit.id },
                        data: updates
                    });
                    console.log(`✅ Updated soundkit: ${soundkit.title}`);
                }
            }

            console.log('\n✅ Database paths updated successfully!');
        }

        console.log('\n🎉 File migration completed!\n');
        console.log('📝 Next steps:');
        console.log('1. Verify files are accessible at R2 URLs');
        console.log('2. Test audio playback and downloads');
        console.log('3. Backup public/uploads directory');
        console.log('4. (Optional) Delete public/uploads when confident\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateFiles();
