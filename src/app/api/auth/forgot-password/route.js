import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Valid email required" }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                message: "If this email exists, a reset code has been sent."
            });
        }

        // Generate 6-digit code
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiry to 15 minutes from now
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

        // Save token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // Send email with code
        await sendResetEmail(email, resetToken, user.name || "User");

        console.log(`Password reset code sent to ${email}`);

        return NextResponse.json({
            message: "If this email exists, a reset code has been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}

async function sendResetEmail(toEmail, code, userName) {
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
        subject: "Reset Your AgonyBeats Password",
        html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: white; padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 1rem; display: block;">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <h1 style="color: #0ea5e9; font-size: 2rem; margin: 0;">AGONYBEATS</h1>
                    <p style="color: #888; margin-top: 0.5rem;">Password Reset Request</p>
                </div>

                <div style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(217, 70, 239, 0.1)); padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                    <h2 style="color: white; margin-top: 0;">Hi ${userName},</h2>
                    <p style="color: #ccc; line-height: 1.8;">
                        You requested to reset your password. Use the code below to continue:
                    </p>
                </div>

                <div style="text-align: center; padding: 2rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 2rem;">
                    <p style="color: #888; font-size: 0.9rem; margin-bottom: 1rem;">Your Reset Code:</p>
                    <div style="font-size: 2.5rem; font-weight: bold; color: #0ea5e9; letter-spacing: 0.5rem; font-family: monospace;">
                        ${code}
                    </div>
                    <p style="color: #666; font-size: 0.85rem; margin-top: 1rem;">
                        This code expires in <strong style="color: #ef4444;">15 minutes</strong>
                    </p>
                </div>

                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 8px; padding: 1rem; margin-bottom: 2rem; display: flex; gap: 0.75rem; align-items: flex-start;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <p style="color: #fca5a5; margin: 0; font-size: 0.9rem;">
                        If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
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
    console.log(`Reset email sent to ${toEmail}`);
}
