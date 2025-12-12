"use client";
import React from "react";
import Link from "next/link";
import styles from "./services.module.css";

// Icons
function MixerIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>;
}
function MusicIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>;
}
function DiscIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>;
}
function ArrowLeftIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
}

export default function ServicesPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeftIcon /> BACK TO STORE
                    </Link>
                </div>
            </div>

            <h1 className={styles.title}>Professional Services</h1>
            <p className={styles.subtitle}>Take your sound to the next level with our expert engineering and production.</p>

            <div className={styles.grid}>
                {/* Mixing */}
                <div className={styles.card}>
                    <div className={styles.iconWrapper}>
                        <MixerIcon />
                    </div>
                    <h2 className={styles.cardTitle}>Mixing</h2>
                    <p className={styles.cardDesc}>
                        Professional mixing to balance your tracks, enhance clarity, and give your music that radio-ready punch.
                        Includes vocal tuning and detailed processing.
                    </p>
                    <div className={styles.price}>From $99 / Track</div>
                    <a href="mailto:andreadelfoco5@gmail.com?subject=Mixing Inquiry" className={styles.contactBtn}>
                        Inquire Now
                    </a>
                </div>

                {/* Mastering */}
                <div className={styles.card}>
                    <div className={styles.iconWrapper}>
                        <DiscIcon />
                    </div>
                    <h2 className={styles.cardTitle}>Mastering</h2>
                    <p className={styles.cardDesc}>
                        The final polish. We ensure your tracks meet industry standards for volume and tonal balance,
                        ready for Spotify, Apple Music, and all streaming platforms.
                    </p>
                    <div className={styles.price}>From $49 / Track</div>
                    <a href="mailto:andreadelfoco5@gmail.com?subject=Mastering Inquiry" className={styles.contactBtn}>
                        Inquire Now
                    </a>
                </div>

                {/* Custom Beats */}
                <div className={styles.card}>
                    <div className={styles.iconWrapper}>
                        <MusicIcon />
                    </div>
                    <h2 className={styles.cardTitle}>Custom Beats</h2>
                    <p className={styles.cardDesc}>
                        Need a specific sound? We create custom instrumentals tailored to your vision and style.
                        Exclusive rights included.
                    </p>
                    <div className={styles.price}>From $299</div>
                    <a href="mailto:andreadelfoco5@gmail.com?subject=Custom Beat Inquiry" className={styles.contactBtn}>
                        Start Project
                    </a>
                </div>
            </div>

            <div style={{ marginTop: '5rem', textAlign: 'center' }}>
                <p style={{ color: '#888', marginBottom: '1rem' }}>Interested in our sound?</p>
                <div className={styles.chromaticSeparator} style={{ maxWidth: '200px', margin: '1rem auto' }}></div>
            </div>
        </div>
    );
}
