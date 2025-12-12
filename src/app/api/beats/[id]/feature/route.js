import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
    try {
        const { id } = await params; // await params in Next.js 15+ (or recent 14)

        // Transaction to ensure only one featured beat
        await prisma.$transaction([
            // 1. Unset feature for ALL beats
            prisma.beat.updateMany({
                data: { isFeatured: false }
            }),
            // 2. Set feature for THIS beat
            prisma.beat.update({
                where: { id },
                data: { isFeatured: true }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Feature Beat Error DETAILS:", error);
        return NextResponse.json({ error: "Failed to set featured beat: " + error.message }, { status: 500 });
    }
}
