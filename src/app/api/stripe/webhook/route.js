import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    try {
        const body = await req.text();
        const signature = req.headers.get("stripe-signature");

        let event;

        // Verify webhook signature
        if (webhookSecret) {
            try {
                event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
            } catch (err) {
                console.error("Webhook signature verification failed:", err.message);
                return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
            }
        } else {
            // For development without webhook secret
            event = JSON.parse(body);
            console.warn("⚠️ Webhook secret not set - skipping signature verification");
        }

        console.log("Stripe webhook event:", event.type);

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;

                if (session.mode === "subscription") {
                    // Handle subscription payments
                    const userId = session.metadata?.userId;
                    const planId = session.metadata?.planId;
                    const subscriptionId = session.subscription;

                    if (userId && planId && subscriptionId) {
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                        await prisma.subscription.upsert({
                            where: { userId },
                            update: {
                                tierId: planId,
                                status: "ACTIVE",
                                paypalSubscriptionId: subscriptionId,
                                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                                cancelledAt: null,
                            },
                            create: {
                                userId,
                                tierId: planId,
                                status: "ACTIVE",
                                paypalSubscriptionId: subscriptionId,
                                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                            },
                        });

                        console.log(`✅ Subscription created for user ${userId}, plan: ${planId}`);
                    }
                } else if (session.mode === "payment") {
                    // Handle one-time beat purchases
                    const userEmail = session.metadata?.userEmail || session.customer_email;
                    const userName = session.metadata?.userName;
                    const userId = session.metadata?.userId;
                    const cartItemsStr = session.metadata?.cartItems;
                    const total = parseFloat(session.metadata?.total || '0');

                    if (cartItemsStr && userEmail) {
                        try {
                            const cartItems = JSON.parse(cartItemsStr);

                            // Create purchase records for each item
                            for (const item of cartItems) {
                                await prisma.purchase.create({
                                    data: {
                                        beatId: item.id,
                                        userId: userId || null,
                                        licenseId: item.licenseId || null,
                                        amount: item.price || 0,
                                        buyerEmail: userEmail,
                                        buyerName: userName || null,
                                        status: 'completed'
                                    }
                                });
                            }

                            console.log(`✅ Beat purchase completed for ${userEmail}, ${cartItems.length} items, total: €${total}`);

                            // Note: Email delivery is handled via /api/orders when user lands on success page
                        } catch (parseError) {
                            console.error("Error parsing cart items:", parseError);
                        }
                    }
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    const status = subscription.status === "active" ? "ACTIVE" :
                        subscription.status === "canceled" ? "CANCELLED" : "PENDING";

                    await prisma.subscription.update({
                        where: { userId },
                        data: {
                            status,
                            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                            cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
                        },
                    });

                    console.log(`✅ Subscription updated for user ${userId}, status: ${status}`);
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    await prisma.subscription.update({
                        where: { userId },
                        data: {
                            status: "CANCELLED",
                            cancelledAt: new Date(),
                        },
                    });

                    console.log(`✅ Subscription cancelled for user ${userId}`);
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object;
                console.error("❌ Payment failed for invoice:", invoice.id);
                // Could send email notification to user here
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
