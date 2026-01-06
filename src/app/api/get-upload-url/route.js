import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAdmin } from "@/lib/security";

// Initialize R2 Client
const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Generate presigned URL for direct upload to R2
export async function POST(req) {
    try {
        // SECURITY: Only admins can upload files
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
        }

        const body = await req.json();
        const { filename, contentType } = body;

        if (!filename) {
            return NextResponse.json({ error: "Filename required" }, { status: 400 });
        }

        // SECURITY: Validate content type to prevent malicious uploads
        const allowedTypes = [
            // Images
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            // Audio formats (for beats and stems)
            'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav',
            'audio/flac', 'audio/x-flac', 'audio/aiff', 'audio/x-aiff',
            'audio/ogg', 'audio/aac', 'audio/x-m4a', 'audio/mp4',
            // Archive formats (for stems packages)
            'application/zip', 'application/x-zip-compressed',
            'application/x-rar-compressed', 'application/x-7z-compressed',
            'application/vnd.rar', 'application/x-rar', // Additional RAR MIME types
            'application/octet-stream' // Generic binary (fallback for some browsers)
        ];

        // Also allow by file extension for cases where browser sends wrong MIME type
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp3', '.wav', '.flac', '.aiff', '.ogg', '.aac', '.m4a', '.zip', '.rar', '.7z'];
        const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        const hasAllowedExtension = allowedExtensions.includes(fileExtension);

        console.log(`Upload request - filename: ${filename}, contentType: ${contentType}, extension: ${fileExtension}`);

        if (contentType && !allowedTypes.includes(contentType) && !hasAllowedExtension) {
            console.log(`Rejected upload - contentType: ${contentType} not in allowed list and extension ${fileExtension} not allowed`);
            return NextResponse.json({ error: `File type not allowed: ${contentType}` }, { status: 400 });
        }

        // Generate unique filename
        const uniqueFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const key = `uploads/${uniqueFilename}`;

        // Create the PutObject command
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType || 'application/octet-stream',
        });

        // Generate presigned URL (valid for 1 hour)
        const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        // Public URL where file will be accessible after upload
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        return NextResponse.json({
            presignedUrl,
            publicUrl,
            key
        });
    } catch (error) {
        console.error("Presigned URL error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

