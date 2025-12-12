import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
    try {
        // Await params in Next.js 13+ App Router
        const { id } = await params;

        // Check if license exists
        const license = await prisma.license.findUnique({
            where: { id },
            include: { beats: true } // Check if any beats use this license
        });

        if (!license) {
            return NextResponse.json({ error: "License not found" }, { status: 404 });
        }

        // Delete the license (Cascade will automatically remove BeatLicense associations)
        await prisma.license.delete({
            where: { id }
        });

        // Return success message with info about removed associations
        const beatCount = license.beats?.length || 0;
        const message = beatCount > 0
            ? `License deleted successfully. Removed from ${beatCount} beat(s).`
            : "License deleted successfully.";

        return NextResponse.json({ message });

    } catch (error) {
        console.error("Delete license error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
