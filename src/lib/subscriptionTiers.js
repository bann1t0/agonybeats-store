// Subscription Tiers Configuration
export const SUBSCRIPTION_TIERS = {
    BASE: {
        id: 'base',
        name: 'Base',
        price: 14.99,
        currency: 'EUR',
        paypalPlanId: process.env.PAYPAL_BASE_PLAN_ID, // To be configured in PayPal
        features: [
            '3 exclusive beats per month',
            'High-quality stems included',
            'MP3 Lease License',
            '10% discount on all purchases',
            'Access to subscriber-only library',
            'Download anytime during subscription'
        ],
        benefits: {
            beatsPerMonth: 3,
            includeStems: true,
            licenseType: 'MP3_LEASE',
            discountPercentage: 10,
            earlyAccess: false,
            customRequests: 0,
            prioritySupport: false
        },
        color: '#0ea5e9', // Sky blue
        recommended: false
    },

    ADVANCED: {
        id: 'advanced',
        name: 'Advanced',
        price: 29.99,
        currency: 'EUR',
        paypalPlanId: process.env.PAYPAL_ADVANCED_PLAN_ID,
        features: [
            '10 exclusive beats per month',
            'Premium stems included',
            'WAV Lease License',
            '25% discount on all purchases',
            'Early access to new releases',
            'Priority email support',
            'Access to subscriber-only library'
        ],
        benefits: {
            beatsPerMonth: 10,
            includeStems: true,
            licenseType: 'WAV_LEASE',
            discountPercentage: 25,
            earlyAccess: true,
            customRequests: 0,
            prioritySupport: true
        },
        color: '#8b5cf6', // Purple
        recommended: true // BEST VALUE
    },

    SPECIAL: {
        id: 'special',
        name: 'Special VIP',
        price: 99.99,
        currency: 'EUR',
        paypalPlanId: process.env.PAYPAL_SPECIAL_PLAN_ID,
        features: [
            'UNLIMITED beats + stems',
            'Premium/Unlimited License',
            '50% discount on all purchases',
            '2 custom beat requests per month',
            'Exclusive VIP-only beats',
            'Early access to everything',
            '1-on-1 dedicated support',
            'Your name in beat credits'
        ],
        benefits: {
            beatsPerMonth: -1, // Unlimited
            includeStems: true,
            licenseType: 'PREMIUM_UNLIMITED',
            discountPercentage: 50,
            earlyAccess: true,
            customRequests: 2,
            prioritySupport: true,
            vipOnly: true,
            creditInBeats: true
        },
        color: '#f59e0b', // Gold/amber
        recommended: false
    }
};

// Helper to get tier by ID
export function getTier(tierId) {
    return Object.values(SUBSCRIPTION_TIERS).find(tier => tier.id === tierId);
}

// Helper to get discount for user
export function getUserDiscount(subscription) {
    if (!subscription || subscription.status !== 'ACTIVE') return 0;
    const tier = getTier(subscription.tierId);
    return tier?.benefits.discountPercentage || 0;
}

// Helper to check if user can download beat
export function canUserDownloadBeat(subscription, downloadsThisMonth) {
    if (!subscription || subscription.status !== 'ACTIVE') return false;
    const tier = getTier(subscription.tierId);
    if (!tier) return false;

    // Unlimited
    if (tier.benefits.beatsPerMonth === -1) return true;

    // Check monthly limit
    return downloadsThisMonth < tier.benefits.beatsPerMonth;
}

// Get remaining downloads for month
export function getRemainingDownloads(subscription, downloadsThisMonth) {
    if (!subscription || subscription.status !== 'ACTIVE') return 0;
    const tier = getTier(subscription.tierId);
    if (!tier) return 0;

    if (tier.benefits.beatsPerMonth === -1) return Infinity;
    return Math.max(0, tier.benefits.beatsPerMonth - downloadsThisMonth);
}
