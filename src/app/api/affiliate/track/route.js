import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/affiliate/track - Track affiliate click
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        // Find affiliate
        const affiliate = await prisma.affiliate.findUnique({
            where: { code }
        });

        if (!affiliate || affiliate.status !== 'active') {
            return NextResponse.json({ error: "Invalid affiliate code" }, { status: 404 });
        }

        // Create click record
        await prisma.affiliateClick.create({
            data: {
                affiliateId: affiliate.id
            }
        });

        return NextResponse.json({ success: true, message: "Click tracked" });

    } catch (error) {
        console.error("Track click error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/affiliate/track - Convert click to sale
export async function POST(req) {
    try {
        const { purchaseId, amount, affiliateCode } = await req.json();

        if (!affiliateCode || !purchaseId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find affiliate
        const affiliate = await prisma.affiliate.findUnique({
            where: { code: affiliateCode }
        });

        if (!affiliate) {
            return NextResponse.json({ error: "Invalid affiliate" }, { status: 404 });
        }

        // Calculate commission
        const commissionAmount = amount * (affiliate.commission / 100);

        // Find the most recent click from this affiliate
        const recentClick = await prisma.affiliateClick.findFirst({
            where: {
                affiliateId: affiliate.id,
                convertedAt: null
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (recentClick) {
            // Mark click as converted
            await prisma.affiliateClick.update({
                where: { id: recentClick.id },
                data: {
                    purchaseId,
                    amount,
                    commission: commissionAmount,
                    convertedAt: new Date()
                }
            });
        } else {
            // Create new conversion record
            await prisma.affiliateClick.create({
                data: {
                    affiliateId: affiliate.id,
                    purchaseId,
                    amount,
                    commission: commissionAmount,
                    convertedAt: new Date()
                }
            });
        }

        // Update affiliate total earnings
        await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: {
                totalEarnings: {
                    increment: commissionAmount
                }
            }
        });

        return NextResponse.json({
            success: true,
            commission: commissionAmount
        });

    } catch (error) {
        console.error("Convert click error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
