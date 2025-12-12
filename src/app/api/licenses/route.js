import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
                order: 0, // Could calculate max order + 1
                isRecommended: !!isRecommended, // Ensure boolean value
            }
        });

        return NextResponse.json(license);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
