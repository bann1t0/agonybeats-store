import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getTier } from "@/lib/subscriptionTiers";

// PayPal API configuration
const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Get PayPal access token
async function getPayPalAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

// POST /api/subscriptions - Create new subscription
export async function POST(req) {
    try {
        console.log('=== CREATE SUBSCRIPTION REQUEST ===');

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.log('User authenticated:', session.user.email);

        const { tierId } = await req.json();
        console.log('Tier requested:', tierId);

        const tier = getTier(tierId);

        if (!tier) {
            return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
        }

        // Get Plan ID directly from env (getters may not work properly)
        const planIdMap = {
            'base': process.env.PAYPAL_BASE_PLAN_ID,
            'advanced': process.env.PAYPAL_ADVANCED_PLAN_ID,
            'special': process.env.PAYPAL_SPECIAL_PLAN_ID
        };

        const paypalPlanId = planIdMap[tierId];
        console.log('Tier found:', tier.name);
        console.log('Plan ID from env:', paypalPlanId);

        if (!paypalPlanId) {
            throw new Error(`PayPal Plan ID not configured for tier: ${tierId}`);
        }

        // Check if user already has active subscription
        const existing = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: 'ACTIVE'
            }
        });

        if (existing) {
            return NextResponse.json({ error: "You already have an active subscription" }, { status: 400 });
        }

        // Check PayPal credentials
        console.log('PayPal Mode:', process.env.PAYPAL_MODE);
        console.log('PayPal API:', PAYPAL_API);
        console.log('Client ID exists:', !!PAYPAL_CLIENT_ID);
        console.log('Client Secret exists:', !!PAYPAL_CLIENT_SECRET);

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error('PayPal credentials not configured. Check .env file.');
        }

        // Get PayPal access token
        console.log('Getting PayPal access token...');
        const accessToken = await getPayPalAccessToken();
        console.log('Access token received:', !!accessToken);

        // Create PayPal subscription
        console.log('Creating PayPal subscription...');

        // Build subscriber info - PayPal requires non-empty surname
        const nameParts = (session.user.name || 'User').split(' ');
        const givenName = nameParts[0] || 'User';
        const surname = nameParts.slice(1).join(' ') || 'Customer';

        // Start time should be in the future (at least 1 minute from now)
        const startTime = new Date(Date.now() + 60000).toISOString();

        const requestBody = {
            plan_id: paypalPlanId,
            start_time: startTime,
            subscriber: {
                name: {
                    given_name: givenName,
                    surname: surname
                },
                email_address: session.user.email
            },
            application_context: {
                brand_name: 'AgonyBeats',
                locale: 'en-US',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'SUBSCRIBE_NOW',
                payment_method: {
                    payer_selected: 'PAYPAL',
                    payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
                },
                return_url: `${process.env.NEXTAUTH_URL}/api/subscriptions/success`,
                cancel_url: `${process.env.NEXTAUTH_URL}/subscribe?canceled=true`
            }
        };

        console.log('=== PayPal Request Body ===');
        console.log('Plan ID:', paypalPlanId);
        console.log('Subscriber:', JSON.stringify(requestBody.subscriber, null, 2));
        console.log('Full request:', JSON.stringify(requestBody, null, 2));

        const paypalResponse = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const paypalData = await paypalResponse.json();
        console.log('PayPal response status:', paypalResponse.status);
        console.log('PayPal response:', JSON.stringify(paypalData, null, 2));

        if (!paypalResponse.ok) {
            console.error('PayPal error details:', JSON.stringify(paypalData, null, 2));
            const errorMessage = paypalData.details?.[0]?.description || paypalData.message || JSON.stringify(paypalData);
            throw new Error(errorMessage);
        }

        // Save pending subscription to database
        await prisma.subscription.create({
            data: {
                userId: session.user.id,
                tierId: tier.id,
                status: 'PENDING',
                paypalSubscriptionId: paypalData.id,
                startDate: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        });

        // Get approval URL
        const approvalUrl = paypalData.links.find(link => link.rel === 'approve')?.href;
        console.log('Approval URL:', approvalUrl);

        return NextResponse.json({ approvalUrl });

    } catch (error) {
        console.error("=== CREATE SUBSCRIPTION ERROR ===");
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET /api/subscriptions - Get user's active subscription
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: { in: ['ACTIVE', 'PENDING'] }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!subscription) {
            return NextResponse.json(null);
        }

        // Get tier info
        const tier = getTier(subscription.tierId);

        return NextResponse.json({
            ...subscription,
            tier
        });

    } catch (error) {
        console.error("Get subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/subscriptions - Cancel subscription
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: 'ACTIVE'
            }
        });

        if (!subscription) {
            return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
        }

        // Cancel on PayPal
        const accessToken = await getPayPalAccessToken();

        await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscription.paypalSubscriptionId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reason: 'User requested cancellation'
            })
        });

        // Update in database
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date()
            }
        });

        return NextResponse.json({ message: "Subscription cancelled successfully" });

    } catch (error) {
        console.error("Cancel subscription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
