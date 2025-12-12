"use client";
import { useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import styles from "./StickyPlayer.module.css";

/* --- SVG ICONS --- */
function SkipBackIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>;
}
function SkipFwdIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>;
}
function VolumeIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
}

export default function StickyPlayer() {
    const {
        currentBeat,
        isPlaying,
        setIsPlaying,
        currentTime,
        duration,
        setDuration,
        volume,
        audioRef,
        togglePlay,
        handleSeek,
        handleVolume,
        animationRef,
        whilePlaying
    } = usePlayer();

    // Effect to handle source changes and playback
    useEffect(() => {
        if (audioRef.current && currentBeat) {
            // If src changed
            let newSrc = currentBeat.audio;
            if (newSrc && !newSrc.startsWith("/") && !newSrc.startsWith("http")) {
                newSrc = "/" + newSrc;
            }

            if (audioRef.current.getAttribute("src") !== newSrc) {
                audioRef.current.src = newSrc;
                if (isPlaying) {
                    audioRef.current.play().catch(e => console.error("Play error:", e));
                }
            } else {
                // Same src, if playing ensure it is playing
                if (isPlaying && audioRef.current.paused) {
                    audioRef.current.play().catch(e => console.error("Resume error:", e));
                }
            }
        }
    }, [currentBeat, isPlaying]);

    // Metadata listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateDuration = () => setDuration(audio.duration);
        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("ended", () => {
            setIsPlaying(false);
            cancelAnimationFrame(animationRef.current);
        });

        return () => {
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("ended", () => { });
        };
    }, []);

    // Animation loop triggers
    useEffect(() => {
        if (isPlaying) {
            animationRef.current = requestAnimationFrame(whilePlaying);
        } else {
            cancelAnimationFrame(animationRef.current);
        }
    }, [isPlaying]);

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (!currentBeat) return <audio ref={audioRef} />;

    return (
        <>
            <audio ref={audioRef} preload="metadata" />
            <div className={`${styles.stickyPlayer} ${currentBeat ? styles.stickyVisible : ''}`}>
                <div className={styles.stickyTrackInfo}>
                    <img src={currentBeat.cover} alt="Cover" className={styles.stickyCover} />
                    <div className={styles.stickyText}>
                        <span className={styles.stickyTitle}>{currentBeat.title}</span>
                        <span className={styles.stickyArtist}>{currentBeat.artist || "AgonyBeats"}</span>
                    </div>
                </div>

                <div className={styles.stickyControlsWrapper}>
                    <div className={styles.stickyButtons}>
                        <button className={styles.controlBtn} onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 10; }}>
                            <SkipBackIcon />
                        </button>
                        <button className={`${styles.controlBtn} ${styles.playBtn}`} onClick={togglePlay}>
                            {isPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            )}
                        </button>
                        <button className={styles.controlBtn} onClick={() => { if (audioRef.current) audioRef.current.currentTime += 10; }}>
                            <SkipFwdIcon />
                        </button>
                    </div>
                    <div className={styles.stickyProgress}>
                        <span>{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            step="0.05"
                            value={currentTime}
                            onChange={(e) => handleSeek(parseFloat(e.target.value))}
                            className={styles.progressBar}
                        />
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className={styles.stickyVolume}>
                    <VolumeIcon />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => handleVolume(e.target.value)}
                        className={styles.volumeBar}
                    />
                </div>
            </div>
        </>
    );
}
