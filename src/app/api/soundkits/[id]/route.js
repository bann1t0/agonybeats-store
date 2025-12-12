
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.soundkit.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting soundkit:", error);
        return NextResponse.json({ error: "Failed to delete soundkit" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { title, description, price, cover, audioPreview, file, genre } = body;

        const updatedKit = await prisma.soundkit.update({
            where: { id },
            data: {
                title,
                description,
                price: parseFloat(price),
                cover,
                audioPreview,
                file,
                genre
            }
        });

        return NextResponse.json(updatedKit);
    } catch (error) {
        console.error("Error updating soundkit:", error);
        return NextResponse.json({ error: "Failed to update soundkit" }, { status: 500 });
    }
}
