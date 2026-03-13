import React from 'react';
import { Mic } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';

const VoiceIndicator = () => {
    const { isListening, transcript, feedback } = useVoice() || {};

    if (!isListening) return null;

    return (
        <div className="fixed top-5 right-5 z-[9999] bg-red-500/90 text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-xl animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            <Mic size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
                {feedback || transcript || 'Listening...'}
            </span>
        </div>
    );
};

export default VoiceIndicator;
