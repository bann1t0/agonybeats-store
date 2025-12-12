import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import styles from '../soundkits.module.css';
import SoundkitDetailsClient from './SoundkitDetailsClient';
import Link from 'next/link';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const kit = await prisma.soundkit.findUnique({
        where: { id },
    });
    if (!kit) return { title: 'Not Found' };
    return {
        title: `${kit.title} | Agony Kits`,
        description: kit.description,
    };
}

export default async function SoundkitDetailsPage({ params }) {
    const { id } = await params;
    const kit = await prisma.soundkit.findUnique({
        where: { id },
    });

    if (!kit) notFound();

    return (
        <div className={styles.container} style={{ padding: 0 }}>
            {/* Navigation Back */}


            <div className={styles.detailsHero}>
                <div
                    className={styles.blurredBg}
                    style={{ backgroundImage: `url(${kit.cover})` }}
                />

                <div className={styles.detailsContent}>
                    <Link href="/soundkits" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-orbitron)', marginBottom: '1rem', width: 'fit-content', alignSelf: 'flex-start' }}>
                        ← BACK TO KITS
                    </Link>
                    <div className={styles.detailsLeft}>
                        <img src={kit.cover} alt={kit.title} className={styles.detailsCover} />
                    </div>

                    <div className={styles.detailsRight}>
                        <h1 className={styles.detailsTitle}>{kit.title}</h1>
                        <p style={{ color: '#e879f9', marginBottom: '1rem', fontFamily: 'var(--font-orbitron)', fontSize: '1.2rem' }}>{kit.genre || "Multi-Genre"}</p>
                        <p className={styles.detailsDesc}>{kit.description}</p>

                        <SoundkitDetailsClient kit={kit} />
                    </div>
                </div>
            </div>
        </div>
    );
}
