'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { aptitudeAPI } from '@/lib/api';

export default function AptitudePage() {
    const { user, isAuthenticated, loadAuth } = useStore();
    const router = useRouter();
    const [phase, setPhase] = useState<'setup' | 'exam' | 'completed'>('setup');
    const [skillLevel, setSkillLevel] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timer, setTimer] = useState(60);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [tabSwitches, setTabSwitches] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => { loadAuth(); }, [loadAuth]);
    useEffect(() => { if (user) setSkillLevel(user.skill_level || 'intermediate'); }, [user]);

    // Tab switch detection
    useEffect(() => {
        if (phase !== 'exam') return;
        const handleVisibility = () => {
            if (document.hidden && sessionId) {
                setTabSwitches(prev => prev + 1);
                aptitudeAPI.trackTabSwitch(sessionId).catch(() => { });
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [phase, sessionId]);

    // Timer
    useEffect(() => {
        if (phase !== 'exam') return;
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    handleNext(true);
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase, currentIndex]);

    const startExam = async () => {
        setLoading(true);
        try {
            const res = await aptitudeAPI.start(skillLevel);
            setSessionId(res.data.session_id);
            setQuestions(res.data.questions);
            setPhase('exam');
            setTimer(60);
            startTimeRef.current = Date.now();
        } catch (err) {
            alert('Failed to start exam. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = useCallback(async (timeout = false) => {
        const q = questions[currentIndex];
        if (!q) return;

        const answer = timeout ? null : (selectedAnswer || answers[q.id]);
        const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

        if (answer) {
            try {
                await aptitudeAPI.submitAnswer({
                    session_id: sessionId,
                    question_id: q.id,
                    selected_answer: answer,
                    time_taken: timeTaken
                });
                setAnswers(prev => ({ ...prev, [q.id]: answer }));
            } catch (err) { console.error('Failed to submit answer'); }
        }

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setTimer(60);
            startTimeRef.current = Date.now();
        } else {
            // Complete exam
            if (timerRef.current) clearInterval(timerRef.current);
            setLoading(true);
            try {
                const res = await aptitudeAPI.complete(sessionId);
                setResults(res.data);
                setPhase('completed');
            } catch (err) {
                alert('Failed to complete exam');
            } finally {
                setLoading(false);
            }
        }
    }, [currentIndex, questions, selectedAnswer, sessionId, answers]);

    if (!isAuthenticated) {
        return <div className="loading-screen"><div className="spinner" /></div>;
    }

    const currentQuestion = questions[currentIndex];
    const timerClass = timer <= 10 ? 'danger' : timer <= 20 ? 'warning' : '';

    return (
        <>
            <Navbar />
            <div className="page-container">
                {/* SETUP PHASE */}
                {phase === 'setup' && (
                    <div className="animate-fade" style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
                        <div style={{ fontSize: 64, marginBottom: 20 }}>🧠</div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Aptitude Assessment</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
                            Test your quantitative, logical reasoning, and verbal skills.
                            Questions will be adapted based on your selected skill level.
                        </p>

                        <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
                            <div className="form-group">
                                <label className="form-label">Select Skill Level</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[
                                        { value: 'beginner', label: 'Beginner', desc: '70% Easy, 30% Medium', icon: '🌱' },
                                        { value: 'intermediate', label: 'Intermediate', desc: '40% Easy, 40% Medium, 20% Hard', icon: '⚡' },
                                        { value: 'advanced', label: 'Advanced', desc: '30% Medium, 70% Hard', icon: '🔥' }
                                    ].map(opt => (
                                        <div key={opt.value}
                                            className={`option-item ${skillLevel === opt.value ? 'selected' : ''}`}
                                            onClick={() => setSkillLevel(opt.value)}
                                            style={{ cursor: 'pointer' }}>
                                            <span style={{ fontSize: 24 }}>{opt.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{opt.label}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                padding: '12px 16px', borderRadius: 'var(--radius)', background: 'rgba(108,92,231,0.05)',
                                border: '1px solid rgba(108,92,231,0.15)', fontSize: 13, color: 'var(--text-secondary)', marginTop: 8
                            }}>
                                📋 <strong>15 questions</strong> • 60 seconds per question • Topics: Quant, Logical, Verbal
                            </div>
                        </div>

                        <button className="btn btn-primary btn-lg w-full" onClick={startExam} disabled={loading}>
                            {loading ? 'Starting...' : 'Start Assessment →'}
                        </button>
                    </div>
                )}

                {/* EXAM PHASE */}
                {phase === 'exam' && currentQuestion && (
                    <div className="animate-fade">
                        {/* Top bar */}
                        {tabSwitches > 0 && (
                            <div className="cheating-banner">
                                ⚠️ Tab switch detected ({tabSwitches} times). This will be recorded.
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                    Question {currentIndex + 1} of {questions.length}
                                </div>
                                <div className="progress-bar" style={{ width: 300 }}>
                                    <div className="progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <span className={`badge badge-${currentQuestion.difficulty}`}>{currentQuestion.difficulty}</span>
                                <span className="badge badge-primary">{currentQuestion.topic}</span>
                            </div>
                            <div className="timer-container">
                                <div className={`timer-circle ${timerClass}`}>{timer}</div>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>seconds</span>
                            </div>
                        </div>

                        {/* Question */}
                        <div className="card" style={{ marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.7, marginBottom: 24 }}>
                                {currentQuestion.question_text}
                            </h2>

                            <div className="option-list">
                                {currentQuestion.options.map((opt: string, idx: number) => (
                                    <div key={idx}
                                        className={`option-item ${selectedAnswer === opt ? 'selected' : ''}`}
                                        onClick={() => setSelectedAnswer(opt)}>
                                        <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                                        <span>{opt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                {Object.keys(answers).length} answered
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {currentIndex === questions.length - 1 ? (
                                    <button className="btn btn-success btn-lg" onClick={() => handleNext(false)} disabled={loading}>
                                        {loading ? 'Submitting...' : '✓ Finish Exam'}
                                    </button>
                                ) : (
                                    <button className="btn btn-primary" onClick={() => handleNext(false)}>
                                        Next →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* RESULTS PHASE */}
                {phase === 'completed' && results && (
                    <div className="animate-fade" style={{ maxWidth: 800, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <div style={{ fontSize: 64, marginBottom: 16 }}>
                                {results.percentage >= 80 ? '🎉' : results.percentage >= 60 ? '👍' : results.percentage >= 40 ? '💪' : '📚'}
                            </div>
                            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Assessment Complete!</h1>
                            <div style={{
                                fontSize: 72, fontWeight: 900, marginTop: 20,
                                background: results.percentage >= 60 ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #ef4444, #f87171)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>
                                {results.percentage}%
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
                                {results.score} / {results.total_questions} correct
                            </p>
                        </div>

                        {/* Topic Breakdown */}
                        {results.performance_analysis && (
                            <div className="grid-3 mb-6">
                                {Object.entries(results.performance_analysis.topic_analysis || {}).map(([topic, data]: [string, any]) => (
                                    <div key={topic} className="card" style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>{topic}</span>
                                        <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, color: data.percentage >= 60 ? 'var(--success)' : 'var(--danger)' }}>
                                            {data.percentage}%
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{data.correct}/{data.total}</div>
                                        <div className="progress-bar" style={{ marginTop: 8 }}>
                                            <div className="progress-fill" style={{
                                                width: `${data.percentage}%`,
                                                background: data.percentage >= 60 ? 'var(--success)' : 'var(--danger)'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* AI Feedback */}
                        {results.ai_feedback && (
                            <div className="card mb-6">
                                <h3 className="section-title">🤖 AI Performance Analysis</h3>
                                <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                                    {results.ai_feedback}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {results.performance_analysis?.suggestions && (
                            <div className="card mb-6">
                                <h3 className="section-title">💡 Improvement Suggestions</h3>
                                {results.performance_analysis.suggestions.map((s: string, i: number) => (
                                    <p key={i} style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s}</p>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
                            <button className="btn btn-primary btn-lg" onClick={() => router.push('/coding')}>
                                Continue to Coding Round →
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
