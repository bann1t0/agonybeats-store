"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "../checkout.module.css";
import FallingComets from "@/components/FallingComets";

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Optional: Fetch session details from Stripe to show order info
        // For now, just show success message
        setTimeout(() => setLoading(false), 1000);
    }, [sessionId]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div style={{ textAlign: "center", marginTop: "4rem", color: "white" }}>
                    <p>Processing your order...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <FallingComets />
            <div className={styles.successContainer}>
                <div className={styles.successCard}>
                    <div className={styles.checkmarkWrapper}>
                        <svg className={styles.checkmarkSvg} viewBox="0 0 52 52">
                            <circle cx="26" cy="26" r="25" fill="none" />
                            <path className={styles.checkmarkPath} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                    <h1 className={styles.successTitle}>Payment Successful!</h1>
                    <p className={styles.successSubtitle}>
                        Your order has been confirmed. Check your email for download links! 📧
                    </p>

                    <div style={{
                        background: 'rgba(14, 165, 233, 0.1)',
                        border: '1px solid #0ea5e9',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        margin: '2rem 0',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ color: '#0ea5e9', marginTop: 0 }}>📬 Next Steps:</h3>
                        <ul style={{ color: '#ccc', lineHeight: '1.8' }}>
                            <li>Check your inbox for the download email</li>
                            <li>Download your beats within 30 days</li>
                            <li>Start creating amazing music! 🎵</li>
                        </ul>
                        {sessionId && (
                            <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '1rem', marginBottom: 0 }}>
                                <strong>Order ID:</strong> {sessionId}
                            </p>
                        )}
                    </div>

                    <Link href="/" className={styles.backHomeBtn}>
                        BACK TO STUDIO
                    </Link>
                </div>
            </div>
        </div>
    );
}
