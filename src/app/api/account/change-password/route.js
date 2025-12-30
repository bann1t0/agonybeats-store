import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/account/change-password - Change user password
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword, confirmPassword } = await req.json();

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({
                error: "All fields are required"
            }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({
                error: "New passwords do not match"
            }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({
                error: "Password must be at least 8 characters long"
            }, { status: 400 });
        }

        // Password strength check
        const hasUppercase = /[A-Z]/.test(newPassword);
        const hasLowercase = /[a-z]/.test(newPassword);
        const hasNumber = /\d/.test(newPassword);

        if (!hasUppercase || !hasLowercase || !hasNumber) {
            return NextResponse.json({
                error: "Password must contain uppercase, lowercase, and a number"
            }, { status: 400 });
        }

        // Get user with current password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, password: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user has a password (might be OAuth only)
        if (!user.password) {
            return NextResponse.json({
                error: "Cannot change password for OAuth accounts. Please set a password first."
            }, { status: 400 });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return NextResponse.json({
                error: "Current password is incorrect"
            }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
