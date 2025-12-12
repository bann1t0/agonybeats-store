import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET /api/admin/affiliates - Get all affiliates and stats (admin only)
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const affiliates = await prisma.affiliate.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                },
                referrals: {
                    where: {
                        convertedAt: { not: null }
                    }
                }
            },
            orderBy: {
                totalEarnings: 'desc'
            }
        });

        const stats = affiliates.map(aff => ({
            id: aff.id,
            code: aff.code,
            userName: aff.user.name,
            userEmail: aff.user.email,
            commission: aff.commission,
            totalEarnings: aff.totalEarnings,
            conversions: aff.referrals.length,
            status: aff.status,
            createdAt: aff.createdAt
        }));

        return NextResponse.json({
            affiliates: stats,
            totalAffiliates: affiliates.length,
            totalEarnings: affiliates.reduce((sum, a) => sum + a.totalEarnings, 0)
        });

    } catch (error) {
        console.error("Admin affiliates error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/admin/affiliates - Update affiliate status or commission
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { affiliateId, status, commission } = await req.json();

        if (!affiliateId) {
            return NextResponse.json({ error: "Affiliate ID required" }, { status: 400 });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (commission !== undefined) updateData.commission = parseFloat(commission);

        const updated = await prisma.affiliate.update({
            where: { id: affiliateId },
            data: updateData
        });

        return NextResponse.json({ success: true, affiliate: updated });

    } catch (error) {
        console.error("Update affiliate error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
