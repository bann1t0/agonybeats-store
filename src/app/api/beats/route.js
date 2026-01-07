import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const all = searchParams.get('all') === 'true'; // For admin panel or other uses

        // If 'all' is true, return all beats without pagination (backwards compatibility)
        if (all) {
            const beats = await prisma.beat.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    licenses: {
                        include: { license: true }
                    }
                }
            });
            return NextResponse.json(beats);
        }

        // Get total count for pagination info
        const total = await prisma.beat.count();
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const beats = await prisma.beat.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                licenses: {
                    include: { license: true }
                }
            },
            skip,
            take: limit
        });

        return NextResponse.json({
            beats,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
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
        // Use wav as fallback for audio if not provided (for streaming)
        // This handles the case where MP3 conversion failed or wasn't done
        const audioPath = audio || wav;
        const taggedPath = body.taggedAudio || wav; // Also fallback tagged to wav

        const beat = await prisma.beat.create({
            data: {
                title,
                bpm: parseInt(bpm),
                key,
                price: price ? parseFloat(price) : 0,
                cover,
                audio: audioPath, // Required field - use wav as fallback
                taggedAudio: taggedPath,
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

