import React, { useState } from 'react';
import {
    LayoutDashboard,
    Target,
    TrendingUp,
    FileText,
    Code,
    User,
    LogOut,
    Brain
} from 'lucide-react';
import Overview from './Dashboard/Overview';
import LearningPath from './Dashboard/LearningPath';
import Progress from './Dashboard/Progress';
import ResumeBuilder from './Dashboard/ResumeBuilder';
import IDE from './Dashboard/IDE';
import Profile from './Dashboard/Profile';
import MockInterview from './Dashboard/MockInterview';

const Dashboard = ({ user, onLogout, activeTab, onTabChange, onUserUpdate }) => {
    const [showMockInterview, setShowMockInterview] = useState(false);
    const [showIDE, setShowIDE] = useState(false);

    // Fallback if not controlled (though App.jsx controls it now)
    const handleTabChange = (tabId) => {
        if (tabId === 'interview') {
            setShowMockInterview(true);
            return;
        }
        if (tabId === 'ide') {
            setShowIDE(true);
            return;
        }
        if (onTabChange) onTabChange(tabId);
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'path', name: 'Learning Path', icon: Target },
        { id: 'progress', name: 'Progress', icon: TrendingUp },
        { id: 'resume', name: 'AI Resume', icon: FileText },
        { id: 'ide', name: 'IDE & Tasks', icon: Code },
        { id: 'interview', name: 'Mock Interview', icon: Brain },
        { id: 'profile', name: 'Profile', icon: User },
    ];

    return (
        <div className="dashboard-view" style={{ padding: '2rem', maxWidth: 1280, margin: '0 auto', minHeight: '100vh' }}>
            <header className="hero-card" style={{ marginBottom: '2rem' }}>
                <h1>EduNova AI Dashboard</h1>
                <p>Welcome back, {user.username}! Ready to continue your journey?</p>
            </header>

            <nav className="nav-tabs" style={{ marginBottom: '2rem', position: 'sticky', top: 16, zIndex: 50 }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        <tab.icon size={18} />
                        {tab.name}
                    </button>
                ))}
                <button className="nav-tab" style={{ color: '#f87171' }} onClick={onLogout}>
                    <LogOut size={18} /> Logout
                </button>
            </nav>

            <div className="tab-container" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
                {activeTab === 'overview' && <Overview user={user} />}
                {activeTab === 'path' && <LearningPath user={user} onUserUpdate={onUserUpdate} />}
                {activeTab === 'progress' && <Progress user={user} />}
                {activeTab === 'resume' && <ResumeBuilder user={user} />}
                {activeTab === 'profile' && <Profile user={user} onLogout={onLogout} onUserUpdate={onUserUpdate} />}
            </div>

            {/* Mock Interview Overlay (Full Screen) */}
            <MockInterview
                isOpen={showMockInterview}
                onClose={() => setShowMockInterview(false)}
                user={user}
            />

            {/* IDE & Tasks Overlay (Full Screen) */}
            <IDE
                isOpen={showIDE}
                onClose={() => setShowIDE(false)}
                user={user}
            />
        </div>
    );
};

export default Dashboard;
