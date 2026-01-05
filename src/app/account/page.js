"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./account.module.css";

// SVG Icons Component
const Icons = {
    calendar: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    ),
    crown: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18l3-10 5 6 2-8 2 8 5-6 3 10H2z"></path>
            <path d="M3 22h18"></path>
        </svg>
    ),
    star: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    ),
    music: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
        </svg>
    ),
    wallet: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"></path>
        </svg>
    ),
    heart: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
    ),
    folder: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
    ),
    starFilled: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    ),
    lock: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    ),
    link: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
    ),
    download: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    ),
    library: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
    ),
    home: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    ),
    shield: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
    ),
    check: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    x: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    ),
    warning: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    ),
    celebate: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
    ),
    arrowRight: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    ),
    arrowLeft: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    )
};

export default function AccountPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [accountData, setAccountData] = useState(null);
    const [error, setError] = useState("");
    const [setupLoading, setSetupLoading] = useState(false);

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
                const errData = await res.json();
                setError(errData.error || "Failed to load account data");
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
        setSetupLoading(true);
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
            alert("An error occurred: " + err.message);
        } finally {
            setSetupLoading(false);
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
                fetchAccountData();
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
                fetchAccountData();
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
                {Icons.arrowLeft} Back to Home
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
                            <span className={styles.metaIcon}>{Icons.calendar}</span>
                            Member since {formatDate(user.createdAt)}
                        </span>
                        {user.role === "admin" && (
                            <span className={styles.metaItem} style={{ color: '#f59e0b' }}>
                                <span className={styles.metaIcon}>{Icons.crown}</span>
                                Administrator
                            </span>
                        )}
                        {subscription && (
                            <span className={styles.metaItem} style={{ color: '#10b981' }}>
                                <span className={styles.metaIcon}>{Icons.star}</span>
                                {subscription.status === "active" ? "Subscriber" : "Inactive"}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#a855f7' }}>{Icons.music}</div>
                    <div className={styles.statValue}>{stats.purchaseCount}</div>
                    <div className={styles.statLabel}>Beats Purchased</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#10b981' }}>{Icons.wallet}</div>
                    <div className={styles.statValue}>{formatCurrency(stats.totalSpent)}</div>
                    <div className={styles.statLabel}>Total Spent</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#ef4444' }}>{Icons.heart}</div>
                    <div className={styles.statValue}>{stats.favoritesCount}</div>
                    <div className={styles.statLabel}>Favorites</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#3b82f6' }}>{Icons.folder}</div>
                    <div className={styles.statValue}>{stats.playlistsCount}</div>
                    <div className={styles.statLabel}>Playlists</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#f59e0b' }}>{Icons.starFilled}</div>
                    <div className={styles.statValue}>{stats.reviewsCount}</div>
                    <div className={styles.statLabel}>Reviews</div>
                </div>
            </section>

            {/* Security Section */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>{Icons.lock}</span>
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
                            {user.twoFactorEnabled ? (
                                <>{Icons.check} Enabled</>
                            ) : (
                                <>{Icons.x} Disabled</>
                            )}
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
                                disabled={!user.hasPassword || setupLoading}
                            >
                                {setupLoading ? "Loading..." : "Enable"}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Quick Links */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>{Icons.link}</span>
                    Quick Links
                </h3>
                <div className={styles.quickLinks}>
                    <Link href="/account/purchases" className={styles.quickLink}>
                        <span className={styles.quickLinkIcon}>{Icons.download}</span>
                        <span className={styles.quickLinkText}>My Purchases</span>
                        <span className={styles.quickLinkArrow}>{Icons.arrowRight}</span>
                    </Link>
                    <Link href="/account/library" className={styles.quickLink}>
                        <span className={styles.quickLinkIcon}>{Icons.library}</span>
                        <span className={styles.quickLinkText}>My Library</span>
                        <span className={styles.quickLinkArrow}>{Icons.arrowRight}</span>
                    </Link>
                    <Link href="/account/subscriptions" className={styles.quickLink}>
                        <span className={styles.quickLinkIcon}>{Icons.star}</span>
                        <span className={styles.quickLinkText}>Subscription</span>
                        <span className={styles.quickLinkArrow}>{Icons.arrowRight}</span>
                    </Link>
                    <Link href="/" className={styles.quickLink}>
                        <span className={styles.quickLinkIcon}>{Icons.home}</span>
                        <span className={styles.quickLinkText}>Browse Beats</span>
                        <span className={styles.quickLinkArrow}>{Icons.arrowRight}</span>
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
                            <h3 className={styles.modalTitle}>
                                <span style={{ marginRight: '0.5rem' }}>{Icons.shield}</span>
                                Setup Two-Factor Authentication
                            </h3>
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
                            <h3 className={styles.modalTitle}>
                                <span style={{ marginRight: '0.5rem', color: '#10b981' }}>{Icons.celebate}</span>
                                2FA Enabled Successfully!
                            </h3>
                        </div>

                        <div className={styles.warningBox}>
                            <span style={{ marginRight: '0.5rem', color: '#f59e0b' }}>{Icons.warning}</span>
                            <strong>Save these backup codes!</strong><br />
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
