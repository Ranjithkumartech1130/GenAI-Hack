'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { codingAPI } from '@/lib/api';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANG_MAP: Record<string, string> = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp',
    c: 'c'
};

export default function CodingPage() {
    const { user, isAuthenticated, loadAuth } = useStore();
    const router = useRouter();
    const [phase, setPhase] = useState<'setup' | 'coding' | 'completed'>('setup');
    const [language, setLanguage] = useState('python');
    const [difficulty, setDifficulty] = useState('auto');
    const [sessionId, setSessionId] = useState('');
    const [problems, setProblems] = useState<any[]>([]);
    const [currentProblem, setCurrentProblem] = useState(0);
    const [code, setCode] = useState('');
    const [codes, setCodes] = useState<Record<string, string>>({});
    const [testResults, setTestResults] = useState<any>(null);
    const [submissionResult, setSubmissionResult] = useState<any>(null);
    const [finalResults, setFinalResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [running, setRunning] = useState(false);
    const [tabSwitches, setTabSwitches] = useState(0);

    useEffect(() => { loadAuth(); }, [loadAuth]);
    useEffect(() => {
        if (user) setLanguage(user.preferred_language || 'python');
    }, [user]);

    // Tab switch detection
    useEffect(() => {
        if (phase !== 'coding') return;
        const handleVisibility = () => {
            if (document.hidden) setTabSwitches(prev => prev + 1);
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [phase]);

    const startCoding = async () => {
        setLoading(true);
        try {
            const res = await codingAPI.start({
                preferred_language: language,
                difficulty_preference: difficulty === 'auto' ? undefined : difficulty,
            });
            setSessionId(res.data.session_id);
            setProblems(res.data.problems);
            if (res.data.problems.length > 0) {
                setCode(res.data.problems[0].starter_code || '');
                const initial: Record<string, string> = {};
                res.data.problems.forEach((p: any) => { initial[p.id] = p.starter_code || ''; });
                setCodes(initial);
            }
            setPhase('coding');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to start coding round');
        } finally {
            setLoading(false);
        }
    };

    const switchProblem = (idx: number) => {
        // Save current code
        if (problems[currentProblem]) {
            setCodes(prev => ({ ...prev, [problems[currentProblem].id]: code }));
        }
        setCurrentProblem(idx);
        setCode(codes[problems[idx].id] || problems[idx].starter_code || '');
        setTestResults(null);
        setSubmissionResult(null);
    };

    const runTests = async () => {
        setRunning(true);
        setTestResults(null);
        try {
            const res = await codingAPI.runTests({
                problem_id: problems[currentProblem].id,
                language,
                code,
            });
            setTestResults(res.data);
        } catch (err) {
            alert('Failed to run tests');
        } finally {
            setRunning(false);
        }
    };

    const submitCode = async () => {
        setLoading(true);
        try {
            const res = await codingAPI.submit({
                session_id: sessionId,
                problem_id: problems[currentProblem].id,
                language,
                code,
            });
            setSubmissionResult(res.data);
            setCodes(prev => ({ ...prev, [problems[currentProblem].id]: code }));
        } catch (err) {
            alert('Failed to submit code');
        } finally {
            setLoading(false);
        }
    };

    const finishCoding = async () => {
        // Submit current code first
        if (problems[currentProblem]) {
            setCodes(prev => ({ ...prev, [problems[currentProblem].id]: code }));
        }
        setLoading(true);
        try {
            const res = await codingAPI.complete(sessionId);
            setFinalResults(res.data);
            setPhase('completed');
        } catch (err) {
            alert('Failed to complete coding round');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return <div className="loading-screen"><div className="spinner" /></div>;
    }

    const problem = problems[currentProblem];

    return (
        <>
            <Navbar />
            <div className="page-container">
                {/* SETUP */}
                {phase === 'setup' && (
                    <div className="animate-fade" style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
                        <div style={{ fontSize: 64, marginBottom: 20 }}>💻</div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Coding Assessment</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
                            Solve algorithmic problems in your preferred language.
                            Your code will be evaluated for correctness, complexity, and quality.
                        </p>

                        <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
                            <div className="form-group">
                                <label className="form-label">Preferred Language</label>
                                <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                    <option value="python">Python</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="c">C</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Difficulty Preference</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {[
                                        { value: 'auto', label: 'Auto (based on aptitude score)', icon: '🤖' },
                                        { value: 'intermediate', label: 'Standard (Easy + Medium)', icon: '⚡' },
                                        { value: 'advanced', label: 'Challenge (Easy + Medium + Hard)', icon: '🔥' }
                                    ].map(opt => (
                                        <div key={opt.value}
                                            className={`option-item ${difficulty === opt.value ? 'selected' : ''}`}
                                            onClick={() => setDifficulty(opt.value)}
                                            style={{ cursor: 'pointer', flex: 1, flexDirection: 'column', alignItems: 'flex-start', padding: '12px 14px' }}>
                                            <span style={{ fontSize: 20 }}>{opt.icon}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button className="btn btn-primary btn-lg w-full" onClick={startCoding} disabled={loading}>
                            {loading ? 'Loading problems...' : 'Start Coding Round →'}
                        </button>
                    </div>
                )}

                {/* CODING PHASE */}
                {phase === 'coding' && problem && (
                    <div className="animate-fade">
                        {tabSwitches > 3 && (
                            <div className="cheating-banner">
                                ⚠️ Multiple tab switches detected ({tabSwitches}). This is being monitored.
                            </div>
                        )}

                        {/* Problem tabs */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                                {problems.map((p, idx) => (
                                    <button key={p.id} className={`tab ${currentProblem === idx ? 'active' : ''}`}
                                        onClick={() => switchProblem(idx)}>
                                        <span className={`badge badge-${p.difficulty}`} style={{ marginRight: 6 }}>{p.difficulty}</span>
                                        {p.title}
                                    </button>
                                ))}
                            </div>
                            <button className="btn btn-success" onClick={finishCoding} disabled={loading}>
                                {loading ? 'Finishing...' : '✓ Finish All'}
                            </button>
                        </div>

                        {/* Split view */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 'calc(100vh - 240px)' }}>
                            {/* Left - Problem */}
                            <div className="card" style={{ overflow: 'auto', maxHeight: 'calc(100vh - 240px)' }}>
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                        <span className={`badge badge-${problem.difficulty}`}>{problem.difficulty}</span>
                                        <span className="badge badge-info">{problem.topic}</span>
                                    </div>
                                    <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
                                        {problem.problem_number}. {problem.title}
                                    </h2>
                                </div>

                                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                    {problem.problem_statement}
                                </div>

                                <div style={{ marginTop: 20 }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Sample Input</h4>
                                    <pre className="font-mono" style={{
                                        padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)',
                                        fontSize: 13, color: 'var(--success)', overflow: 'auto'
                                    }}>{problem.sample_input}</pre>
                                </div>
                                <div style={{ marginTop: 16 }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Sample Output</h4>
                                    <pre className="font-mono" style={{
                                        padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)',
                                        fontSize: 13, color: 'var(--accent-secondary)', overflow: 'auto'
                                    }}>{problem.sample_output}</pre>
                                </div>
                                {problem.constraints && (
                                    <div style={{ marginTop: 16 }}>
                                        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Constraints</h4>
                                        <pre style={{
                                            padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)',
                                            fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'pre-wrap'
                                        }}>{problem.constraints}</pre>
                                    </div>
                                )}
                            </div>

                            {/* Right - Editor */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div className="editor-container" style={{ flex: 1 }}>
                                    <div className="editor-header">
                                        <select className="input" style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                                            value={language} onChange={(e) => setLanguage(e.target.value)}>
                                            <option value="python">Python</option>
                                            <option value="javascript">JavaScript</option>
                                            <option value="java">Java</option>
                                            <option value="cpp">C++</option>
                                        </select>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-sm btn-secondary" onClick={runTests} disabled={running}>
                                                {running ? '⏳ Running...' : '▶ Run Tests'}
                                            </button>
                                            <button className="btn btn-sm btn-primary" onClick={submitCode} disabled={loading}>
                                                {loading ? 'Submitting...' : '📤 Submit'}
                                            </button>
                                        </div>
                                    </div>
                                    <MonacoEditor
                                        height="400px"
                                        language={LANG_MAP[language] || 'python'}
                                        theme="vs-dark"
                                        value={code}
                                        onChange={(val) => setCode(val || '')}
                                        options={{
                                            fontSize: 14,
                                            fontFamily: "'JetBrains Mono', monospace",
                                            minimap: { enabled: false },
                                            padding: { top: 12 },
                                            lineNumbers: 'on',
                                            roundedSelection: true,
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                        }}
                                    />
                                </div>

                                {/* Test Results */}
                                {(testResults || submissionResult) && (
                                    <div className="card" style={{ maxHeight: 250, overflow: 'auto' }}>
                                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                                            {submissionResult ? '📊 Submission Result' : '🧪 Test Results'}
                                        </h4>
                                        {(submissionResult || testResults) && (
                                            <div>
                                                <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                                                    <div>
                                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tests Passed</span>
                                                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>
                                                            {(submissionResult || testResults).passed_tests}/{(submissionResult || testResults).total_tests}
                                                        </div>
                                                    </div>
                                                    {submissionResult && (
                                                        <>
                                                            <div>
                                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Score</span>
                                                                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-primary)' }}>
                                                                    {submissionResult.score}/100
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Time Complexity</span>
                                                                <div className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--warning)' }}>
                                                                    {submissionResult.time_complexity}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Code Quality</span>
                                                                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--info)' }}>
                                                                    {Math.round(submissionResult.code_quality_score * 100)}%
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {submissionResult?.ai_feedback && (
                                                    <div style={{
                                                        padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)',
                                                        fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7
                                                    }}>
                                                        {submissionResult.ai_feedback}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* COMPLETED */}
                {phase === 'completed' && finalResults && (
                    <div className="animate-fade" style={{ maxWidth: 800, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <div style={{ fontSize: 64, marginBottom: 16 }}>
                                {finalResults.percentage >= 80 ? '🏆' : finalResults.percentage >= 50 ? '👏' : '💻'}
                            </div>
                            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Coding Round Complete!</h1>
                            <div style={{
                                fontSize: 72, fontWeight: 900, marginTop: 20,
                                background: finalResults.percentage >= 60
                                    ? 'linear-gradient(135deg, #10b981, #34d399)'
                                    : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>
                                {finalResults.percentage}%
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
                                {finalResults.total_score} / {finalResults.max_score} points
                            </p>
                        </div>

                        {/* Problem breakdown */}
                        {finalResults.performance_analysis?.problems && (
                            <div className="section">
                                <h3 className="section-title">📊 Problem Breakdown</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {finalResults.performance_analysis.problems.map((p: any, idx: number) => (
                                        <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <span className={`badge badge-${p.difficulty}`}>{p.difficulty}</span>
                                                    <span className="badge badge-info">{p.topic}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Score</div>
                                                    <div style={{ fontSize: 20, fontWeight: 800, color: p.score >= 70 ? 'var(--success)' : 'var(--warning)' }}>{p.score}</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tests</div>
                                                    <div style={{ fontSize: 16, fontWeight: 700 }}>{p.passed_tests}/{p.total_tests}</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Complexity</div>
                                                    <div className="font-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--warning)' }}>{p.time_complexity}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {finalResults.performance_analysis?.overall_feedback && (
                            <div className="card mb-6">
                                <h3 className="section-title">🤖 AI Feedback</h3>
                                <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                                    {finalResults.performance_analysis.overall_feedback}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
                            <button className="btn btn-primary btn-lg" onClick={() => router.push('/leaderboard')}>
                                View Leaderboard
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => router.push('/hr-round')}>
                                🤝 Proceed to HR Round
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => router.push('/dashboard')}>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
