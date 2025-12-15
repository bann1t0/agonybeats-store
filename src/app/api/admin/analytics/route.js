import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Admin Analytics API - with complete top beats formatting
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Basic counts
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

        // Get all beats with their analytics for top performing
        const allBeats = await prisma.beat.findMany({
            select: {
                id: true,
                title: true,
                artist: true,
                cover: true
            }
        });

        // Get analytics for beats
        const beatAnalyticsList = await prisma.beatAnalytics.findMany({
            select: {
                beatId: true,
                plays: true,
                favorites: true,
                purchases: true
            }
        });

        // Get purchase counts per beat
        const beatPurchaseCounts = {};
        purchases.forEach(p => {
            if (p.beatId) {
                beatPurchaseCounts[p.beatId] = (beatPurchaseCounts[p.beatId] || 0) + 1;
            }
        });

        // Get favorites count per beat
        const favoriteCounts = await prisma.favorite.groupBy({
            by: ['beatId'],
            _count: true
        });
        const beatFavoriteCounts = {};
        favoriteCounts.forEach(f => {
            beatFavoriteCounts[f.beatId] = f._count;
        });

        // Build analytics map
        const analyticsMap = {};
        beatAnalyticsList.forEach(a => {
            analyticsMap[a.beatId] = a;
        });

        // Build combined beat data
        const combinedBeats = allBeats.map(beat => ({
            ...beat,
            sales: beatPurchaseCounts[beat.id] || 0,
            favorites: beatFavoriteCounts[beat.id] || analyticsMap[beat.id]?.favorites || 0,
            plays: analyticsMap[beat.id]?.plays || 0
        }));

        // Sort for each category
        const mostSold = [...combinedBeats]
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
            .filter(b => b.sales > 0);

        const mostFavorited = [...combinedBeats]
            .sort((a, b) => b.favorites - a.favorites)
            .slice(0, 5)
            .filter(b => b.favorites > 0);

        const mostPlayed = [...combinedBeats]
            .sort((a, b) => b.plays - a.plays)
            .slice(0, 5)
            .filter(b => b.plays > 0);

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
            topBeats: {
                mostSold,
                mostFavorited,
                mostPlayed
            }
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
            topBeats: { mostSold: [], mostFavorited: [], mostPlayed: [] }
        });
    }
}
