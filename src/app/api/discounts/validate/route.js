import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/discounts/validate - Validate a discount code
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code')?.toUpperCase().trim();
        const email = searchParams.get('email')?.toLowerCase().trim();

        if (!code) {
            return NextResponse.json({ valid: false, error: "No code provided" }, { status: 400 });
        }

        // Find discount code
        const discount = await prisma.discountCode.findUnique({
            where: { code }
        });

        if (!discount) {
            return NextResponse.json({ valid: false, error: "Invalid code" }, { status: 404 });
        }

        // Check if active
        if (!discount.active) {
            return NextResponse.json({ valid: false, error: "This code has expired" }, { status: 400 });
        }

        // Check maxUses (0 = unlimited)
        if (discount.maxUses > 0 && discount.uses >= discount.maxUses) {
            return NextResponse.json({ valid: false, error: "This code has already been used" }, { status: 400 });
        }

        // Check if tied to specific email
        if (discount.email && discount.email.toLowerCase() !== email) {
            return NextResponse.json({ valid: false, error: "This code is not valid for this email" }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            id: discount.id,
            code: discount.code,
            percentage: discount.percentage
        });

    } catch (error) {
        console.error("Validate discount error:", error);
        return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
    }
}
