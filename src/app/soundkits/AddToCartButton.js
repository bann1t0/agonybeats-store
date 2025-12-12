"use client";
import React from 'react';
import { useCart } from '@/context/CartContext';
import styles from './soundkits.module.css';

export function AddToCartButton({ kit }) {
    const { addToCart } = useCart();

    const handleAdd = () => {
        addToCart({
            id: kit.id,
            title: kit.title,
            cover: kit.cover,
            price: kit.price,
            licenseType: "Soundkit", // Standardize item type for cart
            file: kit.file // Keep track of file if needed logic uses it
        });
    };

    return (
        <button onClick={handleAdd} className={styles.buyBtn}>
            ADD TO CART
        </button>
    );
}
