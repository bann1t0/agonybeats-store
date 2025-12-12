import React from "react";
import { prisma } from "@/lib/prisma";
import styles from "./soundkits.module.css";
import { SoundkitCard } from "./SoundkitCard";

export const metadata = {
    title: "Sound Kits | AgonyBeats",
    description: "Premium Drum Kits, Loop Packs, and Presets.",
};

export default async function SoundkitsPage() {
    const soundkits = await prisma.soundkit.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>AGONY KITS</h1>

            {soundkits.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '4rem' }}>
                    <p>No soundkits deployed yet. Check back soon.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {soundkits.map(kit => (
                        <SoundkitCard key={kit.id} kit={kit} />
                    ))}
                </div>
            )}
        </div>
    );
}
