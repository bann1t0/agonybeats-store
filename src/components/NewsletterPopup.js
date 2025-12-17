"use client";
import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

export default function NewsletterPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle"); // idle, submitted, success
    const [discountCode, setDiscountCode] = useState("");
    const [discountPercent, setDiscountPercent] = useState(30);
    const { showToast } = useToast();

    useEffect(() => {
        // Check if already subscribed
        const isSubscribed = localStorage.getItem("newsletter_subscribed");
        if (!isSubscribed) {
            // Show after 5 seconds
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email.includes('@')) return;

        setStatus("submitted");

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (data.discountCode) {
                setDiscountCode(data.discountCode);
                setDiscountPercent(data.percentage || 30);
                localStorage.setItem("newsletter_subscribed", "true");
                localStorage.setItem("newsletter_discount", data.discountCode);
                setStatus("success");
                showToast("Welcome to the cosmos!", "success");
            } else {
                // Already subscribed - check for existing code
                if (data.discountCode) {
                    setDiscountCode(data.discountCode);
                }
                localStorage.setItem("newsletter_subscribed", "true");
                setStatus("success");
                showToast(data.message || "Welcome back!", "info");
            }
        } catch (error) {
            console.error("Newsletter error:", error);
            showToast("Something went wrong. Please try again.", "error");
            setStatus("idle");
        }
    };

    const closePopup = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <>
            <style jsx>{`
                @keyframes neonPulse {
                    0%, 100% {
                        box-shadow: 
                            0 0 20px rgba(217, 70, 239, 0.4),
                            0 0 40px rgba(217, 70, 239, 0.3),
                            0 0 60px rgba(217, 70, 239, 0.2),
                            inset 0 0 20px rgba(217, 70, 239, 0.1);
                    }
                    50% {
                        box-shadow: 
                            0 0 30px rgba(217, 70, 239, 0.6),
                            0 0 60px rgba(217, 70, 239, 0.4),
                            0 0 90px rgba(217, 70, 239, 0.3),
                            inset 0 0 30px rgba(217, 70, 239, 0.2);
                    }
                }

                @keyframes borderRotate {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(180deg);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes glowPulse {
                    0%, 100% {
                        text-shadow: 
                            0 0 10px rgba(217, 70, 239, 0.8),
                            0 0 20px rgba(217, 70, 239, 0.6),
                            0 0 30px rgba(217, 70, 239, 0.4);
                    }
                    50% {
                        text-shadow: 
                            0 0 20px rgba(217, 70, 239, 1),
                            0 0 30px rgba(217, 70, 239, 0.8),
                            0 0 40px rgba(217, 70, 239, 0.6);
                    }
                }

                .particle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: linear-gradient(45deg, #d946ef, #06b6d4);
                    border-radius: 50%;
                    pointer-events: none;
                    opacity: 0.6;
                }

                .particle:nth-child(1) {
                    top: 10%;
                    left: 10%;
                    animation: float 6s ease-in-out infinite;
                }

                .particle:nth-child(2) {
                    top: 20%;
                    right: 15%;
                    animation: float 8s ease-in-out infinite 1s;
                }

                .particle:nth-child(3) {
                    bottom: 15%;
                    left: 20%;
                    animation: float 7s ease-in-out infinite 2s;
                }

                .particle:nth-child(4) {
                    bottom: 25%;
                    right: 10%;
                    animation: float 9s ease-in-out infinite 1.5s;
                }
            `}</style>

            <div style={overlayStyle}>
                <div style={popupContainerStyle}>
                    {/* Animated Border */}
                    <div style={animatedBorderStyle}></div>

                    {/* Floating Particles */}
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>

                    <div style={popupStyle}>
                        <button onClick={closePopup} style={closeBtnStyle}>&times;</button>

                        {status === "success" ? (
                            <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                                <h2 style={titleSuccessStyle}>WELCOME ABOARD! 🚀</h2>
                                <p style={{ color: '#ccc', marginBottom: '1rem' }}>Here is your exclusive {discountPercent}% OFF code:</p>
                                <div style={codeBoxStyle} onClick={() => { navigator.clipboard.writeText(discountCode); showToast("Code copied!", "info") }}>
                                    {discountCode || "LOADING..."}
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#06b6d4', marginTop: '0.5rem' }}>(Click to Copy)</span>
                                </div>
                                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>⚠️ One-time use only - save it!</p>
                                <button onClick={closePopup} style={ctaButtonStyle}>START SHOPPING</button>
                            </div>
                        ) : (
                            <>
                                <h2 style={titleStyle}>UNLOCK 30% OFF</h2>
                                <p style={{ color: '#ccc', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                    Join the AgonyBeats universe. Get exclusive beats, free loops, and a 30% discount on your first order.
                                </p>
                                <form onSubmit={handleSubscribe}>
                                    <input
                                        type="email"
                                        placeholder="producer@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.cssText = inputFocusStyle}
                                        onBlur={(e) => e.target.style.cssText = Object.entries(inputStyle).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        style={ctaButtonStyle}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'scale(1.05)';
                                            e.target.style.boxShadow = '0 0 30px rgba(217, 70, 239, 0.8), 0 0 60px rgba(217, 70, 239, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                            e.target.style.boxShadow = '0 0 20px rgba(217, 70, 239, 0.6), 0 0 40px rgba(217, 70, 239, 0.3)';
                                        }}
                                        disabled={status === "submitted"}
                                    >
                                        {status === "submitted" ? "CONNECTING..." : "GET MY CODE"}
                                    </button>
                                </form>
                                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '1rem' }}>
                                    We respect your inbox. No spam, only fire. 🔥
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'radial-gradient(circle at center, rgba(217, 70, 239, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%)',
    backdropFilter: 'blur(10px)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const popupContainerStyle = {
    position: 'relative',
    maxWidth: '500px',
    width: '90%',
    animation: 'slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
};

const animatedBorderStyle = {
    position: 'absolute',
    top: '-3px',
    left: '-3px',
    right: '-3px',
    bottom: '-3px',
    background: 'linear-gradient(45deg, #d946ef, #06b6d4, #8b5cf6, #d946ef)',
    backgroundSize: '300% 300%',
    borderRadius: '16px',
    animation: 'borderRotate 4s ease infinite, neonPulse 2s ease-in-out infinite',
    zIndex: -1,
};

const popupStyle = {
    background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.98) 0%, rgba(30, 20, 40, 0.98) 100%)',
    padding: '3rem',
    borderRadius: '12px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
};

const closeBtnStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1.5rem',
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '2rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: 10,
};

const titleStyle = {
    fontFamily: 'var(--font-orbitron)',
    color: '#fff',
    marginBottom: '1rem',
    fontSize: '2rem',
    animation: 'glowPulse 3s ease-in-out infinite',
    letterSpacing: '2px',
};

const titleSuccessStyle = {
    ...titleStyle,
    background: 'linear-gradient(45deg, #d946ef, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
};

const inputStyle = {
    width: '100%',
    padding: '1rem',
    marginBottom: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(217, 70, 239, 0.3)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
};

const inputFocusStyle = `
    width: 100%;
    padding: 1rem;
    margin-bottom: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid #06b6d4;
    color: #fff;
    border-radius: 8px;
    font-size: 1rem;
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.4), inset 0 0 10px rgba(6, 182, 212, 0.1);
    outline: none;
`;

const ctaButtonStyle = {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)',
    border: 'none',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    borderRadius: '8px',
    fontFamily: 'var(--font-orbitron)',
    boxShadow: '0 0 20px rgba(217, 70, 239, 0.6), 0 0 40px rgba(217, 70, 239, 0.3)',
    transition: 'all 0.3s ease',
    letterSpacing: '1px',
};

const codeBoxStyle = {
    background: 'rgba(0,0,0,0.6)',
    border: '3px dashed #06b6d4',
    padding: '1.5rem',
    fontSize: '2rem',
    color: '#06b6d4',
    fontWeight: 'bold',
    margin: '2rem 0',
    cursor: 'pointer',
    fontFamily: 'monospace',
    borderRadius: '8px',
    boxShadow: '0 0 30px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.1)',
    transition: 'all 0.3s ease',
    letterSpacing: '4px',
};
