'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';

/* ─── HR Question Pool (from the provided datasets + behavioral classics) ─── */
const HR_QUESTIONS: { category: string; question: string }[] = [
    // Behavioral / Soft-skills
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

    // Logical Reasoning (from logical_reasoning_questions.csv)
    { category: 'Logical', question: 'Look at this series: 2, 6, 18, 54. What number should come next? Options are 108, 162, 148, 128.' },
    { category: 'Logical', question: 'Look at this series: 97, 89, 81, 73. What number should come next? Options are 61, 65, 67, 80.' },
    { category: 'Logical', question: 'Look at this series: 3, 9, 27, 81. What number should come next? Options are 243, 233, 259, 251.' },
    { category: 'Logical', question: 'Look at this series: 1, 4, 9, 16. What comes next? Options are 17, 28, 42, 25.' },
    { category: 'Logical', question: 'Look at this series: 200, 100, 50, 25. What number should come next? Options are 30, 7, 12.5, 20.' },

    // General Aptitude (from clean_general_aptitude_dataset.csv)
    { category: 'Aptitude', question: 'What is 25 percent of 200? Options: 40, 50, 60, or 45.' },
    { category: 'Aptitude', question: 'If a - b = 3 and a squared plus b squared = 29, find the value of ab. Options are 10, 12, 15, 18.' },
    { category: 'Aptitude', question: 'A goods train runs at the speed of 72 km per hour and crosses a 250 m long platform in 26 seconds. What is the length of the train? Options: 230m, 240m, 260m, 270m.' },
    { category: 'Aptitude', question: 'The average weight of 8 persons increases by 2.5 kg when a new person replaces one weighing 65 kg. What is the weight of the new person? Options: 76 kg, 76.5 kg, 85 kg, or data inadequate.' },

    // CS Technical (from cse_dataset.csv)
    { category: 'Technical', question: 'Which data structure is best suited for implementing a recursive algorithm? Options are Stack, Queue, Array, or Linked List.' },
    { category: 'Technical', question: 'What is the time complexity of finding an element in a binary search tree? Options: O of n, O of n log n, O of log n, O of n squared.' },
    { category: 'Technical', question: 'Which sorting algorithm has the best average-case time complexity? Options: Merge Sort, Selection Sort, Insertion Sort, Bubble Sort.' },
    { category: 'Technical', question: 'What is the purpose of the final keyword in Java? Options: declare constant variable, prevent method overriding, prevent class inheritance, or all of the above.' },
    { category: 'Technical', question: 'In the context of databases, what does ACID stand for? Options: Atomicity Consistency Isolation Durability, or other options.' },
];

function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickQuestions(count: number) {
    // Pick a mix: 3 behavioral, 1 logical, 1 aptitude/technical  (adjustable)
    const behavioral = shuffleArray(HR_QUESTIONS.filter(q => q.category === 'Behavioral')).slice(0, Math.max(2, count - 3));
    const logical = shuffleArray(HR_QUESTIONS.filter(q => q.category === 'Logical')).slice(0, 1);
    const aptitude = shuffleArray(HR_QUESTIONS.filter(q => q.category === 'Aptitude')).slice(0, 1);
    const technical = shuffleArray(HR_QUESTIONS.filter(q => q.category === 'Technical')).slice(0, 1);
    const pool = [...behavioral, ...logical, ...aptitude, ...technical];
    return shuffleArray(pool).slice(0, count);
}

type Phase = 'intro' | 'interview' | 'finished';
interface Message { role: 'ai' | 'user'; text: string; }

export default function HRRoundPage() {
    const { user, isAuthenticated, loadAuth } = useStore();
    const router = useRouter();

    const [phase, setPhase] = useState<Phase>('intro');
    const [questions, setQuestions] = useState<{ category: string; question: string }[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [messages, setMessages] = useState<Message[]>([]);
    const [textInput, setTextInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [scores, setScores] = useState<number[]>([]);
    const [questionCount, setQuestionCount] = useState(5);

    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => { loadAuth(); }, [loadAuth]);

    // Init speech
    useEffect(() => {
        if (typeof window === 'undefined') return;
        synthesisRef.current = window.speechSynthesis;
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SR) {
            const r = new SR();
            r.continuous = false;
            r.interimResults = false;
            r.lang = 'en-US';
            r.onresult = (e: any) => {
                const t = e.results[0][0].transcript;
                handleAnswer(t);
            };
            r.onerror = () => setIsListening(false);
            r.onend = () => setIsListening(false);
            recognitionRef.current = r;
        }
        return () => {
            synthesisRef.current?.cancel();
            recognitionRef.current?.stop();
        };
    }, []);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const speak = useCallback((text: string) => {
        if (!synthesisRef.current) return;
        synthesisRef.current.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.95;
        u.pitch = 1.0;
        u.onstart = () => setIsSpeaking(true);
        u.onend = () => setIsSpeaking(false);
        synthesisRef.current.speak(u);
    }, []);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || isListening || phase !== 'interview') return;
        synthesisRef.current?.cancel();
        try { recognitionRef.current.start(); setIsListening(true); } catch (_) { }
    }, [isListening, phase]);

    /* ─── Start Interview ─── */
    const startInterview = () => {
        const picked = pickQuestions(questionCount);
        setQuestions(picked);
        setCurrentQ(0);
        setScores([]);
        setPhase('interview');
        const greeting = `Hello ${user?.name || 'there'}! Welcome to the HR round. I'm your interviewer today. Let's get started. Here is your first question. ${picked[0].question}`;
        setMessages([{ role: 'ai', text: greeting }]);
        speak(greeting);
    };

    /* ─── Handle user answer ─── */
    const handleAnswer = useCallback((text: string) => {
        if (!text.trim()) return;
        setIsListening(false);
        recognitionRef.current?.stop();

        const userMsg: Message = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setTextInput('');

        // Simple scoring heuristic
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
                // Finished
                const aiEnd = "Thank you for your answers! That concludes our HR round. Let me prepare your feedback.";
                setMessages(m => [...m, { role: 'ai', text: aiEnd }]);
                speak(aiEnd);
                setTimeout(() => setPhase('finished'), 3000);
                return prev;
            }
            // Acknowledge + next question
            const acks = [
                "Thank you for your response.",
                "That's a great answer.",
                "Interesting perspective.",
                "I appreciate your honesty.",
                "Good. Let's move on.",
            ];
            const ack = acks[Math.floor(Math.random() * acks.length)];
            const nextQ = questions[next];
            const aiText = `${ack} Here is your next question. ${nextQ.question}`;
            setMessages(m => [...m, { role: 'ai', text: aiText }]);
            speak(aiText);
            return next;
        });
    }, [questions, speak]);

    /* ─── Compute final score ─── */
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    if (!isAuthenticated) {
        return <div className="loading-screen"><div className="spinner" /><p className="text-muted">Loading...</p></div>;
    }

    return (
        <>
            <Navbar />
            <div className="page-container">
                {/* ─── INTRO ─── */}
                {phase === 'intro' && (
                    <div className="animate-fade" style={{ maxWidth: 650, margin: '50px auto', textAlign: 'center' }}>
                        <div style={{ fontSize: 72, marginBottom: 16 }}>🤝</div>
                        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>HR Interview Round</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8, marginBottom: 36 }}>
                            Experience a realistic HR interview with an AI HR Manager.
                            You'll be asked behavioral questions, logical reasoning problems, and general aptitude questions
                            — just like a real interview. Answer using <strong>voice</strong> or <strong>text</strong>.
                        </p>

                        <div className="card" style={{ textAlign: 'left', marginBottom: 28 }}>
                            <div className="form-group">
                                <label className="form-label">Number of Questions</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {[5, 7, 10].map(n => (
                                        <div key={n}
                                            className={`option-item ${questionCount === n ? 'selected' : ''}`}
                                            onClick={() => setQuestionCount(n)}
                                            style={{ cursor: 'pointer', flex: 1, justifyContent: 'center', padding: '14px 10px' }}>
                                            <span style={{ fontWeight: 700 }}>{n} Questions</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                                {[
                                    { icon: '🗣️', label: 'Behavioral Questions', desc: 'Leadership, teamwork, conflicts' },
                                    { icon: '🧩', label: 'Logical Reasoning', desc: 'Number series & patterns' },
                                    { icon: '📐', label: 'General Aptitude', desc: 'Math & problem solving' },
                                    { icon: '💻', label: 'Technical Concepts', desc: 'CS fundamentals & concepts' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: 22 }}>{item.icon}</span>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="btn btn-primary btn-lg w-full" onClick={startInterview}>
                            🎤 Start HR Interview
                        </button>
                    </div>
                )}

                {/* ─── INTERVIEW ─── */}
                {phase === 'interview' && (
                    <div className="animate-fade" style={{ maxWidth: 900, margin: '0 auto' }}>
                        {/* Header bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    background: 'var(--accent-gradient)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 22, position: 'relative'
                                }}>
                                    🤝
                                    {isSpeaking && (
                                        <span style={{
                                            position: 'absolute', inset: -4, borderRadius: '50%',
                                            border: '2px solid var(--accent-primary)',
                                            animation: 'pulse 1s infinite', pointerEvents: 'none'
                                        }} />
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 16 }}>AI HR Manager</div>
                                    <div style={{ fontSize: 12, color: isSpeaking ? 'var(--accent-primary)' : 'var(--success)' }}>
                                        {isSpeaking ? '🔊 Speaking...' : '● Online'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span className="badge badge-primary" style={{ fontSize: 12 }}>
                                    Question {currentQ + 1} of {questions.length}
                                </span>
                                <span className="badge badge-info" style={{ fontSize: 12 }}>
                                    {questions[currentQ]?.category}
                                </span>
                            </div>
                        </div>

                        {/* Video call simulation - two cards side by side */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            {/* AI interviewer card */}
                            <div className="card" style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                minHeight: 200, background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(108,92,231,0.08) 100%)',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: 'var(--accent-gradient)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 36, marginBottom: 12, boxShadow: isSpeaking ? '0 0 30px rgba(108,92,231,0.5)' : 'none',
                                    transition: 'box-shadow 0.3s ease'
                                }}>
                                    🤝
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>AI HR Manager</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                    {isSpeaking ? '🔊 Speaking...' : 'Listening to you'}
                                </div>
                                {isSpeaking && (
                                    <div style={{
                                        position: 'absolute', bottom: 16, display: 'flex', gap: 3, alignItems: 'flex-end', height: 20
                                    }}>
                                        {[12, 18, 8, 22, 14, 10, 16].map((h, i) => (
                                            <div key={i} style={{
                                                width: 3, borderRadius: 2,
                                                background: 'var(--accent-primary)',
                                                animation: `pulse ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
                                                height: h,
                                            }} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Candidate card */}
                            <div className="card" style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                minHeight: 200, position: 'relative'
                            }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 12
                                }}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.name || 'Candidate'}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                    {isListening ? '🎤 Listening...' : 'You'}
                                </div>
                                {isListening && (
                                    <span style={{
                                        position: 'absolute', top: 12, right: 12,
                                        width: 10, height: 10, borderRadius: '50%',
                                        background: '#ef4444', animation: 'pulse 0.6s infinite'
                                    }} />
                                )}
                            </div>
                        </div>

                        {/* Chat transcript */}
                        <div className="card" style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 20, padding: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {messages.map((msg, i) => (
                                    <div key={i} style={{
                                        padding: '12px 16px', borderRadius: 16,
                                        maxWidth: '85%',
                                        alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                                        background: msg.role === 'ai' ? 'var(--bg-secondary)' : 'rgba(108,92,231,0.15)',
                                        border: `1px solid ${msg.role === 'ai' ? 'var(--border)' : 'var(--accent-primary)'}`,
                                        animation: 'fadeIn 0.3s ease'
                                    }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
                                            {msg.role === 'ai' ? '🤝 HR Manager' : '👤 You'}
                                        </div>
                                        <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{msg.text}</p>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>
                        </div>

                        {/* Input area */}
                        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                            <input
                                type="text"
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAnswer(textInput)}
                                placeholder="Type your answer here..."
                                className="input"
                                style={{ flex: 1, borderRadius: 999 }}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={() => handleAnswer(textInput)}
                                disabled={!textInput.trim() || isSpeaking}
                                style={{ borderRadius: 999, padding: '12px 24px' }}
                            >
                                Send
                            </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                            <button
                                className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                                onClick={() => isListening ? recognitionRef.current?.stop() : startListening()}
                                disabled={isSpeaking}
                                style={{ borderRadius: 999, padding: '12px 24px' }}
                            >
                                {isListening ? '⏹ Stop Listening' : '🎤 Speak My Answer'}
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => {
                                    synthesisRef.current?.cancel();
                                    recognitionRef.current?.stop();
                                    setPhase('finished');
                                }}
                                style={{ borderRadius: 999, padding: '12px 24px' }}
                            >
                                End Interview
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── RESULTS ─── */}
                {phase === 'finished' && (
                    <div className="animate-fade" style={{ maxWidth: 700, margin: '40px auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <div style={{ fontSize: 64, marginBottom: 12 }}>
                                {avgScore >= 80 ? '🏆' : avgScore >= 60 ? '👏' : avgScore >= 40 ? '💪' : '📝'}
                            </div>
                            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>HR Round Complete!</h1>
                            <div style={{
                                fontSize: 72, fontWeight: 900, marginTop: 16,
                                background: avgScore >= 60
                                    ? 'linear-gradient(135deg, #10b981, #34d399)'
                                    : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>
                                {avgScore}%
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 8 }}>
                                Overall Communication Score
                            </p>
                        </div>

                        {/* Per-question breakdown */}
                        <div className="section">
                            <h3 className="section-title">📊 Question Breakdown</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {questions.map((q, idx) => (
                                    <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
                                        <div style={{ flex: 1, marginRight: 16 }}>
                                            <span className={`badge badge-${q.category === 'Behavioral' ? 'primary' : q.category === 'Logical' ? 'info' : q.category === 'Aptitude' ? 'medium' : 'easy'}`}
                                                style={{ marginBottom: 6, display: 'inline-flex' }}>
                                                {q.category}
                                            </span>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                {q.question.length > 90 ? q.question.slice(0, 90) + '...' : q.question}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center', minWidth: 50 }}>
                                            <div style={{
                                                fontSize: 20, fontWeight: 800,
                                                color: (scores[idx] || 0) >= 70 ? 'var(--success)' : (scores[idx] || 0) >= 40 ? 'var(--warning)' : 'var(--danger)'
                                            }}>
                                                {scores[idx] || 0}
                                            </div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ 100</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="card" style={{ marginBottom: 24 }}>
                            <h3 className="section-title">🤖 AI Feedback</h3>
                            <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                                {avgScore >= 80 && "Outstanding performance! Your answers were detailed, well-structured, and demonstrated strong communication skills. You would leave a great impression on any HR team."}
                                {avgScore >= 60 && avgScore < 80 && "Good performance! You communicated clearly on most questions. To improve, try using the STAR method (Situation, Task, Action, Result) for behavioral questions and elaborate more on your thought process."}
                                {avgScore >= 40 && avgScore < 60 && "Decent effort. Your answers could use more detail and structure. Practice telling stories about your experiences using specific examples. For logical questions, talk through your reasoning out loud."}
                                {avgScore < 40 && "Your answers were quite brief. In an HR interview, it's important to elaborate on your experiences. Practice speaking about your projects, teamwork experiences, and problem-solving approaches in detail."}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button className="btn btn-primary btn-lg" onClick={() => { setPhase('intro'); setMessages([]); setScores([]); }}>
                                🔄 Retake HR Round
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => router.push('/leaderboard')}>
                                View Leaderboard
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
