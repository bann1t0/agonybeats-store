'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getTier, getRemainingDownloads, SUBSCRIPTION_TIERS } from '@/lib/subscriptionTiers';

// Wrapper component to handle Suspense for useSearchParams
export default function SubscriptionsPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SubscriptionsManagementPage />
        </Suspense>
    );
}

function LoadingFallback() {
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

function SubscriptionsManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [canceling, setCanceling] = useState(false);
    const [upgrading, setUpgrading] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Check for upgrade success
    useEffect(() => {
        if (searchParams.get('upgraded') === 'true') {
            setSuccessMessage(`Successfully upgraded to ${searchParams.get('tier')}!`);
        }
    }, [searchParams]);

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

    async function handleUpgrade(newTierId) {
        const newTier = getTier(newTierId);
        const currentTier = getTier(subscription?.tierId);

        const tierOrder = { 'base': 1, 'advanced': 2, 'special': 3 };
        const isUpgrade = tierOrder[newTierId] > tierOrder[subscription?.tierId];

        const confirmMsg = isUpgrade
            ? `Upgrade to ${newTier?.name} for €${newTier?.price}/month? You'll pay the prorated difference.`
            : `Downgrade to ${newTier?.name} for €${newTier?.price}/month? This will take effect at your next billing cycle.`;

        if (!confirm(confirmMsg)) {
            return;
        }

        setUpgrading(newTierId);
        try {
            const res = await fetch('/api/subscriptions/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newTierId })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to change plan');
            }

            if (data.requiresApproval && data.approvalUrl) {
                // Redirect to PayPal for payment
                window.location.href = data.approvalUrl;
            } else {
                // Plan changed immediately
                setSuccessMessage(data.message);
                fetchSubscription();
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setUpgrading(null);
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

                            {/* Access Library Button */}
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <Link
                                    href="/account/library"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem',
                                        background: tier.color,
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    📚 Access My Library
                                </Link>

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

                        {/* Change Plan Section */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '2rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            marginTop: '2rem'
                        }}>
                            <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Change Your Plan</h3>

                            {successMessage && (
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    border: '1px solid #10b981',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    color: '#10b981',
                                    marginBottom: '1.5rem'
                                }}>
                                    ✅ {successMessage}
                                </div>
                            )}

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem'
                            }}>
                                {Object.values(SUBSCRIPTION_TIERS).map(planTier => {
                                    const isCurrent = subscription?.tierId === planTier.id;
                                    const tierOrder = { 'base': 1, 'advanced': 2, 'special': 3 };
                                    const isUpgrade = tierOrder[planTier.id] > tierOrder[subscription?.tierId];
                                    const isDowngrade = tierOrder[planTier.id] < tierOrder[subscription?.tierId];

                                    return (
                                        <div
                                            key={planTier.id}
                                            style={{
                                                background: isCurrent
                                                    ? `linear-gradient(135deg, ${planTier.color}20 0%, ${planTier.color}10 100%)`
                                                    : 'rgba(255, 255, 255, 0.03)',
                                                border: isCurrent
                                                    ? `2px solid ${planTier.color}`
                                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                padding: '1.5rem',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <h4 style={{
                                                color: planTier.color,
                                                marginBottom: '0.5rem',
                                                fontSize: '1.2rem'
                                            }}>
                                                {planTier.name}
                                            </h4>
                                            <p style={{
                                                color: 'white',
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                marginBottom: '0.5rem'
                                            }}>
                                                €{planTier.price}<span style={{ fontSize: '0.9rem', color: '#888' }}>/mo</span>
                                            </p>
                                            <p style={{
                                                color: '#888',
                                                fontSize: '0.85rem',
                                                marginBottom: '1rem'
                                            }}>
                                                {planTier.benefits.beatsPerMonth === -1
                                                    ? 'Unlimited downloads'
                                                    : `${planTier.benefits.beatsPerMonth} downloads/mo`}
                                            </p>

                                            {isCurrent ? (
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.5rem 1rem',
                                                    background: planTier.color,
                                                    color: 'white',
                                                    borderRadius: '6px',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    Current Plan
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpgrade(planTier.id)}
                                                    disabled={upgrading === planTier.id}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        background: isUpgrade ? planTier.color : 'transparent',
                                                        border: isUpgrade ? 'none' : `1px solid ${planTier.color}`,
                                                        color: isUpgrade ? 'white' : planTier.color,
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.85rem',
                                                        opacity: upgrading ? 0.6 : 1
                                                    }}
                                                >
                                                    {upgrading === planTier.id
                                                        ? 'Processing...'
                                                        : isUpgrade ? '⬆️ Upgrade' : '⬇️ Downgrade'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
