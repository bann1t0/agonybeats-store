"use client";
import React from "react";
import Link from "next/link";
import styles from "./licenses.module.css";
import LicenseComparison from "@/components/LicenseComparison";

function ArrowLeftIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    );
}

export default function LicensesPage() {
    const [licenses, setLicenses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch("/api/licenses")
            .then(res => res.json())
            .then(data => {
                setLicenses(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getCardClass = (license) => {
        const lower = license.name.toLowerCase();

        // Exclusive Rights - Platinum style
        if (lower.includes("exclusive") || license.defaultPrice >= 300) {
            return `${styles.licenseCard} ${styles.platinumCard}`;
        }

        // Unlimited Lease - Special gold style  
        if (lower.includes("unlimited") || (license.defaultPrice >= 140 && license.defaultPrice < 300)) {
            return `${styles.licenseCard} ${styles.goldCard}`;
        }

        // Premium Lease - Purple style
        if (license.defaultPrice >= 80) {
            return `${styles.licenseCard} ${styles.specialCard}`;
        }

        return styles.licenseCard;
    };

    const parseFeatures = (features) => {
        try {
            const parsed = JSON.parse(features);
            return Array.isArray(parsed) ? parsed : [features];
        } catch (e) {
            return [features];
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div style={{ paddingLeft: "1rem" }}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeftIcon />
                        BACK TO STORE
                    </Link>
                </div>
            </div>

            <main className={styles.main}>
                <h1 className={styles.titleMain}>LICENSE OPTIONS</h1>
                <p className={styles.subtitle}>
                    Choose the license that fits your needs. Upgrade at any time by contacting us.
                </p>

                {loading ? (
                    <p style={{ color: 'white', textAlign: 'center', marginTop: '4rem' }}>Loading licenses...</p>
                ) : (
                    <>
                        <div className={styles.licensesContainer}>
                            {licenses.map((license) => (
                                <div
                                    key={license.id}
                                    className={getCardClass(license)}
                                    style={license.isRecommended ? {
                                        boxShadow: '0 0 40px rgba(217, 70, 239, 0.3)',
                                        borderColor: 'var(--neon-purple)',
                                        transform: 'scale(1.05)',
                                        zIndex: 2
                                    } : {}}
                                >
                                    {license.isRecommended && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '0',
                                            right: '0',
                                            background: 'var(--neon-purple)',
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            padding: '0.25rem 0.75rem',
                                            borderBottomLeftRadius: '8px',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                        }}>
                                            BEST VALUE
                                        </div>
                                    )}
                                    <h2 className={styles.cardTitle}>{license.name}</h2>
                                    <span className={styles.cardPrice}>${license.defaultPrice}</span>
                                    <ul className={styles.featuresList}>
                                        {parseFeatures(license.features).map((feature, idx) => (
                                            <li key={idx}>{feature}</li>
                                        ))}
                                    </ul>
                                    <Link href={`/?license=${license.id}#featured`} className={styles.selectBtn} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                                        SELECT LICENSE
                                    </Link>
                                </div>
                            ))}
                            {licenses.length === 0 && <p style={{ color: '#888' }}>No licenses available at the moment.</p>}
                        </div>

                        {/* License Comparison Section */}
                        {licenses.length > 0 && (
                            <div style={{ marginTop: '4rem' }}>
                                <LicenseComparison licenses={licenses} />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
