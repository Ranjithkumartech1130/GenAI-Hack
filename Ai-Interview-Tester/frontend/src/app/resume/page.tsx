'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { resumeAPI } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

export default function ResumeEvaluator() {
    const { isAuthenticated } = useStore();
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('Software Engineer');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    if (!isAuthenticated) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a PDF resume to upload.');
            return;
        }

        if (file.type !== 'application/pdf') {
            setError('Only PDF files are supported.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);

        try {
            const res = await resumeAPI.evaluate(formData);
            setResult(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to evaluate resume. Make sure it is a valid PDF and the server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
            <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AI Resume Evaluator
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Upload your resume to see how well it matches your target role. Our AI will analyze your skills and provide actionable feedback to help you pass the ATS (Applicant Tracking System).
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Target Role / Job Title</label>
                    <input
                        type="text"
                        className="input"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="e.g. Software Engineer, Frontend Developer, Data Scientist..."
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Upload Resume (PDF)</label>
                    <input
                        type="file"
                        accept=".pdf"
                        className="input"
                        onChange={handleFileChange}
                        style={{ padding: '0.5rem' }}
                    />
                </div>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>{error}</div>}

                <button
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={loading || !file}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem' }}
                >
                    {loading ? 'Analyzing Resume...' : 'Analyze Resume'}
                </button>
            </div>

            {loading && (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem', width: 40, height: 40, border: '4px solid rgba(108, 92, 231, 0.3)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <h3 style={{ marginBottom: '0.5rem' }}>AI is Reviewing Document</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Extracting text, identifying skills, and checking ATS compatibility...</p>
                    <style jsx>{`
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            )}

            {result && !loading && (
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Evaluation Score</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>ATS Compatibility Match</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.score >= 80 ? 'var(--success)' : result.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                                {result.score}<span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>/100</span>
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, color: result.score >= 80 ? 'var(--success)' : result.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                                {result.suitability}
                            </div>
                        </div>
                    </div>

                    <div style={{ lineHeight: 1.6, color: 'var(--text-primary)' }}>
                        <ReactMarkdown components={{
                            h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--primary)' }} {...props} />,
                            h3: ({ node, ...props }) => <h3 style={{ fontSize: '1.1rem', marginTop: '1.25rem', marginBottom: '0.5rem' }} {...props} />,
                            ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }} {...props} />,
                            li: ({ node, ...props }) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                            p: ({ node, ...props }) => <p style={{ marginBottom: '1rem' }} {...props} />
                        }}>
                            {result.feedback}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}
