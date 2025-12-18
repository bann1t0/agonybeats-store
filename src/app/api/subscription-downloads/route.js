import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getTier, canUserDownloadBeat, getRemainingDownloads } from "@/lib/subscriptionTiers";

// GET /api/subscription-downloads - Get user's downloads this month and remaining count
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's active subscription
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: 'ACTIVE'
            }
        });

        if (!subscription) {
            return NextResponse.json({
                hasSubscription: false,
                message: "No active subscription"
            });
        }

        const tier = getTier(subscription.tierId);

        // Get downloads this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const downloadsThisMonth = await prisma.subscriptionDownload.count({
            where: {
                userId: session.user.id,
                subscriptionId: subscription.id,
                downloadedAt: { gte: startOfMonth }
            }
        });

        // Get list of downloaded beats this month
        const downloadedBeats = await prisma.subscriptionDownload.findMany({
            where: {
                userId: session.user.id,
                subscriptionId: subscription.id,
                downloadedAt: { gte: startOfMonth }
            },
            include: {
                beat: {
                    select: {
                        id: true,
                        title: true,
                        artist: true,
                        cover: true,
                        audio: true
                    }
                }
            },
            orderBy: { downloadedAt: 'desc' }
        });

        const remaining = getRemainingDownloads(subscription, downloadsThisMonth);

        return NextResponse.json({
            hasSubscription: true,
            subscription: {
                id: subscription.id,
                tierId: subscription.tierId,
                tierName: tier?.name,
                status: subscription.status,
                currentPeriodEnd: subscription.currentPeriodEnd
            },
            tier: {
                name: tier?.name,
                color: tier?.color,
                beatsPerMonth: tier?.benefits.beatsPerMonth,
                licenseType: tier?.benefits.licenseType,
                discountPercentage: tier?.benefits.discountPercentage
            },
            downloads: {
                used: downloadsThisMonth,
                remaining: remaining === Infinity ? 'Unlimited' : remaining,
                limit: tier?.benefits.beatsPerMonth === -1 ? 'Unlimited' : tier?.benefits.beatsPerMonth
            },
            downloadedBeats
        });

    } catch (error) {
        console.error("Get subscription downloads error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/subscription-downloads - Download a beat using subscription
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { beatId } = await req.json();

        if (!beatId) {
            return NextResponse.json({ error: "Beat ID required" }, { status: 400 });
        }

        // Get user's active subscription
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: 'ACTIVE'
            }
        });

        if (!subscription) {
            return NextResponse.json({ error: "No active subscription" }, { status: 403 });
        }

        const tier = getTier(subscription.tierId);

        // Check if beat exists
        const beat = await prisma.beat.findUnique({
            where: { id: beatId }
        });

        if (!beat) {
            return NextResponse.json({ error: "Beat not found" }, { status: 404 });
        }

        // Get downloads this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const downloadsThisMonth = await prisma.subscriptionDownload.count({
            where: {
                userId: session.user.id,
                subscriptionId: subscription.id,
                downloadedAt: { gte: startOfMonth }
            }
        });

        // Check if already downloaded this beat
        const existingDownload = await prisma.subscriptionDownload.findFirst({
            where: {
                userId: session.user.id,
                beatId,
                subscriptionId: subscription.id
            }
        });

        if (existingDownload) {
            // Already downloaded, just return the file URL (doesn't count as new download)
            const remaining = getRemainingDownloads(subscription, downloadsThisMonth);
            const licenseType = tier?.benefits.licenseType || 'MP3_LEASE';

            // Build download files based on tier
            let downloadFiles = { mp3: beat.audio };
            if ((licenseType === 'WAV_LEASE' || licenseType === 'PREMIUM_UNLIMITED') && beat.wav) {
                downloadFiles.wav = beat.wav;
            }
            if (licenseType === 'PREMIUM_UNLIMITED' && beat.stems) {
                downloadFiles.stems = beat.stems;
            }

            return NextResponse.json({
                success: true,
                message: "You've already downloaded this beat - downloading again (doesn't count as new download)",
                downloadUrl: beat.audio,
                downloadFiles,
                licenseType,
                remaining: remaining,
                wasReDownload: true,
                tier: {
                    name: tier?.name,
                    includesWav: licenseType === 'WAV_LEASE' || licenseType === 'PREMIUM_UNLIMITED',
                    includesStems: licenseType === 'PREMIUM_UNLIMITED'
                }
            });
        }

        // Check if can download more
        if (!canUserDownloadBeat(subscription, downloadsThisMonth)) {
            return NextResponse.json({
                error: "Monthly download limit reached",
                used: downloadsThisMonth,
                limit: tier?.benefits.beatsPerMonth
            }, { status: 403 });
        }

        // Create download record
        await prisma.subscriptionDownload.create({
            data: {
                userId: session.user.id,
                beatId,
                subscriptionId: subscription.id,
                licenseType: tier?.benefits.licenseType || 'MP3_LEASE'
            }
        });

        // Track in analytics
        try {
            await prisma.beatAnalytics.upsert({
                where: { beatId },
                create: {
                    beatId,
                    downloads: 1
                },
                update: {
                    downloads: { increment: 1 }
                }
            });
        } catch (e) {
            console.error("Failed to update analytics:", e);
        }

        // Determine which files to provide based on tier
        const licenseType = tier?.benefits.licenseType || 'MP3_LEASE';
        let downloadFiles = { mp3: beat.audio };

        // Add WAV for WAV_LEASE and PREMIUM_UNLIMITED tiers
        if (licenseType === 'WAV_LEASE' || licenseType === 'PREMIUM_UNLIMITED') {
            if (beat.wav) {
                downloadFiles.wav = beat.wav;
            }
        }

        // Add stems for PREMIUM_UNLIMITED tier (Special VIP)
        if (licenseType === 'PREMIUM_UNLIMITED' && beat.stems) {
            downloadFiles.stems = beat.stems;
        }

        return NextResponse.json({
            success: true,
            message: "Download recorded successfully",
            downloadUrl: beat.audio, // Primary download (MP3)
            downloadFiles, // All available files for this tier
            licenseType,
            remaining: getRemainingDownloads(subscription, downloadsThisMonth + 1),
            tier: {
                name: tier?.name,
                includesWav: licenseType === 'WAV_LEASE' || licenseType === 'PREMIUM_UNLIMITED',
                includesStems: licenseType === 'PREMIUM_UNLIMITED'
            }
        });

    } catch (error) {
        console.error("Subscription download error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
