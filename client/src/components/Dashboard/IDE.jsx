import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';

// Language modes
import 'codemirror/mode/python/python';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/go/go';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/php/php';
import 'codemirror/mode/rust/rust';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/r/r';
import 'codemirror/mode/perl/perl';
import 'codemirror/mode/lua/lua';
import 'codemirror/mode/dart/dart';
import 'codemirror/mode/swift/swift';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/jsx/jsx';

// Addons
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';

import {
    Terminal as TerminalIcon,
    Plus,
    Trash2,
    Play,
    CheckCircle,
    Lightbulb,
    Code,
    FileCode,
    Cpu,
    Zap,
    ChevronRight,
    Clock,
    RotateCcw,
    XCircle,
    Square,
    Copy,
    Check,
    Brain,
    X,
    Sparkles,
    Send,
    ArrowRight,
    AlertTriangle,
    BookOpen,
    Trophy,
    Target
} from 'lucide-react';
import api from '../../services/api';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useVoice } from '../../contexts/VoiceContext';
import AlgoVoiceAgent from './AlgoVoiceAgent';
import '../../styles/ide-fullscreen.css';

// Language configuration
const LANGUAGES = [
    { id: 'python', name: 'Python', icon: '🐍', mode: 'python', ext: 'py', version: 'Python 3.12', boilerplate: '# Write your Python code here\nprint("Hello, World!")\n' },
    { id: 'javascript', name: 'JavaScript', icon: '⚡', mode: 'javascript', ext: 'js', version: 'Node.js 22', boilerplate: '// Write your JavaScript code here\nconsole.log("Hello, World!");\n' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷', mode: 'javascript', ext: 'ts', version: 'TypeScript 5.x', boilerplate: '// Write your TypeScript code here\nconst greeting: string = "Hello, World!";\nconsole.log(greeting);\n' },
    { id: 'c', name: 'C', icon: '🔧', mode: 'text/x-csrc', ext: 'c', version: 'GCC 13', boilerplate: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n' },
    { id: 'cpp', name: 'C++', icon: '⚙️', mode: 'text/x-c++src', ext: 'cpp', version: 'G++ 13', boilerplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n' },
    { id: 'java', name: 'Java', icon: '☕', mode: 'text/x-java', ext: 'java', version: 'Java 21', boilerplate: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n' },
    { id: 'go', name: 'Go', icon: '🐹', mode: 'go', ext: 'go', version: 'Go 1.22', boilerplate: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n' },
    { id: 'ruby', name: 'Ruby', icon: '💎', mode: 'ruby', ext: 'rb', version: 'Ruby 3.3', boilerplate: '# Write your Ruby code here\nputs "Hello, World!"\n' },
    { id: 'php', name: 'PHP', icon: '🐘', mode: 'php', ext: 'php', version: 'PHP 8.3', boilerplate: '<?php\n// Write your PHP code here\necho "Hello, World!\\n";\n?>\n' },
    { id: 'rust', name: 'Rust', icon: '🦀', mode: 'rust', ext: 'rs', version: 'Rust 1.77', boilerplate: 'fn main() {\n    println!("Hello, World!");\n}\n' },
    { id: 'shell', name: 'Shell', icon: '🐚', mode: 'shell', ext: 'sh', version: 'Bash/PS', boilerplate: '#!/bin/bash\n# Write your shell script here\necho "Hello, World!"\n' },
    { id: 'r', name: 'R', icon: '📊', mode: 'r', ext: 'R', version: 'R 4.3', boilerplate: '# Write your R code here\nprint("Hello, World!")\n' },
    { id: 'perl', name: 'Perl', icon: '🐪', mode: 'perl', ext: 'pl', version: 'Perl 5.38', boilerplate: '#!/usr/bin/perl\n# Write your Perl code here\nprint "Hello, World!\\n";\n' },
    { id: 'lua', name: 'Lua', icon: '🌙', mode: 'lua', ext: 'lua', version: 'Lua 5.4', boilerplate: '-- Write your Lua code here\nprint("Hello, World!")\n' },
    { id: 'dart', name: 'Dart', icon: '🎯', mode: 'dart', ext: 'dart', version: 'Dart 3.3', boilerplate: 'void main() {\n  print("Hello, World!");\n}\n' },
    { id: 'swift', name: 'Swift', icon: '🦅', mode: 'swift', ext: 'swift', version: 'Swift 5.9', boilerplate: '// Write your Swift code here\nprint("Hello, World!")\n' },
    { id: 'sql', name: 'SQL', icon: '💾', mode: 'sql', ext: 'sql', version: 'SQL', boilerplate: '-- Write your SQL queries here\nSELECT * FROM users\nWHERE active = true\nORDER BY name;\n' },
];

// Algorithm AI Backend URL
const ALGO_API_URL = 'http://localhost:5005';

const IDE = ({ user, isOpen, onClose }) => {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(LANGUAGES[0].boilerplate);
    const [tasks, setTasks] = useState(() => {
        try {
            const savedTasks = localStorage.getItem(`skillgps_tasks_${user.id || 'default'}`);
            if (savedTasks) {
                return JSON.parse(savedTasks);
            }
        } catch (e) {
            console.error("Failed to load tasks from local storage", e);
        }
        return user.tasks || [];
    });

    useEffect(() => {
        try {
            if (tasks.length > 0) {
                localStorage.setItem(`skillgps_tasks_${user.id || 'default'}`, JSON.stringify(tasks));
            } else {
                localStorage.removeItem(`skillgps_tasks_${user.id || 'default'}`);
            }
        } catch (e) {
            console.error("Failed to save tasks to local storage", e);
        }
    }, [tasks, user.id]);

    const [activeTask, setActiveTask] = useState(null);
    const [terminalVisible, setTerminalVisible] = useState(true);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [executionTime, setExecutionTime] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [copied, setCopied] = useState(false);
    const [stdinValue, setStdinValue] = useState('');
    const [showStdin, setShowStdin] = useState(false);

    // AI Algorithm Helper state
    const [showAlgoPanel, setShowAlgoPanel] = useState(false);
    const [algoInput, setAlgoInput] = useState('');
    const [algoResult, setAlgoResult] = useState(null);
    const [algoLoading, setAlgoLoading] = useState(false);
    const [algoCopied, setAlgoCopied] = useState(false);

    // Voice Agent state
    const [showVoiceAgent, setShowVoiceAgent] = useState(false);

    // Submit state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);
    const [showSubmitResult, setShowSubmitResult] = useState(false);

    // Task relevance
    const [taskRelevance, setTaskRelevance] = useState(null);

    const terminalRef = useRef(null);
    const xterm = useRef(null);
    const fitAddon = useRef(null);

    const { registerEditor, agent } = useVoice() || {};

    const [codeOutput, setCodeOutput] = useState('');

    const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];
    const editorRef = useRef(null);

    // Lock body scroll when fullscreen IDE is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Refresh editor when terminal or view changes
    useEffect(() => {
        if (editorRef.current) {
            setTimeout(() => editorRef.current.refresh(), 100);
        }
    }, [terminalVisible, activeTask, language, isOpen, showAlgoPanel]);
    const runCodeRef = useRef(null);

    // Update code when active task changes
    useEffect(() => {
        if (activeTask && activeTask.starter_code) {
            let codeToSet = activeTask.starter_code;
            const bp = currentLang?.boilerplate || '';
            if (bp && codeToSet.startsWith(bp)) {
                codeToSet = codeToSet.substring(bp.length).trimStart();
            }
            LANGUAGES.forEach(l => {
                if (l.boilerplate && codeToSet.startsWith(l.boilerplate)) {
                    codeToSet = codeToSet.substring(l.boilerplate.length).trimStart();
                }
            });
            if (codeToSet.includes('# Write your Python code here') && codeToSet.includes('print("Hello, World!")')) {
                codeToSet = codeToSet.split('print("Hello, World!")\n').pop().trimStart();
                codeToSet = codeToSet.split('print("Hello, World!")').pop().trimStart();
            }
            setCode(codeToSet);
        }
    }, [activeTask, currentLang]);

    // Initialize terminal with WebSocket
    useEffect(() => {
        let ws;
        const initTerminal = () => {
            if (terminalVisible && terminalRef.current && isOpen) {
                if (xterm.current) {
                    xterm.current.dispose();
                    xterm.current = null;
                }

                const term = new Terminal({
                    cursorBlink: true,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    fontSize: 13,
                    scrollback: 1000,
                    theme: {
                        background: '#0a0e14',
                        foreground: '#B3B1AD',
                        cursor: '#00ffff',
                        cursorAccent: '#0a0e14',
                        selection: 'rgba(0, 255, 255, 0.15)',
                        black: '#01060E',
                        red: '#EA6C73',
                        green: '#91B362',
                        yellow: '#F9AF4F',
                        blue: '#53BDFA',
                        magenta: '#FAE994',
                        cyan: '#90E1C6',
                        white: '#C7C7C7',
                        brightBlack: '#686868',
                        brightRed: '#F07178',
                        brightGreen: '#C2D94C',
                        brightYellow: '#FFB454',
                        brightBlue: '#59C2FF',
                        brightMagenta: '#FFEE99',
                        brightCyan: '#95E6CB',
                        brightWhite: '#FFFFFF',
                    }
                });

                xterm.current = term;
                fitAddon.current = new FitAddon();
                term.loadAddon(fitAddon.current);
                term.open(terminalRef.current);
                fitAddon.current.fit();
                writeWelcome();

                try {
                    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                    const host = window.location.host;
                    const wsUrl = `${protocol}//${host}/terminal`;
                    ws = new WebSocket(wsUrl);

                    ws.onopen = () => {
                        ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
                    };
                    ws.onmessage = (event) => { term.write(event.data); };
                    ws.onerror = (e) => {
                        console.error('Terminal WebSocket error:', e);
                        term.writeln('\r\n\x1b[31m✗ Terminal connection failed\x1b[0m');
                    };
                    ws.onclose = () => {
                        term.writeln('\r\n\x1b[90mTerminal disconnected\x1b[0m');
                    };
                    term.onData((data) => {
                        if (ws.readyState === WebSocket.OPEN) { ws.send(data); }
                    });
                    term.onResize((size) => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ type: 'resize', cols: size.cols, rows: size.rows }));
                        }
                    });
                } catch (err) {
                    console.error("Failed to setup terminal connection", err);
                }
            }
        };

        const timeoutId = setTimeout(initTerminal, 100);
        return () => {
            clearTimeout(timeoutId);
            if (ws) { ws.close(); }
            if (xterm.current) { xterm.current.dispose(); xterm.current = null; }
        };
    }, [terminalVisible, isOpen]);

    // Refit terminal on resize
    useEffect(() => {
        const handleResize = () => {
            if (fitAddon.current) fitAddon.current.fit();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const writeWelcome = () => {
        if (!xterm.current) return;
        xterm.current.writeln('\x1b[36m╭────────────────────────────────────────╮\x1b[0m');
        xterm.current.writeln('\x1b[36m│  \x1b[1m\x1b[37m SkillGPS Code Runner Terminal v3.0 \x1b[0m\x1b[36m │\x1b[0m');
        xterm.current.writeln('\x1b[36m╰────────────────────────────────────────╯\x1b[0m');
        xterm.current.writeln('');
        xterm.current.writeln('\x1b[32m✓\x1b[0m 17 languages supported');
        xterm.current.writeln('\x1b[32m✓\x1b[0m Real code execution with live output');
        xterm.current.writeln('\x1b[32m✓\x1b[0m 10s timeout protection');
        xterm.current.writeln('');
    };

    const handleLanguageChange = (newLang) => {
        const lang = LANGUAGES.find(l => l.id === newLang);
        setLanguage(newLang);
        setCode(lang?.boilerplate || '');
    };

    const handleGenerateTasks = async () => {
        setLoadingTasks(true);
        try {
            const latestPath = user.learning_paths?.[user.learning_paths?.length - 1];
            const userGoal = latestPath?.goal || user.profile?.learning_goals?.join(', ') || user.profile?.interests?.join(', ') || 'Software Development';
            const focusArea = latestPath?.goal || user.profile?.learning_goals?.[0] || 'General';

            const response = await api.post('/generate-tasks', {
                goal: userGoal,
                skills: user.profile?.skills || [],
                experience_level: user.profile?.experience_level || 'Beginner',
                language: language,
                focus_area: focusArea,
                random_seed: Math.random().toString(36).substring(7)
            });
            if (response.data.success) {
                setTasks(response.data.tasks);
            } else {
                if (xterm.current) {
                    xterm.current.writeln(`\x1b[31m✗ Failed to generate tasks: ${response.data.error || response.data.message || 'Unknown error'}\x1b[0m`);
                }
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            if (xterm.current) {
                xterm.current.writeln(`\x1b[31m✗ Task generation error: ${errorMsg}\x1b[0m`);
                xterm.current.writeln('\x1b[33m⚡ Tip: Make sure the AI service is running on port 8002\x1b[0m');
            }
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleRunCode = async () => {
        if (!terminalVisible) setTerminalVisible(true);
        setIsRunning(true);
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 200));

        if (xterm.current) {
            xterm.current.clear();
            writeWelcome();
            xterm.current.writeln(`\x1b[36m▶ Running ${currentLang.name} code...\x1b[0m`);
            xterm.current.writeln('\x1b[90m─────────────────────────────────\x1b[0m');
        }

        try {
            const response = await api.post('/run-code', {
                code: code,
                language: language,
                stdin: stdinValue
            });

            const elapsed = response.data.execution_time || (Date.now() - startTime);
            setExecutionTime(elapsed);

            if (xterm.current) {
                if (response.data.output) {
                    const lines = response.data.output.split('\n');
                    lines.forEach(line => { xterm.current.writeln(`\x1b[37m${line}\x1b[0m`); });
                }
                if (response.data.error) {
                    const errLines = response.data.error.split('\n');
                    errLines.forEach(line => {
                        if (line.trim()) { xterm.current.writeln(`\x1b[31m${line}\x1b[0m`); }
                    });
                }
                if (!response.data.output && !response.data.error) {
                    xterm.current.writeln('\x1b[90m(No output)\x1b[0m');
                }
                xterm.current.writeln('\x1b[90m─────────────────────────────────\x1b[0m');
                if (response.data.success) {
                    xterm.current.writeln(`\x1b[32m✓ Execution complete\x1b[0m \x1b[90m(${elapsed}ms | exit: ${response.data.exit_code || 0})\x1b[0m`);
                } else {
                    xterm.current.writeln(`\x1b[31m✗ Execution failed\x1b[0m \x1b[90m(${elapsed}ms)\x1b[0m`);
                }
                xterm.current.writeln('');
            }
        } catch (err) {
            const elapsed = Date.now() - startTime;
            setExecutionTime(elapsed);
            if (xterm.current) {
                const serverError = err.response?.data?.error || err.response?.data?.message;
                if (err.response?.status === 500) {
                    xterm.current.writeln(`\x1b[31m✗ Server Error: ${serverError || 'Execution service encountered an error'}\x1b[0m`);
                    xterm.current.writeln(`\x1b[33m⚡ Tip: Check that the AI service is running (python main.py on port 8002)\x1b[0m`);
                    xterm.current.writeln(`\x1b[33m⚡ Tip: Check that ${currentLang.name} runtime is installed on your system\x1b[0m`);
                } else if (err.code === 'ERR_NETWORK') {
                    xterm.current.writeln(`\x1b[31m✗ Network Error: Cannot reach the backend server\x1b[0m`);
                    xterm.current.writeln(`\x1b[33m⚡ Tip: Make sure backend (node index.js) is running on port 5001\x1b[0m`);
                } else {
                    xterm.current.writeln(`\x1b[31m✗ Error: ${serverError || err.message}\x1b[0m`);
                }
                xterm.current.writeln('');
            }
        } finally {
            setIsRunning(false);
        }
    };

    // Update ref for voice commands
    useEffect(() => {
        runCodeRef.current = handleRunCode;
    }, [handleRunCode]);

    // Listen for voice agent actions
    useEffect(() => {
        if (agent) {
            agent.onEditorAction = (action) => {
                if (action === 'run' && runCodeRef.current) {
                    runCodeRef.current();
                }
            };
        }
    }, [agent]);

    const handleClearTerminal = () => {
        if (xterm.current) {
            xterm.current.clear();
            writeWelcome();
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return '#10b981';
            case 'medium': return '#f59e0b';
            case 'hard': return '#ef4444';
            default: return '#78B8B8';
        }
    };

    // ─── SUBMIT CODE ───
    const handleSubmitCode = async () => {
        if (!code.trim()) return;
        setIsSubmitting(true);
        setSubmitResult(null);
        setShowSubmitResult(true);

        try {
            const response = await fetch(`${ALGO_API_URL}/submit_code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    language: language,
                    task_title: activeTask?.title || 'Free coding',
                    task_description: activeTask?.description || 'User submitted code for evaluation',
                    reference_solution: activeTask?.solution || '',
                    test_cases: activeTask?.test_cases || []
                })
            });


            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const data = await response.json();
            setSubmitResult(data);

            if (xterm.current) {
                xterm.current.writeln('');
                xterm.current.writeln(data.passed
                    ? '\x1b[32m✓ SUBMISSION PASSED — All test cases cleared!\x1b[0m'
                    : '\x1b[31m✗ SUBMISSION FAILED — See results panel for details.\x1b[0m');
                xterm.current.writeln(`\x1b[36m  Score: ${data.score || 0}/100\x1b[0m`);
                xterm.current.writeln('');
            }
        } catch (err) {
            setSubmitResult({
                passed: false,
                score: 0,
                feedback: `Failed to submit: ${err.message}`,
                test_results: [{ name: 'Connection', passed: false, detail: err.message }],
                suggestions: ['Make sure app.py is running on port 5005']
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── AI ALGORITHM HELPER ───
    const handleAlgoSubmit = async (overrideInput = null) => {
        const inputToUse = typeof overrideInput === 'string' ? overrideInput : algoInput;
        if (!inputToUse.trim()) return;
        setAlgoLoading(true);
        setAlgoResult(null);
        setTaskRelevance(null);

        // Check task relevance if a task is active
        if (activeTask) {
            try {
                const relRes = await fetch(`${ALGO_API_URL}/check_task_relevance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        algorithm: inputToUse.trim(),
                        task_title: activeTask.title || '',
                        task_description: activeTask.description || ''
                    })
                });
                if (relRes.ok) {
                    const relData = await relRes.json();
                    setTaskRelevance(relData);
                }
            } catch (e) {
                console.error('Task relevance check failed:', e);
            }
        }

        try {
            const response = await fetch(`${ALGO_API_URL}/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    algorithm: inputToUse.trim(),
                    language: language,
                    task_title: activeTask ? (activeTask.title || '') : '',
                    task_description: activeTask ? (activeTask.description || '') : ''
                })
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const data = await response.json();

            // ★ If there's a task_mismatch flag, the algorithm doesn't solve the current task
            // Override status to make it clearly "incorrect" for the user
            if (data.task_mismatch && activeTask) {
                data.status = 'incorrect';
                data.type = 'incorrect';
            }
            setAlgoResult(data);
        } catch (err) {
            setAlgoResult({
                status: 'error',
                type: 'error',
                feedback: `Failed to connect to AI Algorithm service: ${err.message}`,
                quote: 'Make sure the algorithm backend is running on port 5005.',
                mistakes: [`Connection error: ${err.message}`],
                learning_path: ['Check that app.py is running']
            });
        } finally {
            setAlgoLoading(false);
        }
    };

    const handleInsertCode = (codeToInsert) => {
        if (codeToInsert) {
            // Replace escaped newlines with actual newlines
            const cleanCode = codeToInsert.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
            setCode(cleanCode);
            setShowAlgoPanel(false);

            if (xterm.current) {
                xterm.current.writeln('\x1b[32m✓ AI-generated code inserted into editor\x1b[0m');
                xterm.current.writeln('');
            }
        }
    };

    const handleCopyAlgoCode = (text) => {
        const cleanText = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        navigator.clipboard.writeText(cleanText);
        setAlgoCopied(true);
        setTimeout(() => setAlgoCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="ide-overlay">
            {/* ═══ TOP HEADER BAR ═══ */}
            <div className="ide-header">
                <div className="ide-header-left">
                    <div className="ide-header-logo">
                        <Code size={22} color="white" />
                    </div>
                    <div>
                        <div className="ide-header-title">
                            SkillGPS IDE <Sparkles size={14} style={{ color: '#78B8B8' }} />
                        </div>
                        <div className="ide-header-subtitle">
                            {LANGUAGES.length} Languages • AI Algorithm Helper • Live Execution
                        </div>
                    </div>
                </div>
                <div className="ide-header-actions">
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginRight: 8 }}>
                        👤 {user?.username || 'Developer'}
                    </span>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.72rem', color: isRunning ? '#f59e0b' : '#28c840', marginRight: 12
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isRunning ? '#f59e0b' : '#28c840', display: 'inline-block', animation: isRunning ? 'pulse 1s infinite' : 'none' }}></span>
                        {isRunning ? 'Executing...' : 'Ready'}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginRight: 8 }}>
                        <Cpu size={12} /> {currentLang.version}
                    </span>
                    {executionTime !== null && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', marginRight: 8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {executionTime}ms
                        </span>
                    )}
                    <button className="ide-header-btn close-btn" onClick={onClose}>
                        <X size={14} /> Close
                    </button>
                </div>
            </div>

            {/* ═══ MAIN CONTENT ═══ */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                {/* ── Task Sidebar ── */}
                <div style={{
                    width: '280px',
                    background: 'linear-gradient(180deg, #0d0f17, #111520)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0
                }}>
                    <div style={{
                        padding: '14px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: 'rgba(255,255,255,0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#78B8B8', fontSize: '0.9rem' }}>
                                <Zap size={15} /> Challenges
                            </h3>
                            <span style={{
                                background: 'rgba(120, 184, 184, 0.15)',
                                color: '#78B8B8',
                                padding: '2px 10px',
                                borderRadius: '100px',
                                fontSize: '0.68rem',
                                fontWeight: 600
                            }}>{tasks.length}</span>
                        </div>

                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#ccc',
                                padding: '9px 12px',
                                borderRadius: '10px',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.id} value={lang.id}>{lang.icon} {lang.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Task List */}
                    <div style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
                        {tasks.length > 0 ? (
                            tasks.map((task, i) => (
                                <div
                                    key={i}
                                    className="task-item"
                                    onClick={() => setActiveTask(task)}
                                    style={{
                                        padding: '12px',
                                        marginBottom: '5px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        border: activeTask?.id === task.id
                                            ? '1px solid rgba(120, 184, 184, 0.4)'
                                            : '1px solid transparent',
                                        background: activeTask?.id === task.id
                                            ? 'rgba(120, 184, 184, 0.08)'
                                            : 'rgba(255,255,255,0.02)',
                                        boxShadow: activeTask?.id === task.id ? 'inset 3px 0 0 #78B8B8' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.78rem', color: '#e2e8f0' }}>{task.title}</p>
                                        {task.difficulty && (
                                            <span style={{
                                                fontSize: '0.52rem', fontWeight: 700, textTransform: 'uppercase',
                                                color: getDifficultyColor(task.difficulty),
                                                background: `${getDifficultyColor(task.difficulty)}15`,
                                                padding: '2px 6px', borderRadius: '4px'
                                            }}>
                                                {task.difficulty}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {task.description}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                <FileCode size={36} style={{ color: '#333', margin: '0 auto 10px' }} />
                                <p style={{ fontSize: '0.78rem', color: '#555', fontWeight: 600 }}>No challenges yet</p>
                                <p style={{ fontSize: '0.62rem', color: '#444' }}>Generate tasks to start practicing</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Actions */}
                    <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button
                            onClick={handleGenerateTasks}
                            disabled={loadingTasks}
                            style={{
                                width: '100%', padding: '10px', borderRadius: '10px',
                                border: '1px solid rgba(120, 184, 184, 0.3)',
                                background: 'linear-gradient(135deg, rgba(120, 184, 184, 0.1), transparent)',
                                color: '#78B8B8', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                fontSize: '0.78rem', transition: 'all 0.2s ease'
                            }}
                        >
                            <Plus size={13} /> {loadingTasks ? 'Generating...' : 'Generate Tasks'}
                        </button>
                        <button
                            onClick={() => setTasks([])}
                            style={{
                                width: '100%', padding: '8px', borderRadius: '10px',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                background: 'transparent', color: '#ef4444', fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '6px', fontSize: '0.72rem', opacity: 0.7
                            }}
                        >
                            <RotateCcw size={11} /> Reset
                        </button>
                    </div>
                </div>

                {/* ── Main Editor + Terminal ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0d0f17', minWidth: 0 }}>
                    {/* Editor Tab Bar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: '#111520',
                        flexShrink: 0
                    }}>
                        <div style={{
                            padding: '10px 18px',
                            background: '#0d0f17',
                            color: '#e2e8f0',
                            fontSize: '0.8rem',
                            borderTop: '2px solid #78B8B8',
                            borderRight: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: "'JetBrains Mono', monospace"
                        }}>
                            <Code size={13} style={{ color: '#78B8B8' }} />
                            solution.{currentLang.ext}
                        </div>
                        <div style={{ flex: 1 }} />
                        <button
                            onClick={handleCopyCode}
                            style={{
                                padding: '6px 12px', marginRight: '8px',
                                borderRadius: '6px', border: 'none',
                                background: 'rgba(255,255,255,0.05)',
                                color: copied ? '#10b981' : '#888',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                fontSize: '0.7rem', transition: 'color 0.2s'
                            }}
                        >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    {/* Task Info Banner */}
                    {activeTask && (
                        <div style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(90deg, rgba(120, 184, 184, 0.08), transparent)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            flexShrink: 0
                        }}>
                            <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'rgba(120, 184, 184, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <ChevronRight size={14} style={{ color: '#78B8B8' }} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.85rem' }}>{activeTask.title}</h4>
                                <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>{activeTask.description}</p>
                            </div>
                        </div>
                    )}

                    {!activeTask && (
                        <div style={{
                            padding: '10px 20px',
                            background: 'rgba(255,255,255,0.02)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            color: '#555', fontSize: '0.78rem',
                            flexShrink: 0
                        }}>
                            <Lightbulb size={13} />
                            Select a task or start coding freely • Press Ctrl+Enter to run • Use AI Algorithm Helper to generate code from algorithms
                        </div>
                    )}

                    {/* Code Editor */}
                    <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
                        <CodeMirror
                            key={`${language}-${activeTask?.id || 'free'}`}
                            value={code}
                            options={{
                                mode: currentLang.mode,
                                theme: 'dracula',
                                lineNumbers: true,
                                autoCloseBrackets: true,
                                lineWrapping: true,
                                matchBrackets: true,
                                indentUnit: 4,
                                tabSize: 4,
                                indentWithTabs: false,
                                extraKeys: {
                                    'Ctrl-Enter': () => handleRunCode(),
                                    'Cmd-Enter': () => handleRunCode(),
                                }
                            }}
                            onBeforeChange={(editor, data, value) => {
                                setCode(value);
                            }}
                            editorDidMount={(editor) => {
                                editorRef.current = editor;
                                if (registerEditor) registerEditor(editor);
                            }}
                            className="h-full text-sm"
                        />
                    </div>

                    {/* Stdin Input */}
                    {showStdin && (
                        <div style={{
                            padding: '8px 16px',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            background: 'rgba(255,255,255,0.02)',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            flexShrink: 0
                        }}>
                            <span style={{ color: '#78B8B8', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>STDIN:</span>
                            <input
                                value={stdinValue}
                                onChange={(e) => setStdinValue(e.target.value)}
                                placeholder="Enter input for your program..."
                                style={{
                                    flex: 1, background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#e2e8f0', padding: '6px 10px',
                                    borderRadius: '6px', fontSize: '0.8rem',
                                    outline: 'none', fontFamily: "'JetBrains Mono', monospace",
                                    cursor: 'text'
                                }}
                            />
                        </div>
                    )}

                    {/* Terminal */}
                    {terminalVisible && (
                        <div style={{
                            height: '200px',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            background: '#0a0e14',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            flexShrink: 0
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '5px 16px',
                                background: 'rgba(255,255,255,0.03)',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                fontSize: '0.7rem', flexShrink: 0
                            }}>
                                <span style={{ color: '#78B8B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <TerminalIcon size={12} /> OUTPUT
                                </span>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={handleClearTerminal} title="Clear terminal"
                                        style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                                        <Trash2 size={11} /> Clear
                                    </button>
                                    <button onClick={() => setTerminalVisible(false)}
                                        style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div ref={terminalRef} style={{ flex: 1, padding: '4px' }} />
                        </div>
                    )}

                    {/* Bottom Toolbar */}
                    <div style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(90deg, #111520, #0d0f17)',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button onClick={() => setTerminalVisible(!terminalVisible)} style={{
                                padding: '7px 14px', borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: terminalVisible ? 'rgba(120, 184, 184, 0.15)' : 'rgba(255,255,255,0.05)',
                                color: terminalVisible ? '#78B8B8' : '#888',
                                fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '5px',
                                fontSize: '0.75rem', transition: 'all 0.2s ease'
                            }}>
                                <TerminalIcon size={13} /> Terminal
                            </button>
                            <button onClick={() => setShowStdin(!showStdin)} style={{
                                padding: '7px 14px', borderRadius: '8px',
                                border: `1px solid ${showStdin ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                                background: showStdin ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.03)',
                                color: showStdin ? '#f59e0b' : '#888',
                                fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '5px',
                                fontSize: '0.75rem'
                            }}>
                                <Code size={13} /> Input
                            </button>
                            {/* ★ AI ALGORITHM HELPER BUTTON — replaces Voice button ★ */}
                            <button
                                onClick={() => setShowAlgoPanel(!showAlgoPanel)}
                                style={{
                                    padding: '7px 16px', borderRadius: '8px',
                                    border: `1px solid ${showAlgoPanel ? 'rgba(120, 184, 184, 0.45)' : 'rgba(120, 184, 184, 0.25)'}`,
                                    background: showAlgoPanel
                                        ? 'linear-gradient(135deg, rgba(120, 184, 184, 0.2), rgba(16, 185, 129, 0.12))'
                                        : 'linear-gradient(135deg, rgba(120, 184, 184, 0.1), rgba(16, 185, 129, 0.05))',
                                    color: '#78B8B8', fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '0.75rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: showAlgoPanel ? '0 2px 12px rgba(120, 184, 184, 0.2)' : '0 2px 10px rgba(120, 184, 184, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <Brain size={14} /> AI Algorithm
                                <span style={{
                                    position: 'absolute', top: '-1px', right: '-1px',
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #10b981, #78B8B8)',
                                    boxShadow: '0 0 6px rgba(120, 184, 184, 0.6)',
                                    animation: 'pulse 2s infinite'
                                }} />
                            </button>
                            {/* ★ VOICE AGENT BUTTON ★ */}
                            <button
                                onClick={() => { setShowVoiceAgent(!showVoiceAgent); if (showVoiceAgent) {} else { setShowAlgoPanel(false); } }}
                                style={{
                                    padding: '7px 16px', borderRadius: '8px',
                                    border: `1px solid ${showVoiceAgent ? 'rgba(16, 185, 129, 0.45)' : 'rgba(16, 185, 129, 0.2)'}`,
                                    background: showVoiceAgent
                                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(120, 184, 184, 0.1))'
                                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(120, 184, 184, 0.03))',
                                    color: showVoiceAgent ? '#10b981' : '#78B8B8', fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '0.75rem', transition: 'all 0.3s ease',
                                    boxShadow: showVoiceAgent ? '0 2px 12px rgba(16, 185, 129, 0.2)' : 'none',
                                    position: 'relative'
                                }}
                            >
                                🎙️ Voice Agent
                                {showVoiceAgent && <span style={{
                                    position: 'absolute', top: '-1px', right: '-1px',
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: '#10b981',
                                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
                                    animation: 'pulse 2s infinite'
                                }} />}
                            </button>
                            <button
                                onClick={() => {
                                    setAlgoInput(code);
                                    setShowAlgoPanel(true);
                                    // Slight delay to allow panel to open
                                    setTimeout(() => handleAlgoSubmit(code), 100);
                                }}
                                style={{
                                    padding: '7px 14px', borderRadius: '8px',
                                    border: '1px solid rgba(120, 184, 184, 0.4)',
                                    background: 'rgba(120, 184, 184, 0.1)',
                                    color: '#78B8B8', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    fontSize: '0.75rem', transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(120, 184, 184, 0.1)'
                            }}>
                                <Target size={13} /> Analyze Editor Code
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleRunCode}
                                disabled={isRunning}
                                style={{
                                    padding: '9px 22px', borderRadius: '10px', border: 'none',
                                    background: isRunning
                                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                        : 'linear-gradient(135deg, #10b981, #059669)',
                                    color: 'white', fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '0.8rem',
                                    boxShadow: isRunning
                                        ? '0 4px 15px rgba(245, 158, 11, 0.3)'
                                        : '0 4px 15px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {isRunning ? <Square size={13} /> : <Play size={13} />}
                                {isRunning ? 'Running...' : 'Run Code'}
                            </button>
                            <button
                                onClick={handleSubmitCode}
                                disabled={isSubmitting || !code.trim()}
                                className="cursor-target"
                                style={{
                                    padding: '9px 22px', borderRadius: '10px', border: 'none',
                                    background: isSubmitting
                                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                        : 'linear-gradient(135deg, #78B8B8, #5a9b9d)',
                                    color: 'white', fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '0.8rem',
                                    boxShadow: '0 4px 15px rgba(120, 184, 184, 0.3)',
                                    opacity: isSubmitting ? 0.7 : 1,
                                    transition: 'all 0.3s ease'
                                }}>
                                {isSubmitting ? (
                                    <><div className="algo-spinner" style={{ width: 13, height: 13 }} /> Grading...</>
                                ) : (
                                    <><CheckCircle size={13} /> Submit</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══ AI ALGORITHM HELPER PANEL ═══ */}
                {showAlgoPanel && (
                    <div className="algo-panel">
                        <div className="algo-panel-header">
                            <span className="algo-panel-title">
                                <Brain size={18} /> AI Algorithm Helper
                            </span>
                            <button className="algo-panel-close" onClick={() => setShowAlgoPanel(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Input Area */}
                        <div className="algo-input-area">
                            <textarea
                                className="algo-textarea"
                                placeholder={`Type an algorithm name or describe your logic...\n\nExamples:\n• "bubble sort" or "binary search"\n• "fibonacci series" or "factorial"\n• "dijkstra shortest path"\n• "Start Input A,B C=A+B Print C Stop"\n• "def find_max(arr): ..."`}
                                value={algoInput}
                                onChange={(e) => setAlgoInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                        handleAlgoSubmit();
                                    }
                                }}
                            />
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                                <span style={{ fontSize: '0.62rem', color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    🎯 Target: <span style={{ color: '#78B8B8', fontWeight: 700 }}>{currentLang.name}</span>
                                </span>
                            </div>
                            <button
                                className="algo-submit-btn"
                                onClick={handleAlgoSubmit}
                                disabled={algoLoading || !algoInput.trim()}
                            >
                                {algoLoading ? (
                                    <>
                                        <div className="algo-spinner" />
                                        Analyzing Algorithm...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} /> Analyze & Generate Code
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Results Area */}
                        <div className="algo-result-area">
                            {!algoResult && !algoLoading && (
                                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                    <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🧠</div>
                                    <p style={{ fontSize: '0.82rem', color: '#555', fontWeight: 600, marginBottom: 8 }}>
                                        AI Algorithm Instructor
                                    </p>
                                    <p style={{ fontSize: '0.7rem', color: '#444', lineHeight: 1.7 }}>
                                        Describe your algorithm and I'll analyze it, find mistakes, and generate the perfect {currentLang.name} implementation.
                                    </p>
                                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {[
                                            'Write pseudocode algorithms',
                                            'Get instant code generation',
                                            'Find logic errors & bugs',
                                            'Learn time & space complexity'
                                        ].map((feat, i) => (
                                            <div key={i} style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                padding: '8px 12px', borderRadius: 8,
                                                background: 'rgba(120, 184, 184, 0.04)',
                                                border: '1px solid rgba(120, 184, 184, 0.08)',
                                                fontSize: '0.7rem', color: '#78B8B8'
                                            }}>
                                                <CheckCircle size={12} /> {feat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {algoResult && (
                                <div>
                                    {/* Status Badge */}
                                    <div className={`algo-result-card ${algoResult.status === 'correct' ? 'correct' : algoResult.status === 'error' ? '' : 'incorrect'}`}>
                                        <div className={`algo-status-badge ${algoResult.status === 'correct' ? 'correct' : 'incorrect'}`}>
                                            {algoResult.status === 'correct' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                            {algoResult.status === 'correct' ? '✓ Correct Algorithm' : algoResult.status === 'error' ? '⚠ Connection Error' : algoResult.task_mismatch ? '✗ Wrong Algorithm for This Task!' : '✗ Incorrect Algorithm'}
                                        </div>

                                        {/* Feedback */}
                                        {algoResult.feedback && (
                                            <div className="algo-section">
                                                <div className="algo-section-title">AI Analysis</div>
                                                <div className="algo-section-content">{algoResult.feedback}</div>
                                            </div>
                                        )}

                                        {/* Explanation */}
                                        {algoResult.explanation && (
                                            <div className="algo-section">
                                                <div className="algo-section-title">Explanation</div>
                                                <div className="algo-section-content">{algoResult.explanation}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mistakes with Fix Suggestions */}
                                    {algoResult.mistakes && algoResult.mistakes.length > 0 && algoResult.status !== 'correct' && (
                                        <div className="algo-result-card">
                                            <div className="algo-section-title" style={{ color: '#ef4444', marginBottom: 12 }}>
                                                <AlertTriangle size={12} style={{ display: 'inline', marginRight: 6 }} />
                                                {algoResult.mistakes.length} Mistake{algoResult.mistakes.length > 1 ? 's' : ''} Found
                                            </div>
                                            {algoResult.mistakes.map((mistake, i) => {
                                                // Parse "MISTAKE: ... → FIX: ..." format
                                                const hasFix = typeof mistake === 'string' && (mistake.includes('→ FIX:') || mistake.includes('-> FIX:'));
                                                let errorPart = mistake;
                                                let fixPart = null;
                                                if (hasFix) {
                                                    const separator = mistake.includes('→ FIX:') ? '→ FIX:' : '-> FIX:';
                                                    const parts = mistake.split(separator);
                                                    errorPart = parts[0].replace(/^MISTAKE:\s*/, '').trim();
                                                    fixPart = parts[1]?.trim();
                                                } else if (typeof mistake === 'string' && mistake.includes('->')) {
                                                    const parts = mistake.split('->');
                                                    errorPart = parts[0].replace(/^MISTAKE:\s*/, '').trim();
                                                    fixPart = parts.slice(1).join('->').trim();
                                                }
                                                return (
                                                    <div key={i} style={{
                                                        marginBottom: 10,
                                                        borderRadius: 10,
                                                        overflow: 'hidden',
                                                        border: '1px solid rgba(239, 68, 68, 0.15)',
                                                        animation: `ideFadeIn 0.3s ease ${i * 0.1}s both`
                                                    }}>
                                                        {/* Error Section */}
                                                        <div style={{
                                                            padding: '10px 14px',
                                                            background: 'rgba(239, 68, 68, 0.06)',
                                                            display: 'flex', alignItems: 'flex-start', gap: 8,
                                                            borderBottom: fixPart ? '1px solid rgba(255,255,255,0.04)' : 'none'
                                                        }}>
                                                            <XCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
                                                            <div>
                                                                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
                                                                    ❌ What's Wrong
                                                                </div>
                                                                <div style={{ fontSize: '0.78rem', color: '#f87171', lineHeight: 1.5 }}>
                                                                    {errorPart}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Fix Suggestion Section */}
                                                        {fixPart && (
                                                            <div style={{
                                                                padding: '10px 14px',
                                                                background: 'rgba(16, 185, 129, 0.04)',
                                                                display: 'flex', alignItems: 'flex-start', gap: 8
                                                            }}>
                                                                <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
                                                                <div>
                                                                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
                                                                        ✅ How to Fix
                                                                    </div>
                                                                    <div style={{ fontSize: '0.78rem', color: '#6ee7b7', lineHeight: 1.5 }}>
                                                                        {fixPart}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Complexity */}
                                    {(algoResult.time_complexity || algoResult.space_complexity) && (
                                        <div className="algo-result-card">
                                            <div className="algo-section-title">Complexity Analysis</div>
                                            <div className="algo-complexity-grid">
                                                {algoResult.time_complexity && (
                                                    <div className="algo-complexity-item">
                                                        <div className="algo-complexity-label">Time</div>
                                                        <div className="algo-complexity-value">{algoResult.time_complexity}</div>
                                                    </div>
                                                )}
                                                {algoResult.space_complexity && (
                                                    <div className="algo-complexity-item">
                                                        <div className="algo-complexity-label">Space</div>
                                                        <div className="algo-complexity-value">{algoResult.space_complexity}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Perfect Code */}
                                    {algoResult.perfect_code && (
                                        <div className="algo-result-card">
                                            <div className="algo-section-title">
                                                <Code size={12} style={{ display: 'inline', marginRight: 6 }} />
                                                Reference {currentLang.name} Implementation
                                            </div>
                                            <div className="algo-code-block">
                                                <button
                                                    className="copy-btn"
                                                    onClick={() => handleCopyAlgoCode(algoResult.perfect_code)}
                                                >
                                                    {algoCopied ? '✓ Copied' : 'Copy'}
                                                </button>
                                                {algoResult.perfect_code.replace(/\\n/g, '\n').replace(/\\t/g, '\t')}
                                            </div>
                                            <button
                                                className="algo-insert-btn"
                                                onClick={() => handleInsertCode(algoResult.perfect_code)}
                                            >
                                                <ArrowRight size={14} /> Insert Code into Editor
                                            </button>
                                        </div>
                                    )}

                                    {/* Expected Output */}
                                    {algoResult.expected_output && (
                                        <div className="algo-result-card">
                                            <div className="algo-section-title">Expected Output</div>
                                            <div className="algo-code-block" style={{ color: '#a29bfe' }}>
                                                {algoResult.expected_output}
                                            </div>
                                        </div>
                                    )}

                                    {/* Learning Path */}
                                    {algoResult.learning_path && algoResult.learning_path.length > 0 && (
                                        <div className="algo-result-card">
                                            <div className="algo-section-title">
                                                <BookOpen size={12} style={{ display: 'inline', marginRight: 6 }} />
                                                Learning Path
                                            </div>
                                            <div>
                                                {algoResult.learning_path.map((topic, i) => (
                                                    <span key={i} className="algo-learning-tag">{topic}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Task Relevance Message */}
                                    {taskRelevance && !taskRelevance.is_relevant && (
                                        <div style={{
                                            marginBottom: 15, padding: '10px 14px', borderRadius: '8px',
                                            background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
                                            color: '#fbbf24', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '8px'
                                        }}>
                                            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                                            <div>
                                                <strong>Not quite matching the task!</strong>
                                                <div style={{ marginTop: 2, color: 'rgba(251, 191, 36, 0.8)' }}>
                                                    {taskRelevance.message}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {taskRelevance && taskRelevance.is_relevant && taskRelevance.message && (
                                        <div style={{
                                            marginBottom: 15, padding: '10px 14px', borderRadius: '8px',
                                            background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                                            color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '8px'
                                        }}>
                                            <CheckCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                                            <div>{taskRelevance.message}</div>
                                        </div>
                                    )}

                                    {/* Quote */}
                                    {algoResult.quote && (
                                        <div className="algo-quote">
                                            💡 {algoResult.quote}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ VOICE AGENT PANEL ═══ */}
                {showVoiceAgent && (
                    <AlgoVoiceAgent
                        isVisible={showVoiceAgent}
                        currentLang={language}
                        algoResult={algoResult}
                        algoInput={algoInput}
                        taskRelevance={taskRelevance}
                        activeTask={activeTask}
                        onClose={() => setShowVoiceAgent(false)}
                        onAlgoDetected={(text) => {
                            setAlgoInput(text);
                            setShowAlgoPanel(true);
                        }}
                        onCodeGenerated={(text) => {
                            setAlgoInput(text);
                            setShowAlgoPanel(true);
                            // Auto-trigger the algo submit
                            setTimeout(() => {
                                const btn = document.querySelector('.algo-submit-btn');
                                if (btn && !btn.disabled) btn.click();
                            }, 600);
                        }}
                    />
                )}
            </div>

            {/* ═══ FOOTER ═══ */}
            <div className="ide-footer">
                <span>SkillGPS IDE • AI Algorithm Instructor • Voice Agent • {LANGUAGES.length} Languages</span>
                <span>Press <kbd>Esc</kbd> to close • <kbd>Ctrl+Enter</kbd> to run • 🎙️ Voice Agent for algorithm explanations</span>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
            {/* ═══ SUBMIT RESULT MODAL ═══ */}
            {showSubmitResult && submitResult && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(4px)',
                    zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'ideFadeIn 0.3s ease'
                }}>
                    <div style={{
                        width: '450px', maxWidth: '90%', background: '#12151f',
                        borderRadius: '16px', border: `1px solid ${submitResult.passed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                        padding: '24px', position: 'relative',
                        boxShadow: `0 10px 40px ${submitResult.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`
                    }}>
                        <button
                            onClick={() => setShowSubmitResult(false)}
                            style={{
                                position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
                                color: '#888', cursor: 'pointer', padding: 4
                            }}>
                            <X size={20} />
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
                            <div style={{
                                width: 60, height: 60, borderRadius: '50%',
                                background: submitResult.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 16
                            }}>
                                {submitResult.passed
                                    ? <Trophy size={30} color="#10b981" />
                                    : <AlertTriangle size={30} color="#ef4444" />}
                            </div>
                            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#fff' }}>
                                {submitResult.passed ? 'Task Complete!' : 'Not Quite There'}
                            </h2>
                            <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>
                                {submitResult.feedback}
                            </p>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px', marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.85rem' }}>
                                <span style={{ color: '#888' }}>Score:</span>
                                <strong style={{ color: submitResult.score >= 80 ? '#10b981' : (submitResult.score >= 50 ? '#f59e0b' : '#ef4444') }}>
                                    {submitResult.score}/100
                                </strong>
                            </div>

                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 8 }}>Test Cases:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {submitResult.test_results?.map((test, i) => (
                                    <div key={i} style={{
                                        padding: '8px 12px', borderRadius: '6px',
                                        background: test.passed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                        border: `1px solid ${test.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                        display: 'flex', alignItems: 'flex-start', gap: '8px'
                                    }}>
                                        {test.passed
                                            ? <CheckCircle size={14} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                                            : <XCircle size={14} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />}
                                        <div>
                                            <strong style={{ color: '#ddd', fontSize: '0.8rem', display: 'block', marginBottom: 2 }}>
                                                {test.name}
                                            </strong>
                                            <span style={{ color: test.passed ? '#6ee7b7' : '#f87171', fontSize: '0.75rem' }}>
                                                {test.detail}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {submitResult.suggestions && submitResult.suggestions.length > 0 && !submitResult.passed && (
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 8 }}>AI Suggestions:</div>
                                <ul style={{ margin: 0, paddingLeft: 20, color: '#aaa', fontSize: '0.85rem' }}>
                                    {submitResult.suggestions.map((sug, i) => (
                                        <li key={i} style={{ marginBottom: 4 }}>{sug}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={() => setShowSubmitResult(false)}
                            style={{
                                width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                                background: submitResult.passed ? '#10b981' : '#333',
                                color: '#fff', fontWeight: 600, cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}>
                            {submitResult.passed ? 'Continue' : 'Try Again'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IDE;
