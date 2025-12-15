import { NextResponse } from "next/server";
import { uploadToR2, getContentType } from "@/lib/r2-storage";

export async function POST(req) {
    try {
        // Check if R2 is configured
        if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_BUCKET_NAME) {
            console.error("R2 configuration missing:", {
                hasEndpoint: !!process.env.R2_ENDPOINT,
                hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
                hasBucket: !!process.env.R2_BUCKET_NAME
            });
            return NextResponse.json({ error: "File storage not configured" }, { status: 500 });
        }

        const data = await req.formData();
        const file = data.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");

        // Detect content type from filename
        const contentType = getContentType(filename);

        // Upload to R2
        const r2Url = await uploadToR2(buffer, filename, 'uploads', contentType);

        console.log(`Uploaded file to R2: ${r2Url}`);

        return NextResponse.json({
            message: "Success",
            path: r2Url  // Return R2 URL instead of local path
        });
    } catch (error) {
        console.error("Upload Error:", error.message, error.stack);
        return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }
}
