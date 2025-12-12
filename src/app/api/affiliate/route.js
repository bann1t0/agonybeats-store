import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// POST /api/affiliate - Register as affiliate
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if already an affiliate
        const existing = await prisma.affiliate.findUnique({
            where: { userId: session.user.id }
        });

        if (existing) {
            return NextResponse.json({ error: "You are already an affiliate" }, { status: 400 });
        }

        // Generate unique code
        const code = `${session.user.name?.replace(/\s+/g, '').toUpperCase().slice(0, 5) || 'USER'}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Create affiliate
        const affiliate = await prisma.affiliate.create({
            data: {
                userId: session.user.id,
                code,
                commission: 10.0 // Default 10% commission
            }
        });

        return NextResponse.json({
            message: "Welcome to the affiliate program!",
            affiliate: {
                code: affiliate.code,
                commission: affiliate.commission,
                referralLink: `${process.env.NEXTAUTH_URL}?ref=${affiliate.code}`
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Create affiliate error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET /api/affiliate - Get affiliate status and stats
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log('Fetching affiliate for user:', session.user.email);

        const affiliate = await prisma.affiliate.findUnique({
            where: { userId: session.user.id },
            include: {
                referrals: {
                    orderBy: { createdAt: 'desc' },
                    take: 50
                }
            }
        }).catch(err => {
            console.error('Prisma query error:', err.message);
            throw err;
        });

        if (!affiliate) {
            console.log('User is not an affiliate');
            return NextResponse.json({ error: "Not an affiliate" }, { status: 404 });
        }

        // Calculate stats
        const totalClicks = affiliate.referrals.length;
        const conversions = affiliate.referrals.filter(r => r.convertedAt).length;
        const conversionRate = totalClicks > 0 ? (conversions / totalClicks * 100).toFixed(2) : 0;
        const pendingEarnings = affiliate.referrals
            .filter(r => r.convertedAt && !r.commission)
            .reduce((sum, r) => sum + (r.amount || 0) * (affiliate.commission / 100), 0);

        return NextResponse.json({
            affiliate: {
                code: affiliate.code,
                commission: affiliate.commission,
                totalEarnings: affiliate.totalEarnings,
                status: affiliate.status,
                referralLink: `${process.env.NEXTAUTH_URL}?ref=${affiliate.code}`
            },
            stats: {
                totalClicks,
                conversions,
                conversionRate: parseFloat(conversionRate),
                pendingEarnings: parseFloat(pendingEarnings.toFixed(2))
            },
            recentReferrals: affiliate.referrals.slice(0, 10).map(r => ({
                date: r.createdAt,
                converted: !!r.convertedAt,
                amount: r.amount,
                commission: r.commission
            }))
        });

    } catch (error) {
        console.error("Get affiliate error:", error.message);
        console.error("Stack:", error.stack);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
