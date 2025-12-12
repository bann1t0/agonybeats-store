/**
 * Waveform Audio Player Component
 * Uses WaveSurfer.js for audio waveform visualization
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

export default function WaveformPlayer({ audioUrl, beatId, autoPlay = false }) {
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!waveformRef.current) return;

        // Initialize WaveSurfer
        const wavesurfer = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#667eea',
            progressColor: '#764ba2',
            cursorColor: '#ffffff',
            barWidth: 2,
            barRadius: 3,
            cursorWidth: 2,
            height: 100,
            barGap: 2,
            responsive: true,
            normalize: true,
            backend: 'WebAudio'
        });

        wavesurferRef.current = wavesurfer;

        // Load audio
        wavesurfer.load(audioUrl);

        // Event listeners
        wavesurfer.on('ready', () => {
            setLoading(false);
            setDuration(wavesurfer.getDuration());
            wavesurfer.setVolume(volume);

            if (autoPlay) {
                wavesurfer.play();
                setIsPlaying(true);
            }
        });

        wavesurfer.on('audioprocess', () => {
            setCurrentTime(wavesurfer.getCurrentTime());
        });

        wavesurfer.on('finish', () => {
            setIsPlaying(false);
            setCurrentTime(0);
        });

        wavesurfer.on('play', () => {
            // Track play analytics
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ beatId, event: 'play' })
            }).catch(console.error);
        });

        // Cleanup
        return () => {
            wavesurfer.destroy();
        };
    }, [audioUrl]);

    // Update volume
    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.setVolume(volume);
        }
    }, [volume]);

    // Update playback rate
    useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.setPlaybackRate(playbackRate);
        }
    }, [playbackRate]);

    const togglePlayPause = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            {/* Waveform Container */}
            <div
                ref={waveformRef}
                style={{
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.4)',
                    opacity: loading ? 0.5 : 1,
                    transition: 'opacity 0.3s'
                }}
            />

            {loading && (
                <div style={{ textAlign: 'center', color: '#888', marginBottom: '1rem' }}>
                    Loading waveform...
                </div>
            )}

            {/* Controls */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                {/* Play/Pause Button */}
                <button
                    onClick={togglePlayPause}
                    disabled={loading}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
                >
                    {isPlaying ? (
                        // Pause Icon
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        // Play Icon
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <polygon points="8,5 19,12 8,19" />
                        </svg>
                    )}
                </button>

                {/* Time Display */}
                <div style={{ color: '#888', fontFamily: 'monospace' }}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Volume Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '150px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        style={{
                            flex: 1,
                            cursor: 'pointer'
                        }}
                    />
                    <span style={{ color: '#888', fontSize: '0.9rem', minWidth: '35px' }}>
                        {Math.round(volume * 100)}%
                    </span>
                </div>

                {/* Speed Control */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[0.75, 1, 1.25, 1.5].map((speed) => (
                        <button
                            key={speed}
                            onClick={() => setPlaybackRate(speed)}
                            style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '4px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: playbackRate === speed ? 'rgba(102, 126, 234, 0.3)' : 'transparent',
                                color: playbackRate === speed ? 'white' : '#888',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
