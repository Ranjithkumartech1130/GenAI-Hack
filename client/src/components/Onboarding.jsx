import React, { useState } from 'react';
import { Save, User as UserIcon } from 'lucide-react';
import api from '../services/api';

const Onboarding = ({ user, onComplete }) => {
    const [profile, setProfile] = useState({
        bio: user.profile?.bio || '',
        experience_level: user.profile?.experience_level || 'Beginner',
        skills: user.profile?.skills?.join(', ') || '',
        learning_goals: user.profile?.learning_goals?.join(', ') || '',
        linkedin: user.profile?.linkedin || '',
        phone: user.profile?.phone || '',
        time_commitment: user.profile?.time_commitment || '1-5 hours / week',
        learning_style: user.profile?.learning_style || 'Visual',
        difficulty_preference: user.profile?.difficulty_preference || 'Beginner-friendly'
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                ...profile,
                skills: profile.skills.split(',').map(s => s.trim()).filter(s => s),
                learning_goals: profile.learning_goals.split(',').map(s => s.trim()).filter(s => s),
                onboarding_completed: true
            };

            const response = await api.post('/user/profile', {
                username: user.username,
                profile: payload
            });

            onComplete(response.data.user);
        } catch (err) {
            alert('Failed to save profile: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-view p-8 max-w-4xl mx-auto">
            <header className="hero-card mb-8">
                <h1>👋 Welcome!</h1>
                <p>Let's build your AI-powered profile to tailor your learning experience.</p>
            </header>

            <div className="glass-card">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <UserIcon size={24} className="text-primary" /> Profile Setup
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="form-group">
                            <label>Professional Bio</label>
                            <textarea
                                placeholder="Tell us about yourself..."
                                className="h-32"
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Experience Level</label>
                            <select
                                value={profile.experience_level}
                                onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                                <option>Professional</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="form-group">
                            <label>Your Current Skills (Comma separated)</label>
                            <input
                                type="text"
                                placeholder="Python, SQL, React..."
                                value={profile.skills}
                                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Learning Goals</label>
                            <input
                                type="text"
                                placeholder="Data Science, Web Development..."
                                value={profile.learning_goals}
                                onChange={(e) => setProfile({ ...profile, learning_goals: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div className="form-group">
                        <label>LinkedIn Profile URL</label>
                        <input
                            type="url"
                            placeholder="https://linkedin.com/in/yourprofile"
                            value={profile.linkedin}
                            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Mobile Number</label>
                        <input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="form-group">
                        <label>Time Commitment</label>
                        <select
                            value={profile.time_commitment}
                            onChange={(e) => setProfile({ ...profile, time_commitment: e.target.value })}
                        >
                            <option>1-5 hours / week</option>
                            <option>6-10 hours / week</option>
                            <option>11-20 hours / week</option>
                            <option>20+ hours / week</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Learning Style</label>
                        <select
                            value={profile.learning_style}
                            onChange={(e) => setProfile({ ...profile, learning_style: e.target.value })}
                        >
                            <option>Visual</option>
                            <option>Text-based</option>
                            <option>Project-oriented</option>
                            <option>Video-based</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Difficulty</label>
                        <select
                            value={profile.difficulty_preference}
                            onChange={(e) => setProfile({ ...profile, difficulty_preference: e.target.value })}
                        >
                            <option>Beginner-friendly</option>
                            <option>Accelerated</option>
                            <option>Strictly Advanced</option>
                        </select>
                    </div>
                </div>

                <button
                    className="btn-primary mt-10 w-full md:w-auto"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : <><Save size={18} /> Save Profile & Enter Dashboard</>}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
