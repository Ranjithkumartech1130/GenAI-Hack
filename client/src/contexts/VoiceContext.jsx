import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { VoiceAgent } from '../modules/VoiceAgent';

const VoiceContext = createContext(null);

export const VoiceProvider = ({ children }) => {
    const [isListening, setIsListening] = useState(false);
    const [shouldBeListening, setShouldBeListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const [mode, setMode] = useState('navigation');
    const [showHelp, setShowHelp] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [commandList, setCommandList] = useState([]);
    const [detectedIntent, setDetectedIntent] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [currentLang, setCurrentLang] = useState('en-US');
    const [supportedLanguages, setSupportedLanguages] = useState({});
    const agentRef = useRef(null);

    useEffect(() => {
        const agent = new VoiceAgent();
        agentRef.current = agent;

        agent.setStateCallback((state) => {
            setIsListening(state.isListening);
            setShouldBeListening(state.shouldBeListening ?? false);
            setTranscript(state.transcript || '');
            setFeedback(state.feedback || '');
            setMode(state.mode || 'navigation');
            setShowHelp(state.showHelp ?? false);
            setIsSpeaking(state.isSpeaking ?? false);
            if (state.commandList) setCommandList(state.commandList);
            setDetectedIntent(state.detectedIntent || '');
            setConfidence(state.confidence ?? 0);
            if (state.currentLang) setCurrentLang(state.currentLang);
            if (state.supportedLanguages) setSupportedLanguages(state.supportedLanguages);
        });

        // Pre-populate command list
        setCommandList(agent.getCommandList());

        return () => {
            if (agentRef.current) {
                agentRef.current.shouldBeListening = false;
                try { agentRef.current.recognition?.stop(); } catch (e) { /* */ }
            }
        };
    }, []);

    const registerNavigation = useCallback((fn) => {
        if (agentRef.current) agentRef.current.setNavigationCallback(fn);
    }, []);

    const registerEditor = useCallback((editor) => {
        if (agentRef.current) agentRef.current.setEditor(editor);
    }, []);

    const registerEditorAction = useCallback((fn) => {
        if (agentRef.current) agentRef.current.setEditorCallback(fn);
    }, []);

    const toggleVoice = useCallback(() => {
        if (agentRef.current) agentRef.current.toggle();
    }, []);

    const startVoice = useCallback(() => {
        if (agentRef.current) agentRef.current.start();
    }, []);

    const stopVoice = useCallback(() => {
        if (agentRef.current) agentRef.current.stop();
    }, []);

    const speak = useCallback((text) => {
        if (agentRef.current) agentRef.current.speak(text);
    }, []);

    const dismissHelp = useCallback(() => {
        if (agentRef.current) {
            agentRef.current.showHelp = false;
            agentRef.current._emitState();
        }
    }, []);

    const switchLanguage = useCallback((langCode) => {
        if (agentRef.current) agentRef.current.switchLanguage(langCode);
    }, []);

    return (
        <VoiceContext.Provider value={{
            isListening,
            shouldBeListening,
            transcript,
            feedback,
            mode,
            showHelp,
            isSpeaking,
            commandList,
            detectedIntent,
            confidence,
            registerNavigation,
            registerEditor,
            registerEditorAction,
            toggleVoice,
            startVoice,
            stopVoice,
            speak,
            dismissHelp,
            currentLang,
            supportedLanguages,
            switchLanguage,
            agent: agentRef.current,
        }}>
            {children}
        </VoiceContext.Provider>
    );
};

export const useVoice = () => useContext(VoiceContext);
