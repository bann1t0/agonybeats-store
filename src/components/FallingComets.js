"use client";
import React, { useEffect, useRef } from "react";

const FallingComets = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let comets = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        class Comet {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * -canvas.height;
                this.length = Math.random() * 80 + 20; // Length of the tail
                this.speed = Math.random() * 10 + 5;
                this.angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1); // Roughly diagonal
                this.opacity = Math.random() * 0.5 + 0.1;
                this.width = Math.random() * 2 + 0.5;
            }

            draw() {
                ctx.beginPath();
                // Gradient trail
                const gradient = ctx.createLinearGradient(
                    this.x, this.y,
                    this.x - Math.cos(this.angle) * this.length,
                    this.y - Math.sin(this.angle) * this.length
                );
                gradient.addColorStop(0, `rgba(0, 255, 255, ${this.opacity})`); // Head
                gradient.addColorStop(1, `rgba(0, 255, 255, 0)`); // Tail

                ctx.strokeStyle = gradient;
                ctx.lineWidth = this.width;
                ctx.lineCap = "round";
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(
                    this.x - Math.cos(this.angle) * this.length,
                    this.y - Math.sin(this.angle) * this.length
                );
                ctx.stroke();
            }

            update() {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;

                // Reset if off screen
                if (this.x > canvas.width + this.length || this.y > canvas.height + this.length) {
                    this.reset();
                    // Start from top or left randomly
                    if (Math.random() > 0.5) {
                        this.x = Math.random() * canvas.width;
                        this.y = -this.length;
                    } else {
                        this.x = -this.length;
                        this.y = Math.random() * canvas.height;
                    }
                }
            }
        }

        // Initialize comets
        const initComets = () => {
            comets = [];
            const cometCount = 15; // Number of active comets
            for (let i = 0; i < cometCount; i++) {
                const comet = new Comet();
                // Randomize initial positions to fill screen
                comet.x = Math.random() * canvas.width;
                comet.y = Math.random() * canvas.height;
                comets.push(comet);
            }
        };

        const drawLoop = () => {
            // Clear screen with fade effect for trails? No, canvas refresh is cleaner
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw regular stars background
            // (Optional: add static stars if needed, but keeping it clean for now)

            comets.forEach(comet => {
                comet.update();
                comet.draw();
            });

            animationFrameId = requestAnimationFrame(drawLoop);
        };

        initComets();
        drawLoop();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 0, // Behind content
                background: "transparent" // Let parent background show through
            }}
        />
    );
};

export default FallingComets;
