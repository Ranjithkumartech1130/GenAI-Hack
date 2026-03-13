import React, { useState } from 'react';
import { Sparkles, Download, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const ResumeBuilder = ({ user }) => {
    const [template, setTemplate] = useState('modern');
    const [loading, setLoading] = useState(false);
    const [resumeData, setResumeData] = useState(null);

    const templates = [
        { id: 'modern', name: 'Modern Professional', color: 'linear-gradient(135deg, #0F172A, #1E293B)', desc: 'Dark sidebar with gold accents' },
        { id: 'creative', name: 'Creative Orange', color: 'linear-gradient(135deg, #F59E0B, #D97706)', desc: 'Vibrant and eye-catching' },
        { id: 'elegant', name: 'Elegant Burgundy', color: 'linear-gradient(135deg, #991B1B, #7F1D1D)', desc: 'Sophisticated and refined' },
        { id: 'tech', name: 'Tech Professional', color: 'linear-gradient(135deg, #1E3A8A, #172554)', desc: 'Clean and modern design' },
        { id: 'coral', name: 'Coral Classic', color: 'linear-gradient(135deg, #EF4444, #FCA5A5)', desc: 'Warm and approachable' },
    ];

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await api.post('/generate-resume', {
                user_profile: user.profile,
                username: user.username,
                email: user.email,
                goal: user.profile?.learning_goals?.[0] || 'Software Engineer'
            });
            if (response.data.success) {
                setResumeData(response.data.resume);
            }
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px 0' }}>
            {/* Main Builder Container */}
            <div style={{
                display: 'flex',
                gap: '48px',
                alignItems: 'stretch',
                minHeight: '520px',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))',
                borderRadius: '24px',
                border: '1px solid rgba(120, 184, 184, 0.1)',
                overflow: 'hidden',
                boxShadow: '0 25px 80px rgba(0,0,0,0.4)'
            }}>
                {/* Sidebar */}
                <div style={{
                    width: '280px',
                    padding: '40px 32px',
                    background: 'linear-gradient(180deg, rgba(120, 184, 184, 0.08), transparent)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0
                }}>
                    {/* Icon */}
                    <div style={{
                        width: '72px',
                        height: '72px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        boxShadow: '0 8px 20px rgba(245, 158, 11, 0.15)'
                    }}>
                        <Sparkles size={36} color="#f59e0b" />
                    </div>

                    <h3 style={{
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '1.8rem',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em',
                        marginBottom: '12px'
                    }}>
                        AI Resume<br />Builder
                    </h3>

                    <p style={{
                        color: '#64748b',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        marginBottom: '16px'
                    }}>
                        Generate a professional resume powered by AI
                    </p>

                    {/* Generate Button - pushed to bottom */}
                    <div style={{ marginTop: 'auto' }}>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px 24px',
                                borderRadius: '14px',
                                border: 'none',
                                background: loading
                                    ? 'rgba(120, 184, 184, 0.2)'
                                    : 'linear-gradient(135deg, #78B8B8 0%, #5a9b9d 100%)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: loading ? 'not-allowed' : 'none',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(120, 184, 184, 0.3)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Sparkles size={16} />
                            {loading ? 'Crafting...' : 'Generate AI Resume'}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{
                    flex: 1,
                    padding: '40px 40px 40px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '1rem',
                        textAlign: 'center',
                        maxWidth: '480px',
                        margin: '0 auto 40px',
                        lineHeight: 1.6
                    }}>
                        Turn your learning achievements into a professional, creative resume tailored to your dream career path.
                    </p>

                    <h4 style={{
                        color: '#78B8B8',
                        fontWeight: 700,
                        fontSize: '1rem',
                        textAlign: 'center',
                        marginBottom: '24px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Choose Your Template
                    </h4>

                    {/* Template Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '14px',
                        width: '100%'
                    }}>
                        {templates.map((t) => (
                            <div
                                key={t.id}
                                onClick={() => setTemplate(t.id)}
                                style={{
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: template === t.id
                                        ? '2px solid #3B82F6'
                                        : '2px solid transparent',
                                    boxShadow: template === t.id
                                        ? '0 0 25px rgba(59, 130, 246, 0.35)'
                                        : '0 4px 12px rgba(0,0,0,0.2)',
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    transform: template === t.id ? 'translateY(-4px)' : 'none'
                                }}
                            >
                                {/* Color Preview */}
                                <div style={{
                                    height: '120px',
                                    background: t.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    {/* Mini resume lines */}
                                    <div style={{ padding: '16px', width: '100%' }}>
                                        <div style={{ width: '60%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.3)', marginBottom: '6px' }} />
                                        <div style={{ width: '40%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', marginBottom: '10px' }} />
                                        <div style={{ width: '80%', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', marginBottom: '4px' }} />
                                        <div style={{ width: '70%', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', marginBottom: '4px' }} />
                                        <div style={{ width: '50%', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }} />
                                    </div>
                                </div>

                                {/* Card Info */}
                                <div style={{
                                    padding: '14px 12px',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    textAlign: 'center'
                                }}>
                                    <p style={{
                                        color: '#e2e8f0',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        marginBottom: '4px',
                                        lineHeight: 1.2
                                    }}>{t.name}</p>
                                    <p style={{
                                        color: '#64748b',
                                        fontSize: '0.65rem',
                                        lineHeight: 1.3
                                    }}>{t.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Generated Resume */}
            {resumeData && (
                <div style={{ marginTop: '48px', animation: 'slideUp 0.5s ease' }}>
                    <div style={{
                        padding: '48px',
                        borderRadius: '20px',
                        border: '1px solid rgba(120, 184, 184, 0.1)',
                        background: '#fff',
                        color: '#1e293b',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)'
                    }}>
                        {/* Resume Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '32px',
                            paddingBottom: '24px',
                            borderBottom: '2px solid #e2e8f0'
                        }}>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0f172a', margin: 0 }}>
                                    {resumeData.name}
                                </h1>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#78B8B8', marginTop: '4px' }}>
                                    {resumeData.job_title}
                                </h2>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>
                                <p>{resumeData.contact?.email || user.email}</p>
                                <p>{resumeData.contact?.phone || user.profile?.phone}</p>
                            </div>
                        </div>

                        {/* Two-column layout */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                            {/* Left column */}
                            <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '32px' }}>
                                <div style={{ marginBottom: '28px' }}>
                                    <h3 style={{ color: '#78B8B8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '14px' }}>Skills</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {resumeData.skills?.map((s, i) => (
                                            <span key={i} style={{
                                                background: '#f1f5f9',
                                                padding: '5px 12px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: '#475569'
                                            }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ color: '#78B8B8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '14px' }}>Languages</h3>
                                    <ul style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
                                        {resumeData.languages?.map((s, i) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ChevronRight size={12} style={{ color: '#78B8B8' }} /> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Right column */}
                            <div>
                                <div style={{ marginBottom: '28px' }}>
                                    <h3 style={{ color: '#78B8B8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '16px', paddingBottom: '6px', borderBottom: '1px solid #e2e8f0' }}>Experience</h3>
                                    {resumeData.experience?.map((exp, i) => (
                                        <div key={i} style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{exp.title}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{exp.period}</span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>{exp.company}</p>
                                            <ul style={{ fontSize: '0.8rem', color: '#64748b', listStyleType: 'disc', marginLeft: '1rem', marginTop: '6px', lineHeight: 1.7 }}>
                                                {exp.responsibilities?.map((r, ri) => (
                                                    <li key={ri}>{r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <h3 style={{ color: '#78B8B8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '16px', paddingBottom: '6px', borderBottom: '1px solid #e2e8f0' }}>Learning Roadmap</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        {resumeData.roadmap?.map((item, i) => (
                                            <div key={i} style={{
                                                padding: '14px',
                                                background: '#f8fafc',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#78B8B8', textTransform: 'uppercase', marginBottom: '4px' }}>{item.phase}</p>
                                                <p style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.4 }}>{item.courses?.join(', ')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Download Button */}
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <button
                            onClick={() => window.print()}
                            style={{
                                padding: '14px 32px',
                                borderRadius: '14px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                color: '#fff',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <Download size={18} /> Download PDF
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ResumeBuilder;
