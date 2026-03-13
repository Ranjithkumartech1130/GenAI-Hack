'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { adminAPI } from '@/lib/api';

export default function AdminDashboard() {
    const { user, isAuthenticated, loadAuth } = useStore();
    const router = useRouter();
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAuth(); }, [loadAuth]);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (user?.role !== 'admin') { router.push('/dashboard'); return; }
        adminAPI.getDashboard().then(res => {
            setDashboard(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [isAuthenticated, user, router]);

    const handleExport = async () => {
        try {
            const res = await adminAPI.exportResults();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'interview_results.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Export failed');
        }
    };

    if (!isAuthenticated || loading) return <><Navbar /><div className="loading-screen"><div className="spinner" /></div></>;

    const stats = dashboard?.stats || {};

    return (
        <>
            <Navbar />
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">📊 <span className="gradient-text">Admin Dashboard</span></h1>
                        <p className="page-subtitle">Overview of candidate performance and system analytics</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-primary" onClick={handleExport}>📥 Export CSV</button>
                        <button className="btn btn-secondary" onClick={() => router.push('/admin/questions')}>Manage Questions</button>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid mb-6">
                    <div className="stat-card">
                        <span className="stat-label">Total Candidates</span>
                        <span className="stat-value">{stats.totalCandidates || 0}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Total Sessions</span>
                        <span className="stat-value">{stats.totalSessions || 0}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value">{stats.completedSessions || 0}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Avg Score</span>
                        <span className="stat-value">{stats.avgScore || 0}%</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Aptitude Questions</span>
                        <span className="stat-value">{stats.totalAptitudeQ || 0}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Coding Problems</span>
                        <span className="stat-value">{stats.totalCodingP || 0}</span>
                    </div>
                </div>

                {/* Topic Performance */}
                {dashboard?.topicPerformance?.length > 0 && (
                    <div className="section">
                        <h3 className="section-title">📈 Topic Performance (All Candidates)</h3>
                        <div className="grid-3">
                            {dashboard.topicPerformance.map((t: any) => (
                                <div key={t.topic} className="card" style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1 }}>
                                        {t.topic}
                                    </div>
                                    <div style={{ fontSize: 36, fontWeight: 900, marginTop: 8, color: t.percentage >= 60 ? 'var(--success)' : 'var(--warning)' }}>
                                        {t.percentage}%
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.correct}/{t.total} correct</div>
                                    <div className="progress-bar mt-2">
                                        <div className="progress-fill" style={{ width: `${t.percentage}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cheating Alerts */}
                {dashboard?.cheatingAlerts?.length > 0 && (
                    <div className="section">
                        <h3 className="section-title">🚨 Cheating Alerts</h3>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Email</th>
                                        <th>Tab Switches</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboard.cheatingAlerts.map((a: any) => (
                                        <tr key={a.id}>
                                            <td style={{ fontWeight: 600 }}>{a.name}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{a.email}</td>
                                            <td><span className="badge badge-hard">{a.tab_switches} switches</span></td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                                {new Date(a.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recent Sessions */}
                {dashboard?.recentSessions?.length > 0 && (
                    <div className="section">
                        <h3 className="section-title">🕐 Recent Sessions</h3>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Score</th>
                                        <th>Tab Switches</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboard.recentSessions.map((s: any) => (
                                        <tr key={s.id}>
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</div>
                                                </div>
                                            </td>
                                            <td><span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{s.session_type}</span></td>
                                            <td><span className={`badge ${s.status === 'completed' ? 'badge-easy' : 'badge-medium'}`}>{s.status}</span></td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: (s.percentage || 0) >= 60 ? 'var(--success)' : 'var(--danger)' }}>
                                                    {s.percentage || 0}%
                                                </span>
                                            </td>
                                            <td style={{ color: (s.tab_switches || 0) > 3 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                                {s.tab_switches || 0}
                                            </td>
                                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                                {new Date(s.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
