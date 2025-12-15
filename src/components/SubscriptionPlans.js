/**
 * Subscription Plans Component
 * Display subscription tiers with pricing and features
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

    const handleSubscribe = async (tierId) => {
        console.log('=== handleSubscribe called ===');
        console.log('tierId:', tierId);
        console.log('session:', session);

        if (!session) {
            console.log('No session, redirecting to login...');
            window.location.href = '/login?redirect=/subscribe';
            return;
        }

        setLoading(tierId);
        try {
            console.log('Calling /api/subscriptions...');
            const res = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tierId })
            });

            console.log('API response status:', res.status);
            const data = await res.json();
            console.log('API response data:', data);

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create subscription');
            }

            if (!data.approvalUrl) {
                throw new Error('No approval URL received from PayPal');
            }

            console.log('Redirecting to PayPal:', data.approvalUrl);
            // Redirect to PayPal for approval
            window.location.href = data.approvalUrl;

        } catch (error) {
            console.error('Subscription error:', error);
            alert('Error: ' + error.message);
            setLoading(null);
        }
    };

    const tiers = Object.values(SUBSCRIPTION_TIERS);

    return (
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
    );
}
