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

// POST /api/stripe/create-payment - Create Stripe Checkout for beat purchases
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        const { cart, email, name, finalTotal, discountInfo } = await req.json();

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        const customerEmail = session?.user?.email || email;

        if (!customerEmail) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        // Calculate original cart total
        const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

        // Use finalTotal from frontend if provided (includes discounts)
        // Otherwise fallback to cart total
        const chargeAmount = finalTotal !== undefined ? finalTotal : cartTotal;
        const hasDiscount = finalTotal !== undefined && finalTotal < cartTotal;

        let lineItems;

        if (hasDiscount) {
            // Create a single line item with the discounted total
            const beatTitles = cart.map(item => item.title).join(', ');
            const discountDescription = [];

            if (discountInfo?.subscriptionDiscount) {
                discountDescription.push(`${discountInfo.subscriptionDiscount}% Subscriber Discount`);
            }
            if (discountInfo?.couponCode) {
                discountDescription.push(`Coupon: ${discountInfo.couponCode}`);
            }
            if (discountInfo?.bundleDiscount > 0) {
                discountDescription.push('Bundle Discount');
            }

            lineItems = [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: cart.length === 1 ? cart[0].title : `${cart.length} Beats Bundle`,
                        description: `${beatTitles}${discountDescription.length > 0 ? ` (${discountDescription.join(', ')})` : ''}`,
                    },
                    unit_amount: Math.round(chargeAmount * 100), // Stripe uses cents
                },
                quantity: 1,
            }];
        } else {
            // No discount - build individual line items
            const baseUrl = process.env.NEXTAUTH_URL || 'https://agonybeats.com';

            lineItems = cart.map(item => {
                // Build valid absolute image URL
                let imageUrl = null;
                if (item.cover) {
                    try {
                        // If already absolute URL, use it
                        if (item.cover.startsWith('http://') || item.cover.startsWith('https://')) {
                            imageUrl = encodeURI(item.cover);
                        } else {
                            // Convert relative path to absolute URL
                            const path = item.cover.startsWith('/') ? item.cover : `/${item.cover}`;
                            imageUrl = encodeURI(`${baseUrl}${path}`);
                        }
                        // Validate URL
                        new URL(imageUrl);
                    } catch {
                        imageUrl = null; // Invalid URL, skip image
                    }
                }

                return {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: item.title,
                            description: item.licenseTitle || 'Beat License',
                            ...(imageUrl ? { images: [imageUrl] } : {}),
                        },
                        unit_amount: Math.round(item.price * 100), // Stripe uses cents
                    },
                    quantity: 1,
                };
            });
        }

        // Create Stripe Checkout Session
        const checkoutSession = await getStripe().checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: lineItems,
            customer_email: customerEmail,
            success_url: `${process.env.NEXTAUTH_URL || "https://agonybeats.com"}/checkout/success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
            cancel_url: `${process.env.NEXTAUTH_URL || "https://agonybeats.com"}/checkout?canceled=true`,
            metadata: {
                userId: session?.user?.id || '',
                userEmail: customerEmail,
                userName: name || session?.user?.name || '',
                cartItems: JSON.stringify(cart.map(item => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    licenseType: item.licenseType,
                    licenseTitle: item.licenseTitle,
                    licenseId: item.licenseId
                }))),
                originalTotal: cartTotal.toString(),
                finalTotal: chargeAmount.toString(),
                discountApplied: hasDiscount ? 'true' : 'false',
                discountInfo: discountInfo ? JSON.stringify(discountInfo) : ''
            },
        });

        return NextResponse.json({
            url: checkoutSession.url,
            sessionId: checkoutSession.id
        });

    } catch (error) {
        console.error("Stripe payment error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
