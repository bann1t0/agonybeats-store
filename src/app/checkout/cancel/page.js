"use client";
import React from "react";
import Link from "next/link";
import styles from "../checkout.module.css";

export default function CancelPage() {
    return (
        <div className={styles.container}>
            <div className={styles.successContainer}>
                <div className={styles.successCard} style={{ maxWidth: '500px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        border: '4px solid #ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        fontSize: '3rem'
                    }}>
                        ❌
                    </div>

                    <h1 style={{ color: 'white', marginBottom: '1rem' }}>Payment Cancelled</h1>
                    <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Your payment was not completed. Your cart items are still saved if you want to try again.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link
                            href="/checkout"
                            style={{
                                padding: '0.75rem 2rem',
                                background: '#0ea5e9',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            Return to Checkout
                        </Link>
                        <Link
                            href="/"
                            style={{
                                padding: '0.75rem 2rem',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            Browse More Beats
                        </Link>
                    </div>

                    <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '2rem' }}>
                        Need help? Contact us at support@agonybeats.com
                    </p>
                </div>
            </div>
        </div>
    );
}
