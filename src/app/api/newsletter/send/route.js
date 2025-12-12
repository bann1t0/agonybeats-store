
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://agonybeats-store.vercel.app';

export async function POST(req) {
    try {
        console.log("---- STARTING EMAIL SEND ----");

        // 0. Env Check
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("MISSING ENV VARS: EMAIL_USER or EMAIL_PASS is empty.");
            return NextResponse.json({ error: "Server Configuration Error: Missing Email Credentials in .env" }, { status: 500 });
        }

        const formData = await req.formData();
        const subject = formData.get("subject");
        const message = formData.get("message");
        const featuredBeatId = formData.get("featuredBeatId");
        const file = formData.get("file");
        const selectedEmailsJson = formData.get("selectedEmails");

        console.log(`Params: Subject=${subject}, BeatID=${featuredBeatId}, File=${file ? 'Yes' : 'No'}, Selected=${selectedEmailsJson ? 'Yes' : 'No'}`);

        if (!subject || !message) {
            return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
        }

        // 1. Fetch all subscribers
        const users = await prisma.user.findMany({ where: { isSubscribed: true }, select: { email: true } });
        const guests = await prisma.newsletterSubscriber.findMany({ select: { email: true } });
        let allEmails = [...users, ...guests].map(u => u.email);

        // 2. Filter by selected emails if provided
        if (selectedEmailsJson) {
            try {
                const selectedEmails = JSON.parse(selectedEmailsJson);
                if (Array.isArray(selectedEmails) && selectedEmails.length > 0) {
                    allEmails = allEmails.filter(email => selectedEmails.includes(email));
                    console.log(`Filtered to ${allEmails.length} selected recipients.`);
                }
            } catch (parseErr) {
                console.error("Failed to parse selectedEmails:", parseErr);
            }
        }

        console.log(`Found ${allEmails.length} subscribers to send to.`);

        if (allEmails.length === 0) {
            return NextResponse.json({ message: "No subscribers to send to." });
        }

        // 2. Configure Transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Verify connection
        try {
            await transporter.verify();
            console.log("Transporter verification success.");
        } catch (verifyErr) {
            console.error("Transporter Verify Error:", verifyErr);
            return NextResponse.json({ error: "Email Login Failed. Check your App Password." }, { status: 500 });
        }

        // 3. Prepare Content - PREMIUM NEON EMAIL TEMPLATE
        let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AgonyBeats Newsletter</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Orbitron:wght@700;900&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #05050a 0%, #0f0515 50%, #05050a 100%); min-height: 100vh;">
            
            <!-- Main Container -->
            <div style="max-width: 650px; margin: 0 auto; padding: 50px 20px;">
                
                <!-- Header with Premium Neon Logo -->
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="
                        font-family: 'Orbitron', sans-serif;
                        font-size: 52px;
                        font-weight: 900;
                        letter-spacing: 6px;
                        margin: 0;
                        color: #ffffff;
                        text-shadow: 
                            0 0 10px rgba(255, 0, 255, 1),
                            0 0 20px rgba(255, 0, 255, 0.8),
                            0 0 30px rgba(0, 255, 255, 0.8),
                            0 0 40px rgba(255, 0, 255, 0.6),
                            0 0 60px rgba(0, 255, 255, 0.5);
                    ">AGONYBEATS</h1>
                    <p style="color: #999; margin: 15px 0 0 0; font-size: 13px; letter-spacing: 4px; font-weight: 500; text-transform: uppercase;">Premium Sound Library</p>
                    <!-- Decorative Line -->
                    <div style="
                        width: 100px;
                        height: 2px;
                        background: linear-gradient(90deg, transparent, #ff00ff, #00ffff, transparent);
                        margin: 20px auto 0;
                        box-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
                    "></div>
                </div>

                <!-- Main Content Card -->
                <div style="
                    background: linear-gradient(135deg, rgba(15, 5, 25, 0.98) 0%, rgba(25, 10, 35, 0.98) 100%);
                    border: 2px solid transparent;
                    background-image: 
                        linear-gradient(135deg, rgba(15, 5, 25, 0.98) 0%, rgba(25, 10, 35, 0.98) 100%),
                        linear-gradient(135deg, #ff00ff 0%, #00ffff 50%, #ff0080 100%);
                    background-origin: border-box;
                    background-clip: padding-box, border-box;
                    border-radius: 20px;
                    padding: 45px 35px;
                    box-shadow: 
                        0 0 60px rgba(255, 0, 255, 0.4), 
                        0 0 100px rgba(0, 255, 255, 0.3),
                        inset 0 0 60px rgba(0, 0, 0, 0.3);
                    margin-bottom: 35px;
                ">
                    
                    <!-- Message Content -->
                    <div style="
                        color: #f0f0f0;
                        font-size: 17px;
                        line-height: 1.9;
                        margin-bottom: 35px;
                        font-weight: 400;
                    ">
                        ${message.replace(/\n/g, '<br>')}
                    </div>`

        let attachments = [];

        // Handle Custom File Attachment
        if (file && typeof file === "object" && typeof file.arrayBuffer === "function") {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());

                // Backend Size Check (25MB - Gmail's maximum)
                if (buffer.length > 25 * 1024 * 1024) {
                    console.error("File Buffer Error: Exceeds 25MB limit.");
                    return NextResponse.json({ error: "File too large (>25MB). Gmail limits attachments to 25MB." }, { status: 400 });
                }

                attachments.push({
                    filename: file.name || "attachment",
                    content: buffer
                });
                console.log("File attached successfully.");
            } catch (fileErr) {
                console.error("File Buffer Error:", fileErr);
            }
        }

        // Handle Beat Card
        if (featuredBeatId) {
            const beat = await prisma.beat.findUnique({ where: { id: featuredBeatId } });
            if (beat) {
                console.log("Beat found for visuals:", beat.title);

                // Convert beat image to base64 for email embedding
                const fs = require('fs');
                const path = require('path');
                let imageBase64 = null;
                let imageCid = 'beatcover@agonybeats';

                try {
                    // Construct full path to the image
                    const imagePath = path.join(process.cwd(), 'public', beat.cover);
                    console.log("Attempting to read image from:", imagePath);

                    if (fs.existsSync(imagePath)) {
                        const imageBuffer = fs.readFileSync(imagePath);
                        imageBase64 = imageBuffer.toString('base64');

                        // Add image as CID attachment
                        attachments.push({
                            filename: path.basename(beat.cover),
                            content: imageBuffer,
                            cid: imageCid
                        });
                        console.log("Image attached successfully as CID");
                    } else {
                        console.warn("Image file not found:", imagePath);
                    }
                } catch (imageErr) {
                    console.error("Error reading beat image:", imageErr);
                }

                htmlContent += `
                    <!-- Featured Beat Card -->
                    <div style="
                        background: rgba(0, 0, 0, 0.5);
                        border: 2px solid rgba(255, 0, 255, 0.5);
                        border-radius: 16px;
                        overflow: hidden;
                        margin-top: 35px;
                        box-shadow: 
                            0 0 30px rgba(255, 0, 255, 0.3),
                            0 0 60px rgba(0, 255, 255, 0.2),
                            inset 0 0 40px rgba(0, 0, 0, 0.4);
                    ">
                        <!-- Header -->
                        <div style="
                            background: linear-gradient(135deg, #ff00ff 0%, #ff0080 50%, #00ffff 100%);
                            padding: 18px;
                            text-align: center;
                        ">
                            <p style="
                                margin: 0;
                                color: white;
                                font-weight: 800;
                                font-size: 18px;
                                letter-spacing: 3px;
                                text-transform: uppercase;
                                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
                            ">Featured Track</p>
                        </div>
                        
                        <!-- Beat Content -->
                        <div style="padding: 40px; text-align: center; background: linear-gradient(180deg, rgba(10, 5, 15, 0.6) 0%, rgba(5, 5, 10, 0.8) 100%);">
                            <!-- Clickable Beat Image -->
                            <a href="${BASE_URL}/beats/${beat.id}" style="display: inline-block; text-decoration: none;">
                                <img src="cid:${imageCid}" alt="${beat.title}" style="
                                    width: 300px;
                                    height: 300px;
                                    object-fit: cover;
                                    border-radius: 16px;
                                    margin-bottom: 25px;
                                    border: 3px solid rgba(0, 255, 255, 0.6);
                                    box-shadow: 
                                        0 0 40px rgba(0, 255, 255, 0.6),
                                        0 0 80px rgba(255, 0, 255, 0.4),
                                        0 10px 40px rgba(0, 0, 0, 0.5);
                                    transition: transform 0.3s ease;
                                ">
                            </a>
                            
                            <h3 style="
                                margin: 0 0 12px 0;
                                color: #fff;
                                font-family: 'Orbitron', sans-serif;
                                font-size: 28px;
                                font-weight: 900;
                                letter-spacing: 2px;
                                text-shadow: 
                                    0 0 20px rgba(255, 0, 255, 0.8),
                                    0 0 40px rgba(0, 255, 255, 0.5);
                            ">${beat.title}</h3>
                            
                            <p style="
                                margin: 0 0 30px 0;
                                color: #00ffff;
                                font-size: 18px;
                                font-weight: 600;
                                letter-spacing: 1px;
                                text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
                            ">${beat.bpm} BPM • ${beat.key} • ${beat.genre}</p>
                            
                            <!-- CTA Button -->
                            <a href="${BASE_URL}/beats/${beat.id}" style="
                                display: inline-block;
                                background: linear-gradient(135deg, #ff00ff 0%, #ff0080 100%);
                                color: white;
                                text-decoration: none;
                                padding: 18px 50px;
                                border-radius: 50px;
                                font-family: 'Inter', sans-serif;
                                font-weight: 800;
                                font-size: 17px;
                                letter-spacing: 2px;
                                text-transform: uppercase;
                                box-shadow: 
                                    0 0 30px rgba(255, 0, 255, 0.7),
                                    0 5px 20px rgba(0, 0, 0, 0.4);
                                border: 2px solid rgba(255, 255, 255, 0.3);
                                transition: all 0.3s ease;
                            ">Listen Now</a>
                        </div>
                    </div>
                `;
            }
        }

        htmlContent += `
                </div>
                
                <!-- Decorative Separator -->
                <div style="
                    width: 150px;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #ff00ff, #00ffff, transparent);
                    margin: 40px auto;
                    box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
                "></div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 20px;">
                    <p style="
                        color: #888;
                        font-size: 13px;
                        margin: 0 0 15px 0;
                        line-height: 1.8;
                        font-weight: 400;
                    ">
                        You are receiving this because you subscribed to AgonyBeats.<br>
                        <a href="#" style="color: #00ffff; text-decoration: none; font-weight: 600; text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);">Unsubscribe</a>
                    </p>
                    
                    <!-- Social Links (Optional) -->
                    <div style="margin-top: 25px;">
                        <p style="
                            color: #666;
                            font-size: 11px;
                            margin: 0;
                            letter-spacing: 2px;
                            font-weight: 500;
                        ">© 2024 AgonyBeats - All Rights Reserved</p>
                    </div>
                </div>
                
            </div>
        </body>
        </html>
        `;

        // 4. Send Emails
        const mailOptions = {
            from: `"AgonyBeats" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            bcc: allEmails,
            subject: subject,
            text: message,
            html: htmlContent,
            attachments: attachments
        };

        console.log("Sending mail now...");
        await transporter.sendMail(mailOptions);
        console.log("Mail sent successfully.");

        return NextResponse.json({ message: `Sent to ${allEmails.length} subscribers!` });

    } catch (error) {
        console.error("Email Send CRITICAL Error:", error);
        return NextResponse.json({ error: "Failed to send: " + error.message }, { status: 500 });
    }
}
