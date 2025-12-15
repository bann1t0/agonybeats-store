/**
 * Admin Analytics Dashboard Component
 * Charts and statistics for admin panel
 */

'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30); // days

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    async function fetchAnalytics() {
        setLoading(true);
        try {
            console.log('=== Fetching analytics ===');
            console.log('Time range:', timeRange);

            const res = await fetch(`/api/admin/analytics?days=${timeRange}`);
            console.log('Response status:', res.status);
            console.log('Response ok:', res.ok);

            if (!res.ok) {
                const errorText = await res.text();
                console.error('=== API Error Response ===');
                console.error('Status:', res.status);
                console.error('Response:', errorText);
                throw new Error('Failed to fetch analytics');
            }

            const data = await res.json();
            console.log('=== Analytics Data Received ===');
            console.log(data);

            setAnalytics(data);
        } catch (error) {
            console.error('=== Fetch Error ===');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#888' }}>Loading analytics...</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#ef4444' }}>Failed to load analytics</p>
            </div>
        );
    }

    const { overview, charts, topBeats } = analytics;

    return (
        <div style={{ padding: '2rem 0' }}>
            {/* Time Range Selector */}
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                {[7, 30, 90, 365].map(days => (
                    <button
                        key={days}
                        onClick={() => setTimeRange(days)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: timeRange === days ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: timeRange === days ? 'bold' : 'normal'
                        }}
                    >
                        {days === 365 ? '1 Year' : `${days} Days`}
                    </button>
                ))}
            </div>

            {/* Overview Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <StatCard
                    title="Total Revenue"
                    value={`€${overview.totalRevenue.toFixed(2)}`}
                    icon={<DollarIcon />}
                    color="#10b981"
                />
                <StatCard
                    title="Downloads"
                    value={overview.totalDownloads.toLocaleString()}
                    icon={<DownloadIcon />}
                    color="#3b82f6"
                />
                <StatCard
                    title="Plays"
                    value={overview.totalPlays.toLocaleString()}
                    icon={<PlayIcon />}
                    color="#8b5cf6"
                />
                <StatCard
                    title="Favorites"
                    value={overview.totalFavorites?.toLocaleString() || 0}
                    icon={<HeartIcon />}
                    color="#ef4444"
                />
                <StatCard
                    title="Total Users"
                    value={overview.totalUsers}
                    icon={<UsersIcon />}
                    color="#ec4899"
                />
                <StatCard
                    title="Total Beats"
                    value={overview.totalBeats}
                    icon={<MusicIcon />}
                    color="#06b6d4"
                />
            </div>

            {/* Revenue Chart */}
            <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Revenue Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={charts.revenueByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                            contentStyle={{
                                background: '#1a1a1a',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: 'white'
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (€)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Top Performing Beats - 3 Categories */}
            <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                gridColumn: '1 / -1'
            }}>
                <h3 style={{ color: 'white', marginBottom: '2rem', fontSize: '1.5rem' }}>Top Performing Beats</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    {/* Most Sold */}
                    <div>
                        <h4 style={{ color: '#10b981', marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                            Most Sold
                        </h4>
                        {topBeats?.mostSold?.map((beat, idx) => (
                            <div key={idx} style={{
                                background: 'rgba(16, 185, 129, 0.05)',
                                padding: '1rem',
                                borderRadius: '10px',
                                marginBottom: '1rem',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    background: '#1a1a1a'
                                }}>
                                    <img src={beat.cover} alt={beat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                                        #{idx + 1} {beat.title}
                                    </div>
                                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{beat.artist}</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>{beat.sales}</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>Sales</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>{beat.favorites}</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>Likes</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.1rem' }}>{beat.plays}</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>Plays</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Most Favorited */}
                    <div>
                        <h4 style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            Most Favorited
                        </h4>
                        {topBeats?.mostFavorited?.map((beat, idx) => (
                            <div key={idx} style={{
                                background: 'rgba(239, 68, 68, 0.05)',
                                padding: '1rem',
                                borderRadius: '10px',
                                marginBottom: '1rem',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    background: '#1a1a1a'
                                }}>
                                    <img src={beat.cover} alt={beat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                                        #{idx + 1} {beat.title}
                                    </div>
                                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{beat.artist}</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>{beat.favorites}</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>Likes</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>{beat.sales}</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>Sales</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.1rem' }}>{beat.plays}</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>Plays</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Most Played */}
                    <div>
                        <h4 style={{ color: '#3b82f6', marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Most Played
                        </h4>
                        {topBeats?.mostPlayed?.length > 0 ? (
                            topBeats.mostPlayed.map((beat, idx) => (
                                <div key={idx} style={{
                                    background: 'rgba(59, 130, 246, 0.05)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    marginBottom: '1rem',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        background: '#1a1a1a'
                                    }}>
                                        <img src={beat.cover} alt={beat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                                            #{idx + 1} {beat.title}
                                        </div>
                                        <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{beat.artist}</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.1rem' }}>{beat.plays}</div>
                                                <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>Plays</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>{beat.sales}</div>
                                                <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>Sales</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.1rem' }}>{beat.favorites}</div>
                                                <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>Likes</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic', padding: '2rem', textAlign: 'center' }}>
                                No play data available yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
            }}>
                <div style={{ color }}>{icon}</div>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color
                }}>
                    {value}
                </div>
            </div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>{title}</div>
        </div>
    );
}

// SVG Icon Components
function DollarIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    );
}

function PlayIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    );
}

function StarIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    );
}

function MusicIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
        </svg>
    );
}

function HeartIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
    );
}
