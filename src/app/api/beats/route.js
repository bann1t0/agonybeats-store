import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";

export async function GET() {
    try {
        const beats = await prisma.beat.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                licenses: {
                    include: { license: true }
                }
            }
        });
        return NextResponse.json(beats);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch beats" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        // SECURITY: Only admins can create beats
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
        }

        const body = await req.json();
        const { title, bpm, key, price, cover, audio, genre, wav } = body;

        // Validation Check - audio is optional if wav is provided (MP3 is auto-generated)
        if (!title || !bpm || !key || !cover) {
            console.error("Missing fields:", { title, bpm, key, cover });
            return NextResponse.json({ error: "Missing required fields (title, bpm, key, cover)" }, { status: 400 });
        }

        // Either audio or wav must be provided
        if (!audio && !wav) {
            console.error("No audio file:", { audio, wav });
            return NextResponse.json({ error: "Either audio or WAV file is required" }, { status: 400 });
        }

        const beat = await prisma.beat.create({
            data: {
                title,
                bpm: parseInt(bpm),
                key,
                price: price ? parseFloat(price) : 0,
                cover,
                audio,
                taggedAudio: body.taggedAudio || null,
                wav: body.wav || null,
                stems: body.stems || null,
                genre: genre || "Trap",
                licenses: {
                    create: body.licenses?.map(lic => ({
                        licenseId: lic.licenseId,
                        price: lic.price ? parseFloat(lic.price) : null,
                        active: true
                    })) || []
                }
            },
        });

        console.log("Beat created in DB:", beat.id);
        return NextResponse.json(beat);
    } catch (error) {
        console.error("Create Beat Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

