import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Generate backup codes
function generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        // Generate 8-character alphanumeric code
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
    }
    return codes;
}

// POST /api/account/2fa/verify - Verify TOTP and enable 2FA
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Verification code required" }, { status: 400 });
        }

        // Get user with secret
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                twoFactorEnabled: true,
                twoFactorSecret: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.twoFactorEnabled) {
            return NextResponse.json({ error: "2FA is already enabled" }, { status: 400 });
        }

        if (!user.twoFactorSecret) {
            return NextResponse.json({
                error: "Please set up 2FA first by calling /api/account/2fa/setup"
            }, { status: 400 });
        }

        // Verify the TOTP code
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
            window: 2 // Allow 1 code before/after for clock skew
        });

        if (!verified) {
            return NextResponse.json({
                error: "Invalid verification code. Please try again."
            }, { status: 400 });
        }

        // Generate backup codes
        const backupCodes = generateBackupCodes(10);

        // Hash backup codes for storage
        const hashedBackupCodes = await Promise.all(
            backupCodes.map(code => bcrypt.hash(code, 10))
        );

        // Enable 2FA and store backup codes
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                twoFactorEnabled: true,
                backupCodes: JSON.stringify(hashedBackupCodes)
            }
        });

        return NextResponse.json({
            success: true,
            message: "Two-factor authentication enabled successfully!",
            backupCodes: backupCodes, // Return plain backup codes ONCE (user must save them)
            warning: "Save these backup codes in a safe place. They will not be shown again!"
        });

    } catch (error) {
        console.error("2FA Verify Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
