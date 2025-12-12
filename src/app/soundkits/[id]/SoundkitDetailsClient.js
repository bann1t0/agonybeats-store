"use client";
import React, { useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { usePlayer } from '@/context/PlayerContext';
import styles from '../soundkits.module.css'; // Re-use module styles

export default function SoundkitDetailsClient({ kit }) {
    const { addToCart } = useCart();
    const { currentBeat, isPlaying, setIsPlaying, setCurrentBeat } = usePlayer();

    const isThisKitPlaying = currentBeat?.id === kit.id && isPlaying;

    const handlePlay = () => {
        if (currentBeat?.id === kit.id) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentBeat({
                id: kit.id,
                title: kit.title,
                artist: "Agony Kits",
                cover: kit.cover,
                audio: kit.audioPreview,
                price: kit.price
            });
            setIsPlaying(true);
        }
    };

    return (
        <div className={styles.detailsActions}>
            <div className={styles.detailsPrice}>${kit.price.toFixed(2)}</div>

            <div className={styles.detailsBtnGroup}>
                <button
                    onClick={handlePlay}
                    className={styles.previewBtn}
                    style={{ borderColor: isThisKitPlaying ? '#0ea5e9' : '#fff' }}
                >
                    {isThisKitPlaying ? "PAUSE PREVIEW ⏸" : "PLAY PREVIEW ▶"}
                </button>

                <button
                    onClick={() => addToCart({
                        id: kit.id,
                        title: kit.title,
                        cover: kit.cover,
                        price: kit.price,
                        licenseType: "Soundkit",
                        file: kit.file
                    })}
                    className={styles.detailCartBtn}
                >
                    ADD TO CART
                </button>
            </div>
        </div>
    );
}
