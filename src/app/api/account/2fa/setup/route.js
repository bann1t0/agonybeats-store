import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

// POST /api/account/2fa/setup - Generate 2FA secret and QR code
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

        // Check if user already has 2FA enabled
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                twoFactorEnabled: true,
                email: true,
                password: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.twoFactorEnabled) {
            return NextResponse.json({
                error: "2FA is already enabled. Disable it first to set up a new one."
            }, { status: 400 });
        }

        // Users must have a password to enable 2FA
        if (!user.password) {
            return NextResponse.json({
                error: "Please set a password before enabling 2FA"
            }, { status: 400 });
        }

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `AgonyBeats (${user.email})`,
            issuer: "AgonyBeats",
            length: 32
        });

        // Store secret temporarily (not enabled yet)
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret.base32 }
        });

        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

        return NextResponse.json({
            success: true,
            secret: secret.base32,
            qrCode: qrCodeDataUrl,
            message: "Scan the QR code with your authenticator app, then verify with a code"
        });

    } catch (error) {
        console.error("2FA Setup Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
