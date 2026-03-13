'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useStore } from '@/lib/store';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setAuth } = useStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authAPI.login({ email, password });
            setAuth(res.data.user, res.data.token);
            router.push(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 50% 30%, rgba(108, 92, 231, 0.06) 0%, transparent 60%)',
                pointerEvents: 'none'
            }} />
            <div className="card animate-fade" style={{ maxWidth: 440, width: '100%', padding: 40 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="url(#lgGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                        <defs><linearGradient id="lgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6c5ce7" /><stop offset="100%" stopColor="#a78bfa" /></linearGradient></defs>
                        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                    </svg>
                    <h1 style={{ fontSize: 26, fontWeight: 800 }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Sign in to your InterviewAI account</p>
                </div>

                {error && (
                    <div style={{
                        padding: '10px 14px', borderRadius: 'var(--radius)', background: 'rgba(239,68,68,0.1)',
                        border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 13, marginBottom: 20, fontWeight: 500
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="input" type="email" placeholder="you@example.com" value={email}
                            onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="input" type="password" placeholder="••••••••" value={password}
                            onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}
                        style={{ marginTop: 8 }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
                </p>

                <div style={{
                    marginTop: 20, padding: '12px 16px', borderRadius: 'var(--radius)',
                    background: 'rgba(108,92,231,0.05)', border: '1px solid rgba(108,92,231,0.15)', fontSize: 12, color: 'var(--text-secondary)'
                }}>

                </div>
            </div>
        </div>
    );
}
