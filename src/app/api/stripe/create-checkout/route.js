import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// Lazy Stripe initialization to avoid undefined API key at module load
let stripeInstance = null;
function getStripe() {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is not configured");
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2023-10-16",
        });
    }
    return stripeInstance;
}

// Stripe Price IDs for subscription plans
const STRIPE_PRICES = {
    base: process.env.STRIPE_PRICE_BASE || "price_1SfRXiAJNEYiJwzu0n0Om4RJ",
    advanced: process.env.STRIPE_PRICE_ADVANCED || "price_1SfRY9AJNEYiJwzu7Hn5DPe7",
    special: process.env.STRIPE_PRICE_SPECIAL || "price_1SfRYpAJNEYiJwzutGiurMcd",
};

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Must be logged in to subscribe" }, { status: 401 });
        }

        const { planId } = await req.json();

        if (!planId || !STRIPE_PRICES[planId]) {
            return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
        }

        const priceId = STRIPE_PRICES[planId];

        // Create Stripe Checkout Session for subscription
        const checkoutSession = await getStripe().checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: session.user.email,
            success_url: `${process.env.NEXTAUTH_URL || "https://agonybeats.com"}/account/subscriptions?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL || "https://agonybeats.com"}/subscriptions?canceled=true`,
            metadata: {
                userId: session.user.id,
                planId: planId,
                userEmail: session.user.email,
            },
            subscription_data: {
                metadata: {
                    userId: session.user.id,
                    planId: planId,
                },
            },
        });

        return NextResponse.json({
            url: checkoutSession.url,
            sessionId: checkoutSession.id
        });

    } catch (error) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
