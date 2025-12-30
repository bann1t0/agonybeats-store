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

        // Fetch user data - only basic fields that always exist
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                isSubscribed: true,
                password: true, // We'll use this to check hasPassword
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Try to get 2FA status, but don't fail if column doesn't exist
        let twoFactorEnabled = false;
        try {
            const tfaCheck = await prisma.$queryRaw`
                SELECT "twoFactorEnabled" FROM "User" WHERE id = ${userId}
            `;
            twoFactorEnabled = tfaCheck?.[0]?.twoFactorEnabled || false;
        } catch (e) {
            // Column might not exist yet - that's ok
            twoFactorEnabled = false;
        }

        // Get purchase statistics
        const purchases = await prisma.purchase.findMany({
            where: { userId },
            select: {
                amount: true,
                createdAt: true,
            }
        });

        const totalSpent = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
        const purchaseCount = purchases.length;

        // Get favorites count
        const favoritesCount = await prisma.favorite.count({
            where: { userId }
        });

        // Get playlists count
        const playlistsCount = await prisma.playlist.count({
            where: { userId }
        });

        // Get reviews count
        const reviewsCount = await prisma.review.count({
            where: { userId }
        });

        // Get subscription info
        const subscription = await prisma.subscription.findFirst({
            where: { userId },
            select: {
                tierId: true,
                status: true,
                currentPeriodEnd: true,
            }
        });

        // Get last purchase date
        const lastPurchase = purchases.length > 0
            ? purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt
            : null;

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
                isSubscribed: user.isSubscribed,
                twoFactorEnabled,
                createdAt: null,
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
        return NextResponse.json({ error: "Failed to load account data: " + error.message }, { status: 500 });
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
