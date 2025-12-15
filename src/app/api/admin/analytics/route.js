import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// WORKING VERSION - with play tracking
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Test simple queries that we know work
        const purchaseCount = await prisma.purchase.count({
            where: { status: 'completed' }
        });

        const aggregate = await prisma.purchase.aggregate({
            _sum: { amount: true },
            where: { status: 'completed' }
        });

        const totalUsers = await prisma.user.count();
        const totalBeats = await prisma.beat.count();
        const newUsers = await prisma.user.count({
            where: { createdAt: { gte: startDate } }
        });

        // Get total plays from BeatAnalytics
        const playsAggregate = await prisma.beatAnalytics.aggregate({
            _sum: { plays: true }
        });
        const totalPlays = playsAggregate._sum.plays || 0;

        // Get purchases with dates for chart
        const purchases = await prisma.purchase.findMany({
            where: {
                status: 'completed',
                purchasedAt: { gte: startDate }
            },
            select: {
                amount: true,
                purchasedAt: true,
                beatId: true
            }
        });

        // Revenue by day
        const revenueByDay = {};
        purchases.forEach(p => {
            const date = p.purchasedAt.toISOString().split('T')[0];
            revenueByDay[date] = (revenueByDay[date] || 0) + p.amount;
        });

        const formattedRevenueByDay = Object.entries(revenueByDay)
            .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Top beats
        const beatPurchases = {};
        purchases.forEach(p => {
            if (p.beatId) {
                beatPurchases[p.beatId] = (beatPurchases[p.beatId] || 0) + 1;
            }
        });

        const topBeatIds = Object.entries(beatPurchases)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([id]) => id);

        const beats = await prisma.beat.findMany({
            where: { id: { in: topBeatIds } },
            select: { id: true, title: true, artist: true }
        });

        const topBeats = topBeatIds.map(id => {
            const beat = beats.find(b => b.id === id);
            return {
                beatId: id,
                title: beat?.title || 'Unknown',
                artist: beat?.artist || 'Unknown',
                purchases: beatPurchases[id]
            };
        });

        return NextResponse.json({
            overview: {
                totalRevenue: parseFloat((aggregate._sum.amount || 0).toFixed(2)),
                totalDownloads: purchaseCount,
                totalPlays,
                activeSubscriptions: 0,
                totalUsers,
                totalBeats,
                newUsers
            },
            charts: {
                revenueByDay: formattedRevenueByDay
            },
            topBeats
        });

    } catch (error) {
        console.error('❌ Analytics error:', error);
        return NextResponse.json({
            overview: {
                totalRevenue: 0,
                totalDownloads: 0,
                totalPlays: 0,
                activeSubscriptions: 0,
                totalUsers: 0,
                totalBeats: 0,
                newUsers: 0
            },
            charts: { revenueByDay: [] },
            topBeats: []
        });
    }
}
