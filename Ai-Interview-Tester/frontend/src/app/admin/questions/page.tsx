'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { adminAPI } from '@/lib/api';

export default function AdminQuestions() {
    const { user, isAuthenticated, loadAuth } = useStore();
    const router = useRouter();
    const [tab, setTab] = useState<'aptitude' | 'coding'>('aptitude');
    const [aptQuestions, setAptQuestions] = useState<any[]>([]);
    const [codingProblems, setCodingProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => { loadAuth(); }, [loadAuth]);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (user?.role !== 'admin') { router.push('/dashboard'); return; }
        loadQuestions();
    }, [isAuthenticated, user, router]);

    const loadQuestions = () => {
        setLoading(true);
        Promise.all([
            adminAPI.getAptitudeQuestions().catch(() => ({ data: { questions: [] } })),
            adminAPI.getCodingProblems().catch(() => ({ data: { problems: [] } }))
        ]).then(([aptRes, codRes]) => {
            setAptQuestions(aptRes.data.questions || []);
            setCodingProblems(codRes.data.problems || []);
            setLoading(false);
        });
    };

    const handleUpload = async () => {
        const file = fileRef.current?.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadMsg('');
        try {
            const res = tab === 'aptitude'
                ? await adminAPI.uploadAptitude(file)
                : await adminAPI.uploadCoding(file);
            setUploadMsg(res.data.message || 'Upload successful!');
            loadQuestions();
        } catch (err: any) {
            setUploadMsg(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleDelete = async (id: string, type: 'aptitude' | 'coding') => {
        if (!confirm('Are you sure you want to delete this?')) return;
        try {
            if (type === 'aptitude') {
                await adminAPI.deleteAptitudeQuestion(id);
                setAptQuestions(prev => prev.filter(q => q.id !== id));
            } else {
                await adminAPI.deleteCodingProblem(id);
                setCodingProblems(prev => prev.filter(p => p.id !== id));
            }
        } catch (err) {
            alert('Delete failed');
        }
    };

    if (!isAuthenticated || loading) return <><Navbar /><div className="loading-screen"><div className="spinner" /></div></>;

    return (
        <>
            <Navbar />
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">📝 <span className="gradient-text">Question Management</span></h1>
                        <p className="page-subtitle">Upload datasets and manage questions</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button className={`tab ${tab === 'aptitude' ? 'active' : ''}`} onClick={() => setTab('aptitude')}>
                        🧠 Aptitude ({aptQuestions.length})
                    </button>
                    <button className={`tab ${tab === 'coding' ? 'active' : ''}`} onClick={() => setTab('coding')}>
                        💻 Coding ({codingProblems.length})
                    </button>
                </div>

                {/* Upload section */}
                <div className="card mb-6">
                    <h3 className="section-title">📤 Upload Dataset</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                        {tab === 'aptitude'
                            ? 'Upload JSON or CSV file with aptitude questions (fields: question_text, options, correct_answer, topic, difficulty)'
                            : 'Upload JSON file with coding problems (fields: title, difficulty, topic, problem_statement, test_cases)'
                        }
                    </p>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <input type="file" ref={fileRef} accept={tab === 'aptitude' ? '.json,.csv' : '.json'}
                            className="input" style={{ flex: 1 }} />
                        <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
                            {uploading ? 'Uploading...' : '⬆ Upload'}
                        </button>
                    </div>
                    {uploadMsg && (
                        <div style={{
                            marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius)',
                            background: uploadMsg.includes('fail') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                            color: uploadMsg.includes('fail') ? 'var(--danger)' : 'var(--success)',
                            fontSize: 13, fontWeight: 500
                        }}>
                            {uploadMsg}
                        </div>
                    )}
                </div>

                {/* Aptitude Questions */}
                {tab === 'aptitude' && (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}>#</th>
                                    <th>Question</th>
                                    <th>Topic</th>
                                    <th>Difficulty</th>
                                    <th>Answer</th>
                                    <th style={{ width: 80 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aptQuestions.map((q, idx) => (
                                    <tr key={q.id}>
                                        <td>{idx + 1}</td>
                                        <td style={{ maxWidth: 400 }}>
                                            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                                                {q.question_text.length > 100 ? q.question_text.slice(0, 100) + '...' : q.question_text}
                                            </div>
                                        </td>
                                        <td><span className="badge badge-primary">{q.topic}</span></td>
                                        <td><span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span></td>
                                        <td style={{ fontSize: 13, fontWeight: 600 }}>{q.correct_answer}</td>
                                        <td>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(q.id, 'aptitude')}>✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Coding Problems */}
                {tab === 'coding' && (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}>#</th>
                                    <th>Title</th>
                                    <th>Topic</th>
                                    <th>Difficulty</th>
                                    <th style={{ width: 80 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {codingProblems.map((p, idx) => (
                                    <tr key={p.id}>
                                        <td>{idx + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{p.title}</td>
                                        <td><span className="badge badge-info">{p.topic}</span></td>
                                        <td><span className={`badge badge-${p.difficulty}`}>{p.difficulty}</span></td>
                                        <td>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, 'coding')}>✕</button>
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
