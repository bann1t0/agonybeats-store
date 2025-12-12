import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/analytics/track - Track various events
export async function POST(req) {
    try {
        const { beatId, event } = await req.json();

        if (!beatId || !event) {
            return NextResponse.json({ error: "beatId and event required" }, { status: 400 });
        }

        const updateData = {};

        switch (event) {
            case 'play':
                updateData.plays = { increment: 1 };
                updateData.lastPlayed = new Date();
                break;
            case 'download':
                updateData.downloads = { increment: 1 };
                break;
            case 'purchase':
                updateData.purchases = { increment: 1 };
                break;
            case 'share':
                updateData.shares = { increment: 1 };
                break;
            default:
                return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
        }

        await prisma.beatAnalytics.upsert({
            where: { beatId },
            create: {
                beatId,
                ...Object.fromEntries(
                    Object.entries(updateData).map(([key, value]) =>
                        [key, value.increment || value]
                    )
                )
            },
            update: updateData
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Track analytics error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET /api/analytics/track?beatId=xxx - Get analytics for a beat
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const beatId = searchParams.get('beatId');

        if (!beatId) {
            return NextResponse.json({ error: "beatId required" }, { status: 400 });
        }

        const analytics = await prisma.beatAnalytics.findUnique({
            where: { beatId }
        });

        if (!analytics) {
            // Return zeros if no analytics yet
            return NextResponse.json({
                beatId,
                plays: 0,
                downloads: 0,
                purchases: 0,
                favorites: 0,
                shares: 0,
                lastPlayed: null
            });
        }

        return NextResponse.json(analytics);

    } catch (error) {
        console.error("Get analytics error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
