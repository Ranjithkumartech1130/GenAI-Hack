import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const LandingView = ({ onGetStarted }) => {
    const mainRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const btnRef = useRef(null);
    const particlesRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Entrance animations
            gsap.fromTo(titleRef.current,
                { opacity: 0, y: 60, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.3 }
            );
            gsap.fromTo(subtitleRef.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.7 }
            );
            gsap.fromTo(btnRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 1.1 }
            );

            // Floating particles animation
            if (particlesRef.current) {
                const particles = particlesRef.current.querySelectorAll('.particle');
                particles.forEach((p, i) => {
                    gsap.to(p, {
                        y: `random(-80, 80)`,
                        x: `random(-40, 40)`,
                        opacity: `random(0.2, 0.8)`,
                        scale: `random(0.5, 1.5)`,
                        duration: `random(3, 6)`,
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut',
                        delay: i * 0.2,
                    });
                });
            }
        }, mainRef);

        return () => ctx.revert();
    }, []);

    return (
        <div id="landing-view" ref={mainRef} style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '2rem',
        }}>
            {/* Animated Background Orbs */}
            <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="particle" style={{
                        position: 'absolute',
                        width: `${Math.random() * 8 + 4}px`,
                        height: `${Math.random() * 8 + 4}px`,
                        borderRadius: '50%',
                        background: i % 3 === 0
                            ? 'rgba(120, 184, 184, 0.4)'
                            : i % 3 === 1
                                ? 'rgba(216, 159, 158, 0.4)'
                                : 'rgba(114, 135, 171, 0.4)',
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: 0.3,
                        filter: 'blur(1px)',
                    }} />
                ))}
                {/* Large glowing orbs */}
                <div style={{
                    position: 'absolute', top: '15%', left: '10%', width: 300, height: 300,
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,184,184,0.15) 0%, transparent 70%)',
                    filter: 'blur(40px)', animation: 'float1 8s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', bottom: '20%', right: '10%', width: 250, height: 250,
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(216,159,158,0.15) 0%, transparent 70%)',
                    filter: 'blur(40px)', animation: 'float2 10s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', width: 400, height: 400,
                    transform: 'translate(-50%,-50%)',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(114,135,171,0.08) 0%, transparent 60%)',
                    filter: 'blur(60px)',
                }} />
            </div>

            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 720 }}>
                {/* Logo / Brand Icon */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 80, height: 80, borderRadius: 24,
                    background: 'linear-gradient(135deg, rgba(120,184,184,0.2), rgba(114,135,171,0.2))',
                    border: '1px solid rgba(120,184,184,0.3)',
                    marginBottom: 32, fontSize: 36,
                    boxShadow: '0 8px 32px rgba(120,184,184,0.2)',
                    backdropFilter: 'blur(10px)',
                }}>
                    🧭
                </div>

                <h1 ref={titleRef} style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                    marginBottom: 24,
                    background: 'linear-gradient(135deg, #78B8B8 0%, #ffffff 40%, #D89F9E 80%, #78B8B8 100%)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradientShift 4s ease infinite',
                    filter: 'drop-shadow(0 0 30px rgba(120,184,184,0.3))',
                    opacity: 0,
                }}>
                    SkillGPS AI
                </h1>

                <p ref={subtitleRef} style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                    color: '#94a3b8',
                    maxWidth: 550,
                    margin: '0 auto 40px',
                    lineHeight: 1.7,
                    fontWeight: 400,
                    opacity: 0,
                }}>
                    Architecting your journey from novice to master with precision-engineered, AI-powered learning paths.
                </p>

                <button ref={btnRef} onClick={onGetStarted} style={{
                    padding: '18px 56px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #78B8B8 0%, #609da0 100%)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(120,184,184,0.4), 0 4px 12px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    letterSpacing: '0.02em',
                }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-3px) scale(1.03)';
                        e.target.style.boxShadow = '0 12px 40px rgba(120,184,184,0.5), 0 6px 16px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 8px 32px rgba(120,184,184,0.4), 0 4px 12px rgba(0,0,0,0.2)';
                    }}>
                    🚀 Get Started Now
                </button>

                {/* Feature pills */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12,
                    marginTop: 48, opacity: 0.7,
                }}>
                    {['AI Learning Paths', 'Smart IDE', 'Resume Builder', 'Mock Interviews', 'Progress Tracking'].map((feat, i) => (
                        <span key={i} style={{
                            padding: '6px 16px',
                            borderRadius: 100,
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            background: 'rgba(120,184,184,0.08)',
                            border: '1px solid rgba(120,184,184,0.2)',
                            color: '#78B8B8',
                        }}>
                            {feat}
                        </span>
                    ))}
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes float1 {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, -40px); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-20px, 30px); }
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
};

export default LandingView;
