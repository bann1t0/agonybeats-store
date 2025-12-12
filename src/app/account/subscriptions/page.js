'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTier, getRemainingDownloads } from '@/lib/subscriptionTiers';

export default function SubscriptionsManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [canceling, setCanceling] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            fetchSubscription();
        }
    }, [status, router]);

    async function fetchSubscription() {
        try {
            const res = await fetch('/api/subscriptions');
            if (!res.ok) throw new Error('Failed to fetch subscription');

            const data = await res.json();
            setSubscription(data);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel() {
        if (!confirm('Are you sure you want to cancel your subscription? You\'ll lose access at the end of your billing period.')) {
            return;
        }

        setCanceling(true);
        try {
            const res = await fetch('/api/subscriptions', {
                method: 'DELETE'
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to cancel subscription');
            }

            alert('Subscription cancelled successfully. You\'ll keep access until the end of your billing period.');
            fetchSubscription();
        } catch (error) {
            alert(error.message);
        } finally {
            setCanceling(false);
        }
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '120px'
            }}>
                <p style={{ color: '#888', fontSize: '1.2rem' }}>Loading...</p>
            </div>
        );
    }

    const tier = subscription ? getTier(subscription.tierId) : null;
    const downloadsThisMonth = 0; // TODO: Calculate from database
    const remaining = subscription ? getRemainingDownloads(subscription, downloadsThisMonth) : 0;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            paddingTop: '120px',
            paddingBottom: '4rem',
            padding: '120px 2rem 4rem'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <Link href="/" style={{ color: '#888', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>
                    ← Back to Store
                </Link>

                <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>
                    My Subscription
                </h1>

                {/* No Subscription */}
                {!subscription && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '3rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>No Active Subscription</h2>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>
                            Subscribe to get unlimited access to exclusive beats, stems, and licenses!
                        </p>
                        <Link
                            href="/subscribe"
                            style={{
                                display: 'inline-block',
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold'
                            }}
                        >
                            View Plans
                        </Link>
                    </div>
                )}

                {/* Active Subscription */}
                {subscription && tier && (
                    <>
                        <div style={{
                            background: `linear-gradient(135deg, ${tier.color}15 0%, ${tier.color}05 100%)`,
                            padding: '2rem',
                            borderRadius: '16px',
                            border: `2px solid ${tier.color}`,
                            marginBottom: '2rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ color: tier.color, fontSize: '2rem', marginBottom: '0.5rem' }}>
                                        {tier.name}
                                    </h2>
                                    <p style={{ color: '#888', fontSize: '1.2rem' }}>
                                        €{tier.price}/month
                                    </p>
                                </div>

                                <div style={{
                                    background: subscription.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}>
                                    {subscription.status}
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div>
                                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Downloads This Month</p>
                                    <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {downloadsThisMonth} / {remaining === Infinity ? '∞' : tier.benefits.beatsPerMonth}
                                    </p>
                                </div>

                                <div>
                                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Discount</p>
                                    <p style={{ color: tier.color, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {tier.benefits.discountPercentage}% OFF
                                    </p>
                                </div>

                                <div>
                                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Next Billing</p>
                                    <p style={{ color: 'white', fontSize: '1.1rem' }}>
                                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {subscription.status === 'ACTIVE' && (
                                <button
                                    onClick={handleCancel}
                                    disabled={canceling}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'transparent',
                                        border: '1px solid #ef4444',
                                        color: '#ef4444',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {canceling ? 'Canceling...' : 'Cancel Subscription'}
                                </button>
                            )}
                        </div>

                        {/* Benefits */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '2rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Your Benefits</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {tier.features.map((feature, idx) => (
                                    <li
                                        key={idx}
                                        style={{
                                            color: '#ccc',
                                            marginBottom: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tier.color} strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
