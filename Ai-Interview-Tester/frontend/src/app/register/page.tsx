'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useStore } from '@/lib/store';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', skill_level: 'intermediate' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setAuth } = useStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const res = await authAPI.register({
                name: form.name, email: form.email, password: form.password, skill_level: form.skill_level
            });
            setAuth(res.data.user, res.data.token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 50% 30%, rgba(108,92,231,0.06) 0%, transparent 60%)', pointerEvents: 'none'
            }} />
            <div className="card animate-fade" style={{ maxWidth: 480, width: '100%', padding: 40 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 800 }}>Create Account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Join InterviewAI and start practicing</p>
                </div>

                {error && (
                    <div style={{
                        padding: '10px 14px', borderRadius: 'var(--radius)', background: 'rgba(239,68,68,0.1)',
                        border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 13, marginBottom: 16, fontWeight: 500
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="input" placeholder="John Doe" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="input" type="email" placeholder="you@example.com" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="input" type="password" placeholder="••••••••" value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm</label>
                            <input className="input" type="password" placeholder="••••••••" value={form.confirm}
                                onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Skill Level</label>
                        <select className="input" value={form.skill_level}
                            onChange={(e) => setForm({ ...form, skill_level: e.target.value })}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
