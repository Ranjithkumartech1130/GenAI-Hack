import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    X, Brain, Sparkles, BookOpen, Code, Trophy, Clock,
    ChevronRight, ArrowLeft, Play, CheckCircle, AlertTriangle,
    BarChart3, User, History, Handshake, Mic, MicOff, Send, PhoneOff
} from 'lucide-react';
import { interviewAuthAPI, aptitudeAPI, codingAPI, sessionAPI, leaderboardAPI } from '../../services/interviewApi';
import VoiceAssistant from '../VoiceAssistant';
import '../../styles/mock-interview.css';

// ─── AUTO-AUTH HELPER ───
// Silently syncs the SkillGPS user to the interview backend
const autoAuthInterviewUser = async (parentUser) => {
    // Already have a valid token? Try to use it
    const savedToken = localStorage.getItem('interview_token');
    const savedUser = localStorage.getItem('interview_user');
    if (savedToken && savedUser) {
        try {
            const profile = await interviewAuthAPI.getProfile();
            if (profile.data?.user) return profile.data.user;
        } catch { /* token expired or invalid, re-sync below */ }
    }

    // Clear old tokens
    localStorage.removeItem('interview_token');
    localStorage.removeItem('interview_user');

    const email = parentUser.email || `${parentUser.username}@skillgps.local`;
    const password = `skillgps_${parentUser.username}_auto`;
    const name = parentUser.username || parentUser.name || 'SkillGPS User';

    // Use sync endpoint — creates user if new, or updates password if existing
    try {
        const res = await interviewAuthAPI.sync({ email, password, name, skill_level: 'intermediate' });
        localStorage.setItem('interview_token', res.data.token);
        localStorage.setItem('interview_user', JSON.stringify(res.data.user));
        return res.data.user;
    } catch (err) {
        console.error('Interview auto-auth failed:', err);
        // Return a fallback user so the UI loads (limited functionality)
        return { id: 0, name, email, skill_level: 'intermediate' };
    }
};

// ─── DASHBOARD SUB-COMPONENT ───
const InterviewDashboard = ({ user, onNavigate }) => {
    const [sessions, setSessions] = useState([]);
    const [rank, setRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            sessionAPI.getAll().catch(() => ({ data: { sessions: [] } })),
            leaderboardAPI.getMyRank().catch(() => ({ data: {} }))
        ]).then(([s, r]) => {
            setSessions(s.data.sessions || []);
            setRank(r.data);
            setLoading(false);
        });
    }, []);

    const completed = sessions.filter(s => s.status === 'completed');
    const aptitude = completed.filter(s => s.session_type === 'aptitude');
    const coding = completed.filter(s => s.session_type === 'coding');
    const avg = completed.length > 0 ? Math.round(completed.reduce((a, c) => a + (c.percentage || 0), 0) / completed.length) : 0;

    if (loading) return <div className="mi-loading-screen"><div className="mi-spinner" /><span>Loading dashboard...</span></div>;

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0' }}>Welcome, <span className="mi-gradient-text">{user?.name}</span></h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>Ready for your next challenge?</p>
            </div>
            <div className="mi-stats-grid">
                <div className="mi-stat"><span className="mi-stat-label">Sessions</span><span className="mi-stat-value">{completed.length}</span></div>
                <div className="mi-stat"><span className="mi-stat-label">Avg Score</span><span className="mi-stat-value">{avg}%</span></div>
                <div className="mi-stat"><span className="mi-stat-label">Aptitude</span><span className="mi-stat-value">{aptitude.length}</span></div>
                <div className="mi-stat"><span className="mi-stat-label">Coding</span><span className="mi-stat-value">{coding.length}</span></div>
                <div className="mi-stat"><span className="mi-stat-label">Rank</span><span className="mi-stat-value">#{rank?.rank || '—'}</span></div>
            </div>
            <h3 className="mi-section-title">🚀 Quick Actions</h3>
            <div className="mi-grid-3" style={{ marginBottom: 28 }}>
                {[
                    { icon: '🧠', title: 'Aptitude Round', desc: 'Quant, logical & verbal skills', badge: '15 Questions', action: 'aptitude' },
                    { icon: '💻', title: 'Coding Round', desc: 'Solve algorithmic problems', badge: 'Multiple Languages', action: 'coding' },
                    { icon: '🤝', title: 'HR Round', desc: 'Behavioral & general interview', badge: 'Voice & Text', action: 'hr-round' },
                    { icon: '🏆', title: 'Leaderboard', desc: 'See your global ranking', badge: 'Real-time', action: 'leaderboard' },
                ].map((item, i) => (
                    <div key={i} className="mi-card mi-card-glow" onClick={() => onNavigate(item.action)}>
                        <div style={{ fontSize: 32, marginBottom: 10 }}>{item.icon}</div>
                        <h4 style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 4, fontSize: '0.95rem' }}>{item.title}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 10 }}>{item.desc}</p>
                        <span className="mi-badge mi-badge-primary">{item.badge}</span>
                    </div>
                ))}
            </div>
            {completed.length > 0 && (
                <>
                    <h3 className="mi-section-title">📋 Recent Sessions</h3>
                    <div className="mi-table-wrap">
                        <table className="mi-table">
                            <thead><tr><th>Type</th><th>Score</th><th>Status</th><th>Date</th></tr></thead>
                            <tbody>
                                {sessions.slice(0, 5).map(s => (
                                    <tr key={s.id}>
                                        <td><span className="mi-badge mi-badge-primary" style={{ textTransform: 'capitalize' }}>{s.session_type}</span></td>
                                        <td style={{ fontWeight: 700, color: s.percentage >= 60 ? '#10b981' : '#ef4444' }}>{s.percentage || 0}%</td>
                                        <td><span className={`mi-badge ${s.status === 'completed' ? 'mi-badge-easy' : 'mi-badge-medium'}`}>{s.status}</span></td>
                                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

// ─── APTITUDE SUB-COMPONENT ───
const AptitudeRound = ({ user, onNavigate }) => {
    const [phase, setPhase] = useState('setup');
    const [skillLevel, setSkillLevel] = useState(user?.skill_level || 'intermediate');
    const [sessionId, setSessionId] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timer, setTimer] = useState(60);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tabSwitches, setTabSwitches] = useState(0);
    const timerRef = useRef(null);
    const startTimeRef = useRef(Date.now());

    useEffect(() => {
        if (phase !== 'exam') return;
        const handle = () => { if (document.hidden && sessionId) { setTabSwitches(p => p + 1); aptitudeAPI.trackTabSwitch(sessionId).catch(() => { }); } };
        document.addEventListener('visibilitychange', handle);
        return () => document.removeEventListener('visibilitychange', handle);
    }, [phase, sessionId]);

    useEffect(() => {
        if (phase !== 'exam') return;
        timerRef.current = setInterval(() => {
            setTimer(p => { if (p <= 1) { handleNext(true); return 60; } return p - 1; });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase, currentIndex]);

    const startExam = async () => {
        setLoading(true);
        try {
            const res = await aptitudeAPI.start(skillLevel);
            setSessionId(res.data.session_id);
            setQuestions(res.data.questions);
            setPhase('exam'); setTimer(60); startTimeRef.current = Date.now();
        } catch { alert('Failed to start exam'); }
        finally { setLoading(false); }
    };

    const handleNext = useCallback(async (timeout = false) => {
        const q = questions[currentIndex];
        if (!q) return;
        const answer = timeout ? null : (selectedAnswer || answers[q.id]);
        const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (answer) {
            try { await aptitudeAPI.submitAnswer({ session_id: sessionId, question_id: q.id, selected_answer: answer, time_taken: timeTaken }); setAnswers(p => ({ ...p, [q.id]: answer })); } catch { }
        }
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(p => p + 1); setSelectedAnswer(null); setTimer(60); startTimeRef.current = Date.now();
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setLoading(true);
            try { const res = await aptitudeAPI.complete(sessionId); setResults(res.data); setPhase('completed'); } catch { alert('Failed to complete'); }
            finally { setLoading(false); }
        }
    }, [currentIndex, questions, selectedAnswer, sessionId, answers]);

    const q = questions[currentIndex];
    const timerClass = timer <= 10 ? 'danger' : timer <= 20 ? 'warning' : '';

    if (phase === 'setup') return (
        <div style={{ maxWidth: 580, margin: '40px auto', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🧠</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 10 }}>Aptitude Assessment</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 32 }}>Test your quantitative, logical, and verbal skills. Questions adapt to your level.</p>
            <div className="mi-card" style={{ textAlign: 'left', marginBottom: 20 }}>
                <label className="mi-form-label">Skill Level</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[{ v: 'beginner', l: '🌱 Beginner', d: '70% Easy, 30% Medium' }, { v: 'intermediate', l: '⚡ Intermediate', d: '40% Easy, 40% Medium, 20% Hard' }, { v: 'advanced', l: '🔥 Advanced', d: '30% Medium, 70% Hard' }].map(o => (
                        <div key={o.v} className={`mi-option ${skillLevel === o.v ? 'selected' : ''}`} onClick={() => setSkillLevel(o.v)}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{o.l}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{o.d}</span>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.15)', fontSize: '0.78rem', color: '#94a3b8' }}>
                    📋 <strong>15 questions</strong> • 60s per question • Quant, Logical, Verbal
                </div>
            </div>
            <button className="mi-btn mi-btn-primary mi-btn-lg mi-btn-full" onClick={startExam} disabled={loading}>{loading ? 'Starting...' : 'Start Assessment →'}</button>
        </div>
    );

    if (phase === 'exam' && q) return (
        <div>
            {tabSwitches > 0 && <div className="mi-cheating-banner">⚠️ Tab switch detected ({tabSwitches} times). This will be recorded.</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 6 }}>Question {currentIndex + 1} of {questions.length}</div>
                    <div className="mi-progress" style={{ width: 280 }}><div className="mi-progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span className={`mi-badge mi-badge-${q.difficulty}`}>{q.difficulty}</span>
                    <span className="mi-badge mi-badge-primary">{q.topic}</span>
                </div>
                <div className={`mi-timer ${timerClass}`}>{timer}</div>
            </div>
            <div className="mi-card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.7, marginBottom: 20 }}>{q.question_text}</h3>
                {q.options.map((opt, i) => (
                    <div key={i} className={`mi-option ${selectedAnswer === opt ? 'selected' : ''}`} onClick={() => setSelectedAnswer(opt)}>
                        <span className="mi-option-letter">{String.fromCharCode(65 + i)}</span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>{opt}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#555' }}>{Object.keys(answers).length} answered</span>
                <button className={`mi-btn ${currentIndex === questions.length - 1 ? 'mi-btn-success' : 'mi-btn-primary'}`} onClick={() => handleNext(false)} disabled={loading}>
                    {currentIndex === questions.length - 1 ? (loading ? 'Submitting...' : '✓ Finish Exam') : 'Next →'}
                </button>
            </div>
        </div>
    );

    if (phase === 'completed' && results) return (
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{results.percentage >= 60 ? '🎉' : '💪'}</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>Assessment Complete!</h2>
            <div className={`mi-score-hero ${results.percentage >= 60 ? 'mi-score-pass' : 'mi-score-fail'}`}>{results.percentage}%</div>
            <p style={{ color: '#64748b', margin: '10px 0 28px' }}>{results.score} / {results.total_questions} correct</p>
            {results.performance_analysis && (
                <div className="mi-grid-3" style={{ marginBottom: 24, textAlign: 'center' }}>
                    {Object.entries(results.performance_analysis.topic_analysis || {}).map(([topic, data]) => (
                        <div key={topic} className="mi-card">
                            <span className="mi-stat-label">{topic}</span>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 6, color: data.percentage >= 60 ? '#10b981' : '#ef4444' }}>{data.percentage}%</div>
                            <div style={{ fontSize: '0.75rem', color: '#555' }}>{data.correct}/{data.total}</div>
                            <div className="mi-progress" style={{ marginTop: 8 }}><div className="mi-progress-fill" style={{ width: `${data.percentage}%`, background: data.percentage >= 60 ? '#10b981' : '#ef4444' }} /></div>
                        </div>
                    ))}
                </div>
            )}
            {results.ai_feedback && <div className="mi-card" style={{ textAlign: 'left', marginBottom: 20 }}><h4 className="mi-section-title">🤖 AI Analysis</h4><div style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.8 }}>{results.ai_feedback}</div></div>}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                <button className="mi-btn mi-btn-primary" onClick={() => onNavigate('coding')}>Continue to Coding →</button>
                <button className="mi-btn mi-btn-secondary" onClick={() => onNavigate('dashboard')}>Back to Dashboard</button>
            </div>
        </div>
    );

    return null;
};

// ─── LEADERBOARD SUB-COMPONENT ───
const LeaderboardView = () => {
    const [lb, setLb] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            leaderboardAPI.getAll(50).catch(() => ({ data: { leaderboard: [] } })),
            leaderboardAPI.getMyRank().catch(() => ({ data: {} }))
        ]).then(([l, r]) => { setLb(l.data.leaderboard || []); setMyRank(r.data); setLoading(false); });
    }, []);

    const medal = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;

    if (loading) return <div className="mi-loading-screen"><div className="mi-spinner" /><span>Loading leaderboard...</span></div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div><h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>🏆 <span className="mi-gradient-text">Leaderboard</span></h2><p style={{ color: '#64748b', fontSize: '0.8rem' }}>Top performers ranked by overall score</p></div>
                {myRank?.rank && <div className="mi-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Your Rank</span><span className="mi-gradient-text" style={{ fontSize: '1.5rem', fontWeight: 900 }}>#{myRank.rank}</span></div>}
            </div>
            {lb.length === 0 ? <div className="mi-card" style={{ textAlign: 'center', padding: 50 }}><div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div><p style={{ color: '#64748b' }}>No rankings yet. Complete assessments to appear!</p></div> : (
                <div className="mi-table-wrap"><table className="mi-table"><thead><tr><th>Rank</th><th>Candidate</th><th>Sessions</th><th>Aptitude</th><th>Coding</th><th>Overall</th></tr></thead><tbody>
                    {lb.map(e => (<tr key={e.rank} style={{ background: e.rank <= 3 ? 'rgba(108,92,231,0.04)' : undefined }}>
                        <td style={{ fontSize: e.rank <= 3 ? '1.3rem' : '0.9rem', fontWeight: 800 }}>{medal(e.rank)}</td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: '50%', background: e.rank <= 3 ? 'linear-gradient(135deg,#6c5ce7,#a29bfe)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'white' }}>{e.user_name?.charAt(0)?.toUpperCase()}</div><span style={{ fontWeight: 600 }}>{e.user_name}</span></div></td>
                        <td>{e.total_sessions}</td>
                        <td style={{ color: e.avg_aptitude_score >= 60 ? '#10b981' : '#94a3b8' }}>{e.avg_aptitude_score}%</td>
                        <td style={{ color: e.avg_coding_score >= 60 ? '#10b981' : '#94a3b8' }}>{e.avg_coding_score}%</td>
                        <td style={{ fontSize: '1rem', fontWeight: 800, color: e.overall_score >= 80 ? '#10b981' : e.overall_score >= 50 ? '#f59e0b' : '#ef4444' }}>{e.overall_score}%</td>
                    </tr>))}
                </tbody></table></div>
            )}
        </div>
    );
};

// ─── HISTORY SUB-COMPONENT ───
const HistoryView = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        sessionAPI.getAll().then(r => { setSessions(r.data.sessions || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? sessions : sessions.filter(s => s.session_type === filter);

    if (loading) return <div className="mi-loading-screen"><div className="mi-spinner" /><span>Loading history...</span></div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e2e8f0' }}>📋 Session History</h2>
                <div style={{ display: 'flex', gap: 4 }}>
                    {['all', 'aptitude', 'coding'].map(f => (
                        <button key={f} className={`mi-nav-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
                    ))}
                </div>
            </div>
            {filtered.length === 0 ? <div className="mi-card" style={{ textAlign: 'center', padding: 50 }}><div style={{ fontSize: 40, marginBottom: 12 }}>📝</div><p style={{ color: '#64748b' }}>No sessions yet. Start an assessment!</p></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(s => (
                        <div key={s.id} className="mi-card mi-card-glow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <span style={{ fontSize: 26 }}>{s.session_type === 'aptitude' ? '🧠' : '💻'}</span>
                                <div>
                                    <div style={{ fontWeight: 700, textTransform: 'capitalize', marginBottom: 4, fontSize: '0.9rem' }}>{s.session_type} Assessment</div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <span className={`mi-badge ${s.status === 'completed' ? 'mi-badge-easy' : 'mi-badge-medium'}`}>{s.status}</span>
                                        {s.tab_switches > 0 && <span className="mi-badge mi-badge-hard">⚠ {s.tab_switches} tab switches</span>}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: (s.percentage || 0) >= 60 ? '#10b981' : '#ef4444' }}>{s.percentage || 0}%</span>
                                <div style={{ fontSize: '0.7rem', color: '#555' }}>{new Date(s.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── CODING ROUND (simplified - uses CodeMirror from parent) ───
const CodingRound = ({ user, onNavigate }) => {
    const [phase, setPhase] = useState('setup');
    const [language, setLanguage] = useState(user?.preferred_language || 'python');
    const [difficulty, setDifficulty] = useState('auto');
    const [sessionId, setSessionId] = useState('');
    const [problems, setProblems] = useState([]);
    const [currentProblem, setCurrentProblem] = useState(0);
    const [code, setCode] = useState('');
    const [codes, setCodes] = useState({});
    const [testResults, setTestResults] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [finalResults, setFinalResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [running, setRunning] = useState(false);

    const startCoding = async () => {
        setLoading(true);
        try {
            const res = await codingAPI.start({ preferred_language: language, difficulty_preference: difficulty === 'auto' ? undefined : difficulty });
            setSessionId(res.data.session_id); setProblems(res.data.problems);
            if (res.data.problems.length > 0) {
                setCode(res.data.problems[0].starter_code || '');
                const init = {}; res.data.problems.forEach(p => { init[p.id] = p.starter_code || ''; }); setCodes(init);
            }
            setPhase('coding');
        } catch (err) { alert(err.response?.data?.error || 'Failed to start'); }
        finally { setLoading(false); }
    };

    const switchProblem = (idx) => {
        if (problems[currentProblem]) setCodes(p => ({ ...p, [problems[currentProblem].id]: code }));
        setCurrentProblem(idx); setCode(codes[problems[idx].id] || problems[idx].starter_code || ''); setTestResults(null); setSubmissionResult(null);
    };

    const runTests = async () => {
        setRunning(true); setTestResults(null);
        try { const res = await codingAPI.runTests({ problem_id: problems[currentProblem].id, language, code }); setTestResults(res.data); }
        catch { alert('Failed to run tests'); } finally { setRunning(false); }
    };

    const submitCode = async () => {
        setLoading(true);
        try { const res = await codingAPI.submit({ session_id: sessionId, problem_id: problems[currentProblem].id, language, code }); setSubmissionResult(res.data); }
        catch { alert('Failed to submit'); } finally { setLoading(false); }
    };

    const finishCoding = async () => {
        setLoading(true);
        try { const res = await codingAPI.complete(sessionId); setFinalResults(res.data); setPhase('completed'); }
        catch { alert('Failed to complete'); } finally { setLoading(false); }
    };

    const problem = problems[currentProblem];

    if (phase === 'setup') return (
        <div style={{ maxWidth: 580, margin: '40px auto', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💻</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 10 }}>Coding Assessment</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 32 }}>Solve algorithmic problems. Code is evaluated for correctness, complexity & quality.</p>
            <div className="mi-card" style={{ textAlign: 'left', marginBottom: 20 }}>
                <div className="mi-form-group">
                    <label className="mi-form-label">Language</label>
                    <select className="mi-select" value={language} onChange={e => setLanguage(e.target.value)}>
                        <option value="python">Python</option><option value="javascript">JavaScript</option><option value="java">Java</option><option value="cpp">C++</option>
                    </select>
                </div>
                <div className="mi-form-group">
                    <label className="mi-form-label">Difficulty</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {[{ v: 'auto', l: '🤖 Auto' }, { v: 'intermediate', l: '⚡ Standard' }, { v: 'advanced', l: '🔥 Challenge' }].map(o => (
                            <div key={o.v} className={`mi-option ${difficulty === o.v ? 'selected' : ''}`} onClick={() => setDifficulty(o.v)} style={{ flex: 1, justifyContent: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{o.l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <button className="mi-btn mi-btn-primary mi-btn-lg mi-btn-full" onClick={startCoding} disabled={loading}>{loading ? 'Loading...' : 'Start Coding →'}</button>
        </div>
    );

    if (phase === 'coding' && problem) {
        const lineCount = code.split('\n').length;
        const langIcons = { python: '🐍', javascript: '⚡', java: '☕', cpp: '⚙️' };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', gap: 0 }}>
                {/* ── Top Bar: Problem tabs + Finish button ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 2px' }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                        {problems.map((p, i) => (
                            <button key={p.id} onClick={() => switchProblem(i)}
                                style={{
                                    padding: '7px 14px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
                                    fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
                                    background: currentProblem === i ? '#1e1e2e' : 'rgba(255,255,255,0.04)',
                                    color: currentProblem === i ? '#e2e8f0' : '#64748b',
                                    borderBottom: currentProblem === i ? '2px solid #a29bfe' : '2px solid transparent',
                                }}>
                                <span style={{
                                    marginRight: 5, fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4,
                                    background: p.difficulty === 'easy' ? 'rgba(16,185,129,0.15)' : p.difficulty === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                                    color: p.difficulty === 'easy' ? '#10b981' : p.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                                }}>{p.difficulty}</span>
                                {p.title}
                            </button>
                        ))}
                    </div>
                    <button onClick={finishCoding} disabled={loading}
                        style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', boxShadow: '0 2px 10px rgba(16,185,129,0.3)', transition: 'all 0.2s' }}>
                        {loading ? '⏳ Finishing...' : '✓ Finish All'}
                    </button>
                </div>

                {/* ── Main Split: Problem Description | Code Editor ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 10, flex: 1, minHeight: 0 }}>

                    {/* ── LEFT: Problem Description (macOS window) ── */}
                    <div style={{ borderRadius: 12, overflow: 'hidden', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        {/* macOS title bar */}
                        <div style={{ padding: '10px 14px', background: 'linear-gradient(180deg, #2a2a3e, #252536)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.2)' }} />
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.2)' }} />
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.2)' }} />
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, flex: 1, textAlign: 'center' }}>📋 Problem Description</span>
                        </div>
                        {/* Problem content */}
                        <div style={{ padding: '18px 16px', overflow: 'auto', flex: 1 }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                                <span style={{
                                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: 5, fontWeight: 600,
                                    background: problem.difficulty === 'easy' ? 'rgba(16,185,129,0.12)' : problem.difficulty === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                                    color: problem.difficulty === 'easy' ? '#10b981' : problem.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                                    border: `1px solid ${problem.difficulty === 'easy' ? 'rgba(16,185,129,0.2)' : problem.difficulty === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                }}>{problem.difficulty}</span>
                                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 5, fontWeight: 600, background: 'rgba(162,155,254,0.1)', color: '#a29bfe', border: '1px solid rgba(162,155,254,0.15)' }}>{problem.topic}</span>
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 14, letterSpacing: '-0.01em' }}>{problem.title}</h3>
                            <div style={{ fontSize: '0.82rem', lineHeight: 1.85, color: '#94a3b8', whiteSpace: 'pre-wrap' }}>{problem.problem_statement}</div>

                            <div style={{ marginTop: 20 }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>Example Input</div>
                                <pre style={{ background: '#0d1117', borderRadius: 8, padding: '10px 14px', color: '#10b981', fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.78rem', lineHeight: 1.6, border: '1px solid rgba(16,185,129,0.1)', margin: 0 }}>{problem.sample_input}</pre>
                            </div>
                            <div style={{ marginTop: 14 }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>Expected Output</div>
                                <pre style={{ background: '#0d1117', borderRadius: 8, padding: '10px 14px', color: '#a29bfe', fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.78rem', lineHeight: 1.6, border: '1px solid rgba(162,155,254,0.1)', margin: 0 }}>{problem.sample_output}</pre>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Code Editor + Output (macOS window) ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
                        {/* Code Editor Window */}
                        <div style={{ borderRadius: 12, overflow: 'hidden', background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                            {/* macOS title bar with controls */}
                            <div style={{ padding: '8px 14px', background: 'linear-gradient(180deg, #1c1c2e, #161625)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.2)' }} />
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.2)' }} />
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.2)' }} />
                                    </div>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{langIcons[language] || '📄'} {problem.title}.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'java' ? 'java' : 'cpp'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <select value={language} onChange={e => setLanguage(e.target.value)}
                                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: '#1e1e2e', color: '#a29bfe', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                                        <option value="python">🐍 Python</option>
                                        <option value="javascript">⚡ JavaScript</option>
                                        <option value="java">☕ Java</option>
                                        <option value="cpp">⚙️ C++</option>
                                    </select>
                                    <button onClick={runTests} disabled={running}
                                        style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: running ? 'wait' : 'pointer', fontSize: '0.72rem', fontWeight: 700, background: running ? '#334155' : 'rgba(16,185,129,0.15)', color: running ? '#64748b' : '#10b981', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {running ? '⏳ Running...' : '▶ Run'}
                                    </button>
                                    <button onClick={submitCode} disabled={loading}
                                        style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '0.72rem', fontWeight: 700, background: loading ? '#334155' : 'linear-gradient(135deg, #6c5ce7, #a29bfe)', color: 'white', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 2px 8px rgba(108,92,231,0.3)' }}>
                                        {loading ? 'Submitting...' : '📤 Submit'}
                                    </button>
                                </div>
                            </div>
                            {/* Editor area with line numbers */}
                            <div style={{ flex: 1, display: 'flex', overflow: 'auto', minHeight: 0 }}>
                                {/* Line numbers */}
                                <div style={{ padding: '14px 0', background: '#0a0e14', borderRight: '1px solid rgba(255,255,255,0.04)', userSelect: 'none', flexShrink: 0, minWidth: 48, textAlign: 'right' }}>
                                    {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
                                        <div key={i} style={{ padding: '0 10px', fontFamily: "'SF Mono', 'JetBrains Mono', monospace", fontSize: '0.78rem', lineHeight: '1.6', color: i < lineCount ? '#475569' : '#1e293b', height: '1.248em' }}>{i + 1}</div>
                                    ))}
                                </div>
                                {/* Code textarea */}
                                <textarea
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    spellCheck={false}
                                    style={{
                                        flex: 1, padding: '14px 16px', background: 'transparent', color: '#e2e8f0',
                                        border: 'none', outline: 'none', resize: 'none',
                                        fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
                                        fontSize: '0.78rem', lineHeight: '1.6', tabSize: 4,
                                        caretColor: '#a29bfe', minHeight: '100%',
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Tab') {
                                            e.preventDefault();
                                            const start = e.target.selectionStart;
                                            const end = e.target.selectionEnd;
                                            setCode(code.substring(0, start) + '    ' + code.substring(end));
                                            setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 4; }, 0);
                                        }
                                    }}
                                />
                            </div>
                            {/* Status bar */}
                            <div style={{ padding: '4px 14px', background: '#1e1e2e', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.65rem', color: '#475569' }}>Lines: {lineCount} • Chars: {code.length}</span>
                                <span style={{ fontSize: '0.65rem', color: '#475569' }}>UTF-8 • {language.charAt(0).toUpperCase() + language.slice(1)} • Spaces: 4</span>
                            </div>
                        </div>

                        {/* Output / Terminal Panel (macOS terminal style) */}
                        {(testResults || submissionResult) && (
                            <div style={{ borderRadius: 12, overflow: 'hidden', background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', maxHeight: 220, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                                {/* Terminal title bar */}
                                <div style={{ padding: '7px 14px', background: 'linear-gradient(180deg, #1c1c2e, #161625)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                                    </div>
                                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
                                        {submissionResult ? '📊 Submission Result' : '🧪 Test Output'} — Terminal
                                    </span>
                                </div>
                                <div style={{ padding: '12px 16px', overflow: 'auto', maxHeight: 170 }}>
                                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: submissionResult?.ai_feedback ? 12 : 0 }}>
                                        <div>
                                            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>Tests Passed</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', fontFamily: "'SF Mono', monospace" }}>
                                                {(submissionResult || testResults).passed_tests}/{(submissionResult || testResults).total_tests}
                                            </div>
                                        </div>
                                        {submissionResult && <>
                                            <div>
                                                <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>Score</div>
                                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a29bfe', fontFamily: "'SF Mono', monospace" }}>{submissionResult.score}/100</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>Complexity</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', fontFamily: "'SF Mono', monospace" }}>{submissionResult.time_complexity}</div>
                                            </div>
                                        </>}
                                    </div>
                                    {submissionResult?.ai_feedback && (
                                        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(162,155,254,0.05)', border: '1px solid rgba(162,155,254,0.08)', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'pre-wrap', lineHeight: 1.7, fontFamily: "'SF Mono', monospace" }}>
                                            <span style={{ color: '#10b981' }}>$</span> ai-feedback<br />{submissionResult.ai_feedback}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'completed' && finalResults) return (
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{finalResults.percentage >= 60 ? '🏆' : '💻'}</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0' }}>Coding Round Complete!</h2>
            <div className={`mi-score-hero ${finalResults.percentage >= 60 ? 'mi-score-pass' : 'mi-score-fail'}`}>{finalResults.percentage}%</div>
            <p style={{ color: '#64748b', margin: '10px 0 28px' }}>{finalResults.total_score} / {finalResults.max_score} points</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
                <button className="mi-btn mi-btn-primary" onClick={() => onNavigate('hr-round')}>🤝 Proceed to HR Round</button>
                <button className="mi-btn mi-btn-secondary" onClick={() => onNavigate('leaderboard')}>View Leaderboard</button>
                <button className="mi-btn mi-btn-secondary" onClick={() => onNavigate('dashboard')}>Back to Dashboard</button>
            </div>
        </div>
    );
    return null;
};

// ═══════════════════════════════════════════════════
// ─── HR ROUND SUB-COMPONENT ───
// ═══════════════════════════════════════════════════
const HR_QUESTIONS = [
    { category: 'Behavioral', question: 'Tell me about yourself and your background.' },
    { category: 'Behavioral', question: 'What are your biggest strengths and weaknesses?' },
    { category: 'Behavioral', question: 'Why do you want to work at our company?' },
    { category: 'Behavioral', question: 'Describe a time you had to work with a difficult team member. How did you handle it?' },
    { category: 'Behavioral', question: 'Tell me about a challenging project you worked on and how you overcame obstacles.' },
    { category: 'Behavioral', question: 'Where do you see yourself in five years?' },
    { category: 'Behavioral', question: 'How do you prioritize your work when you have multiple deadlines?' },
    { category: 'Behavioral', question: 'Tell me about a mistake you made at work and what you learned from it.' },
    { category: 'Behavioral', question: 'Why should we hire you for this role?' },
    { category: 'Behavioral', question: 'Describe a situation where you showed leadership.' },
    { category: 'Behavioral', question: 'How do you handle pressure and tight deadlines?' },
    { category: 'Behavioral', question: 'What motivates you to do your best work?' },
    { category: 'Logical', question: 'Look at this series: 2, 6, 18, 54. What number should come next? Options are 108, 162, 148, 128.' },
    { category: 'Logical', question: 'Look at this series: 97, 89, 81, 73. What number should come next? Options are 61, 65, 67, 80.' },
    { category: 'Logical', question: 'Look at this series: 3, 9, 27, 81. What number should come next? Options are 243, 233, 259, 251.' },
    { category: 'Logical', question: 'Look at this series: 1, 4, 9, 16. What comes next? Options are 17, 28, 42, 25.' },
    { category: 'Logical', question: 'Look at this series: 200, 100, 50, 25. What number should come next? Options are 30, 7, 12.5, 20.' },
    { category: 'Aptitude', question: 'What is 25 percent of 200? Options: 40, 50, 60, or 45.' },
    { category: 'Aptitude', question: 'If a minus b equals 3 and a squared plus b squared equals 29, find the value of ab. Options are 10, 12, 15, 18.' },
    { category: 'Aptitude', question: 'A goods train runs at the speed of 72 km per hour and crosses a 250 m long platform in 26 seconds. What is the length of the train? Options: 230m, 240m, 260m, 270m.' },
    { category: 'Aptitude', question: 'The average weight of 8 persons increases by 2.5 kg when a new person replaces one weighing 65 kg. What is the weight of the new person? Options: 76 kg, 76.5 kg, 85 kg, or data inadequate.' },
    { category: 'Technical', question: 'Which data structure is best suited for implementing a recursive algorithm? Options are Stack, Queue, Array, or Linked List.' },
    { category: 'Technical', question: 'What is the time complexity of finding an element in a binary search tree? Options: O of n, O of n log n, O of log n, O of n squared.' },
    { category: 'Technical', question: 'Which sorting algorithm has the best average-case time complexity? Options: Merge Sort, Selection Sort, Insertion Sort, Bubble Sort.' },
    { category: 'Technical', question: 'What is the purpose of the final keyword in Java? Options: declare constant variable, prevent method overriding, prevent class inheritance, or all of the above.' },
];

function shuffleArr(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function pickHRQuestions(count) {
    const beh = shuffleArr(HR_QUESTIONS.filter(q => q.category === 'Behavioral')).slice(0, Math.max(2, count - 3));
    const log = shuffleArr(HR_QUESTIONS.filter(q => q.category === 'Logical')).slice(0, 1);
    const apt = shuffleArr(HR_QUESTIONS.filter(q => q.category === 'Aptitude')).slice(0, 1);
    const tech = shuffleArr(HR_QUESTIONS.filter(q => q.category === 'Technical')).slice(0, 1);
    return shuffleArr([...beh, ...log, ...apt, ...tech]).slice(0, count);
}

const HRRound = ({ user, onNavigate }) => {
    const [phase, setPhase] = useState('intro');
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [messages, setMessages] = useState([]);
    const [textInput, setTextInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [scores, setScores] = useState([]);
    const [questionCount, setQuestionCount] = useState(5);
    const recognitionRef = useRef(null);
    const synthesisRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        synthesisRef.current = window.speechSynthesis;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            const r = new SR(); r.continuous = false; r.interimResults = false; r.lang = 'en-US';
            r.onresult = (e) => { const t = e.results[0][0].transcript; handleAnswer(t); };
            r.onerror = () => setIsListening(false); r.onend = () => setIsListening(false);
            recognitionRef.current = r;
        }
        return () => { synthesisRef.current?.cancel(); try { recognitionRef.current?.stop(); } catch { } };
    }, []);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const speak = useCallback((text) => {
        if (!synthesisRef.current) return;
        synthesisRef.current.cancel();
        const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 1.0;
        u.onstart = () => setIsSpeaking(true); u.onend = () => setIsSpeaking(false);
        synthesisRef.current.speak(u);
    }, []);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || isListening || phase !== 'interview') return;
        synthesisRef.current?.cancel();
        try { recognitionRef.current.start(); setIsListening(true); } catch { }
    }, [isListening, phase]);

    const startInterview = () => {
        const picked = pickHRQuestions(questionCount);
        setQuestions(picked); setCurrentQ(0); setScores([]); setPhase('interview');
        const greeting = `Hello ${user?.name || 'there'}! Welcome to the HR round. I am your interviewer today. Let us get started. Here is your first question. ${picked[0].question}`;
        setMessages([{ role: 'ai', text: greeting }]); speak(greeting);
    };

    const handleAnswer = useCallback((text) => {
        if (!text.trim()) return;
        setIsListening(false); try { recognitionRef.current?.stop(); } catch { }
        setMessages(prev => [...prev, { role: 'user', text }]); setTextInput('');
        const words = text.trim().split(/\s+/).length;
        let score = 0;
        if (words >= 30) score = 80 + Math.min(20, words - 30);
        else if (words >= 15) score = 60 + Math.round((words - 15) / 15 * 20);
        else if (words >= 5) score = 30 + Math.round((words - 5) / 10 * 30);
        else score = 10 + words * 4;
        score = Math.min(100, Math.max(10, score));
        setScores(prev => [...prev, score]);
        setCurrentQ(prev => {
            const next = prev + 1;
            if (next >= questions.length) {
                const aiEnd = 'Thank you for your answers! That concludes our HR round. Let me prepare your feedback.';
                setMessages(m => [...m, { role: 'ai', text: aiEnd }]); speak(aiEnd);
                setTimeout(() => setPhase('finished'), 3000); return prev;
            }
            const acks = ['Thank you for your response.', 'That is a great answer.', 'Interesting perspective.', 'I appreciate your honesty.', 'Good. Let us move on.'];
            const ack = acks[Math.floor(Math.random() * acks.length)];
            const aiText = `${ack} Here is your next question. ${questions[next].question}`;
            setMessages(m => [...m, { role: 'ai', text: aiText }]); speak(aiText); return next;
        });
    }, [questions, speak]);

    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // INTRO
    if (phase === 'intro') return (
        <div style={{ maxWidth: 620, margin: '40px auto', textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 14 }}>🤝</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 10 }}>HR Interview Round</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: 32 }}>
                Experience a realistic HR interview with an AI HR Manager. Answer using <strong>voice</strong> or <strong>text</strong>.
                You'll be asked behavioral, logical reasoning, aptitude, and technical questions.
            </p>
            <div className="mi-card" style={{ textAlign: 'left', marginBottom: 24 }}>
                <label className="mi-form-label">Number of Questions</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    {[5, 7, 10].map(n => (
                        <div key={n} className={`mi-option ${questionCount === n ? 'selected' : ''}`}
                            onClick={() => setQuestionCount(n)} style={{ flex: 1, justifyContent: 'center', padding: '12px 10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{n} Questions</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                    {[
                        { icon: '🗣️', label: 'Behavioral', desc: 'Leadership, teamwork' },
                        { icon: '🧩', label: 'Logical', desc: 'Number series & patterns' },
                        { icon: '📐', label: 'Aptitude', desc: 'Math & problem solving' },
                        { icon: '💻', label: 'Technical', desc: 'CS fundamentals' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                            <span style={{ fontSize: 20 }}>{item.icon}</span>
                            <div><div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0' }}>{item.label}</div><div style={{ fontSize: '0.65rem', color: '#64748b' }}>{item.desc}</div></div>
                        </div>
                    ))}
                </div>
            </div>
            <button className="mi-btn mi-btn-primary mi-btn-lg mi-btn-full" onClick={startInterview}>🎤 Start HR Interview</button>
        </div>
    );

    // INTERVIEW
    if (phase === 'interview') return (
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6c5ce7,#a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative' }}>
                        🤝
                        {isSpeaking && <span style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid #a29bfe', animation: 'miTimerPulse 1s infinite', pointerEvents: 'none' }} />}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0' }}>AI HR Manager</div>
                        <div style={{ fontSize: '0.7rem', color: isSpeaking ? '#a29bfe' : '#10b981' }}>{isSpeaking ? '🔊 Speaking...' : '● Online'}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <span className="mi-badge mi-badge-primary">Q{currentQ + 1}/{questions.length}</span>
                    <span className="mi-badge mi-badge-info">{questions[currentQ]?.category}</span>
                </div>
            </div>

            {/* Video Call Simulation */}
            <div className="mi-grid-2" style={{ marginBottom: 16 }}>
                <div className="mi-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, background: 'linear-gradient(135deg, rgba(15,15,25,1) 0%, rgba(108,92,231,0.06) 100%)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#6c5ce7,#a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 10, boxShadow: isSpeaking ? '0 0 28px rgba(108,92,231,0.5)' : 'none', transition: 'box-shadow 0.3s' }}>🤝</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e2e8f0' }}>AI HR Manager</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 3 }}>{isSpeaking ? '🔊 Speaking...' : 'Listening to you'}</div>
                    {isSpeaking && <div style={{ position: 'absolute', bottom: 14, display: 'flex', gap: 3, alignItems: 'flex-end', height: 18 }}>{[10, 16, 7, 20, 12, 8, 15].map((h, i) => <div key={i} style={{ width: 3, borderRadius: 2, background: '#a29bfe', animation: `miTimerPulse ${0.4 + i * 0.1}s ease-in-out infinite alternate`, height: h }} />)}</div>}
                </div>
                <div className="mi-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, position: 'relative' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 10 }}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e2e8f0' }}>{user?.name || 'Candidate'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 3 }}>{isListening ? '🎤 Listening...' : 'You'}</div>
                    {isListening && <span style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'miTimerPulse 0.6s infinite' }} />}
                </div>
            </div>

            {/* Chat Transcript */}
            <div className="mi-card" style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 16, padding: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{ padding: '10px 14px', borderRadius: 14, maxWidth: '85%', alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end', background: msg.role === 'ai' ? 'rgba(255,255,255,0.04)' : 'rgba(108,92,231,0.12)', border: `1px solid ${msg.role === 'ai' ? 'rgba(255,255,255,0.08)' : 'rgba(108,92,231,0.3)'}`, animation: 'miFadeIn 0.3s ease' }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', marginBottom: 3, textTransform: 'uppercase' }}>{msg.role === 'ai' ? '🤝 HR Manager' : '👤 You'}</div>
                            <p style={{ fontSize: '0.82rem', lineHeight: 1.7, margin: 0, color: '#cbd5e1' }}>{msg.text}</p>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer(textInput)}
                    placeholder="Type your answer here..." className="mi-input" style={{ flex: 1, borderRadius: 999 }} />
                <button className="mi-btn mi-btn-primary" onClick={() => handleAnswer(textInput)} disabled={!textInput.trim() || isSpeaking}
                    style={{ borderRadius: 999, padding: '10px 20px' }}><Send size={14} /> Send</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                <button className={`mi-btn ${isListening ? 'mi-btn-danger' : 'mi-btn-secondary'}`}
                    onClick={() => isListening ? recognitionRef.current?.stop() : startListening()} disabled={isSpeaking}
                    style={{ borderRadius: 999, padding: '10px 20px' }}>
                    {isListening ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Speak</>}
                </button>
                <button className="mi-btn mi-btn-danger" style={{ borderRadius: 999, padding: '10px 20px' }}
                    onClick={() => { synthesisRef.current?.cancel(); try { recognitionRef.current?.stop(); } catch { } setPhase('finished'); }}>
                    <PhoneOff size={14} /> End Interview
                </button>
            </div>
        </div>
    );

    // RESULTS
    if (phase === 'finished') return (
        <div style={{ maxWidth: 680, margin: '30px auto', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 10 }}>{avgScore >= 80 ? '🏆' : avgScore >= 60 ? '👏' : avgScore >= 40 ? '💪' : '📝'}</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>HR Round Complete!</h2>
            <div className={`mi-score-hero ${avgScore >= 60 ? 'mi-score-pass' : 'mi-score-fail'}`}>{avgScore}%</div>
            <p style={{ color: '#64748b', margin: '8px 0 24px', fontSize: '0.85rem' }}>Overall Communication Score</p>

            <div style={{ textAlign: 'left', marginBottom: 20 }}>
                <h3 className="mi-section-title">📊 Question Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {questions.map((q, idx) => (
                        <div key={idx} className="mi-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                            <div style={{ flex: 1, marginRight: 14 }}>
                                <span className={`mi-badge mi-badge-${q.category === 'Behavioral' ? 'primary' : q.category === 'Logical' ? 'info' : q.category === 'Aptitude' ? 'medium' : 'easy'}`} style={{ marginBottom: 4, display: 'inline-block' }}>{q.category}</span>
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>{q.question.length > 80 ? q.question.slice(0, 80) + '...' : q.question}</div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: 44 }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: (scores[idx] || 0) >= 70 ? '#10b981' : (scores[idx] || 0) >= 40 ? '#f59e0b' : '#ef4444' }}>{scores[idx] || 0}</div>
                                <div style={{ fontSize: '0.6rem', color: '#555' }}>/ 100</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mi-card" style={{ textAlign: 'left', marginBottom: 20 }}>
                <h4 className="mi-section-title">🤖 AI Feedback</h4>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.8, color: '#94a3b8' }}>
                    {avgScore >= 80 && 'Outstanding performance! Your answers were detailed, well-structured, and demonstrated strong communication skills. You would leave a great impression on any HR team.'}
                    {avgScore >= 60 && avgScore < 80 && 'Good performance! You communicated clearly on most questions. To improve, try using the STAR method (Situation, Task, Action, Result) for behavioral questions and elaborate more on your thought process.'}
                    {avgScore >= 40 && avgScore < 60 && 'Decent effort. Your answers could use more detail and structure. Practice telling stories about your experiences using specific examples. For logical questions, talk through your reasoning out loud.'}
                    {avgScore < 40 && 'Your answers were quite brief. In an HR interview, it is important to elaborate on your experiences. Practice speaking about your projects, teamwork experiences, and problem-solving approaches in detail.'}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="mi-btn mi-btn-primary" onClick={() => { setPhase('intro'); setMessages([]); setScores([]); }}>🔄 Retake HR Round</button>
                <button className="mi-btn mi-btn-secondary" onClick={() => onNavigate('leaderboard')}>Leaderboard</button>
                <button className="mi-btn mi-btn-secondary" onClick={() => onNavigate('dashboard')}>Dashboard</button>
            </div>
        </div>
    );
    return null;
};

// ═══════════════════════════════════════════════════
// ─── MAIN MOCK INTERVIEW COMPONENT ───
// ═══════════════════════════════════════════════════
const MockInterview = ({ isOpen, onClose, user: parentUser }) => {
    const [interviewUser, setInterviewUser] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [authLoading, setAuthLoading] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(() => {
        try { const s = JSON.parse(localStorage.getItem('skillgps_settings') || '{}'); return s.voiceAssistant !== false; } catch { return true; }
    });

    useEffect(() => {
        const handler = (e) => setVoiceEnabled(e.detail?.voiceAssistant !== false);
        window.addEventListener('skillgps-settings-changed', handler);
        return () => window.removeEventListener('skillgps-settings-changed', handler);
    }, []);

    // Auto-authenticate using the parent SkillGPS user
    useEffect(() => {
        if (isOpen && parentUser && !interviewUser) {
            document.body.style.overflow = 'hidden';
            setAuthLoading(true);
            autoAuthInterviewUser(parentUser)
                .then(user => { setInterviewUser(user); setActiveView('dashboard'); })
                .finally(() => setAuthLoading(false));
        } else if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, parentUser]);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const navigate = (view) => setActiveView(view);

    if (!isOpen) return null;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={15} /> },
        { id: 'aptitude', label: 'Aptitude', icon: <BookOpen size={15} /> },
        { id: 'coding', label: 'Coding', icon: <Code size={15} /> },
        { id: 'hr-round', label: 'HR Round', icon: <Handshake size={15} /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={15} /> },
        { id: 'history', label: 'History', icon: <History size={15} /> },
    ];

    return (
        <div className="mi-overlay">
            {/* Header */}
            <div className="mi-header">
                <div className="mi-header-left">
                    <div className="mi-header-logo"><Brain size={22} color="white" /></div>
                    <div>
                        <div className="mi-header-title">AI Mock Interview <Sparkles size={14} style={{ color: '#a29bfe' }} /></div>
                        <div className="mi-header-subtitle">Adaptive Aptitude • Live Coding • AI Analytics</div>
                    </div>
                </div>
                <div className="mi-header-actions">
                    {interviewUser && <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginRight: 8 }}>👤 {interviewUser.name || parentUser?.username}</span>}
                    <button className="mi-header-btn close-btn" onClick={onClose}><X size={14} /></button>
                </div>
            </div>

            {/* Nav */}
            {interviewUser && (
                <div className="mi-nav">
                    {navItems.map(n => (
                        <button key={n.id} className={`mi-nav-btn ${activeView === n.id ? 'active' : ''}`} onClick={() => navigate(n.id)}>
                            {n.icon} {n.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            <div className="mi-content">
                {authLoading ? (
                    <div style={{ textAlign: 'center', marginTop: 100 }}>
                        <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 30px rgba(108,92,231,0.4)', animation: 'pulse 1.5s infinite' }}>
                            <Brain size={30} color="white" />
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Setting up your interview session...</p>
                    </div>
                ) : interviewUser ? (
                    <>
                        {activeView === 'dashboard' && <InterviewDashboard user={interviewUser} onNavigate={navigate} />}
                        {activeView === 'aptitude' && <AptitudeRound user={interviewUser} onNavigate={navigate} />}
                        {activeView === 'coding' && <CodingRound user={interviewUser} onNavigate={navigate} />}
                        {activeView === 'hr-round' && <HRRound user={interviewUser} onNavigate={navigate} />}
                        {activeView === 'leaderboard' && <LeaderboardView />}
                        {activeView === 'history' && <HistoryView />}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: 100 }}>
                        <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>Could not connect to interview service. Please try again.</p>
                        <button className="mi-btn mi-btn-primary" style={{ marginTop: 16 }} onClick={() => {
                            setAuthLoading(true);
                            autoAuthInterviewUser(parentUser)
                                .then(user => { setInterviewUser(user); setActiveView('dashboard'); })
                                .finally(() => setAuthLoading(false));
                        }}>Retry</button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mi-footer">
                <span>AI Interview Assessment Module • SkillGPS Integration</span>
                <span>Press <kbd>Esc</kbd> to close • Powered by InterviewAI</span>
            </div>

            {/* Voice Assistant inside overlay so it works above the z-index */}
            {voiceEnabled && <VoiceAssistant />}
        </div>
    );
};

export default MockInterview;
