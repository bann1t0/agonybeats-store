
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path if needed

// Generate unique discount code
function generateDiscountCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars like O/0, I/1
    let code = 'WELCOME';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// POST: Subscribe to newsletter
export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        // Check if email already has a discount code
        const existingCode = await prisma.discountCode.findFirst({
            where: { email }
        });

        if (existingCode) {
            return NextResponse.json({
                message: "Already subscribed!",
                discountCode: existingCode.code,
                percentage: existingCode.percentage
            });
        }

        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            await prisma.user.update({
                where: { email },
                data: { isSubscribed: true },
            });
        }

        // 2. Check if already in guest subscribers
        const existingSub = await prisma.newsletterSubscriber.findUnique({
            where: { email },
        });

        if (!existingSub && !existingUser) {
            // 3. Create new guest subscriber
            await prisma.newsletterSubscriber.create({
                data: { email },
            });
        }

        // 4. Generate unique one-time discount code
        let discountCode;
        let attempts = 0;
        while (attempts < 10) {
            const code = generateDiscountCode();
            const exists = await prisma.discountCode.findUnique({
                where: { code }
            });
            if (!exists) {
                discountCode = await prisma.discountCode.create({
                    data: {
                        code,
                        percentage: 30,      // 30% off
                        maxUses: 1,          // One-time use
                        email: email,        // Tied to this email
                        active: true
                    }
                });
                break;
            }
            attempts++;
        }

        return NextResponse.json({
            message: "Subscribed successfully!",
            discountCode: discountCode?.code,
            percentage: discountCode?.percentage
        });

    } catch (error) {
        console.error("Newsletter Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET: List all subscribers (Admin only)
export async function GET(req) {
    try {
        // Fetch subscribed users (User model might not have createdAt)
        const users = await prisma.user.findMany({
            where: { isSubscribed: true },
            select: { email: true }, // Removed createdAt
        });

        // Fetch guest subscribers
        const guests = await prisma.newsletterSubscriber.findMany({
            select: { email: true, createdAt: true },
        });

        // Merge lists
        const allSubs = [
            ...users.map(u => ({ ...u, type: 'User', createdAt: null })), // Handle User date as null or mock if needed
            ...guests.map(g => ({ ...g, type: 'Guest' }))
        ];

        // Sort by date desc (Guest dates first, then Users at bottom if no date)
        allSubs.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return NextResponse.json(allSubs);

    } catch (error) {
        console.error("Newsletter Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
