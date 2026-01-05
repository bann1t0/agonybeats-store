"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import ThemeToggle from "./ThemeToggle";
import styles from "./Navigation.module.css";

export default function Navigation() {
    const { data: session } = useSession();
    const { cart, setIsCartOpen } = useCart();
    const [shopDropdown, setShopDropdown] = useState(false);
    const [accountDropdown, setAccountDropdown] = useState(false);
    const shopTimeoutRef = useRef(null);
    const accountTimeoutRef = useRef(null);

    const handleShopEnter = () => {
        if (shopTimeoutRef.current) clearTimeout(shopTimeoutRef.current);
        setShopDropdown(true);
    };

    const handleShopLeave = () => {
        shopTimeoutRef.current = setTimeout(() => {
            setShopDropdown(false);
        }, 200);
    };

    const handleAccountEnter = () => {
        if (accountTimeoutRef.current) clearTimeout(accountTimeoutRef.current);
        setAccountDropdown(true);
    };

    const handleAccountLeave = () => {
        accountTimeoutRef.current = setTimeout(() => {
            setAccountDropdown(false);
        }, 200);
    };

    return (
        <div className={styles.header}>
            <div className={styles.leftNav}>
                <Link href="/" className={styles.navLink}>Home</Link>

                {/* Shop Dropdown */}
                <div
                    className={styles.dropdown}
                    onMouseEnter={handleShopEnter}
                    onMouseLeave={handleShopLeave}
                >
                    <span className={styles.navLink} style={{ cursor: 'pointer' }}>
                        Shop ▼
                    </span>
                    {shopDropdown && (
                        <div className={styles.dropdownMenu}>
                            <Link href="/services" className={styles.dropdownItem}>Services</Link>
                            <Link href="/soundkits" className={styles.dropdownItem}>Soundkits</Link>
                            <Link href="/licenses" className={styles.dropdownItem}>Licenses</Link>
                        </div>
                    )}
                </div>

                <Link href="/subscribe" className={styles.navLink} style={{ color: '#10b981' }}>Subscribe</Link>
                <Link href="/affiliate" className={styles.navLink} style={{ color: '#f59e0b' }}>Affiliate</Link>
                <Link href="/contact" className={styles.navLink}>Contact</Link>
            </div>

            <Link href="/" className={styles.brandContainer}>
                <Image
                    src="/logo.png"
                    alt="Agony Beats Logo"
                    width={50}
                    height={50}
                    className={styles.logo}
                />
                <span className={styles.brandText}>AGONYBEATS</span>
            </Link>

            <div className={styles.rightNav}>
                {session ? (
                    <>
                        {/* Favorites Link */}
                        <Link href="/favorites" className={styles.navLink}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </Link>

                        {/* Account Dropdown */}
                        <div
                            className={styles.dropdown}
                            onMouseEnter={handleAccountEnter}
                            onMouseLeave={handleAccountLeave}
                        >
                            <span className={styles.navLink} style={{ cursor: 'pointer' }}>
                                {session.user.name?.split(' ')[0] || 'Account'} ▼
                            </span>
                            {accountDropdown && (
                                <div className={styles.dropdownMenu} style={{ right: 0 }}>
                                    {session.user?.role === "admin" && (
                                        <>
                                            <Link href="/admin" className={styles.dropdownItem} style={{ color: '#d946ef' }}>
                                                Admin Panel
                                            </Link>
                                            <Link href="/admin/analytics" className={styles.dropdownItem} style={{ color: '#10b981' }}>
                                                Analytics
                                            </Link>
                                            <Link href="/admin/affiliates" className={styles.dropdownItem} style={{ color: '#f59e0b' }}>
                                                Affiliates
                                            </Link>
                                            <div className={styles.dropdownDivider}></div>
                                        </>
                                    )}
                                    <Link href="/account" className={styles.dropdownItem}>
                                        👤 My Account
                                    </Link>
                                    <Link href="/account/purchases" className={styles.dropdownItem}>
                                        🎵 My Purchases
                                    </Link>
                                    <Link href="/account/library" className={styles.dropdownItem}>
                                        📚 My Library
                                    </Link>
                                    <Link href="/account/subscriptions" className={styles.dropdownItem}>
                                        ⭐ My Subscription
                                    </Link>
                                    <div className={styles.dropdownDivider}></div>
                                    <button
                                        onClick={() => signOut()}
                                        className={styles.dropdownItem}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            width: '100%',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            color: '#ef4444'
                                        }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <Link href="/login" className={styles.navLink}>LOGIN</Link>
                )}

                <ThemeToggle />

                <button onClick={() => setIsCartOpen(true)} className={styles.cartButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span>({cart.length})</span>
                </button>
            </div>
        </div>
    );
}
