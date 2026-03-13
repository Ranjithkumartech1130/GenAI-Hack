import React, { useState } from 'react';
import { Activity, PlusCircle } from 'lucide-react';

const Progress = ({ user }) => {
    const [log, setLog] = useState({
        type: 'Course Watching',
        skill: '',
        time: 60,
        details: ''
    });

    const handleLog = () => {
        alert('Activity Logged! (Demo)');
    };

    const progress = user.progress || { active_days: 1, streak: 1, total_time: 3600 };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <div className="tab-progress glass-card">
            <h3 className="text-2xl font-bold mb-6">Your Learning Progress</h3>

            <div className="metrics-row mb-12">
                <div className="metric-card">
                    <div className="title">Active Days</div>
                    <div className="value">{progress.active_days} Days</div>
                </div>
                <div className="metric-card">
                    <div className="title">Current Streak</div>
                    <div className="value">{progress.streak} Days 🔥</div>
                </div>
                <div className="metric-card">
                    <div className="title">Total Time</div>
                    <div className="value">{formatTime(progress.total_time)}</div>
                </div>
            </div>

            <div className="glass-card bg-black/40 h-64 flex flex-col items-center justify-center border-dashed mb-12">
                <Activity size={48} className="text-primary mb-4" />
                <p className="text-dim">Daily Study Activity Chart Placeholder</p>
            </div>

            <h4 className="text-xl font-bold mb-6">📝 Update Your Progress</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="form-group">
                    <label>Activity Type</label>
                    <select
                        value={log.type}
                        onChange={(e) => setLog({ ...log, type: e.target.value })}
                    >
                        <option>Course Watching</option>
                        <option>Practical Project</option>
                        <option>Reading Documentation</option>
                        <option>Bug Fixing</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Skill / Subject</label>
                    <input
                        type="text"
                        placeholder="e.g. Python, SQL"
                        value={log.skill}
                        onChange={(e) => setLog({ ...log, skill: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Duration (minutes)</label>
                    <input
                        type="number"
                        value={log.time}
                        onChange={(e) => setLog({ ...log, time: parseInt(e.target.value) || 0 })}
                    />
                </div>
                <div className="form-group">
                    <label>Details</label>
                    <textarea
                        placeholder="What did you achieve today?"
                        value={log.details}
                        onChange={(e) => setLog({ ...log, details: e.target.value })}
                        className="h-20"
                    />
                </div>
            </div>

            <button className="btn-primary" onClick={handleLog}>
                <PlusCircle size={18} /> Log Activity
            </button>
        </div>
    );
};

export default Progress;
