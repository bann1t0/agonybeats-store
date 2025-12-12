import { NextResponse } from "next/server";
import { uploadToR2, getContentType } from "@/lib/r2-storage";

export async function POST(req) {
    try {
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
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
