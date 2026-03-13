'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { sessionAPI } from '@/lib/api';

export default function ResultsPage() {
    const { loadAuth, isAuthenticated } = useStore();
    const params = useParams();
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [details, setDetails] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAuth(); }, [loadAuth]);

    useEffect(() => {
        if (!isAuthenticated || !params.id) return;
        sessionAPI.getById(params.id as string).then(res => {
            setSession(res.data.session);
            setDetails(res.data);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, [isAuthenticated, params.id]);

    if (!isAuthenticated || loading) {
        return <><Navbar /><div className="loading-screen"><div className="spinner" /></div></>;
    }

    if (!session) {
        return (
            <>
                <Navbar />
                <div className="page-container text-center" style={{ paddingTop: 100 }}>
                    <h2>Session not found</h2>
                    <button className="btn btn-primary mt-4" onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
                </div>
            </>
        );
    }

    const analysis = session.performance_analysis;

    return (
        <>
            <Navbar />
            <div className="page-container" style={{ maxWidth: 900 }}>
                <button className="btn btn-secondary btn-sm mb-4" onClick={() => router.back()}>← Back</button>

                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <span style={{ fontSize: 48 }}>{session.session_type === 'aptitude' ? '🧠' : '💻'}</span>
                    <h1 style={{ fontSize: 28, fontWeight: 800, textTransform: 'capitalize', marginTop: 12 }}>
                        {session.session_type} Assessment Results
                    </h1>
                    <div className="stats-grid" style={{ marginTop: 24, maxWidth: 500, margin: '24px auto 0' }}>
                        <div className="stat-card">
                            <span className="stat-label">Score</span>
                            <span className="stat-value">{session.percentage || 0}%</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Points</span>
                            <span className="stat-value">{session.total_score}/{session.max_score}</span>
                        </div>
                        {session.tab_switches > 0 && (
                            <div className="stat-card" style={{ borderColor: 'var(--danger)' }}>
                                <span className="stat-label">Tab Switches</span>
                                <span className="stat-value" style={{ color: 'var(--danger)' }}>{session.tab_switches}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Topic analysis for aptitude */}
                {analysis?.topic_analysis && (
                    <div className="section">
                        <h3 className="section-title">📊 Topic Analysis</h3>
                        <div className="grid-3">
                            {Object.entries(analysis.topic_analysis).map(([topic, data]: [string, any]) => (
                                <div key={topic} className="card" style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>{topic}</div>
                                    <div style={{ fontSize: 36, fontWeight: 900, marginTop: 8, color: data.percentage >= 60 ? 'var(--success)' : 'var(--danger)' }}>
                                        {data.percentage}%
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{data.correct}/{data.total} correct</div>
                                    <div className="progress-bar mt-2">
                                        <div className="progress-fill" style={{ width: `${data.percentage}%`, background: data.percentage >= 60 ? 'var(--success)' : 'var(--danger)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Feedback */}
                {session.ai_feedback && (
                    <div className="card mb-6">
                        <h3 className="section-title">🤖 AI Analysis</h3>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                            {session.ai_feedback}
                        </div>
                    </div>
                )}

                {/* Suggestions */}
                {analysis?.suggestions && (
                    <div className="card mb-6">
                        <h3 className="section-title">💡 Suggestions</h3>
                        {analysis.suggestions.map((s: string, i: number) => (
                            <p key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.7 }}>{s}</p>
                        ))}
                    </div>
                )}

                {/* Detailed answers for aptitude */}
                {details.answers && details.answers.length > 0 && (
                    <div className="section">
                        <h3 className="section-title">📝 Question Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {details.answers.map((a: any, idx: number) => (
                                <div key={idx} className="card" style={{ borderLeftWidth: 4, borderLeftColor: a.is_correct ? 'var(--success)' : 'var(--danger)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700 }}>Q{idx + 1}</span>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <span className={`badge badge-${a.difficulty}`}>{a.difficulty}</span>
                                            <span className="badge badge-primary">{a.topic}</span>
                                        </div>
                                    </div>
                                    <p style={{ fontWeight: 600, marginBottom: 8 }}>{a.question_text}</p>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                        <span>Your answer: </span>
                                        <span style={{ color: a.is_correct ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                                            {a.selected_answer || 'Not answered'}
                                        </span>
                                        {!a.is_correct && (
                                            <span style={{ marginLeft: 12 }}>
                                                Correct: <span style={{ color: 'var(--success)', fontWeight: 700 }}>{a.correct_answer}</span>
                                            </span>
                                        )}
                                    </div>
                                    {a.explanation && (
                                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            💡 {a.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Coding submissions */}
                {details.submissions && details.submissions.length > 0 && (
                    <div className="section">
                        <h3 className="section-title">💻 Code Submissions</h3>
                        {details.submissions.map((sub: any, idx: number) => (
                            <div key={idx} className="card mb-4">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div>
                                        <h4 style={{ fontWeight: 700 }}>{sub.title}</h4>
                                        <span className={`badge badge-${sub.difficulty}`}>{sub.difficulty}</span>
                                    </div>
                                    <span style={{ fontSize: 24, fontWeight: 800, color: sub.score >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                                        {sub.score}/100
                                    </span>
                                </div>
                                {sub.ai_feedback && (
                                    <div style={{
                                        padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)',
                                        fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7
                                    }}>
                                        {sub.ai_feedback}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
