'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { adminAPI } from '@/lib/api';

export default function AdminCandidates() {
    const { user, isAuthenticated, loadAuth } = useStore();
    const router = useRouter();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAuth(); }, [loadAuth]);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (user?.role !== 'admin') { router.push('/dashboard'); return; }
        adminAPI.getCandidates().then(res => {
            setCandidates(res.data.candidates || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || loading) return <><Navbar /><div className="loading-screen"><div className="spinner" /></div></>;

    return (
        <>
            <Navbar />
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">👥 <span className="gradient-text">Candidates</span></h1>
                        <p className="page-subtitle">{candidates.length} registered candidates</p>
                    </div>
                </div>

                {candidates.length === 0 ? (
                    <div className="card text-center" style={{ padding: 60 }}>
                        <p>No candidates registered yet.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Email</th>
                                    <th>Skill Level</th>
                                    <th>Sessions</th>
                                    <th>Avg Score</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map(c => (
                                    <tr key={c.id} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: 'var(--accent-gradient)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: 13, color: 'white'
                                                }}>
                                                    {c.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{c.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                                        <td>
                                            <span className={`badge ${c.skill_level === 'advanced' ? 'badge-hard' : c.skill_level === 'intermediate' ? 'badge-medium' : 'badge-easy'}`}
                                                style={{ textTransform: 'capitalize' }}>
                                                {c.skill_level}
                                            </span>
                                        </td>
                                        <td>{c.total_sessions}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: 700,
                                                color: (c.avg_score || 0) >= 60 ? 'var(--success)' : 'var(--text-secondary)'
                                            }}>
                                                {Math.round(c.avg_score || 0)}%
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                            {new Date(c.created_at).toLocaleDateString()}
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
