import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req) {
    try {
        console.log("🔄 Reset password request received");
        const { email, token, newPassword } = await req.json();
        console.log("📧 Email:", email);
        console.log("🔑 Token:", token);

        if (!email || !token || !newPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        // Find user with matching email and token
        const user = await prisma.user.findFirst({
            where: {
                email,
                resetToken: token,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 });
        }

        // Check if token is expired
        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return NextResponse.json({ error: "Reset code has expired. Please request a new one." }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        // Send confirmation email
        await sendConfirmationEmail(email, user.name || "User");

        console.log(`Password reset successful for ${email}`);

        return NextResponse.json({
            message: "Password reset successful! You can now login with your new password.",
        });
    } catch (error) {
        console.error("❌ Reset password error:", error);
        console.error("Error stack:", error.stack);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}

async function sendConfirmationEmail(toEmail, userName) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"AgonyBeats" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Password Changed Successfully",
        html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: white; padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="color: #0ea5e9; font-size: 2rem; margin: 0;">AGONYBEATS</h1>
                    <p style="color: #888; margin-top:0.5rem;">Security Update</p>
                </div>

                <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(14, 165, 233, 0.1)); padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                    <h2 style="color: white; margin-top: 0;">Hi ${userName},</h2>
                    <p style="color: #ccc; line-height: 1.8;">
                        Your AgonyBeats password has been changed successfully. You can now login with your new password.
                    </p>
                </div>

                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; text-align: center;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 0.5rem; display: block;">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <p style="color: #34d399; margin: 0; font-weight: bold;">
                        Password Updated
                    </p>
                </div>

                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 1rem; display: flex; gap: 0.75rem; align-items: flex-start;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <p style="color: #fca5a5; margin: 0; font-size: 0.9rem;">
                        If you didn't make this change, please contact us immediately at <a href="mailto:support@agonybeats.com" style="color: #60a5fa;">support@agonybeats.com</a>
                    </p>
                </div>

                <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="color: #666; font-size: 0.85rem;">
                        © ${new Date().getFullYear()} AgonyBeats. All rights reserved.
                    </p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset confirmation email sent to ${toEmail}`);
}
