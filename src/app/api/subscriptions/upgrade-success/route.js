import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/subscriptions/upgrade-success - Handle upgrade completion callback
export async function GET(req) {
    try {
        console.log('=== SUBSCRIPTION UPGRADE SUCCESS ===');

        const { searchParams } = new URL(req.url);
        const newTier = searchParams.get('newTier');
        const subscriptionId = searchParams.get('subscription_id');

        console.log('New tier:', newTier);
        console.log('PayPal subscription ID:', subscriptionId);

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Find user's subscription
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: 'ACTIVE'
            }
        });

        if (!subscription) {
            console.error('No active subscription found for user');
            return NextResponse.redirect(new URL('/account/subscriptions?error=not_found', req.url));
        }

        // Update subscription tier
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                tierId: newTier,
                updatedAt: new Date()
            }
        });

        console.log('Subscription upgraded successfully to:', newTier);

        // Redirect to subscription page with success message
        return NextResponse.redirect(
            new URL(`/account/subscriptions?upgraded=true&tier=${newTier}`, req.url)
        );

    } catch (error) {
        console.error('Upgrade success handler error:', error);
        return NextResponse.redirect(
            new URL(`/account/subscriptions?error=${encodeURIComponent(error.message)}`, req.url)
        );
    }
}
