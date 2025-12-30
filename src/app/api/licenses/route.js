import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";

export async function GET() {
    try {
        const licenses = await prisma.license.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(licenses);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        // SECURITY: Only admins can create licenses
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
        }

        const body = await req.json();
        const { name, defaultPrice, features, description, isRecommended } = body;

        if (!name || defaultPrice === undefined) {
            return NextResponse.json({ error: "Name and defaultPrice are required" }, { status: 400 });
        }

        const license = await prisma.license.create({
            data: {
                name,
                defaultPrice: parseFloat(defaultPrice),
                features: JSON.stringify(features || []),
                description: description || "",
                order: 0,
                isRecommended: !!isRecommended,
            }
        });

        return NextResponse.json(license);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

