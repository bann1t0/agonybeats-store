import { NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2-storage";

// Test endpoint to verify R2 upload works
export async function GET() {
    try {
        // Create a small test file
        const testContent = "Test upload at " + new Date().toISOString();
        const testBuffer = Buffer.from(testContent, 'utf-8');

        console.log("Starting test upload to R2...");

        const url = await uploadToR2(
            testBuffer,
            `test-${Date.now()}.txt`,
            'uploads',
            'text/plain'
        );

        return NextResponse.json({
            status: 'UPLOAD_SUCCESS',
            message: 'Test file uploaded successfully!',
            url: url
        });
    } catch (error) {
        console.error("Test upload failed:", error);
        return NextResponse.json({
            status: 'UPLOAD_FAILED',
            error: error.message,
            details: {
                name: error.name,
                code: error.Code || error.code,
                statusCode: error.$metadata?.httpStatusCode
            }
        }, { status: 500 });
    }
}
