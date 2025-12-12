/**
 * Favorite/Heart Button Component
 * Toggle favorites with heart icon animation
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function FavoriteButton({ beatId, initialFavorited = false, size = 24, onToggle }) {
    const { data: session } = useSession();
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [isLoading, setIsLoading] = useState(false);

    // Check if beat is favorited when component loads
    useEffect(() => {
        if (!session || !beatId) return;

        async function checkFavorited() {
            try {
                const res = await fetch('/api/favorites');
                if (!res.ok) return;

                const favorites = await res.json();
                const isAlreadyFavorited = favorites.some(fav => fav.beatId === beatId);
                setIsFavorited(isAlreadyFavorited);
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }
        }

        checkFavorited();
    }, [session, beatId]);

    const handleToggle = async (e) => {
        e.stopPropagation(); // Prevent parent click events

        if (!session) {
            alert('Please login to favorite beats!');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Toggling favorite for beat:', beatId);
            const res = await fetch('/api/favorites', {
                method: isFavorited ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ beatId })
            });

            console.log('API Response status:', res.status);

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || 'Failed to update favorite');
            }

            const newState = !isFavorited;
            setIsFavorited(newState);
            console.log('Favorite updated successfully:', newState);

            if (onToggle) {
                onToggle(newState);
            }
        } catch (error) {
            console.error('=== FAVORITE ERROR ===');
            console.error('Error message:', error.message);
            console.error('Full error:', error);
            console.error('Beat ID:', beatId);
            console.error('User session:', session);
            alert('Error: Check browser console (F12) for details');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: isLoading ? 'wait' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1)')}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill={isFavorited ? "#ef4444" : "none"}
                stroke={isFavorited ? "#ef4444" : "#888"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    filter: isFavorited ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' : 'none'
                }}
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        </button>
    );
}
