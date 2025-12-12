'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function AnalyticsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        }
    }, [status, session, router]);

    if (status === 'loading' || (!session)) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <p style={{ color: '#888' }}>Loading...</p>
            </div>
        );
    }

    if (session.user.role !== 'admin') {
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
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <Link
                            href="/admin"
                            style={{
                                color: '#888',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}
                        >
                            ← Back to Admin
                        </Link>
                        <h1 style={{
                            color: 'white',
                            fontSize: '2.5rem',
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Analytics Dashboard
                        </h1>
                        <p style={{ color: '#888' }}>
                            Track your store's performance and insights
                        </p>
                    </div>
                </div>

                {/* Analytics Dashboard Component */}
                <AnalyticsDashboard />
            </div>
        </div>
    );
}
