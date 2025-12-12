import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
});

export async function POST(req) {
    try {
        const { cart, email, name, total } = await req.json();

        if (!email || !cart || cart.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create line items for Stripe
        const lineItems = cart.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: `${item.title} - ${item.licenseTitle || "Basic Lease"}`,
                    description: `Beat: ${item.title} | BPM: ${item.bpm} | Key: ${item.key}`,
                    images: [item.cover], // Stripe supports product images
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses cents
            },
            quantity: 1,
        }));

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/cancel`,
            customer_email: email,
            metadata: {
                cart: JSON.stringify(cart),
                email: email,
                name: name || "",
                total: total.toString(),
            },
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
