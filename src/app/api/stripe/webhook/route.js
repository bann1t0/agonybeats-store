import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { generateLicensePDF } from "@/lib/licenseTemplates";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        console.log("Payment successful! Session ID:", session.id);
        console.log("Customer email:", session.customer_email);

        // Extract metadata
        const { cart, email, name } = session.metadata;
        const cartItems = JSON.parse(cart);

        try {
            // Process the order (same logic as PayPal)
            await processStripeOrder(cartItems, email, name, session.id);
        } catch (error) {
            console.error("Error processing Stripe order:", error);
            return NextResponse.json({ error: "Order processing failed" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}

async function processStripeOrder(cart, email, name, sessionId) {
    console.log(`Processing Stripe order for ${email}, Session: ${sessionId}`);

    const downloads = [];

    for (const item of cart) {
        const beat = await prisma.beat.findUnique({ where: { id: item.id } });
        if (!beat) {
            console.warn(`Beat ${item.id} not found`);
            continue;
        }

        const files = [];

        // MP3 (tagged version for free download or purchased)
        if (beat.taggedAudio) {
            files.push({
                name: `${beat.title}.mp3`,
                url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${beat.taggedAudio}`,
            });
        }

        // WAV (if license includes it)
        const licenseType = item.licenseType || "basic";
        if (licenseType.includes("premium") || licenseType.includes("unlimited") || licenseType.includes("exclusive")) {
            if (beat.wav) {
                files.push({
                    name: `${beat.title}.wav`,
                    url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${beat.wav}`,
                });
            }
        }

        // Stems (if license includes it)
        if (licenseType.includes("unlimited") || licenseType.includes("exclusive")) {
            if (beat.stems) {
                files.push({
                    name: `${beat.title}_stems.zip`,
                    url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${beat.stems}`,
                });
            }
        }

        downloads.push({
            beatTitle: beat.title,
            license: item.licenseTitle || "Basic Lease",
            files,
        });
    }

    // Send email with download links
    await sendDownloadEmail(email, name, downloads, sessionId);

    console.log(`Stripe order processed successfully for ${email}`);
}

async function sendDownloadEmail(toEmail, userName, downloads, sessionId) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let downloadHTML = "";
    downloads.forEach((beat) => {
        downloadHTML += `
            <div style="margin-bottom: 2rem; padding: 1.5rem; background: #1a1a1a; border-radius: 8px;">
                <h3 style="color: #0ea5e9; margin-bottom: 1rem;">${beat.beatTitle}</h3>
                <p style="color: #888; margin-bottom: 1rem;">License: ${beat.license}</p>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${beat.files
                .map(
                    (file) => `
                        <a href="${file.url}" style="display: inline-block; padding: 0.75rem 1.5rem; background: #0ea5e9; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                            ⬇️ Download ${file.name}
                        </a>
                    `
                )
                .join("")}
                </div>
            </div>
        `;
    });

    const mailOptions = {
        from: `"AgonyBeats" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "🎵 Your AgonyBeats Purchase - Download Ready!",
        html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: white; padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="color: #0ea5e9; font-size: 2rem; margin: 0;">AGONYBEATS</h1>
                    <p style="color: #888; margin-top: 0.5rem;">Premium Beat Store</p>
                </div>

                <div style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(217, 70, 239, 0.1)); padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                    <h2 style="color: white; margin-top: 0;">Thank You for Your Purchase! 🎉</h2>
                    <p style="color: #ccc; line-height: 1.8;">
                        Hi ${userName || "Producer"},<br><br>
                        Your payment was successful! Your beats are ready to download.
                    </p>
                </div>

                <h2 style="color: white; margin-bottom: 1rem;">Your Downloads:</h2>
                ${downloadHTML}

                <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <p style="color: #888; font-size: 0.9rem; margin: 0;">
                        <strong>Order ID:</strong> ${sessionId}<br>
                        <strong>Download links expire after 30 days.</strong><br>
                        Need help? Reply to this email or visit our contact page.
                    </p>
                </div>

                <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="color: #666; font-size: 0.85rem;">
                        © ${new Date().getFullYear()} AgonyBeats. All rights reserved.<br>
                        This is an automated email. Please do not reply directly.
                    </p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Download email sent to ${toEmail}`);
}
