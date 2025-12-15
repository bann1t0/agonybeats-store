import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/early-access-beats - Get beats available only to subscribers (early access)
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user has active subscription
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: 'ACTIVE'
            }
        });

        if (!subscription) {
            return NextResponse.json({
                error: "Subscription required",
                message: "You need an active subscription to access early access beats"
            }, { status: 403 });
        }

        // Get early access beats (earlyAccess = true OR earlyAccessUntil > now)
        const now = new Date();
        const earlyAccessBeats = await prisma.beat.findMany({
            where: {
                OR: [
                    { earlyAccess: true },
                    { earlyAccessUntil: { gt: now } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        // Check which beats user has already downloaded
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const userDownloads = await prisma.subscriptionDownload.findMany({
            where: {
                userId: session.user.id,
                subscriptionId: subscription.id
            },
            select: { beatId: true }
        });

        const downloadedBeatIds = new Set(userDownloads.map(d => d.beatId));

        // Mark beats as downloaded or not
        const beatsWithDownloadStatus = earlyAccessBeats.map(beat => ({
            ...beat,
            isDownloaded: downloadedBeatIds.has(beat.id)
        }));

        return NextResponse.json({
            beats: beatsWithDownloadStatus,
            count: beatsWithDownloadStatus.length
        });

    } catch (error) {
        console.error("Get early access beats error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
