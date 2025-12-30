import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/account/2fa/disable - Disable 2FA
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { password } = await req.json();

        if (!password) {
            return NextResponse.json({
                error: "Password is required to disable 2FA"
            }, { status: 400 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                twoFactorEnabled: true,
                password: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.twoFactorEnabled) {
            return NextResponse.json({
                error: "2FA is not enabled on this account"
            }, { status: 400 });
        }

        // Verify password
        if (!user.password) {
            return NextResponse.json({
                error: "Account has no password set"
            }, { status: 400 });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json({
                error: "Incorrect password"
            }, { status: 400 });
        }

        // Disable 2FA
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                backupCodes: null
            }
        });

        return NextResponse.json({
            success: true,
            message: "Two-factor authentication has been disabled"
        });

    } catch (error) {
        console.error("2FA Disable Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
