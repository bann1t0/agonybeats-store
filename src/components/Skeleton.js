"use client";
import styles from "./Skeleton.module.css";

/**
 * Skeleton loading components with shimmer animation
 */

export function Skeleton({ width, height, borderRadius = "4px", className = "" }) {
    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style={{
                width: width || "100%",
                height: height || "1rem",
                borderRadius
            }}
        />
    );
}

export function SkeletonText({ lines = 3, className = "" }) {
    return (
        <div className={`${styles.textGroup} ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={i === lines - 1 ? "70%" : "100%"}
                    height="0.9rem"
                    className={styles.textLine}
                />
            ))}
        </div>
    );
}

export function SkeletonImage({ width, height, className = "" }) {
    return (
        <Skeleton
            width={width}
            height={height}
            borderRadius="8px"
            className={`${styles.image} ${className}`}
        />
    );
}

export function SkeletonBeatCard({ className = "" }) {
    return (
        <div className={`${styles.beatCard} ${className}`}>
            <SkeletonImage width="100%" height="180px" />
            <div className={styles.beatCardContent}>
                <Skeleton width="70%" height="1.2rem" />
                <div className={styles.beatCardMeta}>
                    <Skeleton width="40px" height="0.8rem" />
                    <Skeleton width="30px" height="0.8rem" />
                    <Skeleton width="50px" height="0.8rem" />
                </div>
                <div className={styles.beatCardButtons}>
                    <Skeleton width="80px" height="32px" borderRadius="6px" />
                    <Skeleton width="100px" height="32px" borderRadius="6px" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonPlayer({ className = "" }) {
    return (
        <div className={`${styles.player} ${className}`}>
            <Skeleton width="50px" height="50px" borderRadius="4px" />
            <div className={styles.playerInfo}>
                <Skeleton width="120px" height="1rem" />
                <Skeleton width="60px" height="0.8rem" />
            </div>
            <div className={styles.playerControls}>
                <Skeleton width="32px" height="32px" borderRadius="50%" />
                <Skeleton width="40px" height="40px" borderRadius="50%" />
                <Skeleton width="32px" height="32px" borderRadius="50%" />
            </div>
            <Skeleton width="200px" height="4px" borderRadius="2px" />
        </div>
    );
}
