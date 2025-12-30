import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";

// GET: List all codes (admin only)
export async function GET() {
    try {
        // SECURITY: Only admins can view discount codes
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
        }

        const codes = await prisma.discountCode.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(codes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch codes" }, { status: 500 });
    }
}

// POST: Create new code (admin only)
export async function POST(req) {
    try {
        // SECURITY: Only admins can create discount codes
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
        }

        const body = await req.json();
        const { code, percentage } = body;

        if (!code || !percentage) {
            return NextResponse.json({ error: "Missing code or percentage" }, { status: 400 });
        }

        const newCode = await prisma.discountCode.create({
            data: {
                code: code.toUpperCase(),
                percentage: parseInt(percentage)
            }
        });

        return NextResponse.json(newCode);
    } catch (error) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create code" }, { status: 500 });
    }
}

