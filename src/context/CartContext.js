"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { showToast } = useToast();

    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        // Check if item with same ID AND same license type exists
        if (cart.some((cartItem) => cartItem.id === item.id && cartItem.licenseType === item.licenseType)) {
            showToast("This item is already in your cart!", "info");
            setIsCartOpen(true);
            return;
        }
        setCart([...cart, item]);
        setIsCartOpen(true);
        showToast(`${item.title} added to cart!`, "success");
    };

    const removeFromCart = (id) => {
        setCart(cart.filter((item) => item.id !== id));
        showToast("Item removed from cart.", "error"); // Optional: Notification on remove
    };

    const clearCart = () => {
        setCart([]);
        setAppliedCoupon(null);
    };

    // calculate totals
    const getCartTotals = () => {
        let subtotal = cart.reduce((acc, item) => acc + item.price, 0);
        let bundleDiscount = 0;
        let couponDiscount = 0;
        let hasBundle = false;

        // 1. Bundle Logic: Buy 2 Get 1 Free (Every 3rd beat free, cheapest one)
        // Actually simplest logic: If cart >= 3, find lowest price and subtract it.
        // Wait, "Buy 2 Get 1" usually implies 1 free per set of 3. 
        // Let's implement: For every 3 items, 1 (cheapest available) is free.
        if (cart.length >= 3) {
            const prices = cart.map(i => i.price).sort((a, b) => a - b);
            const freeItemsCount = Math.floor(cart.length / 3);
            for (let i = 0; i < freeItemsCount; i++) {
                bundleDiscount += prices[i];
            }
            hasBundle = true;
        }

        let totalAfterBundle = subtotal - bundleDiscount;

        // 2. Coupon Logic
        if (appliedCoupon) {
            if (appliedCoupon.code === 'TEST100') {
                couponDiscount = totalAfterBundle; // 100% OFF
            } else if (appliedCoupon.code === 'TEST_PAYPAL') {
                // Reduces total to $0.01 to test real payment flow
                couponDiscount = Math.max(0, totalAfterBundle - 0.01);
            } else if (appliedCoupon.percentage) {
                // Dynamic percentage from database
                couponDiscount = totalAfterBundle * (appliedCoupon.percentage / 100);
            }
        }

        let finalTotal = Math.max(0, totalAfterBundle - couponDiscount);

        return {
            subtotal,
            bundleDiscount,
            couponDiscount,
            finalTotal,
            hasBundle
        };
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                isCartOpen,
                setIsCartOpen,
                addToCart,
                removeFromCart,
                clearCart,
                appliedCoupon,
                setAppliedCoupon,
                getCartTotals
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
