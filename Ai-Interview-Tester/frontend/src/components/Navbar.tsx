'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useEffect } from 'react';

export default function Navbar() {
    const { user, isAuthenticated, logout, loadAuth } = useStore();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => { loadAuth(); }, [loadAuth]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!isAuthenticated) return null;

    const isAdmin = user?.role === 'admin';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href="/dashboard" className="navbar-brand">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6c5ce7" /><stop offset="100%" stopColor="#a78bfa" /></linearGradient></defs>
                        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                    </svg>
                    <span>InterviewAI</span>
                </Link>

                <div className="navbar-links">
                    {isAdmin ? (
                        <>
                            <Link href="/admin" className={`navbar-link ${pathname === '/admin' ? 'active' : ''}`}>Dashboard</Link>
                            <Link href="/admin/candidates" className={`navbar-link ${pathname.includes('/candidates') ? 'active' : ''}`}>Candidates</Link>
                            <Link href="/admin/questions" className={`navbar-link ${pathname.includes('/questions') ? 'active' : ''}`}>Questions</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard" className={`navbar-link ${pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
                            <Link href="/resume" className={`navbar-link ${pathname.includes('/resume') ? 'active' : ''}`}>Resume</Link>
                            <Link href="/aptitude" className={`navbar-link ${pathname.includes('/aptitude') ? 'active' : ''}`}>Aptitude</Link>
                            <Link href="/coding" className={`navbar-link ${pathname.includes('/coding') ? 'active' : ''}`}>Coding</Link>
                            <Link href="/hr-round" className={`navbar-link ${pathname.includes('/hr-round') ? 'active' : ''}`}>HR Round</Link>
                            <Link href="/leaderboard" className={`navbar-link ${pathname === '/leaderboard' ? 'active' : ''}`}>Leaderboard</Link>
                            <Link href="/history" className={`navbar-link ${pathname === '/history' ? 'active' : ''}`}>History</Link>
                        </>
                    )}
                </div>

                <div className="navbar-user">
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.name}</span>
                    <div className="navbar-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                    <button className="btn btn-sm btn-secondary" onClick={handleLogout}>Logout</button>
                </div>
            </div>
        </nav>
    );
}
