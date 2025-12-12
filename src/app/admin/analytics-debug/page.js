'use client';

import { useEffect, useState } from 'react';

export default function AnalyticsDebugPage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics?days=30')
            .then(res => {
                console.log('Status:', res.status);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log('Got data:', data);
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading...</div>;
    if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

    return (
        <div style={{ padding: '2rem', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
            <h1>Analytics API Debug</h1>

            <h2 style={{ color: '#10b981', marginTop: '2rem' }}>Overview Data:</h2>
            <pre style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
                {JSON.stringify(data?.overview, null, 2)}
            </pre>

            <h2 style={{ color: '#10b981', marginTop: '2rem' }}>Charts Data:</h2>
            <pre style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
                {JSON.stringify(data?.charts, null, 2)}
            </pre>

            <h2 style={{ color: '#10b981', marginTop: '2rem' }}>Top Beats:</h2>
            <pre style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
                {JSON.stringify(data?.topBeats, null, 2)}
            </pre>

            <h2 style={{ color: '#f59e0b', marginTop: '2rem' }}>Raw Response:</h2>
            <pre style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.85rem' }}>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
