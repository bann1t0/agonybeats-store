import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';
import { createOrderEmail } from '@/lib/emailTemplates';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    try {
        const { cart, email, name, total, discountCodeId } = await req.json();

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
        }

        // Get user session to link purchase to user
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // Mark discount code as used (increment uses counter)
        if (discountCodeId) {
            try {
                await prisma.discountCode.update({
                    where: { id: discountCodeId },
                    data: { uses: { increment: 1 } }
                });
                console.log('✅ Discount code uses incremented:', discountCodeId);
            } catch (dcError) {
                console.error('❌ Failed to update discount code:', dcError);
            }
        }

        const deliveredFiles = [];
        const createdPurchases = [];

        for (const item of cart) {
            // Fetch beat fresh from DB to ensure file paths are accurate
            const beat = await prisma.beat.findUnique({
                where: { id: item.id }
            });

            if (!beat) continue;

            const licenseType = item.licenseType?.toLowerCase() || "basic";
            const files = [];

            // file mapping logic
            const includeMP3 = true; // Always
            let includeWAV = false;
            let includeStems = false;

            if (licenseType === "free" || licenseType === "test" || licenseType === "free_test") {
                // Generous test mode
                includeWAV = true;
                includeStems = true;
            } else if (licenseType === "basic") {
                includeWAV = false;
            } else if (licenseType === "standard") {
                includeWAV = true;
            } else if (licenseType === "premium" || licenseType === "exclusive" || licenseType === "special") {
                includeWAV = true;
                includeStems = true;
            }

            // Push MP3
            if (includeMP3 && beat.audio) {
                files.push({ name: `${beat.title} (MP3).mp3`, url: beat.audio });
            }

            // Push WAV
            if (includeWAV && beat.wav) {
                files.push({ name: `${beat.title} (WAV).wav`, url: beat.wav });
            }

            // Push Stems
            if (includeStems && beat.stems) {
                files.push({ name: `${beat.title} (Stems).zip`, url: beat.stems });
            }

            // License Link
            const encodedTitle = encodeURIComponent(beat.title);
            const encodedBuyer = encodeURIComponent(name || email || "Valued Customer");
            const encodedType = encodeURIComponent(licenseType);
            const licenseUrl = `${process.env.NEXTAUTH_URL}/api/license?beatTitle=${encodedTitle}&buyerName=${encodedBuyer}&licenseType=${encodedType}`;

            deliveredFiles.push({
                beatTitle: beat.title,
                license: item.licenseTitle,
                files: [
                    ...files,
                    { name: 'LICENSE AGREEMENT.txt', url: licenseUrl }
                ]
            });

            // CREATE PURCHASE RECORD FOR ANALYTICS
            try {
                const purchase = await prisma.purchase.create({
                    data: {
                        beatId: beat.id,
                        userId: userId || null, // Link to user if logged in
                        licenseId: item.licenseId || null,
                        amount: item.price || 0,
                        buyerEmail: email,
                        buyerName: name || null,
                        status: 'completed'
                    }
                });
                createdPurchases.push(purchase);
                console.log('✅ Purchase record created:', purchase.id);
            } catch (dbError) {
                console.error('❌ Failed to create purchase record:', dbError);
                // Continue anyway - don't fail the order if DB write fails
            }
        }

        // Send confirmation email with styled template
        if (email && process.env.RESEND_API_KEY) {
            try {
                const htmlContent = createOrderEmail(email, name, deliveredFiles, total || 0);

                await resend.emails.send({
                    from: 'AgonyBeats <orders@agonybeats.com>',
                    to: email,
                    subject: '🎵 Your AgonyBeats Order - Download Your Beats',
                    html: htmlContent
                });

                console.log('✅ Order confirmation email sent to:', email);
            } catch (emailError) {
                console.error('❌ Email send failed:', emailError);
                // Don't fail the order if email fails
            }
        }

        return NextResponse.json({
            success: true,
            downloads: deliveredFiles
        });

    } catch (error) {
        console.error("Order API Error:", error);
        return NextResponse.json({ error: "Order processing failed" }, { status: 500 });
    }
}
