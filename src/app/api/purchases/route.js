import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET /api/purchases - Get current user's purchases
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const purchases = await prisma.purchase.findMany({
            where: {
                userId: session.user.id,
                status: "completed"
            },
            include: {
                beat: {
                    select: {
                        id: true,
                        title: true,
                        artist: true,
                        cover: true,
                        bpm: true,
                        key: true
                    }
                },
                license: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                purchasedAt: 'desc'
            }
        });

        // Get user's reviews to check which beats have been reviewed
        const reviews = await prisma.review.findMany({
            where: {
                userId: session.user.id
            },
            select: {
                beatId: true,
                rating: true,
                title: true,
                comment: true
            }
        });

        const reviewedBeatIds = new Set(reviews.map(r => r.beatId));

        // Add hasReviewed flag and review data to each purchase
        const purchasesWithReviewStatus = purchases.map(purchase => ({
            ...purchase,
            hasReviewed: purchase.beatId ? reviewedBeatIds.has(purchase.beatId) : false,
            review: purchase.beatId ? reviews.find(r => r.beatId === purchase.beatId) || null : null
        }));

        return NextResponse.json({
            purchases: purchasesWithReviewStatus,
            totalPurchases: purchases.length
        });

    } catch (error) {
        console.error("Get purchases error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
