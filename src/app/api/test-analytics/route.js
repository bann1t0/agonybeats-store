import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Complete test endpoint with all analytics data
export async function GET(req) {
    console.log('🔥 TEST API CALLED!');

    try {
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Purchase analytics
        const purchaseCount = await prisma.purchase.count({
            where: { status: 'completed' }
        });

        const aggregate = await prisma.purchase.aggregate({
            _sum: { amount: true },
            where: { status: 'completed' }
        });
        console.log('Aggregate result:', aggregate);

        // Total beats and users
        const totalBeats = await prisma.beat.count();
        const totalUsers = await prisma.user.count();
        // Note: User model doesn't have createdAt, so we can't calculate newUsers

        // Revenue by day for chart
        const purchases = await prisma.purchase.findMany({
            where: {
                status: 'completed',
                purchasedAt: { gte: startDate }
            },
            select: {
                amount: true,
                purchasedAt: true
            }
        });

        const revenueByDay = {};
        purchases.forEach(p => {
            const date = p.purchasedAt.toISOString().split('T')[0];
            revenueByDay[date] = (revenueByDay[date] || 0) + p.amount;
        });

        const revenueByDayArray = Object.entries(revenueByDay)
            .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // TOP PERFORMING BEATS
        // 1. Most Sold Beats (by purchase count)
        const purchasesByBeat = await prisma.purchase.groupBy({
            by: ['beatId'],
            _count: { beatId: true },
            where: {
                status: 'completed',
                beatId: { not: null }
            },
            orderBy: { _count: { beatId: 'desc' } },
            take: 3
        });

        // 2. Most Favorited Beats
        const favoritesByBeat = await prisma.favorite.groupBy({
            by: ['beatId'],
            _count: { beatId: true },
            orderBy: { _count: { beatId: 'desc' } },
            take: 3
        });

        // 3. Get beat details for all top beats
        const allTopBeatIds = [
            ...purchasesByBeat.map(p => p.beatId),
            ...favoritesByBeat.map(f => f.beatId)
        ].filter(Boolean);

        const beatsDetails = await prisma.beat.findMany({
            where: { id: { in: allTopBeatIds } },
            select: {
                id: true,
                title: true,
                artist: true,
                cover: true,
                analytics: true,
                _count: {
                    select: {
                        purchases: true,
                        favorites: true
                    }
                }
            }
        });

        // Format top beats data
        const mostSold = purchasesByBeat.slice(0, 3).map(p => {
            const beat = beatsDetails.find(b => b.id === p.beatId);
            return {
                beatId: p.beatId,
                title: beat?.title || 'Unknown',
                artist: beat?.artist || 'Unknown',
                cover: beat?.cover || '/default-cover.jpg',
                sales: p._count.beatId,
                favorites: beat?._count.favorites || 0,
                plays: beat?.analytics?.plays || 0
            };
        });

        const mostFavorited = favoritesByBeat.slice(0, 3).map(f => {
            const beat = beatsDetails.find(b => b.id === f.beatId);
            return {
                beatId: f.beatId,
                title: beat?.title || 'Unknown',
                artist: beat?.artist || 'Unknown',
                cover: beat?.cover || '/default-cover.jpg',
                favorites: f._count.beatId,
                sales: beat?._count.purchases || 0,
                plays: beat?.analytics?.plays || 0
            };
        });

        // Most played (from BeatAnalytics if exists)
        const mostPlayed = beatsDetails
            .filter(b => b.analytics?.plays)
            .sort((a, b) => (b.analytics?.plays || 0) - (a.analytics?.plays || 0))
            .slice(0, 3)
            .map(beat => ({
                beatId: beat.id,
                title: beat.title,
                artist: beat.artist,
                cover: beat.cover || '/default-cover.jpg',
                plays: beat.analytics.plays,
                sales: beat._count.purchases,
                favorites: beat._count.favorites
            }));

        return NextResponse.json({
            success: true,
            purchaseCount,
            totalRevenue: aggregate._sum.amount || 0,
            totalBeats,
            totalUsers,
            revenueByDay: revenueByDayArray,
            topPerforming: {
                mostSold,
                mostFavorited,
                mostPlayed
            },
            message: 'Test API working!'
        });

    } catch (error) {
        console.error('❌ Test API error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
