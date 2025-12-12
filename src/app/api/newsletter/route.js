
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path if needed

// POST: Subscribe to newsletter
export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Update existing user
            await prisma.user.update({
                where: { email },
                data: { isSubscribed: true },
            });
            return NextResponse.json({ message: "Subscription updated for existing account!" });
        }

        // 2. Check if already in guest subscribers
        const existingSub = await prisma.newsletterSubscriber.findUnique({
            where: { email },
        });

        if (existingSub) {
            return NextResponse.json({ message: "Already subscribed!" });
        }

        // 3. Create new guest subscriber
        await prisma.newsletterSubscriber.create({
            data: { email },
        });

        return NextResponse.json({ message: "Subscribed successfully!" });

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
