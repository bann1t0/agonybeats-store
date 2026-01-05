"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }) {
    return (
        <ThemeProvider>
            <SessionProvider>
                <ToastProvider>
                    <PlayerProvider>
                        <CartProvider>
                            {children}
                        </CartProvider>
                    </PlayerProvider>
                </ToastProvider>
            </SessionProvider>
        </ThemeProvider>
    );
}

