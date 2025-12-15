import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getTier, SUBSCRIPTION_TIERS } from "@/lib/subscriptionTiers";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// Plan ID mapping
const planIdMap = {
    'base': process.env.PAYPAL_BASE_PLAN_ID || 'P-2TY13469GG7008428NE5RN4Q',
    'advanced': process.env.PAYPAL_ADVANCED_PLAN_ID || 'P-9WE31665X6150735CNE5RPEI',
    'special': process.env.PAYPAL_SPECIAL_PLAN_ID || 'P-07F348626J919554BNE5RPYA'
};

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

// POST /api/subscriptions/upgrade - Upgrade or downgrade subscription
export async function POST(req) {
    try {
        console.log('=== SUBSCRIPTION UPGRADE REQUEST ===');

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { newTierId } = await req.json();
        console.log('New tier requested:', newTierId);

        // Validate new tier
        const newTier = getTier(newTierId);
        if (!newTier) {
            return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
        }

        // Get current subscription
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: session.user.id,
                status: 'ACTIVE'
            }
        });

        if (!subscription) {
            return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
        }

        const currentTier = getTier(subscription.tierId);
        console.log('Current tier:', currentTier?.name, '→ New tier:', newTier.name);

        if (subscription.tierId === newTierId) {
            return NextResponse.json({ error: "You're already on this plan" }, { status: 400 });
        }

        // Determine if upgrade or downgrade
        const tierOrder = { 'base': 1, 'advanced': 2, 'special': 3 };
        const isUpgrade = tierOrder[newTierId] > tierOrder[subscription.tierId];
        console.log('Is upgrade:', isUpgrade);

        // Get new plan ID
        const newPlanId = planIdMap[newTierId];
        if (!newPlanId) {
            return NextResponse.json({ error: "Plan not configured" }, { status: 500 });
        }

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Call PayPal revise subscription API
        const reviseResponse = await fetch(
            `${PAYPAL_API}/v1/billing/subscriptions/${subscription.paypalSubscriptionId}/revise`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    plan_id: newPlanId,
                    application_context: {
                        brand_name: 'AgonyBeats',
                        return_url: `${process.env.NEXTAUTH_URL}/api/subscriptions/upgrade-success?newTier=${newTierId}`,
                        cancel_url: `${process.env.NEXTAUTH_URL}/account/subscriptions?canceled=true`
                    }
                })
            }
        );

        const reviseData = await reviseResponse.json();
        console.log('PayPal revise response:', JSON.stringify(reviseData, null, 2));

        if (!reviseResponse.ok) {
            console.error('PayPal revise error:', reviseData);
            const errorMsg = reviseData.details?.[0]?.description || reviseData.message || 'Failed to revise subscription';
            return NextResponse.json({ error: errorMsg }, { status: 500 });
        }

        // If upgrade requires payment, redirect to approval URL
        const approvalUrl = reviseData.links?.find(link => link.rel === 'approve')?.href;

        if (approvalUrl) {
            // Upgrade with payment needed
            return NextResponse.json({
                success: true,
                requiresApproval: true,
                approvalUrl,
                message: isUpgrade ? 'Please approve the upgrade payment' : 'Please confirm the plan change'
            });
        } else {
            // Downgrade or no payment needed - update immediately
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    tierId: newTierId,
                    updatedAt: new Date()
                }
            });

            return NextResponse.json({
                success: true,
                requiresApproval: false,
                message: `Successfully ${isUpgrade ? 'upgraded' : 'downgraded'} to ${newTier.name}`
            });
        }

    } catch (error) {
        console.error('Subscription upgrade error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
