"use client";
import React from 'react';
import { useCart } from '@/context/CartContext';
import { usePlayer } from '@/context/PlayerContext';
import styles from './soundkits.module.css';
import Link from 'next/link';

export function SoundkitCard({ kit }) {
    const { addToCart } = useCart();
    const { currentBeat, isPlaying, setIsPlaying, setCurrentBeat } = usePlayer();

    // Check if this kit is currently the active track
    const isThisKitPlaying = currentBeat?.id === kit.id && isPlaying;

    const handlePlay = (e) => {
        e.stopPropagation(); // Prevent navigation if we add it later
        if (currentBeat?.id === kit.id) {
            // Toggle play/pause if already active
            setIsPlaying(!isPlaying);
        } else {
            // Set new track
            setCurrentBeat({
                id: kit.id,
                title: kit.title,
                artist: "Agony Kits",
                cover: kit.cover,
                audio: kit.audioPreview, // Map 'audioPreview' to 'audio' for the player
                price: kit.price
            });
            setIsPlaying(true);
        }
    };

    const handleAdd = (e) => {
        e.stopPropagation();
        addToCart({
            id: kit.id,
            title: kit.title,
            cover: kit.cover,
            price: kit.price,
            licenseType: "Soundkit",
            file: kit.file
        });
    };

    return (
        <div className={`${styles.card} ${isThisKitPlaying ? styles.cardActive : ''}`}>
            <div className={styles.coverWrapper} onClick={handlePlay}>
                <img src={kit.cover} alt={kit.title} className={styles.cover} />
                <div className={`${styles.playOverlay} ${isThisKitPlaying ? styles.overlayVisible : ''}`}>
                    {isThisKitPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    )}
                </div>
            </div>

            <div className={styles.info}>
                <Link href={`/soundkits/${kit.id}`} style={{ textDecoration: 'none' }}>
                    <h3 className={styles.kitTitle}>{kit.title}</h3>
                </Link>
                <p className={styles.desc}>{kit.description}</p>
                <Link href={`/soundkits/${kit.id}`} className={styles.detailsLink}>
                    View Details →
                </Link>
            </div>

            <div className={styles.actions}>
                <div className={styles.priceTag}>${kit.price.toFixed(2)}</div>
                <button onClick={handleAdd} className={styles.cartBtn}>
                    ADD TO CART
                </button>
            </div>
        </div>
    );
}
