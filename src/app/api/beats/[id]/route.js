import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";

export async function DELETE(req, { params }) {
    try {
        // SECURITY: Only admins can delete beats
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
        }

        const { id } = await params;
        await prisma.beat.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Beat deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete beat" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        // SECURITY: Only admins can update beats
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { title, bpm, key, price, cover, audio, taggedAudio, wav, stems, genre } = body;

        // Build update data - always include file paths if they are provided (even if same value)
        // This ensures replacement files are properly saved
        const updateData = {
            title,
            bpm: parseInt(bpm),
            key,
        };

        // Optional fields - only update if provided
        if (price !== undefined) {
            updateData.price = parseFloat(price);
        }
        if (genre) {
            updateData.genre = genre;
        }

        // File fields - ALWAYS update if provided in request body
        // This is critical for file replacement to work
        if (cover !== undefined) {
            updateData.cover = cover;
        }
        if (audio !== undefined) {
            updateData.audio = audio;
        }
        if (taggedAudio !== undefined) {
            updateData.taggedAudio = taggedAudio;
        }
        if (wav !== undefined) {
            updateData.wav = wav;
        }
        if (stems !== undefined) {
            updateData.stems = stems;
        }

        const updatedBeat = await prisma.beat.update({
            where: { id },
            data: updateData,
        });

        // Update Licenses if provided
        if (body.licenses && Array.isArray(body.licenses)) {
            // Delete existing licenses for this beat
            await prisma.beatLicense.deleteMany({
                where: { beatId: id }
            });

            // Create new ones
            if (body.licenses.length > 0) {
                await prisma.beatLicense.createMany({
                    data: body.licenses.map(lic => ({
                        beatId: id,
                        licenseId: lic.licenseId,
                        price: lic.price ? parseFloat(lic.price) : null,
                        active: true
                    }))
                });
            }

            // Re-fetch beat with licenses to return complete object
            const finalBeat = await prisma.beat.findUnique({
                where: { id },
                include: { licenses: { include: { license: true } } }
            });
            return NextResponse.json(finalBeat);
        }

        return NextResponse.json(updatedBeat);
    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
