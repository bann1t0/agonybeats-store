'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SubscriptionPlans from '@/components/SubscriptionPlans';

export default function SubscribePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchSubscription();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [status]);

    async function fetchSubscription() {
        try {
            const res = await fetch('/api/subscriptions');
            if (res.ok) {
                const data = await res.json();
                setSubscription(data);
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <p style={{ color: '#888', fontSize: '1.2rem' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            paddingTop: '120px',
            paddingBottom: '4rem'
        }}>
            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: '3rem',
                padding: '0 2rem'
            }}>
                <h1 style={{
                    color: 'white',
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Choose Your Plan
                </h1>
                <p style={{
                    color: '#888',
                    fontSize: '1.2rem',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    Get unlimited access to premium beats, stems, and exclusive licenses. Cancel anytime.
                </p>

                {!session && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        margin: '1.5rem auto 0'
                    }}>
                        <p style={{ color: '#667eea', margin: 0 }}>
                            Please{' '}
                            <Link href="/login?redirect=/subscribe" style={{ color: '#667eea', textDecoration: 'underline' }}>
                                login
                            </Link>
                            {' '}to subscribe
                        </p>
                    </div>
                )}
            </div>

            {/* Subscription Plans */}
            <SubscriptionPlans currentSubscription={subscription} />

            {/* FAQ Section */}
            <div style={{
                maxWidth: '800px',
                margin: '4rem auto 0',
                padding: '0 2rem'
            }}>
                <h2 style={{
                    color: 'white',
                    fontSize: '2rem',
                    marginBottom: '2rem',
                    textAlign: 'center'
                }}>
                    Frequently Asked Questions
                </h2>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    {[
                        {
                            q: 'Can I cancel anytime?',
                            a: 'Yes! You can cancel your subscription at any time from your account settings. You\'ll keep access until the end of your billing period.'
                        },
                        {
                            q: 'What happens to my downloaded beats if I cancel?',
                            a: 'All beats you\'ve downloaded during your subscription remain yours forever with the included license. You can continue using them commercially.'
                        },
                        {
                            q: 'Do I keep the stems?',
                            a: 'Yes! All downloaded beats include high-quality stems that you keep forever, even after canceling.'
                        },
                        {
                            q: 'Can I upgrade or downgrade my plan?',
                            a: 'Absolutely! You can change your plan anytime from your account settings. Changes take effect at the next billing cycle.'
                        },
                        {
                            q: 'What licenses are included?',
                            a: 'Each tier includes different licenses (MP3 Lease, WAV Lease, or Premium/Unlimited) automatically applied to every beat you download.'
                        }
                    ].map((faq, idx) => (
                        <div
                            key={idx}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <h3 style={{
                                color: 'white',
                                marginBottom: '0.75rem',
                                fontSize: '1.1rem'
                            }}>
                                {faq.q}
                            </h3>
                            <p style={{
                                color: '#888',
                                margin: 0,
                                lineHeight: '1.6'
                            }}>
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
