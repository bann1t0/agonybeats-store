/**
 * Subscription Plans Component
 * Display subscription tiers with pricing and features
 * Supports both PayPal and Stripe payments
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptionTiers';

export default function SubscriptionPlans({ currentSubscription }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe'); // 'stripe' or 'paypal'

    // Handle subscription with selected payment method
    const handleSubscribe = async (tierId) => {
        if (!session) {
            window.location.href = '/login?redirect=/subscribe';
            return;
        }

        setLoading(tierId);

        try {
            if (selectedPaymentMethod === 'stripe') {
                // Stripe Checkout
                const res = await fetch('/api/stripe/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId: tierId })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to create Stripe checkout');
                }

                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error('No checkout URL received from Stripe');
                }
            } else {
                // PayPal Checkout (existing)
                const res = await fetch('/api/subscriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tierId })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to create subscription');
                }

                if (!data.approvalUrl) {
                    throw new Error('No approval URL received from PayPal');
                }

                window.location.href = data.approvalUrl;
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Error: ' + error.message);
            setLoading(null);
        }
    };

    const tiers = Object.values(SUBSCRIPTION_TIERS);

    return (
        <div>
            {/* Payment Method Selector */}
            <div style={{
                maxWidth: '500px',
                margin: '0 auto 2rem auto',
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <p style={{ color: '#888', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    Choose your payment method:
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setSelectedPaymentMethod('stripe')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: selectedPaymentMethod === 'stripe'
                                ? 'linear-gradient(135deg, #635bff, #4f46e5)'
                                : 'rgba(255,255,255,0.05)',
                            border: selectedPaymentMethod === 'stripe'
                                ? '2px solid #635bff'
                                : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: selectedPaymentMethod === 'stripe' ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        Credit Card
                    </button>
                    <button
                        onClick={() => setSelectedPaymentMethod('paypal')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: selectedPaymentMethod === 'paypal'
                                ? 'linear-gradient(135deg, #0070ba, #003087)'
                                : 'rgba(255,255,255,0.05)',
                            border: selectedPaymentMethod === 'paypal'
                                ? '2px solid #0070ba'
                                : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: selectedPaymentMethod === 'paypal' ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
                        </svg>
                        PayPal
                    </button>
                </div>
            </div>

            {/* Subscription Tiers */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem'
            }}>
                {tiers.map((tier) => {
                    const isCurrentPlan = currentSubscription?.tierId === tier.id;
                    const isRecommended = tier.recommended;

                    return (
                        <div
                            key={tier.id}
                            style={{
                                background: isRecommended
                                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(109, 40, 217, 0.15) 100%)'
                                    : 'rgba(0, 0, 0, 0.3)',
                                border: isRecommended
                                    ? `2px solid ${tier.color}`
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                padding: '2rem',
                                position: 'relative',
                                transform: isRecommended ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 0.3s',
                                boxShadow: isRecommended
                                    ? `0 8px 32px ${tier.color}40`
                                    : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (!isRecommended) e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                if (!isRecommended) e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            {/* Recommended Badge */}
                            {isRecommended && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    padding: '6px 20px',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    ⭐ BEST VALUE
                                </div>
                            )}

                            {/* Current Plan Badge */}
                            {isCurrentPlan && (
                                <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: '#10b981',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    padding: '4px 12px',
                                    borderRadius: '12px'
                                }}>
                                    CURRENT PLAN
                                </div>
                            )}

                            {/* Tier Name */}
                            <h3 style={{
                                color: tier.color,
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                marginBottom: '0.5rem',
                                marginTop: isRecommended ? '1.5rem' : '0'
                            }}>
                                {tier.name}
                            </h3>

                            {/* Price */}
                            <div style={{
                                marginBottom: '2rem'
                            }}>
                                <span style={{
                                    color: 'white',
                                    fontSize: '3rem',
                                    fontWeight: 'bold'
                                }}>
                                    €{tier.price}
                                </span>
                                <span style={{
                                    color: '#888',
                                    fontSize: '1rem',
                                    marginLeft: '0.5rem'
                                }}>
                                    /month
                                </span>
                            </div>

                            {/* Features List */}
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: '0 0 2rem 0'
                            }}>
                                {tier.features.map((feature, idx) => (
                                    <li
                                        key={idx}
                                        style={{
                                            color: '#ccc',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke={tier.color}
                                            strokeWidth="2"
                                            style={{ flexShrink: 0, marginTop: '2px' }}
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span style={{ flex: 1 }}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Subscribe Button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSubscribe(tier.id);
                                }}
                                disabled={isCurrentPlan || loading === tier.id}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: isCurrentPlan
                                        ? '#888'
                                        : `linear-gradient(135deg, ${tier.color}, ${tier.color}dd)`,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: isCurrentPlan ? 'not-allowed' : 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    touchAction: 'manipulation',
                                    WebkitTapHighlightColor: 'transparent',
                                    userSelect: 'none',
                                    minHeight: '50px'
                                }}
                            >
                                {loading === tier.id
                                    ? 'Loading...'
                                    : isCurrentPlan
                                        ? 'Current Plan'
                                        : 'Subscribe Now'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

