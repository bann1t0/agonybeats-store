import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// POST /api/account/2fa/verify - Verify 2FA code and enable
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

        const { code } = await req.json();

        if (!code || code.length !== 6) {
            return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
        }

        // Get user with 2FA secret
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                twoFactorSecret: true,
                twoFactorEnabled: true
            }
        });

        if (!user?.twoFactorSecret) {
            return NextResponse.json({
                error: "Please start 2FA setup first"
            }, { status: 400 });
        }

        if (user.twoFactorEnabled) {
            return NextResponse.json({
                error: "2FA is already enabled"
            }, { status: 400 });
        }

        // Verify the code
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
            window: 2
        });

        if (!verified) {
            return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
        }

        // Generate backup codes
        const backupCodes = [];
        const hashedBackupCodes = [];

        for (let i = 0; i < 10; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            backupCodes.push(code);
            hashedBackupCodes.push(await bcrypt.hash(code, 10));
        }

        // Enable 2FA
        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                backupCodes: JSON.stringify(hashedBackupCodes)
            }
        });

        return NextResponse.json({
            success: true,
            message: "2FA enabled successfully",
            backupCodes
        });

    } catch (error) {
        console.error("2FA Verify Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
