import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
        const body = await req.json();
        const { filename, contentType } = body;

        if (!filename) {
            return NextResponse.json({ error: "Filename required" }, { status: 400 });
        }

        // Generate unique filename
        const uniqueFilename = `${Date.now()}_${filename.replace(/\s+/g, '_')}`;
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
