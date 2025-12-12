/**
 * Utility functions for analytics tracking
 */

/**
 * Track a beat play
 */
export async function trackPlay(beatId) {
    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                beatId,
                event: 'play'
            })
        });
    } catch (error) {
        console.error('Failed to track play:', error);
    }
}

/**
 * Track a beat download
 */
export async function trackDownload(beatId) {
    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                beatId,
                event: 'download'
            })
        });
    } catch (error) {
        console.error('Failed to track download:', error);
    }
}

/**
 * Track a purchase
 */
export async function trackPurchase(beatId, licenseId, amount) {
    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                beatId,
                licenseId,
                amount,
                event: 'purchase'
            })
        });
    } catch (error) {
        console.error('Failed to track purchase:', error);
    }
}

/**
 * Track a share
 */
export async function trackShare(beatId) {
    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                beatId,
                event: 'share'
            })
        });
    } catch (error) {
        console.error('Failed to track share:', error);
    }
}

/**
 * Format numbers for display (e.g., 1000 -> 1K, 1000000 -> 1M)
 */
export function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}
