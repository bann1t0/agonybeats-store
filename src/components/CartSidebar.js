"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./CartSidebar.module.css";

export default function CartSidebar() {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart } = useCart();
    const [discountCode, setDiscountCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [promoMessage, setPromoMessage] = useState("");
    const [promoStatus, setPromoStatus] = useState("");

    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;

    const applyDiscount = async () => {
        try {
            const res = await fetch("/api/discounts/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: discountCode })
            });

            const data = await res.json();

            if (res.ok) {
                setDiscount(data.percentage / 100);
                setPromoMessage(data.message);
                setPromoStatus("success");
            } else {
                setDiscount(0);
                setPromoMessage(data.error);
                setPromoStatus("error");
            }
        } catch (e) {
            setDiscount(0);
            setPromoMessage("Error checking code");
            setPromoStatus("error");
        }
    };

    return (
        <>
            {/* Sidebar Cart */}
            <div className={`${styles.cartSidebar} ${isCartOpen ? styles.cartOpen : ''}`}>
                <div className={styles.cartHeader}>
                    <h2>Your Cart ({cart.length})</h2>
                    <button onClick={() => setIsCartOpen(false)} className={styles.closeButton}>×</button>
                </div>

                <div className={styles.cartContent}>
                    {cart.length === 0 ? (
                        <>
                            <p className={styles.emptyCartMsg}>Your cart is empty.</p>
                            <p className={styles.emptyCartMsg} style={{ fontSize: '0.8rem', marginTop: '1rem' }}>Add some space beats!</p>
                        </>
                    ) : (
                        <div className={styles.cartItemsList}>
                            {cart.map((item) => (
                                <div key={item.cartId || item.id} className={styles.cartItem}>
                                    <img src={item.cover} alt={item.title} className={styles.cartItemImage} />
                                    <div className={styles.cartItemInfo}>
                                        <h4>{item.title}</h4>
                                        {item.licenseTitle && <span>{item.licenseTitle}</span>}
                                        <span>${item.price.toFixed(2)}</span>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className={styles.removeButton}>×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.cartFooter}>
                    {cart.length > 0 && (
                        <div className={styles.promoSection}>
                            <div className={styles.promoInputWrapper}>
                                <input
                                    type="text"
                                    placeholder="Promo Code"
                                    className={styles.promoInput}
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                />
                                <button onClick={applyDiscount} className={styles.promoButton}>APPLY</button>
                            </div>
                            {promoMessage && <p className={`${styles.promoMessage} ${styles[promoStatus]}`}>{promoMessage}</p>}
                        </div>
                    )}

                    <div className={styles.cartTotalRow}>
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className={styles.cartTotalRow} style={{ color: 'var(--neon-blue)' }}>
                            <span>Discount</span>
                            <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className={`${styles.cartTotalRow} ${styles.finalTotal}`}>
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <Link
                        href="/checkout"
                        className={styles.checkoutButton}
                        style={{ pointerEvents: cart.length === 0 ? 'none' : 'auto', opacity: cart.length === 0 ? 0.5 : 1 }}
                        onClick={() => setIsCartOpen(false)}
                    >
                        Checkout
                    </Link>
                </div>
            </div>

            {/* Overlay */}
            {isCartOpen && <div className={styles.cartOverlay} onClick={() => setIsCartOpen(false)}></div>}
        </>
    );
}
