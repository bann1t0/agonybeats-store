"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        token: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    token: formData.token,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                setError(data.error || "Something went wrong");
            }
        } catch (err) {
            setError("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.page}>
                <div className={`${styles.main} ${styles.loginContainer}`} style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center' }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', display: 'block' }}>
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h1 className={styles.title}>Password Reset Successful!</h1>
                        <p style={{ color: '#34d399', marginBottom: '2rem' }}>
                            Your password has been updated. Redirecting to login...
                        </p>
                        <Link href="/login" style={{ color: '#0ea5e9', textDecoration: 'underline' }}>
                            Go to Login now →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={`${styles.main} ${styles.loginContainer}`} style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h1 className={styles.title}>Reset Password</h1>
                <p style={{ color: '#888', marginBottom: '2rem', textAlign: 'center' }}>
                    Enter the code from your email and create a new password.
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#fca5a5',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className={styles.searchInput}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontWeight: 'bold' }}>Reset Code (from email)</label>
                        <input
                            type="text"
                            name="token"
                            placeholder="123456"
                            value={formData.token}
                            onChange={handleChange}
                            maxLength={6}
                            pattern="[0-9]{6}"
                            required
                            disabled={loading}
                            className={styles.searchInput}
                            style={{
                                width: '100%',
                                fontFamily: 'monospace',
                                fontSize: '1.5rem',
                                letterSpacing: '0.5rem',
                                textAlign: 'center'
                            }}
                        />
                        <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            Check your email for the 6-digit code
                        </p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontWeight: 'bold' }}>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="At least 6 characters"
                            value={formData.newPassword}
                            onChange={handleChange}
                            minLength={6}
                            required
                            disabled={loading}
                            className={styles.searchInput}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontWeight: 'bold' }}>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className={styles.searchInput}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.ctaButton}
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Link href="/forgot-password" style={{ color: '#0ea5e9', textDecoration: 'none', marginRight: '2rem' }}>
                        ← Request New Code
                    </Link>
                    <Link href="/login" style={{ color: '#888', textDecoration: 'none' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
