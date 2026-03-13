'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { sessionAPI, leaderboardAPI } from '@/lib/api';

export default function DashboardPage() {
    const { user, isAuthenticated, loadAuth } = useStore();
    const [sessions, setSessions] = useState<any[]>([]);
    const [rank, setRank] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => { loadAuth(); }, [loadAuth]);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (user?.role === 'admin') { router.push('/admin'); return; }
        Promise.all([
            sessionAPI.getAll().catch(() => ({ data: { sessions: [] } })),
            leaderboardAPI.getMyRank().catch(() => ({ data: { rank: null } }))
        ]).then(([sessRes, rankRes]) => {
            setSessions(sessRes.data.sessions || []);
            setRank(rankRes.data);
            setLoading(false);
        });
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated) {
        return <div className="loading-screen"><div className="spinner" /><p className="text-muted">Loading...</p></div>;
    }

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const aptitudeSessions = completedSessions.filter(s => s.session_type === 'aptitude');
    const codingSessions = completedSessions.filter(s => s.session_type === 'coding');
    const avgScore = completedSessions.length > 0
        ? Math.round(completedSessions.reduce((s, c) => s + (c.percentage || 0), 0) / completedSessions.length) : 0;

    const highestAptitude = aptitudeSessions.reduce((max, s) => Math.max(max, s.percentage || 0), 0);
    const canAccessCoding = highestAptitude > 50;
    return (
        <>
            <Navbar />
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Welcome back, <span className="gradient-text">{user?.name}</span></h1>
                        <p className="page-subtitle">Ready for your next challenge?</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/aptitude" className="btn btn-primary">Start Aptitude Round</Link>
                        {canAccessCoding ? (
                            <Link href="/coding" className="btn btn-secondary">Start Coding Round</Link>
                        ) : (
                            <button className="btn btn-secondary" disabled title="Score >50% in Aptitude to unlock">
                                🔒 Coding Locked
                            </button>
                        )}
                        {canAccessCoding ? (
                            <Link href="/hr-round" className="btn btn-secondary">🤝 HR Round</Link>
                        ) : (
                            <button className="btn btn-secondary" disabled title="Complete Coding to unlock HR">
                                🔒 HR Locked
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid mb-6">
                    <div className="stat-card">
                        <span className="stat-label">Total Sessions</span>
                        <span className="stat-value">{completedSessions.length}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Avg Score</span>
                        <span className="stat-value">{avgScore}%</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Aptitude Tests</span>
                        <span className="stat-value">{aptitudeSessions.length}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Coding Tests</span>
                        <span className="stat-value">{codingSessions.length}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Global Rank</span>
                        <span className="stat-value">#{rank?.rank || '—'}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Skill Level</span>
                        <span className="stat-value" style={{ fontSize: 22, textTransform: 'capitalize' }}>{user?.skill_level || 'N/A'}</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="section">
                    <h2 className="section-title">🚀 Quick Actions</h2>
                    <div className="grid-3">
                        <Link href="/aptitude" style={{ textDecoration: 'none' }}>
                            <div className="card card-glow" style={{ cursor: 'pointer' }}>
                                <div style={{ fontSize: 36, marginBottom: 12 }}>🧠</div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Aptitude Round</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Test quantitative, logical, and verbal skills with adaptive difficulty
                                </p>
                                <div className="badge badge-primary" style={{ marginTop: 12 }}>15 Questions • 60s each</div>
                            </div>
                        </Link>
                        {canAccessCoding ? (
                            <Link href="/coding" style={{ textDecoration: 'none' }}>
                                <div className="card card-glow" style={{ cursor: 'pointer' }}>
                                    <div style={{ fontSize: 36, marginBottom: 12 }}>💻</div>
                                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Coding Round</h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                        Solve LeetCode-style problems with live code editor and AI evaluation
                                    </p>
                                    <div className="badge badge-info" style={{ marginTop: 12 }}>2-3 Problems • Multiple Languages</div>
                                </div>
                            </Link>
                        ) : (
                            <div className="card" style={{ cursor: 'not-allowed', opacity: 0.6 }} title="Score >50% in Aptitude to unlock">
                                <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Coding Round (Locked)</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    You must score over 50% in the Aptitude Round to unlock the technical coding challenge.
                                </p>
                                <div className="badge badge-medium" style={{ marginTop: 12 }}>Requirements not met</div>
                            </div>
                        )}
                        {canAccessCoding ? (
                            <Link href="/hr-round" style={{ textDecoration: 'none' }}>
                                <div className="card card-glow" style={{ cursor: 'pointer' }}>
                                    <div style={{ fontSize: 36, marginBottom: 12 }}>🤝</div>
                                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>HR Round</h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                        Experience a realistic HR interview with behavioral, logical, and aptitude questions
                                    </p>
                                    <div className="badge badge-info" style={{ marginTop: 12 }}>Voice & Text • AI Powered</div>
                                </div>
                            </Link>
                        ) : (
                            <div className="card" style={{ cursor: 'not-allowed', opacity: 0.6 }} title="Complete Coding Round to unlock">
                                <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>HR Round (Locked)</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Complete the Coding Round first to unlock the HR interview experience.
                                </p>
                                <div className="badge badge-medium" style={{ marginTop: 12 }}>Requirements not met</div>
                            </div>
                        )}
                        <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
                            <div className="card card-glow" style={{ cursor: 'pointer' }}>
                                <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Leaderboard</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    See how you rank against other candidates globally
                                </p>
                                <div className="badge badge-easy" style={{ marginTop: 12 }}>Real-time Rankings</div>
                            </div>
                        </Link>
                        <Link href="/resume" style={{ textDecoration: 'none' }}>
                            <div className="card card-glow" style={{ cursor: 'pointer' }}>
                                <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Resume Evaluator</h3>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Upload your resume (PDF) to check ATS compatibility
                                </p>
                                <div className="badge badge-info" style={{ marginTop: 12 }}>AI Powered</div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Sessions */}
                {completedSessions.length > 0 && (
                    <div className="section">
                        <h2 className="section-title">📋 Recent Sessions</h2>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Score</th>
                                        <th>Status</th>
                                        <th>Tab Switches</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.slice(0, 5).map((s) => (
                                        <tr key={s.id}>
                                            <td>
                                                <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                                                    {s.session_type}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: s.percentage >= 60 ? 'var(--success)' : 'var(--danger)' }}>
                                                    {s.percentage || 0}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${s.status === 'completed' ? 'badge-easy' : 'badge-medium'}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ color: (s.tab_switches || 0) > 3 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                                    {s.tab_switches || 0}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                                {new Date(s.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <Link href={`/results/${s.id}`} className="btn btn-sm btn-outline">View</Link>
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
