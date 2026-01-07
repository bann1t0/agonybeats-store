"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation"; // Correct for App Router
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import styles from "./beat-details.module.css";

// LICENSES removed in favor of dynamic beat.licenses

function ArrowLeftIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    );
}

function DownloadIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
}

function LockIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
}

function StarsIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
}

import { useToast } from "@/context/ToastContext";
import { usePlayer } from "@/context/PlayerContext"; // Add import

function BeatDetailsContent() {
    const params = useParams();
    const { id } = params;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { playTrack, currentBeat, isPlaying } = usePlayer(); // Get player hook

    const [beat, setBeat] = useState(null);
    const [similarBeats, setSimilarBeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLicense, setSelectedLicense] = useState(null);

    // Subscription state for FREE downloads
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [downloading, setDownloading] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewsData, setReviewsData] = useState({ avgRating: 0, totalReviews: 0 });

    const displayLicenses = React.useMemo(() => {
        if (!beat) return [];
        if (beat.licenses && beat.licenses.length > 0) {
            return beat.licenses.map(bl => {
                const basePrice = bl.price !== null ? bl.price : bl.license.defaultPrice;
                const features = bl.license.features || '';

                // Check if license includes stems but beat doesn't have stems
                const licenseIncludesStems = features.toLowerCase().includes('stem');
                const beatMissingStems = !beat.stems;
                const shouldDiscount = licenseIncludesStems && beatMissingStems;

                // Apply 15% discount if stems are expected but missing
                const finalPrice = shouldDiscount ? Math.round(basePrice * 0.85 * 100) / 100 : basePrice;

                return {
                    id: bl.licenseId,
                    title: bl.license.name,
                    price: finalPrice,
                    originalPrice: shouldDiscount ? basePrice : null, // Show original if discounted
                    type: bl.license.name.toLowerCase().replace(/\s+/g, '-'),
                    features: bl.license.features,
                    isRecommended: bl.license.isRecommended,
                    hasStemsDiscount: shouldDiscount
                };
            }).sort((a, b) => a.price - b.price);
        }
        // Fallback for legacy beats without attached licenses
        return [{ title: "Basic Lease", price: beat.price || 19.99, type: "basic" }];
    }, [beat]);

    // Pre-select license from URL or default
    useEffect(() => {
        if (!beat) return;
        const licenseType = searchParams.get("license");
        if (licenseType) {
            const found = displayLicenses.find(l => l.type === licenseType || l.id === licenseType);
            if (found) setSelectedLicense(found);
        }
    }, [searchParams, beat, displayLicenses]);

    useEffect(() => {
        if (!id) return;
        async function fetchBeat() {
            try {
                // Dummy fallback
                // Dummy fallback removed
                if (id == 1) {
                    // Pass through to fetch, or just return if we want to kill it completely.
                    // Let's assume id 1 might be real now, or if it was dummy only, we just rely on fetch.
                }

                const res = await fetch("/api/beats?all=true");
                if (res.ok) {
                    const data = await res.json();
                    const found = data.find(b => b.id == id);
                    if (found) {
                        setBeat(found);

                        // Find similar beats
                        if (found.genre) {
                            const similar = data.filter(b => b.genre === found.genre && b.id !== found.id).slice(0, 4);
                            setSimilarBeats(similar);
                        } else {
                            const similar = data.filter(b => b.id !== found.id).slice(0, 4);
                            setSimilarBeats(similar);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load beat", e);
            } finally {
                setLoading(false);
            }
        }
        fetchBeat();
    }, [id]);

    // Fetch subscription data
    useEffect(() => {
        if (session?.user) {
            fetch('/api/subscription-downloads')
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && data.hasSubscription) {
                        setSubscriptionData(data);
                    }
                })
                .catch(console.error);
        }
    }, [session]);

    // Fetch reviews for this beat
    useEffect(() => {
        if (!id) return;
        fetch(`/api/reviews?beatId=${id}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setReviews(data.reviews || []);
                    setReviewsData({
                        avgRating: data.avgRating || 0,
                        totalReviews: data.totalReviews || 0
                    });
                }
            })
            .catch(console.error);
    }, [id]);

    // License type mapping for subscription tiers
    const LICENSE_TYPE_MAP = {
        'MP3_LEASE': ['mp3', 'mp3-lease', 'basic', 'basic-lease'],
        'WAV_LEASE': ['wav', 'wav-lease', 'standard'],
        'PREMIUM_UNLIMITED': ['unlimited', 'premium', 'exclusive', 'premium-unlimited']
    };

    // Check if a license matches the subscription tier
    function isLicenseIncludedInSubscription(licenseType) {
        const remaining = subscriptionData?.downloads?.remaining;
        // Handle: number, string number, 'Unlimited', or missing
        const hasRemainingDownloads = remaining === 'Unlimited' || remaining === Infinity || (Number(remaining) > 0);
        if (!subscriptionData || !hasRemainingDownloads) return false;

        const tierLicenseType = subscriptionData.tier?.licenseType;
        if (!tierLicenseType) return false;

        const normalizedLicType = licenseType?.toLowerCase().replace(/\s+/g, '-');
        const matchingTypes = LICENSE_TYPE_MAP[tierLicenseType] || [];

        // Also check for exact match or partial match
        return matchingTypes.some(t => normalizedLicType?.includes(t)) ||
            normalizedLicType?.includes(tierLicenseType.toLowerCase().replace('_', '-'));
    }

    // Handle subscriber free download
    async function handleSubscriberDownload() {
        const remaining = subscriptionData?.downloads?.remaining;
        const hasRemainingDownloads = remaining === 'Unlimited' || remaining === Infinity || (Number(remaining) > 0);
        if (!subscriptionData || !hasRemainingDownloads || !beat) {
            console.log('Cannot download:', { subscriptionData, remaining, beat: !!beat });
            return;
        }

        setDownloading(true);
        try {
            const res = await fetch('/api/subscription-downloads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ beatId: beat.id })
            });

            const data = await res.json();

            if (res.ok && data.downloadUrl) {
                // 1. Download the beat file
                const beatLink = document.createElement('a');
                beatLink.href = data.downloadUrl;
                beatLink.download = `${beat.title}.mp3`;
                document.body.appendChild(beatLink);
                beatLink.click();
                document.body.removeChild(beatLink);

                // 2. Download the license file
                const licenseType = data.licenseType || 'MP3_LEASE';
                const buyerName = session?.user?.name || session?.user?.email || 'Subscriber';
                const licenseUrl = `/api/license?beatTitle=${encodeURIComponent(beat.title)}&buyerName=${encodeURIComponent(buyerName)}&licenseType=${encodeURIComponent(licenseType)}&date=${encodeURIComponent(new Date().toLocaleDateString())}`;

                // Small delay to avoid browser blocking multiple downloads
                setTimeout(() => {
                    const licenseLink = document.createElement('a');
                    licenseLink.href = licenseUrl;
                    licenseLink.download = `${beat.title} - ${licenseType} License.txt`;
                    document.body.appendChild(licenseLink);
                    licenseLink.click();
                    document.body.removeChild(licenseLink);
                }, 500);

                showToast(`Download started! Beat + License. ${data.remaining} downloads remaining.`, 'success');

                // Update remaining count
                setSubscriptionData(prev => ({
                    ...prev,
                    downloads: {
                        ...prev.downloads,
                        remaining: data.remaining
                    }
                }));
            } else {
                showToast(data.error || 'Download failed', 'error');
            }
        } catch (error) {
            console.error('Download error:', error);
            showToast('Download failed', 'error');
        } finally {
            setDownloading(false);
        }
    }

    const handleAddToCart = () => {
        if (!beat || !selectedLicense) {
            showToast("Please select a license first.", "info");
            return;
        }

        const itemToAdd = {
            ...beat,
            price: selectedLicense.price,
            licenseTitle: selectedLicense.title,
            licenseType: selectedLicense.type,
            cartId: `${beat.id}-${selectedLicense.type}`
        };

        addToCart(itemToAdd);
        // Toast is handled in addToCart now, but we can rely on that.
    };

    const handleFreeDownload = async () => {
        if (!session) {
            showToast("Please login to access free downloads.", "error");
            // Optionally redirect to login
            // router.push("/login");
            return;
        }

        try {
            showToast("Starting download...", "info"); // Immediate feedback
            const res = await fetch(`/api/beats/${beat.id}/download`, {
                method: "POST",
            });
            const data = await res.json();

            if (res.ok && data.downloadUrl) {
                // Trigger download
                const link = document.createElement('a');
                link.href = data.downloadUrl;
                link.download = `${beat.title}.mp3`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast("Download started! Enjoy the beat.", "success");
            } else {
                showToast("Error starting download: " + data.error, "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Something went wrong with the download.", "error");
        }
    };

    if (loading) return <div className={styles.page}><p style={{ color: 'white', marginTop: '4rem' }}>Loading...</p></div>;
    if (!beat) return <div className={styles.page}><p style={{ color: 'white', marginTop: '4rem' }}>Beat not found.</p></div>;

    const isCurrentPlaying = currentBeat && currentBeat.id === beat.id && isPlaying;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div style={{ paddingLeft: "2rem", width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeftIcon />
                        BACK TO CATALOGUE
                    </Link>
                </div>
            </div>

            <main className={styles.main}>
                <div className={styles.beatContainer}>
                    {/* Left Column: Image & Info */}
                    <div className={styles.leftColumn}>
                        <div className={styles.imageAndPlayWrapper} style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
                            <img src={beat.cover} alt={beat.title} className={styles.coverImage} style={{ display: 'block', width: '100%' }} />

                            {/* Play Overlay */}
                            <div
                                onClick={() => playTrack(beat)}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: 'rgba(0,0,0,0.3)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    opacity: isCurrentPlaying ? 1 : 0.8,
                                    transition: 'opacity 0.2s'
                                }}
                                className="playOverlay"
                            >
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.6)',
                                    border: '2px solid var(--neon-blue)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: 'white',
                                    boxShadow: isCurrentPlaying ? '0 0 20px var(--neon-blue)' : 'none'
                                }}>
                                    {isCurrentPlaying ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.beatInfo}>
                            <h1 className={styles.title}>{beat.title}</h1>
                            <div className={styles.meta}>
                                <span className={styles.metaItem}>{beat.bpm} BPM</span>
                                <span className={styles.metaItem}>{beat.key}</span>
                                <span className={styles.metaItem}>{beat.genre}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: License Selector */}
                    <div className={styles.rightColumn}>

                        {!beat.stems && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid #ef4444',
                                color: '#fca5a5',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem'
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                <strong>Note:</strong> Track Stems are not currently available for this beat.
                            </div>
                        )}

                        <h2 className={styles.licenseTitle}>Select a License</h2>

                        {displayLicenses.map((lic) => {
                            const isFreeForSubscriber = isLicenseIncludedInSubscription(lic.type || lic.title);

                            return (
                                <div
                                    key={lic.id || lic.type}
                                    className={`${styles.licenseOption} ${selectedLicense?.type === lic.type ? styles.selectedLicense : ''} ${(lic.title.toLowerCase().includes('exclusive') || Number(lic.price) > 99) ? styles.exclusiveOpt : ''}`}
                                    style={{
                                        ...(lic.isRecommended ? {
                                            boxShadow: '0 0 15px rgba(217, 70, 239, 0.4)',
                                            border: '1px solid var(--neon-purple)',
                                            position: 'relative',
                                            overflow: 'visible'
                                        } : {}),
                                        ...(isFreeForSubscriber ? {
                                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                                            border: '2px solid #10b981',
                                            background: 'rgba(16, 185, 129, 0.1)'
                                        } : {})
                                    }}
                                    onClick={() => setSelectedLicense(lic)}
                                >
                                    {/* Subscriber FREE Badge */}
                                    {isFreeForSubscriber && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-12px',
                                            left: '10px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold',
                                            padding: '3px 8px',
                                            borderRadius: '4px',
                                            textTransform: 'uppercase',
                                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                            SUBSCRIBED • {subscriptionData?.downloads?.remaining} left
                                        </span>
                                    )}

                                    {lic.isRecommended && !isFreeForSubscriber && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-10px',
                                            right: '10px',
                                            background: 'var(--neon-purple)',
                                            color: 'white',
                                            fontSize: '0.6rem',
                                            fontWeight: 'bold',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            textTransform: 'uppercase',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                        }}>Best Value</span>
                                    )}

                                    <span className={styles.licName}>{lic.title}</span>

                                    {isFreeForSubscriber ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                textDecoration: 'line-through',
                                                color: '#666',
                                                fontSize: '0.9rem'
                                            }}>
                                                ${lic.price != null ? Number(lic.price).toFixed(2) : '0.00'}
                                            </span>
                                            <span style={{
                                                color: '#10b981',
                                                fontWeight: 'bold',
                                                fontSize: '1.1rem',
                                                textShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                                            }}>
                                                FREE
                                            </span>
                                        </span>
                                    ) : (
                                        <span className={styles.licPrice}>${lic.price != null ? Number(lic.price).toFixed(2) : '0.00'}</span>
                                    )}
                                </div>
                            );
                        })}

                        {/* Subscriber Download Button - shows when FREE license is selected */}
                        {selectedLicense && isLicenseIncludedInSubscription(selectedLicense.type || selectedLicense.title) ? (
                            <button
                                onClick={handleSubscriberDownload}
                                disabled={downloading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    marginTop: '2rem',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <DownloadIcon />
                                {downloading ? 'DOWNLOADING...' : `FREE DOWNLOAD (${subscriptionData?.downloads?.remaining} left)`}
                            </button>
                        ) : (
                            <button
                                className={`${styles.addToCartBtn} ${!selectedLicense ? styles.disabledBtn : ''}`}
                                disabled={!selectedLicense}
                                onClick={handleAddToCart}
                            >
                                {selectedLicense ? (
                                    selectedLicense.hasStemsDiscount ? (
                                        <>
                                            ADD TO CART -
                                            <span style={{ textDecoration: 'line-through', opacity: 0.6, marginLeft: '4px' }}>${selectedLicense.originalPrice}</span>
                                            <span style={{ color: '#4ade80', marginLeft: '4px' }}>${selectedLicense.price}</span>
                                        </>
                                    ) : `ADD TO CART - $${selectedLicense.price}`
                                ) : "SELECT A LICENSE"}
                            </button>
                        )}

                        {selectedLicense?.hasStemsDiscount && (
                            <div style={{
                                background: 'rgba(251, 191, 36, 0.15)',
                                border: '1px solid #f59e0b',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                marginTop: '0.75rem',
                                textAlign: 'center'
                            }}>
                                <p style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 'bold', margin: 0 }}>
                                    ⚠️ 15% OFF - Stems Not Available
                                </p>
                                <p style={{ color: '#d97706', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0 }}>
                                    This license normally includes stems but they're not uploaded for this beat.
                                </p>
                            </div>
                        )}

                        <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>
                            Secure checkout via Stripe/PayPal. Instant download after purchase.
                        </p>

                        <div className={styles.freeDlSection}>
                            {session ? (
                                <button onClick={handleFreeDownload} className={styles.freeDlBtn}>
                                    <DownloadIcon /> FREE DOWNLOAD
                                </button>
                            ) : (
                                <Link href="/login" className={styles.loginDlBtn}>
                                    <LockIcon /> LOGIN FOR FREE DOWNLOAD
                                </Link>
                            )}
                            <p className={styles.gdprNote}>MP3 Tagged • By downloading, you agree to receive updates.</p>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '2rem',
                    marginTop: '2rem'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h3 style={{ color: 'white', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                ⭐ Recensioni
                                <span style={{ color: '#888', fontSize: '1rem', fontWeight: 'normal' }}>({reviewsData.totalReviews})</span>
                            </h3>
                            {reviewsData.totalReviews > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: '#f59e0b', fontSize: '1.5rem' }}>{'★'.repeat(Math.round(reviewsData.avgRating))}</span>
                                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{reviewsData.avgRating}</span>
                                    <span style={{ color: '#888' }}>/ 5</span>
                                </div>
                            )}
                        </div>

                        {reviews.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nessuna recensione ancora</p>
                                <p style={{ fontSize: '0.9rem' }}>Acquista questo beat per lasciare la prima recensione!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {reviews.map(review => (
                                    <div key={review.id} style={{
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: '12px',
                                        padding: '1.25rem',
                                        border: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {review.user?.image ? (
                                                    <img
                                                        src={review.user.image}
                                                        alt={review.user.name || 'User'}
                                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {(review.user?.name || 'U')[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ color: 'white', fontWeight: '600' }}>{review.user?.name || 'Utente'}</span>
                                                        {review.verified && (
                                                            <span style={{
                                                                background: 'rgba(16, 185, 129, 0.15)',
                                                                color: '#10b981',
                                                                padding: '0.15rem 0.5rem',
                                                                borderRadius: '4px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 'bold',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem'
                                                            }}>
                                                                ✓ Acquisto Verificato
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span style={{ color: '#666', fontSize: '0.8rem' }}>
                                                        {new Date(review.createdAt).toLocaleDateString('it-IT')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ color: '#f59e0b', fontSize: '1.1rem' }}>
                                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                        {review.title && (
                                            <h4 style={{ color: 'white', fontSize: '1rem', margin: '0.75rem 0 0.5rem', fontWeight: '600' }}>
                                                {review.title}
                                            </h4>
                                        )}
                                        {review.comment && (
                                            <p style={{ color: '#ccc', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {similarBeats.length > 0 && (
                    <div className={styles.similarSection}>
                        <h3 className={styles.similarTitle}>Similar Vibes <StarsIcon /></h3>
                        <div className={styles.similarGrid}>
                            {similarBeats.map(sim => (
                                <Link key={sim.id} href={`/beats/${sim.id}`} className={styles.similarCard}>
                                    <img src={sim.cover} alt={sim.title} className={styles.similarCover} />
                                    <div className={styles.similarInfo}>
                                        <h4>{sim.title}</h4>
                                        <span>{sim.bpm} BPM • {sim.key}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
}

export default function BeatDetailsPage() {
    return (
        <Suspense fallback={<div className={styles.page}><p style={{ color: 'white', marginTop: '4rem' }}>Loading...</p></div>}>
            <BeatDetailsContent />
        </Suspense>
    );
}
