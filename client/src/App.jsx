import React, { useState, useEffect } from 'react';
import { useVoice } from './contexts/VoiceContext';
import LandingView from './components/LandingView';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import TargetCursor from './components/TargetCursor';
import VoiceAssistant from './components/VoiceAssistant';

const getSettings = () => {
  try {
    const saved = localStorage.getItem('skillgps_settings');
    return saved ? JSON.parse(saved) : { voiceAssistant: true, customCursor: true };
  } catch { return { voiceAssistant: true, customCursor: true }; }
};

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [isLoading, setIsLoading] = useState(true);

  const { registerNavigation, agent } = useVoice() || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [appSettings, setAppSettings] = useState(getSettings);

  // Listen for settings changes from Profile page
  useEffect(() => {
    const handleSettingsChange = (e) => setAppSettings(e.detail);
    window.addEventListener('skillgps-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('skillgps-settings-changed', handleSettingsChange);
  }, []);

  useEffect(() => {
    if (appSettings.darkMode === false) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [appSettings.darkMode]);

  useEffect(() => {
    // Restore user session
    const savedUser = localStorage.getItem('bugbuster_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      // Auto-navigate to dashboard if already logged in
      if (parsed.profile?.onboarding_completed) {
        setView('dashboard');
      } else {
        setView('onboarding');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Register voice navigation
    if (registerNavigation) {
      registerNavigation((target) => {
        // Map voice targets to view states
        if (target === 'logout') {
          handleLogout();
          return;
        }

        // Handle specific view mapping if needed
        const viewMap = {
          'home': 'landing',
          'login': 'auth',
          'profile': 'dashboard', // simplified, dashboard handles tabs
          'ide': 'dashboard',
          'resume': 'dashboard',
          'progress': 'dashboard',
          'overview': 'dashboard',
          'path': 'dashboard'
        };

        const nextView = viewMap[target] || target;

        // If we are navigating to dashboard tabs, we need to ensure we are ON the dashboard view
        // The Dashboard component itself handles the tabs via its own props or state?
        // Actually, App.jsx only handles top-level views: landing, auth, onboarding, dashboard.
        // Dashboard.jsx handles the sub-tabs.
        // We need a way to pass the "active tab" to Dashboard if we navigate there.

        if (['profile', 'ide', 'resume', 'progress', 'overview', 'path', 'interview'].includes(target)) {
          if (view !== 'dashboard') setView('dashboard');
          // We need to tell Dashboard to switch tabs. 
          // We can do this by passing a prop or using a shared context/event.
          // Since Dashboard is a child, we can pass initialTab or use a ref/event.
          // For simplicity, let's trigger a window event or use the agent to handle inner-dashboard navigation
          // The VoiceAgent (in module) already had logic to handle tabs if dashboard is visible.
          // But here we are separating concerns. 

          // Let's just setView('dashboard') here. The Agent inside Dashboard (or global agent) 
          // might handle the detailed tab switch if we let it.
          // Actually, VoiceAgent.js "navigate" method handles both view switching and tab switching if we look at it.
          // It says: if (tabs.includes(viewId)) ... checks if dashboard is visible ...

          // So, here we just ensuring App shows Dashboard.
          setView('dashboard');
          setActiveTab(target);
        } else {
          if (nextView === 'landing' || nextView === 'auth' || nextView === 'onboarding') {
            setView(nextView);
          }
        }
      });
    }
  }, [registerNavigation, view, setActiveTab]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('bugbuster_user', JSON.stringify(userData));
    if (userData.profile?.onboarding_completed) {
      setView('dashboard');
    } else {
      setView('onboarding');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bugbuster_user');
    setView('landing');
    setActiveTab('overview');
  };

  if (isLoading) return null;

  return (
    <div className="app-container">
      {appSettings.customCursor !== false && <TargetCursor targetSelector="button, a, .task-item, .nav-tab, .metric-card, .template-card" />}
      {appSettings.voiceAssistant !== false && <VoiceAssistant />}

      {view === 'landing' && (
        <LandingView onGetStarted={() => setView(user ? (user.profile?.onboarding_completed ? 'dashboard' : 'onboarding') : 'auth')} />
      )}

      {view === 'auth' && (
        <AuthView onLogin={handleLogin} onBack={() => setView('landing')} />
      )}

      {view === 'onboarding' && (
        <Onboarding user={user} onComplete={(updatedUser) => {
          setUser(updatedUser);
          setView('dashboard');
        }} />
      )}

      {view === 'dashboard' && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onUserUpdate={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem('bugbuster_user', JSON.stringify(updatedUser));
          }}
        />
      )}
    </div>
  );
}

export default App;

