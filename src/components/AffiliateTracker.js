'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Affiliate Tracking Component
 * Tracks referral codes from URL and saves to localStorage
 */
function AffiliateTrackerContent() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');

        if (ref) {
            console.log('Affiliate referral detected:', ref);

            // Save to localStorage (persists across sessions)
            localStorage.setItem('affiliateRef', ref);
            localStorage.setItem('affiliateRefTime', Date.now().toString());

            // Track the click
            fetch(`/api/affiliate/track?code=${ref}`)
                .then(res => res.json())
                .then(data => console.log('Referral tracked:', data))
                .catch(err => console.error('Tracking error:', err));
        }
    }, [searchParams]);

    return null;
}

export default function AffiliateTracker() {
    return (
        <Suspense fallback={null}>
            <AffiliateTrackerContent />
        </Suspense>
    );
}
