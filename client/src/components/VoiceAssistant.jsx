import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, HelpCircle, X, Volume2, ChevronDown, ChevronUp, MessageSquare, Brain, Zap, Globe } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';

const VoiceAssistant = () => {
    const voice = useVoice();
    const {
        isListening, shouldBeListening, transcript, feedback,
        mode, showHelp, isSpeaking, commandList,
        toggleVoice, dismissHelp, detectedIntent, confidence,
        currentLang, supportedLanguages, switchLanguage
    } = voice || {};

    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [showLangPicker, setShowLangPicker] = useState(false);
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);

    // ── Audio Waveform Animation ──
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const W = canvas.width = 200;
        const H = canvas.height = 60;
        let phase = 0;

        const draw = () => {
            ctx.clearRect(0, 0, W, H);

            if (isListening || isSpeaking) {
                const barCount = 32;
                const barWidth = W / barCount - 1;

                for (let i = 0; i < barCount; i++) {
                    const amplitude = isListening
                        ? Math.sin(phase + i * 0.3) * 12 + Math.random() * 8 + 8
                        : Math.sin(phase * 0.5 + i * 0.2) * 18 + Math.random() * 4 + 6;

                    const hue = isSpeaking ? 10 : 175;
                    const sat = 60 + Math.sin(phase + i * 0.2) * 20;
                    const light = 55 + Math.sin(phase + i * 0.1) * 15;

                    ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.8)`;
                    const x = i * (barWidth + 1);
                    const barH = amplitude;
                    ctx.fillRect(x, (H - barH) / 2, barWidth, barH);

                    // Mirror reflection
                    ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.2)`;
                    ctx.fillRect(x, (H + barH) / 2, barWidth, barH * 0.3);
                }
                phase += 0.08;
            } else {
                // Idle state — breathing line
                ctx.strokeStyle = 'rgba(120, 184, 184, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let x = 0; x < W; x++) {
                    const y = H / 2 + Math.sin(phase * 0.5 + x * 0.03) * 3;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();
                phase += 0.02;
            }

            animFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isListening, isSpeaking]);

    // ── Group commands by category ──
    const categories = ['All', ...new Set((commandList || []).map(c => c.category))];
    const filteredCommands = activeCategory === 'All'
        ? commandList || []
        : (commandList || []).filter(c => c.category === activeCategory);

    // ── Confidence color ──
    const getConfidenceColor = (conf) => {
        if (conf >= 0.7) return '#4ade80'; // green
        if (conf >= 0.4) return '#fbbf24'; // yellow
        return '#f87171'; // red
    };

    if (isMinimized) {
        return (
            <button
                id="voice-assistant-fab"
                className="voice-fab"
                onClick={() => setIsMinimized(false)}
                aria-label="Open voice assistant"
                title="Open Voice Assistant"
            >
                <div className={`voice-fab-inner ${shouldBeListening ? 'active' : ''}`}>
                    {shouldBeListening ? <Mic size={22} /> : <MicOff size={22} />}
                </div>
                {shouldBeListening && <div className="voice-fab-pulse" />}
            </button>
        );
    }

    return (
        <div id="voice-assistant-panel" className={`voice-panel ${isExpanded ? 'expanded' : ''}`}>
            {/* ── Header ── */}
            <div className="voice-panel-header">
                <div className="voice-header-left">
                    <div className={`voice-status-dot ${shouldBeListening ? (isSpeaking ? 'speaking' : 'listening') : 'idle'}`} />
                    <span className="voice-title">SkillGPS Assistant</span>
                    <span className="voice-mode-badge voice-nlp-badge">
                        <Brain size={10} /> NLP
                    </span>
                    <span className="voice-mode-badge">
                        {mode === 'coding' ? '🖥️ Code' : '🗣️ Voice'}
                    </span>
                    {currentLang && supportedLanguages?.[currentLang] && (
                        <button
                            className="voice-mode-badge voice-lang-badge"
                            onClick={() => setShowLangPicker(!showLangPicker)}
                            title="Change language"
                        >
                            <Globe size={10} /> {supportedLanguages[currentLang]?.flag} {supportedLanguages[currentLang]?.name?.slice(0, 6)}
                        </button>
                    )}
                </div>
                <div className="voice-header-actions">
                    <button
                        className="voice-header-btn"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                        aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                    <button
                        className="voice-header-btn"
                        onClick={() => setIsMinimized(true)}
                        title="Minimize"
                        aria-label="Minimize voice assistant"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* ── Waveform ── */}
            <div className="voice-waveform-container">
                <canvas ref={canvasRef} className="voice-waveform" />
            </div>

            {/* ── Status & Transcript ── */}
            <div className="voice-status-section">
                {transcript && (
                    <div className="voice-transcript">
                        <MessageSquare size={14} />
                        <span>"{transcript}"</span>
                    </div>
                )}

                {/* NLP Intent + Confidence indicator */}
                {detectedIntent && confidence > 0 && (
                    <div className="voice-nlp-result">
                        <div className="voice-intent-row">
                            <Zap size={12} style={{ color: getConfidenceColor(confidence) }} />
                            <span className="voice-intent-label">
                                {detectedIntent.replace(/_/g, ' ')}
                            </span>
                            <span
                                className="voice-confidence-pill"
                                style={{
                                    background: `${getConfidenceColor(confidence)}20`,
                                    color: getConfidenceColor(confidence),
                                    borderColor: `${getConfidenceColor(confidence)}40`,
                                }}
                            >
                                {Math.round(confidence * 100)}%
                            </span>
                        </div>
                    </div>
                )}

                {feedback && (
                    <div className={`voice-feedback ${feedback.startsWith('❌') || feedback.startsWith('🤔') ? 'error' : feedback.startsWith('✓') || feedback.startsWith('📍') ? 'success' : ''}`}>
                        {feedback}
                    </div>
                )}

                {isSpeaking && (
                    <div className="voice-speaking-indicator">
                        <Volume2 size={14} className="voice-speaking-icon" />
                        <span>Speaking...</span>
                    </div>
                )}
            </div>

            {/* ── Main Controls ── */}
            <div className="voice-controls">
                <button
                    id="voice-mic-toggle"
                    className={`voice-mic-btn ${shouldBeListening ? 'active' : ''}`}
                    onClick={toggleVoice}
                    aria-label={shouldBeListening ? 'Stop listening' : 'Start listening'}
                    title={shouldBeListening ? 'Stop listening' : 'Start listening'}
                >
                    <div className="voice-mic-inner">
                        {shouldBeListening ? <Mic size={24} /> : <MicOff size={24} />}
                    </div>
                    {shouldBeListening && <div className="voice-mic-ring ring-1" />}
                    {shouldBeListening && <div className="voice-mic-ring ring-2" />}
                </button>

                <div className="voice-control-hint">
                    {shouldBeListening
                        ? '🧠 NLP Active — speak naturally!'
                        : 'Tap to activate voice control'
                    }
                </div>
            </div>

            {/* ── Expanded: Natural Language Help ── */}
            {(isExpanded || showHelp) && (
                <div className="voice-help-panel">
                    <div className="voice-help-header">
                        <HelpCircle size={16} />
                        <span>Speak Naturally — Examples</span>
                    </div>

                    <div className="voice-nlp-note">
                        💡 <em>No need to memorize commands! Just speak in your own words.</em>
                    </div>

                    <div className="voice-category-tabs">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`voice-cat-tab ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="voice-commands-list">
                        {filteredCommands.map((cmd, idx) => (
                            <div key={idx} className="voice-command-item">
                                <span className="voice-cmd-desc">{cmd.description}</span>
                                <span className="voice-cmd-example">
                                    {cmd.example ? `e.g. "${cmd.example}"` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Language Picker ── */}
            {showLangPicker && (
                <div className="voice-lang-picker">
                    <div className="voice-lang-picker-header">
                        <Globe size={14} />
                        <span>Choose Language</span>
                        <button className="voice-header-btn" onClick={() => setShowLangPicker(false)}>
                            <X size={14} />
                        </button>
                    </div>
                    <div className="voice-lang-grid">
                        {Object.entries(supportedLanguages || {}).map(([code, lang]) => (
                            <button
                                key={code}
                                className={`voice-lang-item ${currentLang === code ? 'active' : ''}`}
                                onClick={() => { switchLanguage?.(code); setShowLangPicker(false); }}
                            >
                                <span className="voice-lang-flag">{lang.flag}</span>
                                <span className="voice-lang-name">{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Quick tips ── */}
            {!isExpanded && !showHelp && !showLangPicker && (
                <div className="voice-quick-tips">
                    <span className="voice-tip">
                        🧠 <strong>NLP-powered</strong> — speak in {supportedLanguages?.[currentLang]?.englishName || supportedLanguages?.[currentLang]?.name || 'any language'}!
                    </span>
                </div>
            )}
        </div>
    );
};

export default VoiceAssistant;
