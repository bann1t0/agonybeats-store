import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// DELETE: Remove a discount code
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        // Only admin can delete
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        await prisma.discountCode.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "Discount code deleted" });
    } catch (error) {
        console.error("Delete discount error:", error);
        return NextResponse.json({ error: "Failed to delete discount code" }, { status: 500 });
    }
}
