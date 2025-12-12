import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
    try {
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
        const { id } = await params;
        const body = await req.json();
        const { title, bpm, key, price, cover, audio } = body;

        const updatedBeat = await prisma.beat.update({
            where: { id },
            data: {
                title,
                bpm: parseInt(bpm),
                key,
                ...(price !== undefined && { price: parseFloat(price) }),
                // Only update files if new paths are provided
                ...(cover && { cover }),
                ...(audio && { audio }),
                ...(body.taggedAudio && { taggedAudio: body.taggedAudio }),
                ...(body.wav && { wav: body.wav }),
                ...(body.stems && { stems: body.stems }),
                ...(body.genre && { genre: body.genre }),
            },
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
