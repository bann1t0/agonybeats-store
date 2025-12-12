"use client";
import React from "react";
import Link from "next/link";
import styles from "../page.module.css";

export default function PrivacyPage() {
    return (
        <div className={styles.page}>
            <div className={styles.main} style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem', fontFamily: 'var(--font-geist-sans)' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-blue)', textDecoration: 'none', fontWeight: 'bold' }}>
                        &larr; BACK TO REGISTRATION
                    </Link>
                </div>

                <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Privacy Policy</h1>
                <p style={{ color: '#888', marginBottom: '3rem' }}>Last Updated: December 9, 2025</p>

                <div style={{ color: '#ccc', lineHeight: '1.8', fontSize: '1rem' }}>
                    <h2>1. Introduction</h2>
                    <p>AgonyBeats ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase, in compliance with the General Data Protection Regulation (GDPR).</p>
                    <br />

                    <h2>2. Information We Collect</h2>
                    <p>We assume the role of Data Controller for the information you provide. We collect:</p>
                    <ul style={{ marginLeft: '1.5rem', marginTop: '1rem', listStyleType: 'disc' }}>
                        <li><strong>Identity Data:</strong> Name, username.</li>
                        <li><strong>Contact Data:</strong> Email address.</li>
                        <li><strong>Transaction Data:</strong> Details of payments and products purchased (Note: We do NOT store credit card numbers; these are handled securely by our payment processors PayPal and Stripe).</li>
                        <li><strong>Technical Data:</strong> IP address, browser type, and usage data via cookies.</li>
                    </ul>
                    <br />

                    <h2>3. How We Use Your Data</h2>
                    <p>We use your data strictly for the following purposes:</p>
                    <ul style={{ marginLeft: '1.5rem', marginTop: '1rem', listStyleType: 'disc' }}>
                        <li>To process your orders and deliver digital downloads via email.</li>
                        <li>To manage your registered account and providing customer support.</li>
                        <li>To send you marketing communications (newsletters, new beat alerts) ONLY if you have explicitly opted in.</li>
                        <li>To comply with legal obligations (e.g., tax reporting).</li>
                    </ul>
                    <br />

                    <h2>4. Data Sharing and Third Parties</h2>
                    <p>We do not sell or rent your personal data to marketers. We may share data with trusted third-party service providers solely to operate our business, such as:</p>
                    <ul style={{ marginLeft: '1.5rem', marginTop: '1rem', listStyleType: 'disc' }}>
                        <li><strong>Payment Processors:</strong> PayPal, Stripe (for transactions).</li>
                        <li><strong>Email Services:</strong> Gmail/SMTP (for delivery of files).</li>
                        <li><strong>Hosting Providers:</strong> Vercel (for website infrastructure).</li>
                    </ul>
                    <br />

                    <h2>5. Your Rights (GDPR)</h2>
                    <p>Under the GDPR, you have the right to:</p>
                    <ul style={{ marginLeft: '1.5rem', marginTop: '1rem', listStyleType: 'disc' }}>
                        <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                        <li><strong>Rectification:</strong> Correction of inaccurate data.</li>
                        <li><strong>Erasure ("Right to be Forgotten"):</strong> Request deletion of your data where it is no longer necessary for us to retain it.</li>
                        <li><strong>Withdraw Consent:</strong> Opt-out of marketing emails at any time.</li>
                    </ul>
                    <p style={{ marginTop: '1rem' }}>To exercise these rights, please contact us at <a href="mailto:andreadelfoco5@gmail.com" style={{ color: 'var(--neon-blue)' }}>andreadelfoco5@gmail.com</a>.</p>
                    <br />

                    <h2>6. Cookies</h2>
                    <p>We use essential cookies to maintain your shopping cart and session. Analyzing cookies may be used to improve website performance.</p>
                    <br />

                    <h2>7. Contact Us</h2>
                    <p>If you have questions about this privacy policy, please contact us at <a href="mailto:andreadelfoco5@gmail.com" style={{ color: 'var(--neon-blue)' }}>andreadelfoco5@gmail.com</a>.</p>
                </div>

                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Link href="/login" style={{ padding: '1rem 2rem', background: '#222', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                        ACKNOWLEDGE & RETURN TO REGISTER
                    </Link>
                </div>
            </div>
        </div>
    );
}
