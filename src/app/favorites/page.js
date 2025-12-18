'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';
import styles from '../page.module.css';

export default function FavoritesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated') {
            fetchFavorites();
        }
    }, [status, router]);

    async function fetchFavorites() {
        try {
            const res = await fetch('/api/favorites');
            if (!res.ok) throw new Error('Failed to fetch favorites');

            const data = await res.json();
            setFavorites(data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleFavoriteToggle = (removed) => {
        if (removed) {
            // Refresh favorites list when a beat is unfavorited
            fetchFavorites();
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a'
            }}>
                <p style={{ color: '#888', fontSize: '1.2rem' }}>Loading favorites...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            padding: '2rem',
            paddingTop: '120px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link
                        href="/"
                        style={{
                            color: '#888',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Store
                    </Link>

                    <h1 style={{
                        color: 'white',
                        fontSize: '2.5rem',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        My Favorites
                    </h1>
                    <p style={{ color: '#888' }}>
                        {favorites.length} {favorites.length === 1 ? 'beat' : 'beats'} saved
                    </p>
                </div>

                {/* Favorites Grid */}
                {favorites.length === 0 ? (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '4rem 2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                <line x1="4" y1="4" x2="20" y2="20" stroke="#888" strokeWidth="2"></line>
                            </svg>
                        </div>
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>No favorites yet</h2>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>
                            Start exploring beats and click the heart icon to save your favorites!
                        </p>
                        <Link href="/" className={styles.ctaButton}>
                            Browse Beats
                        </Link>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {favorites.map(({ beat }) => (
                            <div
                                key={beat.id}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Beat Cover */}
                                <div style={{ position: 'relative', paddingTop: '100%' }}>
                                    <img
                                        src={beat.cover}
                                        alt={beat.title}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem'
                                    }}>
                                        <FavoriteButton
                                            beatId={beat.id}
                                            initialFavorited={true}
                                            size={28}
                                            onToggle={handleFavoriteToggle}
                                        />
                                    </div>
                                </div>

                                {/* Beat Info */}
                                <div style={{ padding: '1.5rem' }}>
                                    <h3 style={{
                                        color: 'white',
                                        marginBottom: '0.5rem',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {beat.title}
                                    </h3>

                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        marginBottom: '1rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        <span style={{
                                            color: '#38bdf8',
                                            background: 'rgba(56, 189, 248, 0.1)',
                                            border: '1px solid rgba(56, 189, 248, 0.2)',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px'
                                        }}>
                                            {beat.bpm} BPM
                                        </span>
                                        <span style={{
                                            color: '#34d399',
                                            background: 'rgba(52, 211, 153, 0.1)',
                                            border: '1px solid rgba(52, 211, 153, 0.2)',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px'
                                        }}>
                                            {beat.key}
                                        </span>
                                        {beat.genre && (
                                            <span style={{
                                                color: '#d946ef',
                                                background: 'rgba(217, 70, 239, 0.1)',
                                                border: '1px solid rgba(217, 70, 239, 0.2)',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px'
                                            }}>
                                                {beat.genre}
                                            </span>
                                        )}
                                    </div>

                                    {/* Price Info */}
                                    {beat.licenses && beat.licenses.length > 0 && (
                                        <div style={{
                                            color: '#888',
                                            fontSize: '0.9rem',
                                            marginBottom: '1rem'
                                        }}>
                                            From ${Math.min(...beat.licenses.map(l => l.price || l.license.defaultPrice))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <Link
                                        href={`/beats/${beat.id}`}
                                        className={styles.ctaButton}
                                        style={{
                                            width: '100%',
                                            textAlign: 'center',
                                            display: 'block',
                                            padding: '0.75rem'
                                        }}
                                    >
                                        View Options
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
