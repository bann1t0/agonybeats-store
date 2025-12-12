/**
 * Review Section Component
 * Displays reviews for a beat with rating, sorting, and write review functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import StarRating from './StarRating';
import styles from '../app/page.module.css';

export default function ReviewSection({ beatId }) {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [verifiedCount, setVerifiedCount] = useState(0);
    const [sortBy, setSortBy] = useState('recent'); // recent, rating, verified
    const [showWriteReview, setShowWriteReview] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [beatId, sortBy]);

    async function fetchReviews() {
        try {
            setLoading(true);
            const res = await fetch(`/api/reviews?beatId=${beatId}&sortBy=${sortBy}`);
            if (!res.ok) throw new Error('Failed to fetch reviews');

            const data = await res.json();
            setReviews(data.reviews);
            setAvgRating(data.avgRating);
            setTotalReviews(data.totalReviews);
            setVerifiedCount(data.verifiedCount);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    }

    async function submitReview(e) {
        e.preventDefault();

        if (!session) {
            alert('Please login to write a review');
            return;
        }

        if (newRating === 0) {
            alert('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    beatId,
                    rating: newRating,
                    comment: newComment.trim() || null
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit review');
            }

            // Reset form and refresh reviews
            setNewRating(0);
            setNewComment('');
            setShowWriteReview(false);
            fetchReviews();
            alert('Review submitted! 🎉');
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function deleteReview(reviewId) {
        if (!confirm('Delete this review?')) return;

        try {
            const res = await fetch(`/api/reviews?reviewId=${reviewId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete review');

            fetchReviews();
        } catch (error) {
            alert(error.message);
        }
    }

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading reviews...</div>;
    }

    return (
        <div style={{ marginTop: '3rem' }}>
            {/* Header with Average Rating */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>
                        Reviews & Ratings
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <StarRating rating={avgRating} size={24} />
                        <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {avgRating.toFixed(1)}
                        </span>
                        <span style={{ color: '#888' }}>
                            ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>
                </div>

                {session && (
                    <button
                        onClick={() => setShowWriteReview(!showWriteReview)}
                        className={styles.ctaButton}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: showWriteReview ? '#888' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                    >
                        {showWriteReview ? 'Cancel' : 'Write a Review'}
                    </button>
                )}
            </div>

            {/* Write Review Form */}
            {showWriteReview && (
                <form onSubmit={submitReview} style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem' }}>Your Review</h3>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>
                            Rating *
                        </label>
                        <StarRating
                            rating={newRating}
                            interactive
                            size={32}
                            onRatingChange={setNewRating}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>
                            Comment (optional)
                        </label>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts about this beat..."
                            maxLength={500}
                            className={styles.searchInput}
                            style={{
                                minHeight: '100px',
                                resize: 'vertical',
                                width: '100%'
                            }}
                        />
                        <small style={{ color: '#666' }}>{newComment.length}/500 characters</small>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || newRating === 0}
                        className={styles.ctaButton}
                        style={{ width: '100%' }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            )}

            {/* Sort Options */}
            {totalReviews > 0 && (
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap'
                }}>
                    {['recent', 'rating', 'verified'].map((option) => (
                        <button
                            key={option}
                            onClick={() => setSortBy(option)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: sortBy === option ? 'rgba(102, 126, 234, 0.3)' : 'transparent',
                                color: sortBy === option ? 'white' : '#888',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {option === 'recent' && '🕐 Most Recent'}
                            {option === 'rating' && '⭐ Highest Rating'}
                            {option === 'verified' && '✓ Verified Purchases'}
                        </button>
                    ))}
                </div>
            )}

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#888',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '8px'
                    }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No reviews yet</p>
                        <p>Be the first to review this beat!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '1rem',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {review.user.image && (
                                        <img
                                            src={review.user.image}
                                            alt={review.user.name}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ color: 'white', fontWeight: 'bold' }}>
                                                {review.user.name}
                                            </span>
                                            {review.verified && (
                                                <span style={{
                                                    background: '#10b981',
                                                    color: 'white',
                                                    fontSize: '0.7rem',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓ VERIFIED
                                                </span>
                                            )}
                                        </div>
                                        <StarRating rating={review.rating} size={16} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <small style={{ color: '#666' }}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </small>
                                    {session?.user?.id === review.userId && (
                                        <button
                                            onClick={() => deleteReview(review.id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: '0.25rem 0.5rem'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {review.comment && (
                                <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
