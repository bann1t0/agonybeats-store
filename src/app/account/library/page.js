'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePlayer } from '@/context/PlayerContext';

export default function SubscriberLibraryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { playTrack, currentBeat, isPlaying } = usePlayer();

    const [subscriptionData, setSubscriptionData] = useState(null);
    const [earlyAccessBeats, setEarlyAccessBeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?redirect=/account/library');
            return;
        }

        if (status === 'authenticated') {
            fetchData();
        }
    }, [status, router]);

    async function fetchData() {
        try {
            // Fetch subscription status and downloads
            const subRes = await fetch('/api/subscription-downloads');
            const subData = await subRes.json();
            setSubscriptionData(subData);

            // Fetch early access beats if has subscription
            if (subData.hasSubscription) {
                const beatsRes = await fetch('/api/early-access-beats');
                if (beatsRes.ok) {
                    const beatsData = await beatsRes.json();
                    setEarlyAccessBeats(beatsData.beats || []);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload(beatId, beatTitle) {
        setDownloading(beatId);
        try {
            const res = await fetch('/api/subscription-downloads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ beatId })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to download');
                return;
            }

            // Trigger download
            if (data.downloadUrl) {
                const link = document.createElement('a');
                link.href = data.downloadUrl;
                link.download = `${beatTitle}.mp3`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Refresh data to update remaining count
                fetchData();
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed: ' + error.message);
        } finally {
            setDownloading(null);
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <p style={{ color: '#888' }}>Loading...</p>
            </div>
        );
    }

    // No subscription
    if (!subscriptionData?.hasSubscription) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0a',
                paddingTop: '120px',
                paddingBottom: '4rem'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
                    <Link href="/account" style={{ color: '#888', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
                        ← Back to Account
                    </Link>

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '4rem 2rem',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <h1 style={{
                            color: 'white',
                            fontSize: '2.5rem',
                            marginBottom: '1rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            🔒 Subscriber Library
                        </h1>
                        <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            Subscribe to unlock exclusive early access beats and monthly downloads!
                        </p>
                        <Link href="/subscribe" style={{
                            display: 'inline-block',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                        }}>
                            View Subscription Plans →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { subscription, tier, downloads, downloadedBeats } = subscriptionData;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            paddingTop: '120px',
            paddingBottom: '4rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/account" style={{ color: '#888', textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>
                        ← Back to Account
                    </Link>
                    <h1 style={{
                        color: 'white',
                        fontSize: '2.5rem',
                        marginBottom: '0.5rem',
                        background: `linear-gradient(135deg, ${tier?.color || '#667eea'} 0%, #764ba2 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        📚 Subscriber Library
                    </h1>
                    <p style={{ color: '#888' }}>Your exclusive early access beats and downloads</p>
                </div>

                {/* Subscription Status Card */}
                <div style={{
                    background: `linear-gradient(135deg, ${tier?.color || '#667eea'}15 0%, ${tier?.color || '#667eea'}05 100%)`,
                    padding: '2rem',
                    borderRadius: '16px',
                    border: `1px solid ${tier?.color || '#667eea'}40`,
                    marginBottom: '2rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '2rem'
                }}>
                    <div>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Your Plan</p>
                        <p style={{ color: tier?.color || '#667eea', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {tier?.name || subscription?.tierId}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Monthly Downloads</p>
                        <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {downloads?.used} / {downloads?.limit}
                        </p>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>
                            {downloads?.remaining === 'Unlimited' ? '∞ remaining' : `${downloads?.remaining} remaining`}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>License Type</p>
                        <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {tier?.licenseType?.replace('_', ' ')}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Your Discount</p>
                        <p style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {tier?.discountPercentage}% OFF
                        </p>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>on all purchases</p>
                    </div>
                </div>

                {/* Early Access Beats Section */}
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ⭐ Early Access Beats
                        <span style={{
                            background: tier?.color || '#667eea',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '50px',
                            fontSize: '0.8rem'
                        }}>
                            EXCLUSIVE
                        </span>
                    </h2>

                    {earlyAccessBeats.length === 0 ? (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            padding: '3rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <p style={{ color: '#888', fontSize: '1.1rem' }}>
                                No early access beats available right now.
                            </p>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Check back soon for new exclusive drops!
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {earlyAccessBeats.map(beat => (
                                <div key={beat.id} style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    transition: 'transform 0.2s, border-color 0.2s'
                                }}>
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={beat.cover}
                                            alt={beat.title}
                                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                        />
                                        <button
                                            onClick={() => playTrack(beat)}
                                            style={{
                                                position: 'absolute',
                                                bottom: '1rem',
                                                right: '1rem',
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                background: tier?.color || '#667eea',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '1.2rem'
                                            }}
                                        >
                                            {currentBeat?.id === beat.id && isPlaying ? '❚❚' : '▶'}
                                        </button>
                                    </div>
                                    <div style={{ padding: '1rem' }}>
                                        <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                            {beat.title}
                                        </h3>
                                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            {beat.artist} • {beat.bpm} BPM • {beat.key}
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            {beat.isDownloaded ? (
                                                <button
                                                    onClick={() => handleDownload(beat.id, beat.title)}
                                                    disabled={downloading === beat.id}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.75rem',
                                                        background: 'rgba(16, 185, 129, 0.2)',
                                                        color: '#10b981',
                                                        border: '1px solid #10b981',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {downloading === beat.id ? 'Downloading...' : '↓ Download Again'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDownload(beat.id, beat.title)}
                                                    disabled={downloading === beat.id || (downloads?.remaining !== 'Unlimited' && downloads?.remaining <= 0)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.75rem',
                                                        background: downloads?.remaining === 'Unlimited' || downloads?.remaining > 0
                                                            ? tier?.color || '#667eea'
                                                            : '#333',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: downloads?.remaining === 'Unlimited' || downloads?.remaining > 0 ? 'pointer' : 'not-allowed',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {downloading === beat.id ? 'Downloading...' :
                                                        downloads?.remaining === 'Unlimited' || downloads?.remaining > 0
                                                            ? '↓ Download MP3'
                                                            : 'Limit Reached'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Downloaded Beats This Month */}
                {downloadedBeats && downloadedBeats.length > 0 && (
                    <div>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                            📥 Downloaded This Month
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1rem'
                        }}>
                            {downloadedBeats.map(download => (
                                <div key={download.id} style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <img
                                        src={download.beat.cover}
                                        alt={download.beat.title}
                                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: 'white', fontWeight: 'bold' }}>{download.beat.title}</p>
                                        <p style={{ color: '#888', fontSize: '0.85rem' }}>{download.beat.artist}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(download.beat.id, download.beat.title)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ↓
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
