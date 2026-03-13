import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Brain, StopCircle, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';

const ALGO_API_URL = 'http://localhost:5005';

// ── Comprehensive algorithm keyword map for local recognition ──
const ALGO_KEYWORDS = {
  'bubble sort': 'bubble_sort', 'selection sort': 'selection_sort',
  'insertion sort': 'insertion_sort', 'merge sort': 'merge_sort',
  'quick sort': 'quick_sort', 'binary search': 'binary_search',
  'linear search': 'linear_search', 'fibonacci': 'fibonacci',
  'factorial': 'factorial', 'palindrome': 'palindrome',
  'prime': 'prime_check', 'prime check': 'prime_check',
  'breadth first': 'bfs', 'bfs': 'bfs', 'depth first': 'dfs', 'dfs': 'dfs',
  'dijkstra': 'dijkstra', 'linked list': 'linked_list',
  'stack': 'stack', 'queue': 'queue', 'knapsack': 'knapsack',
  'tower of hanoi': 'tower_of_hanoi', 'gcd': 'gcd',
  'greatest common': 'gcd', 'find max': 'find_max', 'find min': 'find_min',
  'maximum': 'find_max', 'minimum': 'find_min', 'reverse': 'reverse_item',
  'swap': 'swap', 'matrix': 'matrix_multiply', 'lcm': 'lcm',
  'power': 'power', 'exponent': 'power', 'heap sort': 'heap_sort',
  'counting sort': 'counting_sort', 'binary tree': 'binary_tree',
  'hash table': 'hash_table', 'sliding window': 'sliding_window',
  'two pointer': 'two_pointers', 'kadane': 'kadane',
  'topological': 'topological_sort', 'lcs': 'lcs',
  'longest common': 'lcs',
};

const AlgoVoiceAgent = ({
  onAlgoDetected,
  onCodeGenerated,
  currentLang,
  isVisible,
  onClose,
  algoResult,       // ← Receives algorithm analysis results from IDE
  algoInput: externalAlgoInput,  // ← Receives the user's algorithm input text
  taskRelevance,    // ← Task relevance check result
  activeTask        // ← Currently active challenge task
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle');
  const [lastExplanation, setLastExplanation] = useState('');
  const [correctionText, setCorrectionText] = useState('');
  const [teachingText, setTeachingText] = useState('');
  const [voiceMode, setVoiceMode] = useState('explain'); // 'explain' | 'correct'
  const [waveAmplitudes, setWaveAmplitudes] = useState([0.3, 0.4, 0.7, 0.4, 0.3, 0.5, 0.6]);
  const [autoSpeakDone, setAutoSpeakDone] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const animFrameRef = useRef(null);
  const prevResultRef = useRef(null);

  // ── Initialize Speech Recognition ──
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) { finalTranscript += t; }
        else { interimTranscript += t; }
      }
      setTranscript(finalTranscript || interimTranscript);
      if (finalTranscript) {
        handleVoiceInput(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status === 'listening') setStatus('idle');
    };

    return recognition;
  }, [status]);

  // ── Wave Animation ──
  useEffect(() => {
    if (isListening || isSpeaking) {
      const animate = () => {
        setWaveAmplitudes(prev =>
          prev.map(() => 0.15 + Math.random() * 0.85)
        );
        animFrameRef.current = requestAnimationFrame(() =>
          setTimeout(() => animate(), 100)
        );
      };
      animate();
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setWaveAmplitudes([0.3, 0.4, 0.7, 0.4, 0.3, 0.5, 0.6]);
    }
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isListening, isSpeaking]);

  // ═══════════════════════════════════════════════════════
  // ★ AUTO-SPEAK CORRECTIONS when algoResult changes ★
  // This is the key feature: when the AI checker returns
  // results, the voice agent automatically reads corrections
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (!algoResult || algoResult === prevResultRef.current) return;
    prevResultRef.current = algoResult;

    // Don't auto-speak if it's an error status (connection issue)
    if (algoResult.status === 'error' && algoResult.type === 'error') return;

    setAutoSpeakDone(false);
    fetchAndSpeakCorrection(algoResult);
  }, [algoResult]);

  // ── Fetch correction from backend and speak it ──
  const fetchAndSpeakCorrection = async (result) => {
    setStatus('processing');
    setVoiceMode('correct');

    let mismatchTeaching = '';
    // ★ TASK MISMATCH: If the algorithm doesn't match the active task,
    //   fetch voice teaching for the CORRECT algorithm
    if (result.task_mismatch && activeTask) {
      try {
        const teachRes = await fetch(`${ALGO_API_URL}/voice_teach_correct_algo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_title: activeTask.title || '',
            task_description: activeTask.description || '',
            wrong_algorithm: externalAlgoInput || transcript || ''
          })
        });
        if (teachRes.ok) {
          const teachData = await teachRes.json();
          mismatchTeaching = teachData.teaching || '';
        }
      } catch (err) {
        console.error('Voice teach correct algo fetch error:', err);
      }
    }

    try {
      const response = await fetch(`${ALGO_API_URL}/voice_correct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm: externalAlgoInput || transcript || '',
          mistakes: result.mistakes || [],
          feedback: result.explanation || result.feedback || '',
          correct_algorithm: result.algorithm_name || '',
          complexity: result.complexity || {},
          perfect_code: result.perfect_code || '',
          task_relevance: taskRelevance || null,
          task_mismatch: result.task_mismatch || false,
          task_mismatch_message: result.task_mismatch_message || '',
          mismatch_teaching: mismatchTeaching
        })
      });

      if (response.ok) {
        const data = await response.json();
        const correction = data.correction || '';
        const teaching = data.teaching || '';

        setCorrectionText(correction);
        setTeachingText(teaching);

        // Build the full voice message
        const fullSpeech = [correction, teaching].filter(Boolean).join('. ');
        if (fullSpeech) {
          setLastExplanation(fullSpeech);
          speakText(fullSpeech);
        }
      } else {
        // Fallback: build correction locally from results
        speakLocalCorrection(result);
      }
    } catch (err) {
      console.error('Voice correction fetch error:', err);
      speakLocalCorrection(result);
    }

    setAutoSpeakDone(true);
  };

  // ── Local fallback correction (no backend needed) ──
  const speakLocalCorrection = (result) => {
    const parts = [];

    // ★ Handle task mismatch first
    if (result.task_mismatch && activeTask) {
      parts.push(`Attention! Your algorithm does not solve your current task: ${activeTask.title}.`);
      if (result.task_mismatch_message) {
        parts.push(result.task_mismatch_message);
      }
      parts.push(`Please read the task description carefully and think about what algorithm or data structure is needed to solve ${activeTask.title}.`);
    } else if (taskRelevance) {
      if (taskRelevance.is_relevant) {
        parts.push("This algorithm is a good match for your current task.");
      } else {
        parts.push("Note: This algorithm doesn't seem to solve your current task.");
      }
    }

    if (result.status === 'correct' || result.status === '✅ Correct') {
      const algoName = result.algorithm_name ? result.algorithm_name.replace('_', ' ') : 'your algorithm';
      parts.push(`Great job! Here is the answer for ${algoName}.`);
      
      // If the backend provided an explanation, teach it!
      if (result.explanation) {
        parts.push(result.explanation.replace(/\*\*/g, '').replace(/`/g, ''));
      }
      
      if (result.complexity) {
        const tc = result.complexity.time || '';
        if (tc) parts.push(`Time complexity is ${tc.replace('O(', 'O of ').replace(')', '').replace('²', ' squared')}.`);
      }
    } else {
      if (!result.task_mismatch) {
        parts.push('I found some issues with your algorithm. Let me help you fix them.');
      }

      if (result.mistakes && result.mistakes.length > 0) {
        result.mistakes.slice(0, 3).forEach((m, i) => {
          const cleaned = String(m).replace(/\*\*/g, '').replace(/`/g, '').replace(/\*/g, '');
          parts.push(`Issue ${i + 1}: ${cleaned}`);
        });
      }

      const combinedFeedback = result.explanation || result.feedback;
      if (combinedFeedback) {
        const cleanFeedback = combinedFeedback.replace(/\*\*/g, '').replace(/`/g, '').replace(/\*/g, '').replace(/\n/g, ' ').substring(0, 200);
        parts.push(cleanFeedback);
      }

      parts.push("Check the generated code in the panel to see the correct implementation. Don't worry, learning from mistakes is how we all improve!");
    }

    const fullText = parts.join(' ');
    // For correct algorithms, setting correction to the first sentence, and teaching to the explanation
    if (result.status === 'correct' || result.status === '✅ Correct') {
        setCorrectionText(parts[0]); // "Great job..."
        setTeachingText(parts.slice(1).join(' ')); // The actual explanation and complexity
    } else {
        setCorrectionText(parts.slice(0, 2).join(' '));
        setTeachingText(parts.slice(2).join(' '));
    }
    
    setLastExplanation(fullText);
    speakText(fullText);
  };

  // ── Handle Voice Input → Detect Algorithm ──
  const handleVoiceInput = async (text) => {
    setStatus('processing');
    setVoiceMode('explain');
    const lower = text.toLowerCase();

    // Try to match to a known algorithm
    let matchedAlgo = null;
    for (const [keyword, key] of Object.entries(ALGO_KEYWORDS)) {
      if (lower.includes(keyword)) {
        matchedAlgo = key;
        break;
      }
    }

    if (onAlgoDetected) onAlgoDetected(text);

    // Fetch voice explanation from backend
    try {
      const response = await fetch(`${ALGO_API_URL}/voice_explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm: text, language: currentLang || 'python' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.explanation) {
          setLastExplanation(data.explanation);
          setCorrectionText('');
          setTeachingText('');
          speakText(data.explanation);
        }
      } else {
        const fallback = `I heard you say: ${text}. Let me analyze this algorithm for you.`;
        setLastExplanation(fallback);
        speakText(fallback);
      }
    } catch (err) {
      const fallback = `I detected: ${text}. The voice service is offline, but I can still generate code.`;
      setLastExplanation(fallback);
      speakText(fallback);
    }

    // Trigger code generation in the algo panel
    if (onCodeGenerated) onCodeGenerated(text);
  };

  // ── Text-to-Speech Engine (Enhanced) ──
  const speakText = (text) => {
    if (!synthRef.current || !text) return;
    synthRef.current.cancel();

    // Split long text into chunks for better TTS handling
    const maxChunkLen = 300;
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkLen && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());

    // Get preferred voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Google') && v.lang.startsWith('en')
    ) || voices.find(v =>
      v.name.includes('Microsoft') && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en'));

    // Speak each chunk sequentially
    chunks.forEach((chunk, i) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = 0.92;
      utterance.pitch = 1.02;
      utterance.volume = 1;
      if (preferred) utterance.voice = preferred;

      if (i === 0) {
        utterance.onstart = () => { setIsSpeaking(true); setStatus('speaking'); };
      }
      if (i === chunks.length - 1) {
        utterance.onend = () => { setIsSpeaking(false); setStatus('idle'); };
        utterance.onerror = () => { setIsSpeaking(false); setStatus('idle'); };
      }

      synthRef.current.speak(utterance);
    });
  };

  // ── Start / Stop Listening ──
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      setStatus('idle');
    } else {
      const recognition = initRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
        setStatus('listening');
        setTranscript('');
        setVoiceMode('explain');
      }
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
    setStatus('idle');
  };

  // Load voices
  useEffect(() => {
    const loadVoices = () => synthRef.current?.getVoices();
    loadVoices();
    if (synthRef.current) synthRef.current.onvoiceschanged = loadVoices;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  if (!isVisible) return null;

  const statusColors = {
    idle: '#64748b',
    listening: '#10b981',
    processing: '#f59e0b',
    speaking: '#78B8B8',
    error: '#ef4444'
  };

  const statusLabels = {
    idle: 'Ready — Tap mic to speak an algorithm',
    listening: '🎙️ Listening... Say an algorithm name',
    processing: '🧠 Analyzing your request...',
    speaking: voiceMode === 'correct' ? '🔊 Teaching correction...' : '🔊 Explaining algorithm...',
    error: '❌ Microphone not available'
  };

  // Determine correction display mode
  const hasCorrection = algoResult && (algoResult.status !== 'error' || algoResult.type !== 'error');
  const isCorrect = algoResult && (algoResult.status === 'correct' || algoResult.status === '✅ Correct');

  return (
    <div className="voice-agent-container">
      {/* Header */}
      <div className="voice-agent-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="voice-agent-icon">
            <Brain size={16} />
          </div>
          <div>
            <div className="voice-agent-title">
              <Sparkles size={12} style={{ color: '#78B8B8' }} /> Voice Agent
            </div>
            <div className="voice-agent-subtitle">Speaks, corrects & teaches algorithms</div>
          </div>
        </div>
        <button className="voice-agent-close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      {/* Visualizer */}
      <div className="voice-visualizer">
        <div className="voice-wave-container">
          {waveAmplitudes.map((amp, i) => (
            <div
              key={i}
              className="voice-wave-bar"
              style={{
                height: `${amp * 40}px`,
                background: `linear-gradient(180deg, ${statusColors[status]}, ${statusColors[status]}44)`,
                transition: 'height 0.1s ease',
              }}
            />
          ))}
        </div>
        <div className="voice-status" style={{ color: statusColors[status] }}>
          {statusLabels[status]}
        </div>
      </div>

      {/* ═══ CORRECTION FEEDBACK SECTION ═══ */}
      {hasCorrection && correctionText && (
        <div className={`voice-correction-card ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="voice-correction-header">
            {isCorrect ? (
              <><CheckCircle size={14} style={{ color: '#10b981' }} /> <span style={{ color: '#10b981' }}>Algorithm Correct!</span></>
            ) : (
              <><AlertTriangle size={14} style={{ color: '#f59e0b' }} /> <span style={{ color: '#f59e0b' }}>Corrections Found</span></>
            )}
          </div>
          <div className="voice-correction-text">{correctionText}</div>
        </div>
      )}

      {/* ═══ TEACHING SECTION ═══ */}
      {teachingText && (
        <div className="voice-teaching-card">
          <div className="voice-teaching-header">
            <BookOpen size={13} style={{ color: '#78B8B8' }} />
            <span>Teaching — Correct Approach</span>
          </div>
          <div className="voice-teaching-text">{teachingText}</div>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="voice-transcript">
          <span className="voice-transcript-label">You said:</span>
          <span className="voice-transcript-text">"{transcript}"</span>
        </div>
      )}

      {/* General Explanation (when in explain mode, no correction) */}
      {lastExplanation && !correctionText && !teachingText && (
        <div className="voice-explanation">
          <div className="voice-explanation-label">
            <Volume2 size={12} /> AI Explanation
          </div>
          <div className="voice-explanation-text">{lastExplanation}</div>
        </div>
      )}

      {/* Controls */}
      <div className="voice-controls">
        <button
          className={`voice-mic-btn ${isListening ? 'active' : ''}`}
          onClick={toggleListening}
          disabled={status === 'processing'}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          <span>{isListening ? 'Stop' : 'Speak'}</span>
          {isListening && <div className="voice-mic-pulse" />}
        </button>

        {isSpeaking && (
          <button className="voice-stop-btn" onClick={stopSpeaking}>
            <StopCircle size={16} />
            <span>Stop Voice</span>
          </button>
        )}

        <button
          className="voice-replay-btn"
          onClick={() => lastExplanation && speakText(lastExplanation)}
          disabled={!lastExplanation || isSpeaking}
          title="Replay last voice explanation"
        >
          <Volume2 size={16} />
          <span>Replay</span>
        </button>

        {/* Re-teach button: re-speak the correction */}
        {correctionText && (
          <button
            className="voice-reteach-btn"
            onClick={() => {
              const full = [correctionText, teachingText].filter(Boolean).join('. ');
              speakText(full);
            }}
            disabled={isSpeaking}
            title="Re-listen to the correction teaching"
          >
            <BookOpen size={15} />
            <span>Re-teach</span>
          </button>
        )}
      </div>

      {/* Quick Algorithm Buttons */}
      <div className="voice-quick-algos">
        <div className="voice-quick-label">Quick Voice Explain:</div>
        <div className="voice-quick-grid">
          {['Bubble Sort', 'Binary Search', 'Fibonacci', 'DFS', 'Dijkstra', 'Quick Sort', 'Heap Sort', 'Kadane'].map(algo => (
            <button
              key={algo}
              className="voice-quick-btn"
              onClick={() => {
                setTranscript(algo);
                handleVoiceInput(algo);
              }}
            >
              {algo}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlgoVoiceAgent;
