import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/account/2fa/disable - Disable 2FA
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user by id or email
        let userId = session.user.id;
        if (!userId && session.user.email) {
            const userByEmail = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });
            userId = userByEmail?.id;
        }

        if (!userId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { password } = await req.json();

        if (!password) {
            return NextResponse.json({ error: "Password is required" }, { status: 400 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                password: true,
                twoFactorEnabled: true
            }
        });

        if (!user?.twoFactorEnabled) {
            return NextResponse.json({
                error: "2FA is not enabled"
            }, { status: 400 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
        }

        // Disable 2FA
        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null,
                backupCodes: null
            }
        });

        return NextResponse.json({
            success: true,
            message: "2FA disabled successfully"
        });

    } catch (error) {
        console.error("2FA Disable Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
