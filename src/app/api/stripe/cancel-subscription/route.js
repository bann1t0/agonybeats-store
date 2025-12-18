import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
});

// POST /api/stripe/cancel-subscription - Get cancellation URL or cancel subscription
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's subscription
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: 'ACTIVE'
            }
        });

        if (!subscription) {
            return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
        }

        const subscriptionId = subscription.paypalSubscriptionId;

        if (!subscriptionId) {
            return NextResponse.json({ error: "Subscription ID not found" }, { status: 400 });
        }

        // Check if it's a Stripe subscription (starts with 'sub_')
        if (subscriptionId.startsWith('sub_')) {
            // Create Stripe Billing Portal session for cancellation
            try {
                // First get customer ID from subscription
                const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
                const customerId = stripeSubscription.customer;

                const portalSession = await stripe.billingPortal.sessions.create({
                    customer: customerId,
                    return_url: `${process.env.NEXTAUTH_URL || 'https://agonybeats.com'}/account/subscriptions?canceled=true`,
                });

                return NextResponse.json({
                    type: 'stripe',
                    cancelUrl: portalSession.url
                });
            } catch (stripeError) {
                console.error("Stripe portal error:", stripeError);
                return NextResponse.json({ error: "Failed to create cancellation portal" }, { status: 500 });
            }
        } else if (subscriptionId.startsWith('I-')) {
            // It's a PayPal subscription - return PayPal management URL
            const paypalMode = process.env.PAYPAL_MODE === 'live' ? 'www' : 'www.sandbox';
            const paypalCancelUrl = `https://${paypalMode}.paypal.com/myaccount/autopay`;

            return NextResponse.json({
                type: 'paypal',
                cancelUrl: paypalCancelUrl,
                subscriptionId: subscriptionId
            });
        } else {
            return NextResponse.json({
                error: "Unknown subscription provider",
                hint: "Please contact support to cancel your subscription"
            }, { status: 400 });
        }

    } catch (error) {
        console.error("Cancel subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
