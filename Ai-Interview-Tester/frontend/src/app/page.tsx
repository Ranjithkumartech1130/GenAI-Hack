'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function Home() {
  const { isAuthenticated, loadAuth, user } = useStore();
  const router = useRouter();

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(user?.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background effects */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-25%',
          width: '150%',
          height: '150%',
          background: 'radial-gradient(circle at 30% 40%, rgba(108, 92, 231, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(167, 139, 250, 0.06) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div className="animate-fade" style={{ marginBottom: 24 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#heroGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <defs><linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6c5ce7" /><stop offset="100%" stopColor="#c084fc" /></linearGradient></defs>
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          <h1 className="animate-fade" style={{
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 1.1,
            marginBottom: 20,
            maxWidth: 700
          }}>
            AI-Powered <span className="gradient-text">Interview</span> Assessment
          </h1>

          <p className="animate-fade" style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            maxWidth: 550,
            margin: '0 auto',
            lineHeight: 1.7,
            marginBottom: 40
          }}>
            Evaluate candidates with adaptive aptitude tests, real-time coding challenges,
            and intelligent AI-driven performance analysis.
          </p>

          <div className="animate-fade" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ fontSize: 16 }}>
              Get Started Free →
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg" style={{ fontSize: 16 }}>
              Sign In
            </Link>
          </div>

          {/* Feature cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
            marginTop: 80,
            maxWidth: 900,
            width: '100%'
          }}>
            {[
              { icon: '🧠', title: 'Adaptive Aptitude', desc: 'Questions adapt to skill level with real-time difficulty adjustment' },
              { icon: '💻', title: 'Live Coding', desc: 'Integrated code editor with test execution and AI evaluation' },
              { icon: '🤝', title: 'HR Interview', desc: 'Realistic HR round with behavioral, logical, and aptitude questions' },
              { icon: '📊', title: 'AI Analytics', desc: 'Detailed performance breakdown with personalized improvement tips' },
              { icon: '🏆', title: 'Smart Ranking', desc: 'Dynamic leaderboard with comprehensive candidate comparison' },
              { icon: '🛡️', title: 'Anti-Cheating', desc: 'Tab-switch detection and behavioral monitoring' },
            ].map((f, i) => (
              <div key={i} className="card card-glow animate-fade" style={{ animationDelay: `${i * 0.1}s`, textAlign: 'left' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        fontSize: 13,
        color: 'var(--text-muted)'
      }}>
        © 2026 InterviewAI — AI-Based Interview Assessment System
      </footer>
    </div>
  );
}
