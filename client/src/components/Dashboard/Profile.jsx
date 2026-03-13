import React, { useState } from 'react';
import {
    User,
    Mail,
    Edit3,
    LogOut,
    BookOpen,
    MessageSquare,
    Award,
    Clock,
    Zap,
    Target,
    Star,
    ChevronRight,
    TrendingUp,
    Layers,
    Settings,
    Globe,
    Calendar,
    Flame
} from 'lucide-react';
import api from '../../services/api';

const Profile = ({ user, onLogout, onUserUpdate }) => {
    const [activeSection, setActiveSection] = useState('account');
    const fileInputRef = React.useRef(null);

    // ─── Settings State (synced with localStorage) ───
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('skillgps_settings');
        return saved ? JSON.parse(saved) : {
            emailNotifications: true,
            pushNotifications: false,
            darkMode: true,
            voiceAssistant: true,
            soundEffects: false,
            customCursor: true,
            autoSave: true,
            showProgressBar: true,
            animationsEnabled: true,
            interviewVoiceFeedback: true,
            showLeaderboard: true,
            compactMode: false,
        };
    });

    const updateSetting = (key) => {
        setSettings(prev => {
            const updated = { ...prev, [key]: !prev[key] };
            localStorage.setItem('skillgps_settings', JSON.stringify(updated));
            // Dispatch event so other components can react
            window.dispatchEvent(new CustomEvent('skillgps-settings-changed', { detail: updated }));
            return updated;
        });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return alert("File too large (max 5MB)");

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const res = await api.post('/user/avatar', {
                    username: user.username,
                    avatar: reader.result
                });
                if (res.data.success && onUserUpdate) {
                    onUserUpdate(res.data.user);
                }
            } catch (err) {
                alert("Failed to upload avatar: " + (err.response?.data?.message || err.message));
            }
        };
        reader.readAsDataURL(file);
    };

    const skills = user.profile?.skills || [];
    const interests = user.profile?.interests || [];
    const goals = user.profile?.learning_goals || [];
    const progress = user.progress || { streak: 0, completed_tasks: 0, active_days: 0, total_time: 0 };

    const menuItems = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'progress', label: 'My Progress', icon: TrendingUp },
        { id: 'skills', label: 'Skills & Goals', icon: Target },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const formatTime = (seconds) => {
        if (!seconds) return '0h';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <div style={{
            display: 'flex',
            gap: 0,
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(120, 184, 184, 0.12)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.4))',
            minHeight: '680px',
            boxShadow: '0 25px 80px rgba(0,0,0,0.5)'
        }}>
            {/* Left Sidebar */}
            <div style={{
                width: '280px',
                background: 'linear-gradient(180deg, #2D1B69 0%, #1E1145 40%, #160D35 100%)',
                padding: '32px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0
            }}>
                {/* Avatar */}
                <div
                    onClick={handleAvatarClick}
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #78B8B8, #5a9b9d)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        boxShadow: '0 8px 30px rgba(120, 184, 184, 0.4)',
                        border: '3px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                    title="Click to change avatar"
                >
                    {user.profile?.avatar ? (
                        <img src={user.profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <User size={48} color="#fff" />
                    )}
                    <div style={{
                        position: 'absolute', bottom: 0, width: '100%', height: '30px',
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Edit3 size={14} color="#fff" />
                    </div>
                </div>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                <h3 style={{
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    marginBottom: '4px',
                    textAlign: 'center',
                    padding: '0 20px'
                }}>{user.username}</h3>
                <p style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.75rem',
                    marginBottom: '32px'
                }}>{user.profile?.experience_level || 'Beginner'} Learner</p>

                {/* Menu */}
                <div style={{ width: '100%', padding: '0 16px' }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 20px',
                                borderRadius: '14px',
                                border: 'none',
                                background: activeSection === item.id
                                    ? 'linear-gradient(135deg, rgba(120, 184, 184, 0.25), rgba(120, 184, 184, 0.08))'
                                    : 'transparent',
                                color: activeSection === item.id ? '#78B8B8' : 'rgba(255,255,255,0.6)',
                                fontSize: '0.9rem',
                                fontWeight: activeSection === item.id ? 700 : 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                                marginBottom: '4px',
                                transition: 'all 0.2s ease',
                                boxShadow: activeSection === item.id
                                    ? 'inset 3px 0 0 #78B8B8'
                                    : 'none'
                            }}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Logout at bottom */}
                <div style={{ marginTop: 'auto', padding: '0 16px', width: '100%' }}>
                    <button
                        onClick={onLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 20px',
                            borderRadius: '14px',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            background: 'rgba(239, 68, 68, 0.08)',
                            color: '#ef4444',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
                {/* Account Section */}
                {activeSection === 'account' && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem', marginBottom: '4px' }}>
                                    My Profile
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your account details</p>
                            </div>
                            <button style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: '1px solid rgba(120, 184, 184, 0.3)',
                                background: 'rgba(120, 184, 184, 0.1)',
                                color: '#78B8B8',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.85rem'
                            }}>
                                <Edit3 size={14} /> Edit Profile
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '16px',
                            marginBottom: '32px'
                        }}>
                            {[
                                { label: 'Day Streak', value: progress.streak || 0, icon: Flame, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
                                { label: 'Tasks Done', value: progress.completed_tasks || 0, icon: Award, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
                                { label: 'Active Days', value: progress.active_days || 0, icon: Calendar, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
                                { label: 'Time Spent', value: formatTime(progress.total_time), icon: Clock, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
                            ].map((stat, i) => (
                                <div key={i} style={{
                                    background: stat.bg,
                                    borderRadius: '16px',
                                    padding: '20px',
                                    border: `1px solid ${stat.color}20`,
                                    textAlign: 'center'
                                }}>
                                    <stat.icon size={24} style={{ color: stat.color, marginBottom: '8px' }} />
                                    <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{stat.value}</p>
                                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '6px' }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Info Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '16px',
                                padding: '24px',
                                border: '1px solid rgba(255,255,255,0.06)'
                            }}>
                                <h4 style={{ color: '#78B8B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={14} /> Personal Info
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Username</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}>{user.username}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Email</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Mail size={14} style={{ color: '#78B8B8' }} /> {user.email || 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Experience</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}>{user.profile?.experience_level || 'Beginner'}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '16px',
                                padding: '24px',
                                border: '1px solid rgba(255,255,255,0.06)'
                            }}>
                                <h4 style={{ color: '#78B8B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BookOpen size={14} /> Learning Preferences
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Style</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}>{user.profile?.learning_style || 'Visual'}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Time Commitment</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}>{user.profile?.time_commitment || '1-5 hours'}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Difficulty</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}>{user.profile?.difficulty_preference || 'Beginner-friendly'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        {user.profile?.bio && (
                            <div style={{
                                marginTop: '20px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '16px',
                                padding: '24px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderLeft: '3px solid #78B8B8'
                            }}>
                                <h4 style={{ color: '#78B8B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Bio</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                                    "{user.profile.bio}"
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Section */}
                {activeSection === 'progress' && (
                    <div>
                        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem', marginBottom: '8px' }}>
                            My Progress
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '32px' }}>Track your learning journey</p>

                        {/* Progress Bars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {goals.length > 0 ? goals.map((goal, i) => {
                                const progressPercent = Math.min(20 + (progress.completed_tasks * 5), 100);
                                return (
                                    <div key={i} style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '16px',
                                        padding: '20px 24px',
                                        border: '1px solid rgba(255,255,255,0.06)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.95rem' }}>{goal}</span>
                                            <span style={{ color: '#78B8B8', fontWeight: 700, fontSize: '0.85rem' }}>{progressPercent}%</span>
                                        </div>
                                        <div style={{
                                            height: '10px',
                                            borderRadius: '100px',
                                            background: 'rgba(255,255,255,0.05)',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${progressPercent}%`,
                                                borderRadius: '100px',
                                                background: i === 0
                                                    ? 'linear-gradient(90deg, #78B8B8, #5a9b9d)'
                                                    : i === 1
                                                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                                        : 'linear-gradient(90deg, #8b5cf6, #6d28d9)',
                                                transition: 'width 1s ease'
                                            }} />
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    <Target size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                    <p style={{ fontWeight: 600 }}>No learning goals set yet</p>
                                    <p style={{ fontSize: '0.85rem' }}>Set goals from the onboarding to track your progress</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginTop: '32px', marginBottom: '16px' }}>
                            Learning Paths Created
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {(user.learning_paths || []).slice(-5).reverse().map((lp, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px 20px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(120, 184, 184, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <BookOpen size={16} style={{ color: '#78B8B8' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem' }}>Learning Path #{(user.learning_paths || []).length - i}</p>
                                        <p style={{ color: '#64748b', fontSize: '0.7rem' }}>
                                            Created: {new Date(lp.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <ChevronRight size={16} style={{ color: '#64748b' }} />
                                </div>
                            ))}
                            {(!user.learning_paths || user.learning_paths.length === 0) && (
                                <p style={{ color: '#64748b', textAlign: 'center', paddingTop: '2rem', fontSize: '0.85rem' }}>
                                    No learning paths generated yet. Go to Learning Path tab to start!
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Skills Section */}
                {activeSection === 'skills' && (
                    <div>
                        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem', marginBottom: '8px' }}>
                            Skills & Goals
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '32px' }}>Your technical profile</p>

                        {/* Skills */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '1px solid rgba(255,255,255,0.06)',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ color: '#78B8B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Layers size={14} /> Current Skills
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {skills.length > 0 ? skills.map((skill, i) => (
                                    <span key={i} style={{
                                        padding: '8px 16px',
                                        borderRadius: '100px',
                                        background: 'rgba(120, 184, 184, 0.1)',
                                        border: '1px solid rgba(120, 184, 184, 0.2)',
                                        color: '#78B8B8',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}>{skill}</span>
                                )) : (
                                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No skills added yet</p>
                                )}
                            </div>
                        </div>

                        {/* Goals */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '1px solid rgba(255,255,255,0.06)',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Target size={14} /> Learning Goals
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {goals.length > 0 ? goals.map((goal, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        background: 'rgba(245, 158, 11, 0.05)',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(245, 158, 11, 0.1)'
                                    }}>
                                        <Star size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                        <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{goal}</span>
                                    </div>
                                )) : (
                                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No goals set yet</p>
                                )}
                            </div>
                        </div>

                        {/* Interests */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            <h4 style={{ color: '#8b5cf6', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={14} /> Interests
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {interests.length > 0 ? interests.map((interest, i) => (
                                    <span key={i} style={{
                                        padding: '8px 16px',
                                        borderRadius: '100px',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        color: '#a78bfa',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}>{interest}</span>
                                )) : (
                                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No interests added yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Section */}
                {activeSection === 'settings' && (
                    <div>
                        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem', marginBottom: '8px' }}>
                            Settings
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '32px' }}>Manage your preferences and customize your experience</p>

                        {/* General Settings */}
                        <h3 style={{ color: '#78B8B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Settings size={14} /> General
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                            {[
                                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Get email updates about your learning progress and streaks', icon: '📧' },
                                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser push notifications for reminders', icon: '🔔' },
                                { key: 'autoSave', label: 'Auto-Save Progress', desc: 'Automatically save your work in IDE and learning paths', icon: '💾' },
                                { key: 'showLeaderboard', label: 'Show on Leaderboard', desc: 'Allow your name to appear on public leaderboards', icon: '🏆' },
                            ].map((item) => (
                                <div key={item.key} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '18px 22px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
                                    border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                        <div>
                                            <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.92rem' }}>{item.label}</p>
                                            <p style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>{item.desc}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => updateSetting(item.key)} style={{
                                        width: '48px', height: '26px', borderRadius: '100px', border: 'none',
                                        background: settings[item.key] ? 'linear-gradient(135deg, #78B8B8, #5a9b9d)' : 'rgba(255,255,255,0.08)',
                                        position: 'relative', cursor: 'pointer', transition: 'background 0.3s ease',
                                        boxShadow: settings[item.key] ? '0 2px 12px rgba(120, 184, 184, 0.35)' : 'none',
                                    }}>
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                                            position: 'absolute', top: '3px', left: settings[item.key] ? '25px' : '3px',
                                            transition: 'left 0.3s cubic-bezier(0.68,-0.55,0.27,1.55)',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                        }} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Voice & Audio Settings */}
                        <h3 style={{ color: '#8b5cf6', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🎙️ Voice & Audio
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                            {[
                                { key: 'voiceAssistant', label: 'Voice Assistant', desc: 'Enable the SkillGPS AI voice assistant for hands-free control', icon: '🗣️' },
                                { key: 'soundEffects', label: 'Sound Effects', desc: 'Play sounds for achievements, streaks, and notifications', icon: '🔊' },
                                { key: 'interviewVoiceFeedback', label: 'Interview Voice Feedback', desc: 'AI HR interviewer speaks questions aloud during mock interviews', icon: '🎤' },
                            ].map((item) => (
                                <div key={item.key} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '18px 22px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
                                    border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                        <div>
                                            <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.92rem' }}>{item.label}</p>
                                            <p style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>{item.desc}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => updateSetting(item.key)} style={{
                                        width: '48px', height: '26px', borderRadius: '100px', border: 'none',
                                        background: settings[item.key] ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)' : 'rgba(255,255,255,0.08)',
                                        position: 'relative', cursor: 'pointer', transition: 'background 0.3s ease',
                                        boxShadow: settings[item.key] ? '0 2px 12px rgba(139, 92, 246, 0.35)' : 'none',
                                    }}>
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                                            position: 'absolute', top: '3px', left: settings[item.key] ? '25px' : '3px',
                                            transition: 'left 0.3s cubic-bezier(0.68,-0.55,0.27,1.55)',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                        }} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Display Settings */}
                        <h3 style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🎨 Display & Appearance
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                            {[
                                { key: 'darkMode', label: 'Dark Mode', desc: 'Use dark theme across the application', icon: '🌙' },
                                { key: 'customCursor', label: 'Custom Cursor', desc: 'Use the SkillGPS animated custom cursor', icon: '🖱️' },
                                { key: 'animationsEnabled', label: 'Animations & Transitions', desc: 'Enable smooth animations and micro-interactions', icon: '✨' },
                                { key: 'showProgressBar', label: 'Show Progress Indicators', desc: 'Display progress bars and completion percentages', icon: '📊' },
                                { key: 'compactMode', label: 'Compact Mode', desc: 'Use a more compact layout with smaller spacing', icon: '📐' },
                            ].map((item) => (
                                <div key={item.key} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '18px 22px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
                                    border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                        <div>
                                            <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.92rem' }}>{item.label}</p>
                                            <p style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>{item.desc}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => updateSetting(item.key)} style={{
                                        width: '48px', height: '26px', borderRadius: '100px', border: 'none',
                                        background: settings[item.key] ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.08)',
                                        position: 'relative', cursor: 'pointer', transition: 'background 0.3s ease',
                                        boxShadow: settings[item.key] ? '0 2px 12px rgba(245, 158, 11, 0.35)' : 'none',
                                    }}>
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                                            position: 'absolute', top: '3px', left: settings[item.key] ? '25px' : '3px',
                                            transition: 'left 0.3s cubic-bezier(0.68,-0.55,0.27,1.55)',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                        }} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Reset Settings */}
                        <div style={{
                            padding: '20px 24px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px',
                            border: '1px solid rgba(59, 130, 246, 0.15)', marginBottom: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div>
                                <h4 style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>Reset Settings</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Restore all settings to their default values</p>
                            </div>
                            <button onClick={() => {
                                const defaults = {
                                    emailNotifications: true, pushNotifications: false, darkMode: true,
                                    voiceAssistant: true, soundEffects: false, customCursor: true,
                                    autoSave: true, showProgressBar: true, animationsEnabled: true,
                                    interviewVoiceFeedback: true, showLeaderboard: true, compactMode: false,
                                };
                                setSettings(defaults);
                                localStorage.setItem('skillgps_settings', JSON.stringify(defaults));
                                window.dispatchEvent(new CustomEvent('skillgps-settings-changed', { detail: defaults }));
                            }} style={{
                                padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)',
                                background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontWeight: 600,
                                cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s',
                            }}>
                                🔄 Reset to Defaults
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div style={{
                            marginTop: '12px', padding: '24px', background: 'rgba(239, 68, 68, 0.05)',
                            borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.15)'
                        }}>
                            <h4 style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>⚠️ Danger Zone</h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '16px' }}>
                                Irreversible actions. Please be careful.
                            </p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => {
                                    if (window.confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }} style={{
                                    padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)',
                                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 600,
                                    cursor: 'pointer', fontSize: '0.85rem',
                                }}>
                                    🗑️ Clear All Data
                                </button>
                                <button onClick={onLogout} style={{
                                    padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)',
                                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 600,
                                    cursor: 'pointer', fontSize: '0.85rem',
                                }}>
                                    🚪 Logout from Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
