import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        const body = await req.json();
        console.log("Beats API Received Body:", body); // DEBUG LOG

        const { title, bpm, key, price, cover, audio, genre } = body;

        // Validation Check
        if (!title || !bpm || !key || !cover || !audio) {
            console.error("Missing fields:", { title, bpm, key, cover, audio });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
