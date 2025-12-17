"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import styles from "./checkout.module.css";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import FallingComets from "@/components/FallingComets";

// Icons
function ArrowLeftIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
}

export default function CheckoutPage() {
    const { data: session } = useSession();
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("stripe"); // Default to Stripe
    const [processing, setProcessing] = useState(false);

    // Subscription discount state
    const [subscriptionDiscount, setSubscriptionDiscount] = useState(0);
    const [subscriptionTier, setSubscriptionTier] = useState(null);

    // Fetch subscription status for discount
    useEffect(() => {
        if (session) {
            fetch('/api/subscription-downloads')
                .then(res => res.json())
                .then(data => {
                    if (data.hasSubscription && data.tier?.discountPercentage) {
                        setSubscriptionDiscount(data.tier.discountPercentage);
                        setSubscriptionTier(data.tier);
                    }
                })
                .catch(err => console.error('Error fetching subscription:', err));
        }
    }, [session]);

    // DEBUG: Check which ID is loaded
    console.log("Current PayPal Client ID:", process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "Using Fallback (Sandbox)");

    const [couponInput, setCouponInput] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [deliveredFiles, setDeliveredFiles] = useState([]);

    const {
        cart,
        clearCart,
        appliedCoupon,
        setAppliedCoupon,
        getCartTotals, // Needed!
        couponMsg,     // Not in context? Wait.
        setCouponMsg   // Not in context? Wait.
    } = useCart();

    // Context doesn't have couponMsg/setCouponMsg, create local state if needed?
    // Checking Step 1251: couponMsg was local state.

    const [localCouponMsg, setLocalCouponMsg] = useState("");

    // Calculate totals
    const { subtotal, bundleDiscount, couponDiscount, finalTotal: cartTotal, hasBundle } = getCartTotals();

    // Apply subscription discount on top
    const subscriptionDiscountAmount = (cartTotal * subscriptionDiscount) / 100;
    const finalTotal = Math.max(0, cartTotal - subscriptionDiscountAmount);

    const handleApplyCoupon = async () => {
        const code = couponInput.toUpperCase().trim();

        // Prevent stacking multiple discount codes
        if (appliedCoupon) {
            setLocalCouponMsg("⚠️ Only one discount code allowed. Remove current code first.");
            return;
        }

        // Keep test codes for development
        if (code === 'TEST100') {
            setAppliedCoupon({ code: 'TEST100' });
            setLocalCouponMsg("Test Mode: 100% OFF Activated! 🛠️");
            return;
        } else if (code === 'TEST_PAYPAL') {
            setAppliedCoupon({ code: 'TEST_PAYPAL' });
            setLocalCouponMsg("Test Mode: Price set to $0.01 for Real Payment Test! 💳");
            return;
        }

        // Validate code via API
        try {
            const res = await fetch(`/api/discounts/validate?code=${encodeURIComponent(code)}&email=${encodeURIComponent(userEmail)}`);
            const data = await res.json();

            if (res.ok && data.valid) {
                setAppliedCoupon({ code: data.code, id: data.id, percentage: data.percentage });
                setLocalCouponMsg(`Coupon Applied! ${data.percentage}% OFF 🎉`);
            } else {
                setLocalCouponMsg(data.error || "Invalid Coupon Code ❌");
                setAppliedCoupon(null);
            }
        } catch (error) {
            console.error("Coupon validation error:", error);
            setLocalCouponMsg("Error validating code. Try again.");
        }
    };

    async function processOrder() {
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cart,
                    email: userEmail,
                    name: userName,
                    total: finalTotal,
                    discountCodeId: appliedCoupon?.id || null
                })
            });
            const data = await res.json();
            if (res.ok) {
                setDeliveredFiles(data.downloads);
                setPaymentSuccess(true);
                clearCart();

                // AFFILIATE TRACKING: Track conversion if affiliate referral exists
                const affiliateRef = localStorage.getItem('affiliateRef');
                const refTime = localStorage.getItem('affiliateRefTime');

                // Check if referral is less than 30 days old
                if (affiliateRef && refTime) {
                    const daysSinceRef = (Date.now() - parseInt(refTime)) / (1000 * 60 * 60 * 24);

                    if (daysSinceRef <= 30 && finalTotal > 0) {
                        console.log('Tracking affiliate conversion:', affiliateRef, 'Amount:', finalTotal);

                        fetch('/api/affiliate/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                affiliateCode: affiliateRef,
                                purchaseId: data.orderId || Date.now().toString(),
                                amount: finalTotal
                            })
                        })
                            .then(res => res.json())
                            .then(result => {
                                console.log('Affiliate conversion tracked:', result);
                                // Clear referral after successful conversion
                                localStorage.removeItem('affiliateRef');
                                localStorage.removeItem('affiliateRefTime');
                            })
                            .catch(err => console.error('Affiliate tracking failed:', err));
                    }
                }
            } else {
                alert("Order verification failed: " + data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Connection error during order processing.");
        }
    }

    async function handleStripeCheckout() {
        if (!userEmail || !userEmail.includes("@")) {
            alert("Please enter a valid email address");
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch("/api/stripe/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cart,
                    email: userEmail,
                    name: userName,
                    total: finalTotal
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create checkout session");
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;
        } catch (error) {
            console.error("Stripe checkout error:", error);
            alert("Failed to start payment: " + error.message);
            setProcessing(false);
        }
    }

    // Calculate Total is now handled by getCartTotals
    // const total = cart.reduce((acc, item) => acc + item.price, 0);

    const initialOptions = {
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AS0ZDZEBJ3Y7oLffY5gYLd0TWRdbR7LJYu7wPYYoBTT30Joy-ndn2HdC4bLDB6KfY7I23EzuCMHzRbM3",
        currency: "USD",
        intent: "capture",
    };

    if (paymentSuccess) {
        // ... (Success View remains same)
        return (
            <div className={styles.container}>
                <FallingComets />
                <div className={styles.successContainer}>
                    <div className={styles.successCard}>
                        <div className={styles.checkmarkWrapper}>
                            <svg className={styles.checkmarkSvg} viewBox="0 0 52 52">
                                <circle cx="26" cy="26" r="25" fill="none" />
                                <path className={styles.checkmarkPath} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        </div>
                        <h1 className={styles.successTitle}>Payment Successful</h1>
                        <p className={styles.successSubtitle}>
                            Your files have been sent to <strong style={{ color: '#fff' }}>{userEmail}</strong>
                        </p>

                        <div className={styles.downloadSection}>
                            <h3 className={styles.downloadHeader}>Your Downloads</h3>
                            <div className={styles.downloadList}>
                                {deliveredFiles.map((beat, idx) => (
                                    <div key={idx} className={styles.downloadItem}>
                                        <div className={styles.beatTitle}>{beat.beatTitle}</div>
                                        <span className={styles.beatLicense}>{beat.license}</span>
                                        <div className={styles.fileList}>
                                            {beat.files.map((file, fIdx) => (
                                                <a key={fIdx} href={file.url} download target="_blank" rel="noreferrer" className={styles.fileBtn}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                                    {file.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link href="/" className={styles.backHomeBtn}>
                            BACK TO STUDIO
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeftIcon /> BACK TO STORE
                    </Link>
                </div>
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <h1>Your Cart is Empty</h1>
                    <p style={{ color: '#888', margin: '1rem 0 2rem 0' }}>Add some beats to get started.</p>
                    <Link href="/" style={{ color: 'var(--neon-blue)' }}>Go to Catalogue</Link>
                </div>
            </div>
        );
    }

    return (
        <PayPalScriptProvider options={initialOptions}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <Link href="/" className={styles.backLink}>
                            <ArrowLeftIcon /> BACK TO STORE
                        </Link>
                    </div>
                </div>

                <div className={styles.main}>
                    {/* Summary */}
                    <div className={styles.summarySection}>
                        <h2 className={styles.title}>Order Summary</h2>
                        <div className={styles.itemList}>
                            {cart.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className={styles.item}>
                                    <img src={item.cover} alt={item.title} className={styles.itemImage} />
                                    <div className={styles.itemInfo}>
                                        <h4>{item.title}</h4>
                                        <p>{item.licenseTitle || "Basic Lease"}</p>
                                    </div>
                                    <div style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
                                        ${item.price.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals Block */}
                        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <div className={styles.totalRow} style={{ fontSize: '1rem', color: '#aaa' }}>
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>

                            {hasBundle && (
                                <div className={styles.totalRow} style={{ fontSize: '1rem', color: 'var(--neon-blue)' }}>
                                    <span>Bundle Discount (Buy 2 Get 1)</span>
                                    <span>-${bundleDiscount.toFixed(2)}</span>
                                </div>
                            )}

                            {appliedCoupon && (
                                <div className={styles.totalRow} style={{ fontSize: '1rem', color: 'var(--neon-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>Coupon ({appliedCoupon.code})</span>
                                    <button
                                        onClick={() => {
                                            setAppliedCoupon(null);
                                            setCouponInput('');
                                            setLocalCouponMsg('');
                                        }}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: '1px solid #ef4444',
                                            color: '#ef4444',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        ✕ Remove
                                    </button>
                                    <span style={{ marginLeft: 'auto' }}>-${couponDiscount.toFixed(2)}</span>
                                </div>
                            )}

                            {subscriptionDiscount > 0 && (
                                <div className={styles.totalRow} style={{ fontSize: '1rem', color: '#10b981' }}>
                                    <span>✨ Subscriber Discount ({subscriptionTier?.name} - {subscriptionDiscount}%)</span>
                                    <span>-€{subscriptionDiscountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            {/* Coupon Input */}
                            <div style={{ margin: '1.5rem 0', display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Promo Code"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid #444',
                                        color: '#fff',
                                        borderRadius: '4px'
                                    }}
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    style={{
                                        padding: '0 1.5rem',
                                        background: 'var(--neon-blue)',
                                        border: 'none',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        borderRadius: '4px'
                                    }}
                                >
                                    APPLY
                                </button>
                            </div>
                            {localCouponMsg && <p style={{ fontSize: '0.8rem', color: appliedCoupon ? 'lime' : 'red', marginTop: '-1rem', marginBottom: '1rem' }}>{localCouponMsg}</p>}

                            <div className={styles.totalRow} style={{ fontSize: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                <span>Total</span>
                                <span className={styles.totalHighlight}>${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className={styles.paymentSection}>
                        <h2 className={styles.title}>Payment Details</h2>

                        <div className={styles.inputGroup}>
                            <label>Full Name (for License)</label>
                            <input
                                type="text"
                                placeholder="Your Name or Artist Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Email Address (for delivery)</label>
                            <input
                                type="email"
                                placeholder="producer@example.com"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        {/* Payment Method Selector */}
                        <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '0.75rem', fontWeight: 'bold' }}>Payment Method</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('stripe')}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: paymentMethod === 'stripe'
                                            ? 'linear-gradient(135deg, #635bff, #4f46e5)'
                                            : 'rgba(255,255,255,0.05)',
                                        border: paymentMethod === 'stripe'
                                            ? '2px solid #635bff'
                                            : '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontWeight: paymentMethod === 'stripe' ? 'bold' : 'normal'
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                        <line x1="1" y1="10" x2="23" y2="10" />
                                    </svg>
                                    Credit Card
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('paypal')}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: paymentMethod === 'paypal'
                                            ? 'linear-gradient(135deg, #0070ba, #003087)'
                                            : 'rgba(255,255,255,0.05)',
                                        border: paymentMethod === 'paypal'
                                            ? '2px solid #0070ba'
                                            : '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontWeight: paymentMethod === 'paypal' ? 'bold' : 'normal'
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
                                    </svg>
                                    PayPal
                                </button>
                            </div>
                        </div>

                        {/* Zero Price Bypass */}
                        {finalTotal === 0 ? (
                            <div style={{ marginTop: '2rem' }}>
                                <button
                                    onClick={processOrder}
                                    className={styles.ctaButton}
                                    style={{ width: '100%', background: 'lime', color: 'black', fontWeight: 'bold' }}
                                >
                                    COMPLETE FREE ORDER
                                </button>
                                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#888' }}>
                                    No payment required for free items.
                                </p>
                            </div>
                        ) : userEmail && userEmail.includes("@") ? (
                            <div style={{ marginTop: '2rem' }}>
                                {paymentMethod === 'stripe' ? (
                                    /* Stripe Payment Button */
                                    <button
                                        onClick={async () => {
                                            setProcessing(true);
                                            try {
                                                const res = await fetch('/api/stripe/create-payment', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        cart,
                                                        email: userEmail,
                                                        name: userName
                                                    })
                                                });
                                                const data = await res.json();

                                                if (res.ok && data.url) {
                                                    window.location.href = data.url;
                                                } else {
                                                    throw new Error(data.error || 'Failed to create checkout');
                                                }
                                            } catch (error) {
                                                console.error('Stripe error:', error);
                                                alert('Error: ' + error.message);
                                                setProcessing(false);
                                            }
                                        }}
                                        disabled={processing}
                                        style={{
                                            width: '100%',
                                            padding: '1rem 2rem',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(135deg, #635bff, #4f46e5)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: processing ? 'not-allowed' : 'pointer',
                                            opacity: processing ? 0.7 : 1
                                        }}
                                    >
                                        {processing ? 'Processing...' : `Pay €${finalTotal.toFixed(2)} with Card`}
                                    </button>
                                ) : (
                                    /* PayPal Payment */
                                    <PayPalButtons
                                        style={{ layout: "vertical", shape: "rect", color: "gold" }}
                                        createOrder={(data, actions) => {
                                            return actions.order.create({
                                                purchase_units: [
                                                    {
                                                        amount: {
                                                            value: finalTotal.toFixed(2),
                                                        },
                                                        description: `AgonyBeats Order - ${userEmail}`
                                                    },
                                                ],
                                            });
                                        }}
                                        onApprove={async (data, actions) => {
                                            const details = await actions.order.capture();
                                            console.log("Transaction completed by " + details.payer.name.given_name);
                                            processOrder();
                                        }}
                                        onError={(err) => {
                                            console.error("PayPal Error:", err);
                                            alert("Payment could not be processed. Please try again.");
                                        }}
                                    />
                                )}
                            </div>
                        ) : (
                            <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>
                                Please enter a valid email to unlock payment options.
                            </p>
                        )}

                        {finalTotal > 0 && (
                            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
                                <p>🔒 Secure Payment via {paymentMethod === "stripe" ? "Stripe" : "PayPal"}</p>
                                <p>{paymentMethod === "stripe" ? "Powered by Stripe - Industry Standard Security" : "Accepts Credit/Debit Cards & PayPal Balance"}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PayPalScriptProvider>
    );
}
