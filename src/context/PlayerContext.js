"use client";
import { createContext, useContext, useState, useRef, useEffect } from "react";
import { trackPlay } from "@/lib/analytics";

const PlayerContext = createContext();

export function usePlayer() {
    return useContext(PlayerContext);
}

export function PlayerProvider({ children }) {
    const [currentBeat, setCurrentBeat] = useState(null); // { id, title, artist, audio, cover ... }
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const audioRef = useRef(null);
    const animationRef = useRef();

    // Initialize Audio Element logic
    useEffect(() => {
        // We create the audio element effectively via the ref in StickyPlayer or here?
        // Better to expose the refs or logic. 
        // Actually, if we want the audio to persist, the <audio> tag must be in the Context or Layout (StickyPlayer).
        // Let's rely on StickyPlayer binding to this context. 
    }, []);

    // Keyboard Shortcuts for Player
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlayRef.current();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (audioRef.current) {
                        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (audioRef.current) {
                        audioRef.current.currentTime = Math.min(
                            audioRef.current.duration || 0,
                            audioRef.current.currentTime + 5
                        );
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (audioRef.current) {
                        const newVol = Math.min(1, audioRef.current.volume + 0.1);
                        audioRef.current.volume = newVol;
                        setVolume(newVol);
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (audioRef.current) {
                        const newVol = Math.max(0, audioRef.current.volume - 0.1);
                        audioRef.current.volume = newVol;
                        setVolume(newVol);
                    }
                    break;
                case 'KeyM':
                    // Mute/unmute
                    e.preventDefault();
                    if (audioRef.current) {
                        audioRef.current.muted = !audioRef.current.muted;
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Ref for togglePlay to avoid stale closure in keyboard handler
    const togglePlayRef = useRef(null);

    const togglePlay = () => {
        if (!currentBeat) return;
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            cancelAnimationFrame(animationRef.current);
        } else {
            audioRef.current?.play().catch(e => console.error("Play error:", e));
            setIsPlaying(true);
            animationRef.current = requestAnimationFrame(whilePlaying);
        }
    };

    // Keep togglePlayRef updated
    useEffect(() => {
        togglePlayRef.current = togglePlay;
    });

    const playTrack = (beat) => {
        if (currentBeat?.id === beat.id) {
            togglePlay();
        } else {
            // New track - track the play event
            if (beat.id) {
                trackPlay(beat.id);
            }
            setCurrentBeat(beat);
            setIsPlaying(true);
            // The useEffect in StickyPlayer will detect change and play
            // But we need to reset time
            setCurrentTime(0);
        }
    };

    const whilePlaying = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            animationRef.current = requestAnimationFrame(whilePlaying);
        }
    };

    const handleSeek = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolume = (vol) => {
        if (audioRef.current) {
            audioRef.current.volume = vol;
            setVolume(vol);
        }
    };

    return (
        <PlayerContext.Provider value={{
            currentBeat,
            setCurrentBeat,
            isPlaying,
            setIsPlaying,
            currentTime,
            duration,
            setDuration,
            volume,
            audioRef,
            togglePlay,
            playTrack,
            handleSeek,
            handleVolume,
            animationRef,
            whilePlaying // Exported so StickyPlayer use effect can use it
        }}>
            {children}
        </PlayerContext.Provider>
    );
}
