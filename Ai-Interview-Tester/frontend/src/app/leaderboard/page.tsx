'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { leaderboardAPI } from '@/lib/api';

export default function LeaderboardPage() {
    const { loadAuth, isAuthenticated } = useStore();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [myRank, setMyRank] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAuth(); }, [loadAuth]);

    useEffect(() => {
        if (!isAuthenticated) return;
        Promise.all([
            leaderboardAPI.getAll(50).catch(() => ({ data: { leaderboard: [] } })),
            leaderboardAPI.getMyRank().catch(() => ({ data: {} }))
        ]).then(([lbRes, rankRes]) => {
            setLeaderboard(lbRes.data.leaderboard || []);
            setMyRank(rankRes.data);
            setLoading(false);
        });
    }, [isAuthenticated]);

    if (!isAuthenticated) return <div className="loading-screen"><div className="spinner" /></div>;

    const getMedal = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <>
            <Navbar />
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">🏆 <span className="gradient-text">Leaderboard</span></h1>
                        <p className="page-subtitle">Top performers ranked by overall score</p>
                    </div>
                    {myRank?.rank && (
                        <div className="card" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Your Rank</span>
                            <span style={{ fontSize: 28, fontWeight: 900 }} className="gradient-text">
                                #{myRank.rank}
                            </span>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>of {myRank.total}</span>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="loading-screen"><div className="spinner" /></div>
                ) : leaderboard.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
                        <h3 style={{ marginBottom: 8 }}>No rankings yet</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Complete assessments to appear on the leaderboard!</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 60 }}>Rank</th>
                                    <th>Candidate</th>
                                    <th>Sessions</th>
                                    <th>Aptitude Avg</th>
                                    <th>Coding Avg</th>
                                    <th>Overall Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry) => (
                                    <tr key={entry.rank} style={{
                                        background: entry.rank <= 3 ? 'rgba(108, 92, 231, 0.03)' : undefined
                                    }}>
                                        <td>
                                            <span style={{ fontSize: entry.rank <= 3 ? 24 : 16, fontWeight: 800 }}>
                                                {getMedal(entry.rank)}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '50%',
                                                    background: entry.rank <= 3 ? 'var(--accent-gradient)' : 'var(--bg-input)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: 14, color: 'white'
                                                }}>
                                                    {entry.user_name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{entry.user_name}</span>
                                            </div>
                                        </td>
                                        <td>{entry.total_sessions}</td>
                                        <td>
                                            <span style={{ color: entry.avg_aptitude_score >= 60 ? 'var(--success)' : 'var(--text-secondary)' }}>
                                                {entry.avg_aptitude_score}%
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: entry.avg_coding_score >= 60 ? 'var(--success)' : 'var(--text-secondary)' }}>
                                                {entry.avg_coding_score}%
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: 18, fontWeight: 800,
                                                color: entry.overall_score >= 80 ? 'var(--success)' : entry.overall_score >= 50 ? 'var(--warning)' : 'var(--danger)'
                                            }}>
                                                {entry.overall_score}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
