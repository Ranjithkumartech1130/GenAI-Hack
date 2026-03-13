import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/style.css'
import './styles/template-styles.css'
import './styles/resume-base.css'
import './styles/voice-assistant.css'
import App from './App.jsx'
import { VoiceProvider } from './contexts/VoiceContext.jsx'

// Error Boundary to catch render errors and show them visually
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('App Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#ef4444', background: '#0f172a', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#f87171', fontSize: 24 }}>⚠️ Application Error</h1>
          <pre style={{ color: '#fbbf24', fontSize: 14, marginTop: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ color: '#94a3b8', fontSize: 12, marginTop: 12, whiteSpace: 'pre-wrap' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: '10px 24px', background: '#6c5ce7', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1081513233816-1fcd0v9m5l8g3e5h70q8u91r5m7m62o5.apps.googleusercontent.com'; // Valid test client ID

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <GoogleOAuthProvider clientId={clientId}>
      <VoiceProvider>
        <App />
      </VoiceProvider>
    </GoogleOAuthProvider>
  </ErrorBoundary>
)