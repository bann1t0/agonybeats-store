'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminAffiliatesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [affiliates, setAffiliates] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editCommission, setEditCommission] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchAffiliates();
        }
    }, [status, session, router]);

    async function fetchAffiliates() {
        try {
            const res = await fetch('/api/admin/affiliates');
            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();
            setAffiliates(data.affiliates);
            setStats({
                total: data.totalAffiliates,
                totalEarnings: data.totalEarnings
            });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function updateAffiliate(affiliateId, updates) {
        try {
            const res = await fetch('/api/admin/affiliates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ affiliateId, ...updates })
            });

            if (!res.ok) throw new Error('Update failed');

            await fetchAffiliates();
            setEditingId(null);
            alert('Affiliate updated successfully!');
        } catch (error) {
            alert('Failed to update: ' + error.message);
        }
    }

    function startEdit(affiliate) {
        setEditingId(affiliate.id);
        setEditCommission(affiliate.commission.toString());
    }

    function cancelEdit() {
        setEditingId(null);
        setEditCommission('');
    }

    function saveEdit(affiliateId) {
        const commission = parseFloat(editCommission);
        if (isNaN(commission) || commission < 0 || commission > 100) {
            alert('Invalid commission rate (0-100)');
            return;
        }
        updateAffiliate(affiliateId, { commission });
    }

    if (loading || status === 'loading') {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0a',
                paddingTop: '120px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <p style={{ color: '#888' }}>Loading...</p>
            </div>
        );
    }

    if (!session || session.user.role !== 'admin') {
        return null;
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            paddingTop: '120px',
            paddingBottom: '4rem'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/admin" style={{ color: '#888', textDecoration: 'none' }}>
                        ← Back to Admin
                    </Link>
                    <h1 style={{
                        color: 'white',
                        fontSize: '2.5rem',
                        marginTop: '1rem',
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Affiliate Management
                    </h1>
                    <p style={{ color: '#888' }}>
                        Manage affiliates, commissions, and payouts
                    </p>
                </div>

                {/* Stats Overview */}
                {stats && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <StatCard title="Total Affiliates" value={stats.total} color="#f59e0b" />
                        <StatCard title="Total Earnings Paid" value={`€${stats.totalEarnings.toFixed(2)}`} color="#10b981" />
                    </div>
                )}

                {/* Affiliates Table */}
                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflowX: 'auto'
                }}>
                    <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>All Affiliates</h3>

                    {affiliates.length === 0 ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                            No affiliates yet
                        </p>
                    ) : (
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            color: 'white'
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                                    <th style={thStyle}>Code</th>
                                    <th style={thStyle}>User</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Commission</th>
                                    <th style={thStyle}>Earnings</th>
                                    <th style={thStyle}>Conversions</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {affiliates.map(aff => (
                                    <tr key={aff.id} style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}>
                                        <td style={tdStyle}>
                                            <code style={{
                                                background: 'rgba(245, 158, 11, 0.1)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                color: '#f59e0b'
                                            }}>
                                                {aff.code}
                                            </code>
                                        </td>
                                        <td style={tdStyle}>{aff.userName || 'N/A'}</td>
                                        <td style={tdStyle}>{aff.userEmail}</td>
                                        <td style={tdStyle}>
                                            {editingId === aff.id ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        value={editCommission}
                                                        onChange={(e) => setEditCommission(e.target.value)}
                                                        min="0"
                                                        max="100"
                                                        step="0.5"
                                                        style={{
                                                            width: '60px',
                                                            padding: '0.25rem',
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                                            color: 'white',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                    <span>%</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#10b981' }}>{aff.commission}%</span>
                                            )}
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                                €{aff.totalEarnings.toFixed(2)}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{aff.conversions}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                background: aff.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: aff.status === 'active' ? '#10b981' : '#ef4444'
                                            }}>
                                                {aff.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {editingId === aff.id ? (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => saveEdit(aff.id)}
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            background: '#10b981',
                                                            border: 'none',
                                                            color: 'white',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            background: '#666',
                                                            border: 'none',
                                                            color: 'white',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => startEdit(aff)}
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            background: '#667eea',
                                                            border: 'none',
                                                            color: 'white',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => updateAffiliate(aff.id, {
                                                            status: aff.status === 'active' ? 'inactive' : 'active'
                                                        })}
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            background: aff.status === 'active' ? '#ef4444' : '#10b981',
                                                            border: 'none',
                                                            color: 'white',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        {aff.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color,
                marginBottom: '0.5rem'
            }}>
                {value}
            </div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>{title}</div>
        </div>
    );
}

const thStyle = {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#ccc',
    fontSize: '0.9rem'
};

const tdStyle = {
    padding: '1rem',
    fontSize: '0.9rem'
};
