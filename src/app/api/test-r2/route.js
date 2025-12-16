import { NextResponse } from "next/server";

// Test endpoint to verify R2 configuration on Vercel
export async function GET() {
    const config = {
        hasEndpoint: !!process.env.R2_ENDPOINT,
        hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
        hasBucket: !!process.env.R2_BUCKET_NAME,
        hasPublicUrl: !!process.env.R2_PUBLIC_URL,
        bucketName: process.env.R2_BUCKET_NAME || 'NOT SET',
        endpointPrefix: process.env.R2_ENDPOINT?.substring(0, 30) + '...' || 'NOT SET',
        publicUrlPrefix: process.env.R2_PUBLIC_URL?.substring(0, 40) + '...' || 'NOT SET',
    };

    const allConfigured = config.hasEndpoint && config.hasAccessKey &&
        config.hasSecretKey && config.hasBucket && config.hasPublicUrl;

    return NextResponse.json({
        status: allConfigured ? 'OK' : 'MISSING_CONFIG',
        config
    });
}
