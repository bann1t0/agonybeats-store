import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized. Please login." }, { status: 401 });
        }

        // Next.js 16+ await params
        const resolvedParams = await params;
        const { id } = resolvedParams;

        let beat = await prisma.beat.findUnique({
            where: { id: id },
        });

        // Fallback for Dummy Beat (ID 1)
        if (!beat && id === "1") {
            beat = {
                id: "1",
                title: "BLUEBERRY",
                audio: "/beats/blueberry.mp3"
            };
        }

        if (!beat) {
            return NextResponse.json({ error: "Beat not found" }, { status: 404 });
        }

        // Send Email Notification to Admin (Only if configured)
        if (process.env.EMAIL_PASSWORD) {
            try {
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "andreadelfoco5@gmail.com",
                        pass: process.env.EMAIL_PASSWORD
                    }
                });

                await transporter.sendMail({
                    from: '"AgonyBeats Store" <andreadelfoco5@gmail.com>',
                    to: "andreadelfoco5@gmail.com",
                    subject: `🔔 New Free Download: ${beat.title}`,
                    html: `
                        <h1>New Download Alert!</h1>
                        <p><strong>User:</strong> ${session.user.name} (${session.user.email})</p>
                        <p><strong>Downloaded Beat:</strong> ${beat.title}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        <hr />
                        <p><em>This user has consented to data collection by registering.</em></p>
                    `
                });
            } catch (emailErr) {
                console.error("Failed to send email notification:", emailErr);
                // Do not fail the request if email fails
            }
        }

        // Return the file path (Prioritize Tagged/Demo file, else Streaming file)
        const fileToDownload = beat.taggedAudio || beat.audio;

        return NextResponse.json({
            downloadUrl: fileToDownload,
            message: "Download started"
        });

    } catch (error) {
        console.error("Download Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
