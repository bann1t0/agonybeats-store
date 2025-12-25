import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET /api/reviews?beatId=xxx - Get all reviews for a beat
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const beatId = searchParams.get('beatId');
        const sortBy = searchParams.get('sortBy') || 'recent'; // recent, rating, verified

        if (!beatId) {
            return NextResponse.json({ error: "beatId required" }, { status: 400 });
        }

        let orderBy = {};
        if (sortBy === 'rating') {
            orderBy = { rating: 'desc' };
        } else if (sortBy === 'verified') {
            orderBy = { verified: 'desc' };
        } else {
            orderBy = { createdAt: 'desc' };
        }

        const reviews = await prisma.review.findMany({
            where: { beatId },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy
        });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return NextResponse.json({
            reviews,
            avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            totalReviews: reviews.length,
            verifiedCount: reviews.filter(r => r.verified).length
        });

    } catch (error) {
        console.error("Get reviews error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/reviews - Create a new review (REQUIRES PURCHASE)
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Devi effettuare il login per lasciare una recensione" }, { status: 401 });
        }

        const body = await req.json();
        const { beatId, rating, title, comment } = body;

        if (!beatId || !rating) {
            return NextResponse.json({ error: "beatId e rating sono richiesti" }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Il rating deve essere tra 1 e 5" }, { status: 400 });
        }

        // Check if user PURCHASED this beat (REQUIRED)
        const hasPurchased = await prisma.purchase.findFirst({
            where: {
                userId: session.user.id,
                beatId,
                status: "completed"
            }
        });

        if (!hasPurchased) {
            return NextResponse.json({
                error: "Puoi recensire solo i beat che hai acquistato"
            }, { status: 403 });
        }

        // Check if user already reviewed this beat
        const existing = await prisma.review.findUnique({
            where: {
                userId_beatId: {
                    userId: session.user.id,
                    beatId
                }
            }
        });

        if (existing) {
            return NextResponse.json({ error: "Hai già recensito questo beat" }, { status: 400 });
        }

        const review = await prisma.review.create({
            data: {
                userId: session.user.id,
                beatId,
                rating,
                title: title || null,
                comment: comment || null,
                verified: true // Always verified since purchase is required
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        });

        return NextResponse.json(review);

    } catch (error) {
        console.error("Create review error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/reviews?reviewId=xxx - Delete own review
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const reviewId = searchParams.get('reviewId');

        if (!reviewId) {
            return NextResponse.json({ error: "reviewId required" }, { status: 400 });
        }

        // Check if review belongs to user
        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        if (review.userId !== session.user.id && session.user.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.review.delete({
            where: { id: reviewId }
        });

        return NextResponse.json({ message: "Review deleted" });

    } catch (error) {
        console.error("Delete review error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
