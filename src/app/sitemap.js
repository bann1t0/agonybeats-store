import { prisma } from '@/lib/prisma';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agonybeats.com';

    // Fetch all beats for dynamic routes
    let beats = [];
    let soundkits = [];

    try {
        beats = await prisma.beat.findMany({
            select: {
                id: true,
                updatedAt: true,
            },
        });

        soundkits = await prisma.soundkit.findMany({
            select: {
                id: true,
                updatedAt: true,
            },
        });
    } catch (error) {
        console.error('Sitemap: Could not fetch from database', error);
    }

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/licenses`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/soundkits`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
    ];

    // Dynamic beat pages
    const beatPages = beats.map((beat) => ({
        url: `${baseUrl}/beats/${beat.id}`,
        lastModified: beat.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Dynamic soundkit pages
    const soundkitPages = soundkits.map((kit) => ({
        url: `${baseUrl}/soundkits/${kit.id}`,
        lastModified: kit.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticPages, ...beatPages, ...soundkitPages];
}
