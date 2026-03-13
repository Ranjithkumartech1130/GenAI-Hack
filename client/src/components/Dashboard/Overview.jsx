import React from 'react';
import { Lightbulb, Award } from 'lucide-react';

const Overview = ({ user }) => {
    const progress = user.progress || { active_days: 1, streak: 1, total_time: 3600 };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <div className="tab-overview space-y-8">
            <div className="metrics-row">
                <div className="metric-card">
                    <div className="title">Active Days</div>
                    <div className="value">{progress.active_days} Days</div>
                </div>
                <div className="metric-card" id="streak-card">
                    <div className="title">Current Streak</div>
                    <div className="value">{progress.streak} Days 🔥</div>
                </div>
                <div className="metric-card">
                    <div className="title">Total Time</div>
                    <div className="value">{formatTime(progress.total_time)}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card">
                    <h3 className="flex items-center gap-2 text-primary mb-6">
                        <Lightbulb size={20} /> Personalized Insights
                    </h3>
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary-light mb-4 text-sm">
                        You're most consistent on weekday mornings. Keep up the momentum!
                    </div>
                    <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-xl text-secondary-light text-sm">
                        Strategic growth in your {user.profile?.skills?.[0] || 'core'} skills detected.
                    </div>
                </div>

                <div className="glass-card">
                    <h3 className="flex items-center gap-2 text-primary mb-6">
                        <Award size={20} /> Skills & Goals
                    </h3>
                    <p className="text-xs text-dim mb-2 uppercase tracking-wider">Active Skills</p>
                    <div className="tags mb-6">
                        {user.profile?.skills?.length > 0 ? (
                            user.profile.skills.map((s, i) => <span key={i} className="tag">{s}</span>)
                        ) : (
                            <span className="text-sm text-dim italic">No skills added yet.</span>
                        )}
                    </div>
                    <p className="text-xs text-dim mb-2 uppercase tracking-wider">Primary Goals</p>
                    <div className="tags">
                        {user.profile?.learning_goals?.length > 0 ? (
                            user.profile.learning_goals.map((g, i) => (
                                <span key={i} className="tag bg-secondary/10 border-secondary/30 text-secondary">
                                    {g}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-dim italic">No goals set yet.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
