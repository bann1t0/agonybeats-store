"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./account.module.css";

export default function AccountPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [accountData, setAccountData] = useState(null);
    const [error, setError] = useState("");

    // Modal states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [show2FASetupModal, setShow2FASetupModal] = useState(false);
    const [show2FADisableModal, setShow2FADisableModal] = useState(false);
    const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);

    // 2FA setup state
    const [qrCode, setQrCode] = useState("");
    const [secret, setSecret] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [backupCodes, setBackupCodes] = useState([]);

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // 2FA disable state
    const [disablePassword, setDisablePassword] = useState("");
    const [disableError, setDisableError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchAccountData();
        }
    }, [status, router]);

    const fetchAccountData = async () => {
        try {
            const res = await fetch("/api/account");
            if (res.ok) {
                const data = await res.json();
                setAccountData(data);
            } else {
                setError("Failed to load account data");
            }
        } catch (err) {
            setError("Error loading account");
        } finally {
            setLoading(false);
        }
    };

    // Password Change Handler
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        try {
            const res = await fetch("/api/account/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(passwordForm)
            });

            const data = await res.json();

            if (res.ok) {
                setPasswordSuccess("Password changed successfully!");
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setTimeout(() => setShowPasswordModal(false), 2000);
            } else {
                setPasswordError(data.error || "Failed to change password");
            }
        } catch (err) {
            setPasswordError("An error occurred");
        }
    };

    // 2FA Setup Handler
    const handleSetup2FA = async () => {
        try {
            const res = await fetch("/api/account/2fa/setup", {
                method: "POST"
            });

            const data = await res.json();

            if (res.ok) {
                setQrCode(data.qrCode);
                setSecret(data.secret);
                setShow2FASetupModal(true);
            } else {
                alert(data.error || "Failed to setup 2FA");
            }
        } catch (err) {
            alert("An error occurred");
        }
    };

    // 2FA Verify Handler
    const handleVerify2FA = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/account/2fa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: verificationCode })
            });

            const data = await res.json();

            if (res.ok) {
                setBackupCodes(data.backupCodes);
                setShow2FASetupModal(false);
                setShowBackupCodesModal(true);
                setVerificationCode("");
                fetchAccountData(); // Refresh data
            } else {
                alert(data.error || "Invalid code");
            }
        } catch (err) {
            alert("An error occurred");
        }
    };

    // 2FA Disable Handler
    const handleDisable2FA = async (e) => {
        e.preventDefault();
        setDisableError("");

        try {
            const res = await fetch("/api/account/2fa/disable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: disablePassword })
            });

            const data = await res.json();

            if (res.ok) {
                setShow2FADisableModal(false);
                setDisablePassword("");
                fetchAccountData(); // Refresh data
                alert("2FA disabled successfully");
            } else {
                setDisableError(data.error || "Failed to disable 2FA");
            }
        } catch (err) {
            setDisableError("An error occurred");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("it-IT", {
            style: "currency",
            currency: "EUR"
        }).format(amount);
    };

    if (status === "loading" || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                </div>
            </div>
        );
    }

    if (!accountData) {
        return (
            <div className={styles.container}>
                <p style={{ color: "#ef4444", textAlign: "center" }}>{error || "Unable to load account"}</p>
            </div>
        );
    }

    const { user, stats, subscription } = accountData;

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backButton}>
                ← Back to Home
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>My Account</h1>
                <p className={styles.subtitle}>Manage your profile and security settings</p>
            </header>

            {/* Profile Section */}
            <section className={styles.profileSection}>
                <div className={styles.avatar}>
                    {user.image ? (
                        <img src={user.image} alt={user.name} className={styles.avatarImage} />
                    ) : (
                        user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"
                    )}
                </div>
                <div className={styles.profileInfo}>
                    <h2 className={styles.profileName}>{user.name || "User"}</h2>
                    <p className={styles.profileEmail}>{user.email}</p>
                    <div className={styles.profileMeta}>
                        <span className={styles.metaItem}>
                            📅 Member since {formatDate(user.createdAt)}
                        </span>
                        {user.role === "admin" && (
                            <span className={styles.metaItem}>
                                👑 Administrator
                            </span>
                        )}
                        {subscription && (
                            <span className={styles.metaItem}>
                                ⭐ {subscription.status === "active" ? "Subscriber" : "Inactive"}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎵</div>
                    <div className={styles.statValue}>{stats.purchaseCount}</div>
                    <div className={styles.statLabel}>Beats Purchased</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div className={styles.statValue}>{formatCurrency(stats.totalSpent)}</div>
                    <div className={styles.statLabel}>Total Spent</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>❤️</div>
                    <div className={styles.statValue}>{stats.favoritesCount}</div>
                    <div className={styles.statLabel}>Favorites</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📁</div>
                    <div className={styles.statValue}>{stats.playlistsCount}</div>
                    <div className={styles.statLabel}>Playlists</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⭐</div>
                    <div className={styles.statValue}>{stats.reviewsCount}</div>
                    <div className={styles.statLabel}>Reviews</div>
                </div>
            </section>

            {/* Security Section */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>🔒</span>
                    Security Settings
                </h3>

                {/* Password */}
                <div className={styles.securityItem}>
                    <div className={styles.securityInfo}>
                        <div className={styles.securityLabel}>Password</div>
                        <div className={styles.securityDesc}>
                            {user.hasPassword ? "Password is set" : "No password set (OAuth login)"}
                        </div>
                    </div>
                    {user.hasPassword && (
                        <button
                            className={`${styles.button} ${styles.buttonSecondary}`}
                            onClick={() => setShowPasswordModal(true)}
                        >
                            Change Password
                        </button>
                    )}
                </div>

                {/* 2FA */}
                <div className={styles.securityItem}>
                    <div className={styles.securityInfo}>
                        <div className={styles.securityLabel}>Two-Factor Authentication</div>
                        <div className={styles.securityDesc}>
                            Add an extra layer of security to your account
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span className={`${styles.securityStatus} ${user.twoFactorEnabled ? styles.statusEnabled : styles.statusDisabled}`}>
                            {user.twoFactorEnabled ? "✓ Enabled" : "✕ Disabled"}
                        </span>
                        {user.twoFactorEnabled ? (
                            <button
                                className={`${styles.button} ${styles.buttonDanger}`}
                                onClick={() => setShow2FADisableModal(true)}
                            >
                                Disable
                            </button>
                        ) : (
                            <button
                                className={`${styles.button} ${styles.buttonPrimary}`}
                                onClick={handleSetup2FA}
                                disabled={!user.hasPassword}
                            >
                                Enable
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Quick Links */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>🔗</span>
                    Quick Links
                </h3>
                <div className={styles.quickLinks}>
                    <Link href="/account/purchases" className={styles.quickLink}>
                        <span className={styles.quickLinkIcon}>🎵</span>
                        <span className={styles.quickLinkText}>My Purchases</span>
                        <span className={styles.quickLinkArrow}>→</span>
                    </Link>
                    <Link href="/account/library" className={styles.quickLink}>
                        <span className={styles.quickLinkIcon}>📚</span>
                        <span className={styles.quickLinkText}>My Library</span>
                        <span className={styles.quickLinkArrow}>→</span>
                    </Link>
                    <Link href="/account/subscriptions" className={styles.quickLink}>
                        <span className={styles.quickLinkIcon}>⭐</span>
                        <span className={styles.quickLinkText}>Subscription</span>
                        <span className={styles.quickLinkArrow}>→</span>
                    </Link>
                    <Link href="/" className={styles.quickLink}>
                        <span className={styles.quickLinkIcon}>🏠</span>
                        <span className={styles.quickLinkText}>Browse Beats</span>
                        <span className={styles.quickLinkArrow}>→</span>
                    </Link>
                </div>
            </section>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Change Password</h3>
                            <button className={styles.modalClose} onClick={() => setShowPasswordModal(false)}>×</button>
                        </div>
                        <form onSubmit={handlePasswordChange}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Current Password</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={passwordForm.currentPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>New Password</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    required
                                    minLength={8}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm New Password</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            {passwordError && <p className={styles.error}>{passwordError}</p>}
                            {passwordSuccess && <p className={styles.success}>{passwordSuccess}</p>}
                            <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} style={{ width: "100%" }}>
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 2FA Setup Modal */}
            {show2FASetupModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Setup Two-Factor Authentication</h3>
                            <button className={styles.modalClose} onClick={() => setShow2FASetupModal(false)}>×</button>
                        </div>

                        <p style={{ color: "#888", marginBottom: "1rem" }}>
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                        </p>

                        <div className={styles.qrContainer}>
                            <img src={qrCode} alt="2FA QR Code" className={styles.qrCode} />
                        </div>

                        <p style={{ color: "#888", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                            Or enter this code manually:
                        </p>
                        <div className={styles.secretCode}>{secret}</div>

                        <form onSubmit={handleVerify2FA}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Enter verification code from app</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={verificationCode}
                                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem" }}
                                />
                            </div>
                            <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} style={{ width: "100%" }}>
                                Verify & Enable 2FA
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Backup Codes Modal */}
            {showBackupCodesModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>🎉 2FA Enabled Successfully!</h3>
                        </div>

                        <div className={styles.warningBox}>
                            ⚠️ <strong>Save these backup codes!</strong><br />
                            These codes can be used to access your account if you lose your authenticator.
                            They will NOT be shown again.
                        </div>

                        <div className={styles.backupCodes}>
                            {backupCodes.map((code, index) => (
                                <div key={index} className={styles.backupCode}>{code}</div>
                            ))}
                        </div>

                        <button
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            style={{ width: "100%" }}
                            onClick={() => {
                                // Copy to clipboard
                                navigator.clipboard.writeText(backupCodes.join("\n"));
                                alert("Backup codes copied to clipboard!");
                            }}
                        >
                            Copy All Codes
                        </button>

                        <button
                            className={`${styles.button} ${styles.buttonSecondary}`}
                            style={{ width: "100%", marginTop: "0.75rem" }}
                            onClick={() => setShowBackupCodesModal(false)}
                        >
                            I've Saved My Codes
                        </button>
                    </div>
                </div>
            )}

            {/* 2FA Disable Modal */}
            {show2FADisableModal && (
                <div className={styles.modalOverlay} onClick={() => setShow2FADisableModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Disable Two-Factor Authentication</h3>
                            <button className={styles.modalClose} onClick={() => setShow2FADisableModal(false)}>×</button>
                        </div>

                        <p style={{ color: "#888", marginBottom: "1rem" }}>
                            Enter your password to confirm disabling 2FA. This will remove the extra security from your account.
                        </p>

                        <form onSubmit={handleDisable2FA}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Password</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={disablePassword}
                                    onChange={e => setDisablePassword(e.target.value)}
                                    required
                                />
                            </div>
                            {disableError && <p className={styles.error}>{disableError}</p>}
                            <button type="submit" className={`${styles.button} ${styles.buttonDanger}`} style={{ width: "100%" }}>
                                Disable 2FA
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
