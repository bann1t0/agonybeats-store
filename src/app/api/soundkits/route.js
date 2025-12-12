
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const soundkits = await prisma.soundkit.findMany({
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(soundkits);
    } catch (error) {
        console.error("Error fetching soundkits:", error);
        return NextResponse.json({ error: "Failed to fetch soundkits" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, description, price, cover, audioPreview, file, genre } = body;

        if (!title || !price || !cover || !audioPreview || !file) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const soundkit = await prisma.soundkit.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                cover,
                audioPreview,
                file,
                genre: genre || "Multi-Genre"
            }
        });

        return NextResponse.json(soundkit);
    } catch (error) {
        console.error("Error creating soundkit:", error);
        return NextResponse.json({ error: "Failed to create soundkit" }, { status: 500 });
    }
}

