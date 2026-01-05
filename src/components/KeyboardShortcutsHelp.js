"use client";
import { useState, useEffect } from "react";
import styles from "./KeyboardShortcutsHelp.module.css";

export default function KeyboardShortcutsHelp() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Toggle with "?" key (Shift + /)
            if (e.key === "?" || (e.shiftKey && e.code === "Slash")) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            // Close with Escape
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Keyboard Shortcuts</h2>
                    <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <h3>Playback</h3>
                        <div className={styles.shortcut}>
                            <kbd>Space</kbd>
                            <span>Play / Pause</span>
                        </div>
                        <div className={styles.shortcut}>
                            <kbd>M</kbd>
                            <span>Mute / Unmute</span>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>Navigation</h3>
                        <div className={styles.shortcut}>
                            <kbd>←</kbd>
                            <span>Rewind 5 seconds</span>
                        </div>
                        <div className={styles.shortcut}>
                            <kbd>→</kbd>
                            <span>Forward 5 seconds</span>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>Volume</h3>
                        <div className={styles.shortcut}>
                            <kbd>↑</kbd>
                            <span>Volume up 10%</span>
                        </div>
                        <div className={styles.shortcut}>
                            <kbd>↓</kbd>
                            <span>Volume down 10%</span>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>Help</h3>
                        <div className={styles.shortcut}>
                            <kbd>?</kbd>
                            <span>Toggle this help</span>
                        </div>
                        <div className={styles.shortcut}>
                            <kbd>Esc</kbd>
                            <span>Close this modal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
