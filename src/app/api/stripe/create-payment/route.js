import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
});

// POST /api/stripe/create-payment - Create Stripe Checkout for beat purchases
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        const { cart, email, name } = await req.json();

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        const customerEmail = session?.user?.email || email;

        if (!customerEmail) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        // Build line items from cart
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.title,
                    description: item.licenseTitle || 'Beat License',
                    images: item.cover ? [item.cover] : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses cents
            },
            quantity: 1,
        }));

        // Calculate total for metadata
        const total = cart.reduce((sum, item) => sum + item.price, 0);

        // Create Stripe Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
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
                total: total.toString()
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
