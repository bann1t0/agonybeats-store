import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        const { code } = await req.json();

        if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

        const discount = await prisma.discountCode.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!discount) {
            return NextResponse.json({ error: "Invalid Code" }, { status: 404 });
        }

        if (!discount.active) {
            return NextResponse.json({ error: "Code is expired" }, { status: 400 });
        }

        // Increment usage count
        await prisma.discountCode.update({
            where: { id: discount.id },
            data: { uses: { increment: 1 } }
        });

        return NextResponse.json({
            success: true,
            percentage: discount.percentage,
            message: `${discount.percentage}% Discount Applied!`
        });

    } catch (error) {
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
