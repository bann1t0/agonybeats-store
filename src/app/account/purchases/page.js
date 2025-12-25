'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './purchases.module.css';

// Star Rating Component
function StarRating({ rating, onRatingChange, interactive = false, size = 24 }) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`${styles.star} ${star <= (hoverRating || rating) ? styles.starFilled : ''}`}
                    onClick={() => interactive && onRatingChange?.(star)}
                    onMouseEnter={() => interactive && setHoverRating(star)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                    disabled={!interactive}
                    style={{ fontSize: size }}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

// Review Modal Component
function ReviewModal({ purchase, onClose, onSubmit }) {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        if (rating === 0) {
            setError('Seleziona un rating');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    beatId: purchase.beat.id,
                    rating,
                    title: title.trim() || null,
                    comment: comment.trim() || null
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Errore durante l\'invio');
            }

            onSubmit(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>✕</button>

                <div className={styles.modalHeader}>
                    <img
                        src={purchase.beat.cover}
                        alt={purchase.beat.title}
                        className={styles.modalCover}
                    />
                    <div>
                        <h2 className={styles.modalTitle}>Lascia una recensione</h2>
                        <p className={styles.beatTitle}>{purchase.beat.title}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.reviewForm}>
                    <div className={styles.formGroup}>
                        <label>La tua valutazione *</label>
                        <StarRating
                            rating={rating}
                            onRatingChange={setRating}
                            interactive={true}
                            size={36}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="review-title">Titolo (opzionale)</label>
                        <input
                            id="review-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Es: Beat fantastico!"
                            className={styles.input}
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="review-comment">Commento (opzionale)</label>
                        <textarea
                            id="review-comment"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Condividi la tua esperienza..."
                            className={styles.textarea}
                            rows={4}
                            maxLength={1000}
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={submitting || rating === 0}
                    >
                        {submitting ? 'Invio in corso...' : 'Invia Recensione'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function PurchasesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?redirect=/account/purchases');
            return;
        }

        if (status === 'authenticated') {
            fetchPurchases();
        }
    }, [status, router]);

    async function fetchPurchases() {
        try {
            const res = await fetch('/api/purchases');
            const data = await res.json();

            if (res.ok) {
                setPurchases(data.purchases || []);
            }
        } catch (error) {
            console.error('Error fetching purchases:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleReviewSubmitted(review) {
        // Update the purchase to show it has been reviewed
        setPurchases(prev =>
            prev.map(p =>
                p.beat?.id === review.beatId
                    ? { ...p, hasReviewed: true, review }
                    : p
            )
        );
        setReviewModal(null);
    }

    if (status === 'loading' || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <p>Caricamento...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <Link href="/account" className={styles.backLink}>
                        ← Torna all'Account
                    </Link>
                    <h1 className={styles.title}>
                        🎵 I Miei Acquisti
                    </h1>
                    <p className={styles.subtitle}>
                        Gestisci i tuoi beat acquistati e lascia recensioni
                    </p>
                </div>

                {purchases.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🛒</div>
                        <h2>Nessun acquisto</h2>
                        <p>Non hai ancora acquistato nessun beat.</p>
                        <Link href="/" className={styles.browseButton}>
                            Esplora i Beat →
                        </Link>
                    </div>
                ) : (
                    <div className={styles.purchasesList}>
                        {purchases.map(purchase => (
                            <div key={purchase.id} className={styles.purchaseCard}>
                                {purchase.beat && (
                                    <>
                                        <img
                                            src={purchase.beat.cover}
                                            alt={purchase.beat.title}
                                            className={styles.cover}
                                        />
                                        <div className={styles.purchaseInfo}>
                                            <h3 className={styles.beatName}>
                                                {purchase.beat.title}
                                            </h3>
                                            <p className={styles.beatArtist}>
                                                {purchase.beat.artist} • {purchase.beat.bpm} BPM • {purchase.beat.key}
                                            </p>
                                            <p className={styles.purchaseDetails}>
                                                <span className={styles.license}>
                                                    {purchase.license?.name || 'Licenza Standard'}
                                                </span>
                                                <span className={styles.date}>
                                                    {new Date(purchase.purchasedAt).toLocaleDateString('it-IT')}
                                                </span>
                                            </p>
                                            <p className={styles.amount}>
                                                €{purchase.amount?.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                        <div className={styles.actions}>
                                            {purchase.hasReviewed ? (
                                                <div className={styles.reviewedBadge}>
                                                    <span className={styles.checkIcon}>✓</span>
                                                    Recensito
                                                    <StarRating rating={purchase.review?.rating || 0} size={14} />
                                                </div>
                                            ) : (
                                                <button
                                                    className={styles.reviewButton}
                                                    onClick={() => setReviewModal(purchase)}
                                                >
                                                    ★ Lascia Recensione
                                                </button>
                                            )}
                                            <Link
                                                href={`/beats/${purchase.beat.id}`}
                                                className={styles.viewButton}
                                            >
                                                Visualizza
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {reviewModal && (
                <ReviewModal
                    purchase={reviewModal}
                    onClose={() => setReviewModal(null)}
                    onSubmit={handleReviewSubmitted}
                />
            )}
        </div>
    );
}
