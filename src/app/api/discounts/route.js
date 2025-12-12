import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List all codes
export async function GET() {
    try {
        const codes = await prisma.discountCode.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(codes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch codes" }, { status: 500 });
    }
}

// POST: Create new code
export async function POST(req) {
    try {
        const body = await req.json();
        const { code, percentage } = body;

        if (!code || !percentage) {
            return NextResponse.json({ error: "Missing code or percentage" }, { status: 400 });
        }

        const newCode = await prisma.discountCode.create({
            data: {
                code: code.toUpperCase(), // Store uppercase
                percentage: parseInt(percentage)
            }
        });

        return NextResponse.json(newCode);
    } catch (error) {
        // Handle constraint violation (duplicate code)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create code" }, { status: 500 });
    }
}
