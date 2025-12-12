"use client";
import React from "react";
import Link from "next/link";
import styles from "./contact.module.css";

// Icons
function ArrowLeftIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
}

function MailIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>;
}

function InstagramIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
}

export default function ContactPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeftIcon /> BACK TO STORE
                    </Link>
                </div>
            </div>

            <main className={styles.main}>
                <h1 className={styles.title}>Get In Touch</h1>
                <p className={styles.subtitle}>
                    Have a question or looking for a custom project? Reach out through the channels below.
                </p>

                <div className={styles.grid}>
                    {/* Email Card */}
                    <a href="mailto:andreadelfoco5@gmail.com" className={`${styles.card} ${styles.emailCard}`}>
                        <div className={styles.icon} style={{ color: 'var(--neon-blue)' }}>
                            <MailIcon />
                        </div>
                        <h2 className={styles.cardTitle}>Email</h2>
                        <p className={styles.cardText}>andreadelfoco5@gmail.com</p>
                        <span className={styles.cardAction} style={{ color: 'var(--neon-blue)' }}>SEND MESSAGE &rarr;</span>
                    </a>

                    {/* Instagram Card */}
                    <a href="https://instagram.com/andrea_delfoco" target="_blank" rel="noopener noreferrer" className={`${styles.card} ${styles.instaCard}`}>
                        <div className={styles.icon} style={{ color: '#d62976' }}>
                            <InstagramIcon />
                        </div>
                        <h2 className={styles.cardTitle}>Instagram</h2>
                        <p className={styles.cardText}>@andrea_delfoco</p>
                        <span className={styles.cardAction} style={{ color: '#d62976' }}>FOLLOW US &rarr;</span>
                    </a>
                </div>
            </main>

            {/* Background Atmosphere */}
            <div className={styles.meteorDecoration}>
                <div className="stars"></div>
                <div className="stars2"></div>
            </div>
        </div>
    );
}
