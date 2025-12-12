import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Success callback from PayPal
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const subscriptionId = searchParams.get('subscription_id');
        const token = searchParams.get('token');

        if (!subscriptionId) {
            return NextResponse.redirect(new URL('/subscribe?error=missing_id', req.url));
        }

        // Find subscription in database
        const subscription = await prisma.subscription.findFirst({
            where: { paypalSubscriptionId: subscriptionId }
        });

        if (!subscription) {
            return NextResponse.redirect(new URL('/subscribe?error=not_found', req.url));
        }

        // Update subscription status to ACTIVE
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'ACTIVE' }
        });

        // Redirect to success page
        return NextResponse.redirect(new URL('/account/subscriptions?success=true', req.url));

    } catch (error) {
        console.error("Subscription success callback error:", error);
        return NextResponse.redirect(new URL('/subscribe?error=unknown', req.url));
    }
}
