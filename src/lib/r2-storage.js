import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

// Initialize R2 Client (S3-compatible)
const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

/**
 * Upload a file to Cloudflare R2
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} filename - Name of the file 
 * @param {string} folder - Folder path (e.g., 'beats', 'covers', 'soundkits')
 * @param {string} contentType - MIME type (e.g., 'audio/mpeg', 'image/jpeg')
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
export async function uploadToR2(fileBuffer, filename, folder = 'uploads', contentType = 'application/octet-stream') {
    try {
        // Log configuration for debugging
        console.log('R2 Upload attempt:', {
            bucket: BUCKET_NAME,
            folder,
            filename,
            contentType,
            hasEndpoint: !!process.env.R2_ENDPOINT,
            hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
            hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY
        });

        const key = `${folder}/${filename}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await r2Client.send(command);

        // Return the public URL using the helper function
        const publicUrl = getR2Url(key);

        console.log(`✅ Uploaded file to R2: ${publicUrl}`);
        return publicUrl;

    } catch (error) {
        console.error("❌ R2 Upload Error Details:", {
            message: error.message,
            name: error.name,
            code: error.Code || error.code,
            statusCode: error.$metadata?.httpStatusCode,
            requestId: error.$metadata?.requestId
        });
        throw new Error(`Failed to upload to R2: ${error.message}`);
    }
}

/**
 * Delete a file from Cloudflare R2
 * @param {string} fileUrl - Full URL or key of the file to delete
 * @returns {Promise<boolean>}
 */
export async function deleteFromR2(fileUrl) {
    try {
        // Extract key from URL (everything after .r2.dev/)
        let key;
        if (fileUrl.includes('.r2.dev/')) {
            key = fileUrl.split('.r2.dev/')[1];
        } else if (fileUrl.startsWith('/')) {
            // If it's a local path like /uploads/file.mp3, extract the filename
            key = fileUrl.substring(1);
        } else {
            key = fileUrl;
        }

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);
        console.log(`✅ Deleted file from R2: ${key}`);
        return true;

    } catch (error) {
        console.error("❌ R2 Delete Error:", error);
        return false;
    }
}

/**
 * Get the public URL for an R2 file
 * @param {string} key - File key (path in bucket)
 * @returns {string} - Public URL
 */
export function getR2Url(key) {
    // If R2_PUBLIC_URL is set, use it (recommended)
    if (process.env.R2_PUBLIC_URL) {
        return `${process.env.R2_PUBLIC_URL}/${key}`;
    }

    // Fallback to constructing URL from endpoint
    // Note: You need to enable public access on your bucket first!
    const endpoint = process.env.R2_ENDPOINT || '';
    const bucketUrl = endpoint.replace('.r2.cloudflarestorage.com', `.${process.env.R2_BUCKET_NAME}.r2.dev`);
    return `${bucketUrl}/${key}`.replace('https://', 'https://pub-');
}

/**
 * Helper to determine content type from filename
 * @param {string} filename
 * @returns {string}
 */
export function getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();

    const mimeTypes = {
        // Audio
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'flac': 'audio/flac',
        'ogg': 'audio/ogg',

        // Images
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',

        // Archives
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',

        // Documents
        'pdf': 'application/pdf',
    };

    return mimeTypes[ext] || 'application/octet-stream';
}
