"use client";
import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    const [email, setEmail] = React.useState("");
    const [msg, setMsg] = React.useState("");

    async function handleSubscribe(e) {
        e.preventDefault();
        setMsg("Subscribing...");

        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                setMsg("Welcome to the inner circle! 🌟");
                setEmail("");
            } else {
                setMsg(data.error || "Failed to subscribe");
            }
        } catch (err) {
            setMsg("Something went wrong.");
        }
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Newsletter Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '3rem',
                    padding: '2rem',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>JOIN THE INNER CIRCLE</h3>
                    <p style={{ color: '#888', marginBottom: '1.5rem' }}>Get exclusive beat drops, discounts, and industry tips directly.</p>

                    <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{
                                padding: '0.8rem 1.2rem',
                                borderRadius: '30px',
                                border: '1px solid #333',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                outline: 'none',
                                minWidth: '250px'
                            }}
                        />
                        <button type="submit" style={{
                            padding: '0.8rem 2rem',
                            borderRadius: '30px',
                            border: 'none',
                            background: 'var(--neon-blue)',
                            color: 'black',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}>
                            Subscribe
                        </button>
                    </form>
                    {msg && <p style={{ marginTop: '1rem', color: msg.includes("Welcome") ? '#34d399' : '#f87171' }}>{msg}</p>}
                </div>

                <div className={styles.topSection}>
                    {/* Brand */}
                    <div className={styles.brandCol}>
                        <h2 className={styles.brandName}>AGONYBEATS</h2>
                        <p className={styles.tagline}>Sounds from the Cosmos.</p>
                        <p className={styles.copyright}>&copy; {new Date().getFullYear()} AgonyBeats. All Rights Reserved.</p>
                    </div>

                    {/* Navigation */}
                    <div className={styles.linksCol}>
                        <h4 className={styles.colTitle}>EXPLORE</h4>
                        <Link href="/" className={styles.link}>Catalogue</Link>
                        <Link href="/about" className={styles.link}>About</Link>
                        <Link href="/services" className={styles.link}>Services</Link>
                        <Link href="/contact" className={styles.link}>Contact</Link>
                    </div>

                    {/* Legal */}
                    <div className={styles.linksCol}>
                        <h4 className={styles.colTitle}>LEGAL</h4>
                        <Link href="/terms" className={styles.link}>Terms & Conditions</Link>
                        <Link href="/licenses" className={styles.link}>License Info</Link>
                        <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
                    </div>

                    {/* Socials */}
                    <div className={styles.socialCol}>
                        <h4 className={styles.colTitle}>CONNECT</h4>
                        <div className={styles.socialIcons}>
                            <a href="https://instagram.com/andrea_delfoco" target="_blank" rel="noreferrer" className={styles.socialIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                            <a href="https://www.youtube.com/@ProdbyAgony" target="_blank" rel="noreferrer" className={styles.socialIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                            </a>
                            <a href="mailto:andreadelfoco5@gmail.com" className={styles.socialIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
