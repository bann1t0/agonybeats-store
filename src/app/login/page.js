"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [data, setData] = useState({ email: "", password: "", name: "" });
    const [isRegister, setIsRegister] = useState(false);
    const [gdprConsent, setGdprConsent] = useState(false);
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (isRegister) {
            if (!gdprConsent) {
                setError("You must agree to the Terms and Conditions.");
                return;
            }
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setIsRegister(false); // Switch to login
                alert("Account created! Please log in.");
            } else {
                const msg = await res.json();
                setError(msg.error);
            }
        } else {
            const res = await signIn("credentials", {
                ...data,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid credentials");
            } else {
                router.push("/");
                router.refresh();
            }
        }
    };

    return (
        <div className={styles.page}>
            <div className={`${styles.main} ${styles.loginContainer}`}>
                <h1 className={styles.heroTitle}>{isRegister ? "JOIN THE CREW" : "LOG IN"}</h1>

                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    {isRegister && (
                        <input
                            type="text"
                            placeholder="NAME"
                            className={styles.searchInput}
                            style={{ marginBottom: '1rem', width: '100%' }}
                            value={data.name}
                            onChange={e => setData({ ...data, name: e.target.value })}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="EMAIL"
                        className={styles.searchInput}
                        style={{ marginBottom: '1rem', width: '100%' }}
                        value={data.email}
                        onChange={e => setData({ ...data, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="PASSWORD"
                        className={styles.searchInput}
                        style={{ marginBottom: '1rem', width: '100%' }}
                        value={data.password}
                        onChange={e => setData({ ...data, password: e.target.value })}
                        required
                    />

                    {isRegister && (
                        <div style={{ textAlign: 'left', marginBottom: '1rem', color: '#ccc', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="gdpr"
                                    checked={gdprConsent}
                                    onChange={e => setGdprConsent(e.target.checked)}
                                    required
                                />
                                <label htmlFor="gdpr">I agree to the <a href="/terms" target="_blank" style={{ color: 'var(--neon-blue)' }}>Terms & Conditions</a> and <a href="/privacy" target="_blank" style={{ color: 'var(--neon-blue)' }}>Privacy Policy</a> (GDPR).</label>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="marketing"
                                    checked={marketingConsent}
                                    onChange={e => setMarketingConsent(e.target.checked)}
                                />
                                <label htmlFor="marketing">I agree to receive updates and free beats via email.</label>
                            </div>
                        </div>
                    )}

                    {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

                    <button type="submit" className={styles.ctaButton} style={{ width: '100%' }}>
                        {isRegister ? "CREATE ACCOUNT" : "ENTER"}
                    </button>

                    {!isRegister && (
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link href="/forgot-password" style={{ color: '#0ea5e9', fontSize: '0.9rem', textDecoration: 'none' }}>
                                Forgot your password?
                            </Link>
                        </div>
                    )}
                </form>

                <div style={{ margin: '2rem 0', width: '100%', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <span style={{ color: '#888' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>

                <button
                    onClick={() => {
                        if (isRegister && !gdprConsent) {
                            setError("You must agree to the Terms to register with Google.");
                            return;
                        }
                        signIn("google");
                    }}
                    className={styles.ctaButton}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg>
                    {isRegister ? "SIGN UP WITH GOOGLE" : "LOG IN WITH GOOGLE"}
                </button>

                <p className={styles.toggleText} style={{ marginTop: '2rem', color: '#888' }}>
                    {isRegister ? "Already have an account?" : "Don't have an account?"}
                    <span
                        onClick={() => setIsRegister(!isRegister)}
                        style={{ color: 'var(--neon-blue)', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' }}
                    >
                        {isRegister ? "Log In" : "Sign Up"}
                    </span>
                </p>

                <Link href="/" style={{ marginTop: '2rem', color: '#888', textDecoration: 'underline' }}>Back to Home</Link>
            </div>
        </div>
    );
}
