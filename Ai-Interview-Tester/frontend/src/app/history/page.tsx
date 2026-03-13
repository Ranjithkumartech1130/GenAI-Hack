'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { sessionAPI } from '@/lib/api';

export default function HistoryPage() {
    const { loadAuth, isAuthenticated } = useStore();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => { loadAuth(); }, [loadAuth]);

    useEffect(() => {
        if (!isAuthenticated) return;
        sessionAPI.getAll().then(res => {
            setSessions(res.data.sessions || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [isAuthenticated]);

    if (!isAuthenticated) return <div className="loading-screen"><div className="spinner" /></div>;

    const filtered = filter === 'all' ? sessions : sessions.filter(s => s.session_type === filter);

    return (
        <>
            <Navbar />
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">📋 Session History</h1>
                        <p className="page-subtitle">Review your past assessments and results</p>
                    </div>
                    <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                        {['all', 'aptitude', 'coding'].map(f => (
                            <button key={f} className={`tab ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-screen"><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                        <h3>No sessions yet</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Start an assessment to see your history here.</p>
                        <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <Link href="/aptitude" className="btn btn-primary">Start Aptitude</Link>
                            <Link href="/coding" className="btn btn-secondary">Start Coding</Link>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map(s => (
                            <Link key={s.id} href={`/results/${s.id}`} style={{ textDecoration: 'none' }}>
                                <div className="card card-glow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <span style={{ fontSize: 28 }}>{s.session_type === 'aptitude' ? '🧠' : '💻'}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, textTransform: 'capitalize', marginBottom: 4 }}>
                                                {s.session_type} Assessment
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <span className={`badge badge-${s.status === 'completed' ? 'easy' : 'medium'}`}>{s.status}</span>
                                                {s.tab_switches > 0 && (
                                                    <span className="badge badge-hard">⚠ {s.tab_switches} tab switches</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                fontSize: 24, fontWeight: 800,
                                                color: (s.percentage || 0) >= 60 ? 'var(--success)' : 'var(--danger)'
                                            }}>
                                                {s.percentage || 0}%
                                            </span>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                {new Date(s.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span style={{ color: 'var(--text-muted)' }}>→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
