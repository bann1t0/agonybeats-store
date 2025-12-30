import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/account - Get user account data and statistics
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user by id or email (fallback for OAuth users)
        let userId = session.user.id;

        if (!userId && session.user.email) {
            const userByEmail = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });
            userId = userByEmail?.id;
        }

        if (!userId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch user data with all fields (some may be null for old users)
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get purchase statistics
        let purchases = [];
        try {
            purchases = await prisma.purchase.findMany({
                where: { userId },
                select: {
                    amount: true,
                    createdAt: true,
                }
            });
        } catch (e) {
            console.error("Purchase query error:", e);
        }

        const totalSpent = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
        const purchaseCount = purchases.length;

        // Get favorites count
        let favoritesCount = 0;
        try {
            favoritesCount = await prisma.favorite.count({
                where: { userId }
            });
        } catch (e) {
            console.error("Favorites query error:", e);
        }

        // Get playlists count
        let playlistsCount = 0;
        try {
            playlistsCount = await prisma.playlist.count({
                where: { userId }
            });
        } catch (e) {
            console.error("Playlists query error:", e);
        }

        // Get reviews count
        let reviewsCount = 0;
        try {
            reviewsCount = await prisma.review.count({
                where: { userId }
            });
        } catch (e) {
            console.error("Reviews query error:", e);
        }

        // Get subscription info
        let subscription = null;
        try {
            subscription = await prisma.subscription.findFirst({
                where: { userId },
                select: {
                    tierId: true,
                    status: true,
                    currentPeriodEnd: true,
                }
            });
        } catch (e) {
            console.error("Subscription query error:", e);
        }

        // Get last purchase date
        const lastPurchase = purchases.length > 0
            ? purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt
            : null;

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name || null,
                email: user.email || null,
                image: user.image || null,
                role: user.role || "user",
                isSubscribed: user.isSubscribed || false,
                twoFactorEnabled: user.twoFactorEnabled || false,
                createdAt: user.createdAt || null,
                hasPassword: !!user.password
            },
            stats: {
                totalSpent: Math.round(totalSpent * 100) / 100,
                purchaseCount,
                favoritesCount,
                playlistsCount,
                reviewsCount,
                lastPurchase,
            },
            subscription: subscription || null
        });

    } catch (error) {
        console.error("Account API Error:", error);
        return NextResponse.json({
            error: "Failed to load account",
            details: error.message
        }, { status: 500 });
    }
}

// PUT /api/account - Update user profile
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user by id or email
        let userId = session.user.id;
        if (!userId && session.user.email) {
            const userByEmail = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });
            userId = userByEmail?.id;
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, image } = await req.json();

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name !== undefined && { name }),
                ...(image !== undefined && { image }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            }
        });

        return NextResponse.json({ user: updatedUser });

    } catch (error) {
        console.error("Update Account Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
