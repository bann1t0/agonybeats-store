'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliateDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [affiliate, setAffiliate] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchAffiliateData();
        }
    }, [status]);

    async function fetchAffiliateData() {
        try {
            const res = await fetch('/api/affiliate');
            if (res.status === 404) {
                // Not an affiliate yet
                setAffiliate(null);
                setLoading(false);
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();
            setAffiliate(data.affiliate);
            setStats(data.stats);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function joinProgram() {
        setJoining(true);
        try {
            const res = await fetch('/api/affiliate', {
                method: 'POST'
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error);
            }

            await fetchAffiliateData();
            alert('Welcome to the affiliate program! 🎉');
        } catch (error) {
            alert(error.message);
        } finally {
            setJoining(false);
        }
    }

    function copyLink() {
        navigator.clipboard.writeText(affiliate.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0a',
                paddingTop: '120px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <p style={{ color: '#888' }}>Loading...</p>
            </div>
        );
    }

    if (!affiliate) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0a',
                paddingTop: '120px',
                paddingBottom: '4rem'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
                    <h1 style={{
                        color: 'white',
                        fontSize: '2.5rem',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Affiliate Program
                    </h1>
                    <p style={{ color: '#888', marginBottom: '2rem' }}>
                        Earn money by referring customers to AgonyBeats!
                    </p>

                    <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        marginBottom: '2rem'
                    }}>
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>How It Works</h2>
                        <ul style={{ color: '#ccc', lineHeight: '2' }}>
                            <li>✅ Get a unique referral link</li>
                            <li>💰 Earn <strong style={{ color: '#10b981' }}>10% commission</strong> on all sales</li>
                            <li>📊 Track your clicks and earnings in real-time</li>
                            <li>💸 Get paid monthly via PayPal</li>
                        </ul>
                    </div>

                    <button
                        onClick={joinProgram}
                        disabled={joining}
                        style={{
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: joining ? 'not-allowed' : 'pointer',
                            opacity: joining ? 0.6 : 1
                        }}
                    >
                        {joining ? 'Joining...' : 'Join Affiliate Program'}
                    </button>
                </div>
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
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>
                        ← Back to Home
                    </Link>
                    <h1 style={{
                        color: 'white',
                        fontSize: '2.5rem',
                        marginTop: '1rem',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Affiliate Dashboard
                    </h1>
                    <p style={{ color: '#888' }}>
                        Track your referrals and earnings
                    </p>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <StatCard title="Total Earnings" value={`€${affiliate.totalEarnings.toFixed(2)}`} color="#10b981" />
                    <StatCard title="Total Clicks" value={stats.totalClicks} color="#3b82f6" />
                    <StatCard title="Conversions" value={stats.conversions} color="#8b5cf6" />
                    <StatCard title="Conversion Rate" value={`${stats.conversionRate}%`} color="#f59e0b" />
                    <StatCard title="Commission" value={`${affiliate.commission}%`} color="#ec4899" />
                    <StatCard title="Pending" value={`€${stats.pendingEarnings.toFixed(2)}`} color="#06b6d4" />
                </div>

                {/* Referral Link */}
                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem' }}>Your Referral Link</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={affiliate.referralLink}
                            readOnly
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '0.9rem'
                            }}
                        />
                        <button
                            onClick={copyLink}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: copied ? '#10b981' : '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {copied ? '✓ Copied!' : 'Copy Link'}
                        </button>
                    </div>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Code: <strong style={{ color: 'white' }}>{affiliate.code}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color,
                marginBottom: '0.5rem'
            }}>
                {value}
            </div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>{title}</div>
        </div>
    );
}
