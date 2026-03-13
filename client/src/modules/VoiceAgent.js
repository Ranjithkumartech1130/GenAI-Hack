/**
 * VoiceAgent — NLP-Powered Hands-Free Voice Assistant for SkillGPS
 * ═════════════════════════════════════════════════════════════════
 *
 * This voice assistant uses a built-in NLP engine for natural language
 * understanding. Users speak naturally — no memorizing exact commands.
 *
 * Examples of what users can say:
 *   • "Can you take me to the dashboard?"
 *   • "I'd like to see my learning path please"
 *   • "Show me the profile section"
 *   • "Scroll down a little bit"
 *   • "Could you read what's on the screen?"
 *   • "Type hello world in the input"
 *   • "I want to start coding"
 *
 * Architecture:
 *   Speech → SpeechRecognition API → NLP Engine → Intent + Entities → Action → TTS Response
 */

import { NLPEngine } from './NLPEngine.js';
import { SUPPORTED_LANGUAGES, LANGUAGE_SWITCH_TRIGGERS, getResponses } from './LanguagePack.js';

export class VoiceAgent {
    constructor() {
        // ── NLP Engine ──
        this.nlp = new NLPEngine();

        // ── Language ──
        this.currentLang = 'en-US';
        this.supportedLanguages = SUPPORTED_LANGUAGES;
        this.localizedResponses = getResponses('en-US');

        // ── External hooks ──
        this.editor = null;
        this.onNavigate = null;
        this.onStateChange = null;
        this.onEditorAction = null;

        // ── Speech systems ──
        this.recognition = null;
        this.synth = window.speechSynthesis || null;
        this.selectedVoice = null;
        this._ttsRate = 1.05;

        // ── State ──
        this.isListening = false;
        this.shouldBeListening = false;
        this.isSpeaking = false;
        this.mode = 'navigation'; // 'navigation' | 'coding'
        this.lastSpoken = '';
        this.commandHistory = [];

        // ── UI state ──
        this.transcript = '';
        this.feedbackMessage = '';
        this.detectedIntent = '';
        this.confidence = 0;
        this.showHelp = false;
        this.commandList = [];

        // ── Personality — natural conversational responses ──
        this.personality = {
            greet: [
                "Hello! I'm your SkillGPS assistant. Just tell me what you need!",
                "Hi there! How can I help you today?",
                "Welcome! I'm here to help. What would you like to do?",
                "Hey! Ready to assist you. Just speak naturally!",
            ],
            confirm: [
                "Done!", "Got it!", "Right away!", "On it!", "Sure thing!", "Absolutely!",
            ],
            nav: [
                "Navigating to", "Opening", "Taking you to", "Switching to", "Loading",
            ],
            understood: [
                "Understood.", "Sure!", "Of course!", "No problem!", "Consider it done!",
            ],
            error: [
                "I didn't quite catch that. Could you try saying it differently?",
                "Hmm, I'm not sure what you mean. You can say things like 'go to dashboard' or 'scroll down'.",
                "Sorry, I couldn't understand that. Try speaking more naturally — I understand full sentences!",
                "I didn't get that. Say 'help' to see what I can do for you!",
            ],
            farewell: [
                "Voice assistant paused. Click the mic button or say 'Hey SkillGPS' to activate me again.",
                "Going quiet now. Tap the mic whenever you need me!",
            ],
        };

        // Initialize systems
        this._initRecognition();
        this._initVoices();
        this._buildCommandList();
    }

    // ═══════════════════════════════════════
    //  PUBLIC API
    // ═══════════════════════════════════════

    setNavigationCallback(cb) { this.onNavigate = cb; }
    setStateCallback(cb) { this.onStateChange = cb; }
    setEditorCallback(cb) { this.onEditorAction = cb; }

    /**
     * Switch language — updates recognition, TTS voice, NLP keywords, responses.
     */
    switchLanguage(langCode) {
        if (!SUPPORTED_LANGUAGES[langCode]) return;
        this.currentLang = langCode;
        this.localizedResponses = getResponses(langCode);
        this.nlp.setLanguage(langCode);

        // Update speech recognition language
        if (this.recognition) {
            const wasListening = this.isListening || this.shouldBeListening;
            if (wasListening) {
                try { this.recognition.stop(); } catch (e) { /* */ }
            }
            this.recognition.lang = langCode;
            if (wasListening) {
                setTimeout(() => {
                    try { this.recognition.start(); } catch (e) { /* */ }
                }, 300);
            }
        }

        // Select TTS voice for this language
        this._selectVoiceForLang(langCode);

        // Rebuild command list
        this._buildCommandList();

        const langInfo = SUPPORTED_LANGUAGES[langCode];
        const langName = langInfo.englishName || langInfo.name;
        this._setFeedback(`🌐 ${langInfo.flag} ${langInfo.name}`);
        this.speak(this.localizedResponses.langSwitch || `Switched to ${langName}.`);
        this._emitState();
    }

    _selectVoiceForLang(langCode) {
        if (!this.synth) return;
        const voices = this.synth.getVoices();
        const langPrefix = langCode.split('-')[0];
        this.selectedVoice =
            voices.find(v => v.lang === langCode) ||
            voices.find(v => v.lang.startsWith(langPrefix) && v.localService) ||
            voices.find(v => v.lang.startsWith(langPrefix)) ||
            voices.find(v => v.lang.startsWith('en') && v.localService) ||
            voices[0];
    }
    setEditor(editorInstance) { this.editor = editorInstance; }

    start() {
        if (!this.recognition) {
            this._emitState({ feedback: 'Voice recognition is not supported in this browser.' });
            return;
        }
        this.shouldBeListening = true;
        try { this.recognition.start(); } catch (e) { /* already started */ }
        this._setFeedback('🎤 Listening — speak naturally!');
        this.speak(this.localizedResponses.activated || "Voice assistant activated. Just speak naturally!");
    }

    stop() {
        this.shouldBeListening = false;
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) { /* */ }
        }
        this._setFeedback('⏸ Assistant paused');
        this.speak(this._pick(this.localizedResponses.farewell || this.personality.farewell));
    }

    toggle() {
        if (this.isListening || this.shouldBeListening) this.stop();
        else this.start();
    }

    getCommandList() {
        return this.commandList;
    }

    // ═══════════════════════════════════════
    //  SPEECH SYNTHESIS (TTS)
    // ═══════════════════════════════════════

    speak(text) {
        if (!this.synth) return;
        this.synth.cancel();
        this.lastSpoken = text;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this._ttsRate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        if (this.selectedVoice) utterance.voice = this.selectedVoice;

        // Pause recognition while speaking to avoid echo
        utterance.onstart = () => {
            this.isSpeaking = true;
            this._emitState();
            if (this.recognition && this.isListening) {
                try { this.recognition.stop(); } catch (e) { /* */ }
            }
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this._emitState();
            if (this.shouldBeListening) {
                setTimeout(() => {
                    try { this.recognition.start(); } catch (e) { /* */ }
                }, 300);
            }
        };

        utterance.onerror = () => {
            this.isSpeaking = false;
            if (this.shouldBeListening) {
                setTimeout(() => {
                    try { this.recognition.start(); } catch (e) { /* */ }
                }, 300);
            }
        };

        this.synth.speak(utterance);
    }

    // ═══════════════════════════════════════
    //  SPEECH RECOGNITION (STT)
    // ═══════════════════════════════════════

    _initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;

        this.recognition.onstart = () => {
            this.isListening = true;
            this._emitState();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this._emitState();
            if (this.shouldBeListening && !this.isSpeaking) {
                setTimeout(() => {
                    try { this.recognition.start(); } catch (e) { /* */ }
                }, 200);
            }
        };

        this.recognition.onerror = (event) => {
            console.warn('[VoiceAgent] Recognition error:', event.error);
            if (event.error === 'not-allowed') {
                this._setFeedback('🚫 Microphone access denied. Please allow mic access in your browser.');
                this.shouldBeListening = false;
            }
            if (['network', 'aborted', 'no-speech'].includes(event.error) && this.shouldBeListening) {
                setTimeout(() => {
                    try { this.recognition.start(); } catch (e) { /* */ }
                }, 500);
            }
        };

        this.recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;
                if (result.isFinal) {
                    this._processWithNLP(transcript);
                } else {
                    interim += transcript;
                }
            }
            if (interim) {
                this.transcript = interim;
                this._emitState();
            }
        };
    }

    _initVoices() {
        if (!this.synth) return;
        const loadVoices = () => {
            const voices = this.synth.getVoices();
            this.selectedVoice =
                voices.find(v => v.name.includes('Google UK English Male')) ||
                voices.find(v => v.name.includes('Google US English')) ||
                voices.find(v => v.name.includes('Microsoft David')) ||
                voices.find(v => v.name.includes('Microsoft Mark')) ||
                voices.find(v => v.lang.startsWith('en') && v.localService) ||
                voices[0];
        };
        loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        }
    }

    // ═══════════════════════════════════════
    //  NLP-POWERED COMMAND PROCESSING
    // ═══════════════════════════════════════

    _processWithNLP(rawTranscript) {
        const text = rawTranscript.trim();
        const textLower = text.toLowerCase();
        console.log(`[VoiceAgent-NLP] Heard (${this.currentLang}): "${text}"`);

        this.transcript = textLower;
        this.commandHistory.push({ text, time: Date.now() });
        if (this.commandHistory.length > 50) this.commandHistory.shift();

        // ── Check for language switch triggers first ──
        for (const [langCode, triggers] of Object.entries(LANGUAGE_SWITCH_TRIGGERS)) {
            for (const trigger of triggers) {
                if (textLower.includes(trigger) || text.includes(trigger)) {
                    if (langCode !== this.currentLang) {
                        this.switchLanguage(langCode);
                        return;
                    }
                }
            }
        }

        // ── Run NLP pipeline ──
        const result = this.nlp.process(text);
        console.log(`[VoiceAgent-NLP] Intent: ${result.intent} (${(result.confidence * 100).toFixed(0)}%)`, result.entities);

        this.detectedIntent = result.intent || '';
        this.confidence = result.confidence;

        // ── Coding mode: if no strong intent, insert as code ──
        if (this.mode === 'coding' && this.editor) {
            if (!result.intent || result.confidence < 0.5) {
                this._insertCode(text);
                this._setFeedback(`💻 Code: "${text}"`);
                this._emitState();
                return;
            }
            if (!['stop_coding', 'run_code', 'undo', 'redo', 'new_line', 'navigate', 'stop_voice', 'help'].includes(result.intent)) {
                this._insertCode(text);
                this._setFeedback(`💻 Code: "${text}"`);
                this._emitState();
                return;
            }
        }

        // ── Dispatch based on detected intent ──
        if (result.intent) {
            this._dispatchIntent(result);
        } else {
            this._setFeedback(`🤔 "${text}" — didn't understand`);
            this.speak(this._pick(this.localizedResponses.error || this.personality.error));
        }

        this._emitState();
    }

    // ═══════════════════════════════════════
    //  INTENT DISPATCHER
    // ═══════════════════════════════════════

    _dispatchIntent(result) {
        const { intent, entities, confidence, raw } = result;

        switch (intent) {
            // ── Greetings ──
            case 'greet':
                this.speak(this._pick(this.localizedResponses.greet || this.personality.greet));
                this._setFeedback('👋 Hello!');
                break;

            case 'status':
                this.speak("I'm your SkillGPS voice assistant powered by natural language processing. I understand full sentences — just tell me what you want! For example, say 'take me to my profile' or 'scroll down'. Say 'help' for all options.");
                this._setFeedback('ℹ️ About the assistant');
                break;

            // ── Help ──
            case 'help':
                this.showHelp = !this.showHelp;
                this._emitState();
                this.speak(
                    "Here's what I can do for you: " +
                    "Navigate anywhere — say things like 'take me to dashboard' or 'show my profile'. " +
                    "Scroll the page — 'scroll down', 'go to top'. " +
                    "Interact with the page — 'click save button', 'type hello', 'next field'. " +
                    "Control the assistant — 'stop listening', 'speak faster'. " +
                    "Read the screen — 'read the page', 'what's on screen'. " +
                    "Just speak naturally. Say 'close help' to hide this."
                );
                this._setFeedback('📖 Help — speak naturally to give commands!');
                break;

            case 'close_help':
                this.showHelp = false;
                this._emitState();
                this.speak("Help panel closed.");
                this._setFeedback('🎤 Listening...');
                break;

            // ── Navigation ──
            case 'navigate': {
                const target = entities.target;
                if (target) {
                    const labels = {
                        dashboard: 'Dashboard', landing: 'Home', auth: 'Login', overview: 'Overview',
                        profile: 'Profile', ide: 'IDE & Tasks', resume: 'Resume Builder',
                        progress: 'Progress', path: 'Learning Path',
                    };
                    const label = labels[target] || target;
                    this.speak(`${this._pick(this.localizedResponses.nav || this.personality.nav)} ${label}.`);
                    this._navigate(target);
                    this._setFeedback(`📍 ${label}`);
                } else {
                    this.speak("Where would you like to go? You can say dashboard, profile, IDE, resume, progress, or learning path.");
                    this._setFeedback('🤔 Where to navigate?');
                }
                break;
            }

            case 'get_started':
                this.speak("Let's get started! Taking you to the login page.");
                this._navigate('auth');
                this._setFeedback('🚀 Getting started');
                break;

            // ── Scrolling ──
            case 'scroll': {
                const dir = entities.direction || 'down';
                if (dir === 'top') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    this._confirmAction('Going to the top');
                } else if (dir === 'bottom') {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    this._confirmAction('Going to the bottom');
                } else if (dir === 'up') {
                    window.scrollBy({ top: -400, behavior: 'smooth' });
                    this._confirmAction('Scrolling up');
                } else {
                    window.scrollBy({ top: 400, behavior: 'smooth' });
                    this._confirmAction('Scrolling down');
                }
                break;
            }

            case 'scroll_more': {
                const dir = entities.direction || 'down';
                const amount = dir === 'up' ? -800 : 800;
                window.scrollBy({ top: amount, behavior: 'smooth' });
                this._confirmAction(`Scrolling ${dir === 'up' ? 'up' : 'down'} more`);
                break;
            }

            // ── Click ──
            case 'click': {
                const target = entities.text;
                if (target) {
                    this._clickByText(target);
                } else {
                    this.speak("What would you like me to click? Say the name of the button.");
                    this._setFeedback('🤔 What to click?');
                }
                break;
            }

            // ── Typing ──
            case 'type_text': {
                const text = entities.text;
                if (text) {
                    this._typeIntoFocused(text);
                } else {
                    this.speak("What would you like me to type?");
                    this._setFeedback('🤔 What to type?');
                }
                break;
            }

            // ── Clear field ──
            case 'clear_field':
                this._clearFocusedInput();
                this._confirmAction('Field cleared');
                break;

            // ── Select option ──
            case 'select_option': {
                const value = entities.text;
                if (value) {
                    this._selectOption(value);
                } else {
                    this.speak("Which option would you like to select?");
                }
                break;
            }

            // ── Focus navigation ──
            case 'focus_next':
                this._focusNextInput();
                break;

            case 'focus_prev':
                this._focusPrevInput();
                break;

            // ── Coding mode ──
            case 'start_coding':
                this.mode = 'coding';
                this._navigate('ide');
                this.speak("Coding mode activated. Everything you say will be typed as code. Say 'stop coding' to switch back to voice commands.");
                this._setFeedback('🖥️ Coding Mode — speech becomes code');
                break;

            case 'stop_coding':
                this.mode = 'navigation';
                this.speak("Back to navigation mode. You can use voice commands normally now.");
                this._setFeedback('🎤 Navigation mode');
                break;

            case 'run_code':
                if (this.onEditorAction) this.onEditorAction('run');
                this._confirmAction('Running your code');
                break;

            case 'undo':
                document.execCommand('undo');
                this._confirmAction('Undone');
                break;

            case 'redo':
                document.execCommand('redo');
                this._confirmAction('Redone');
                break;

            case 'new_line':
                if (this.mode === 'coding') this._insertCode('\n');
                this._confirmAction('New line');
                break;

            // ── Save ──
            case 'save':
                this._clickByText('save');
                break;

            // ── Logout ──
            case 'logout':
                this.speak("Logging you out. Goodbye!");
                setTimeout(() => this._navigate('logout'), 1200);
                this._setFeedback('👋 Logging out...');
                break;

            // ── Go back ──
            case 'go_back':
                window.history.back();
                this._confirmAction('Going back');
                break;

            // ── Refresh ──
            case 'refresh':
                this.speak("Refreshing the page.");
                setTimeout(() => window.location.reload(), 1000);
                break;

            // ── Voice Control ──
            case 'stop_voice':
                this.stop();
                break;

            case 'repeat':
                if (this.lastSpoken) {
                    this.speak(this.lastSpoken);
                } else {
                    this.speak("I haven't said anything yet.");
                }
                this._setFeedback('🔁 Repeating...');
                break;

            case 'speak_speed': {
                const speed = entities.speed;
                if (speed === 'faster') {
                    this._ttsRate = Math.min(this._ttsRate + 0.15, 2.0);
                    this.speak(`Speech rate increased to ${Math.round(this._ttsRate * 100)}%.`);
                } else if (speed === 'slower') {
                    this._ttsRate = Math.max(this._ttsRate - 0.15, 0.5);
                    this.speak(`Speech rate decreased to ${Math.round(this._ttsRate * 100)}%.`);
                } else {
                    this.speak("Say 'faster' or 'slower' to adjust my speech speed.");
                }
                this._setFeedback(`🔊 Speed: ${Math.round(this._ttsRate * 100)}%`);
                break;
            }

            // ── Accessibility ──
            case 'read_page':
                this._readPageContent();
                break;

            case 'read_heading': {
                const h1 = document.querySelector('h1');
                if (h1) {
                    this.speak("The main heading says: " + h1.textContent.trim());
                } else {
                    this.speak("I couldn't find a main heading on this page.");
                }
                break;
            }

            // ── Fallback ──
            default:
                this._setFeedback(`🤔 "${raw}" — not sure what to do`);
                this.speak(this._pick(this.personality.error));
                break;
        }
    }

    // ═══════════════════════════════════════
    //  ACTION HELPERS (unchanged from before)
    // ═══════════════════════════════════════

    _navigate(target) {
        if (this.onNavigate) this.onNavigate(target);
    }

    _confirmAction(msg) {
        this.speak(this._pick(this.localizedResponses.confirm || this.personality.confirm));
        this._setFeedback(`✓ ${msg}`);
    }

    _clickByText(targetText) {
        const lower = targetText.toLowerCase();

        // Try buttons first
        const buttons = document.querySelectorAll('button, [role="button"], a, input[type="submit"]');
        for (const btn of buttons) {
            const btnText = (btn.textContent || btn.value || btn.getAttribute('aria-label') || '').toLowerCase().trim();
            if (btnText.includes(lower) || lower.includes(btnText)) {
                btn.click();
                btn.focus();
                this._confirmAction(`Clicked "${btn.textContent?.trim() || targetText}"`);
                return;
            }
        }

        // Try any clickable element
        const allClickable = document.querySelectorAll('[onclick], [role="button"], .nav-tab, .btn-primary');
        for (const el of allClickable) {
            const elText = (el.textContent || '').toLowerCase().trim();
            if (elText.includes(lower)) {
                el.click();
                this._confirmAction(`Clicked "${el.textContent?.trim()}"`);
                return;
            }
        }

        this.speak(`I couldn't find a button or link called "${targetText}".`);
        this._setFeedback(`❌ Button "${targetText}" not found`);
    }

    _focusNextInput() {
        const inputs = Array.from(document.querySelectorAll(
            'input:not([type="hidden"]), textarea, select, [contenteditable="true"]'
        )).filter(el => !el.disabled && el.offsetParent !== null);

        const current = document.activeElement;
        const idx = inputs.indexOf(current);
        const next = inputs[(idx + 1) % inputs.length];
        if (next) {
            next.focus();
            const label = this._getFieldLabel(next);
            this.speak(`Focused on ${label}`);
            this._setFeedback(`➡️ ${label}`);
        }
    }

    _focusPrevInput() {
        const inputs = Array.from(document.querySelectorAll(
            'input:not([type="hidden"]), textarea, select, [contenteditable="true"]'
        )).filter(el => !el.disabled && el.offsetParent !== null);

        const current = document.activeElement;
        const idx = inputs.indexOf(current);
        const prev = inputs[(idx - 1 + inputs.length) % inputs.length];
        if (prev) {
            prev.focus();
            const label = this._getFieldLabel(prev);
            this.speak(`Focused on ${label}`);
            this._setFeedback(`⬅️ ${label}`);
        }
    }

    _getFieldLabel(el) {
        if (el.id) {
            const label = document.querySelector(`label[for="${el.id}"]`);
            if (label) return label.textContent.trim();
        }
        const parentLabel = el.closest('label');
        if (parentLabel) return parentLabel.textContent.trim();
        const prev = el.previousElementSibling;
        if (prev && prev.tagName === 'LABEL') return prev.textContent.trim();
        const parent = el.closest('.form-group');
        if (parent) {
            const lbl = parent.querySelector('label');
            if (lbl) return lbl.textContent.trim();
        }
        return el.placeholder || el.name || el.type || 'input field';
    }

    _typeIntoFocused(text) {
        const el = document.activeElement;
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 'value'
            )?.set || Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype, 'value'
            )?.set;

            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(el, el.value + text);
            } else {
                el.value += text;
            }
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            this._confirmAction(`Typed "${text}"`);
        } else {
            this.speak("No input field is focused. Say 'next field' to focus one first.");
            this._setFeedback('❌ No field focused');
        }
    }

    _clearFocusedInput() {
        const el = document.activeElement;
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 'value'
            )?.set;
            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(el, '');
            } else {
                el.value = '';
            }
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    _selectOption(value) {
        const el = document.activeElement;
        if (el && el.tagName === 'SELECT') {
            const options = Array.from(el.options);
            const match = options.find(o => o.textContent.toLowerCase().includes(value.toLowerCase()));
            if (match) {
                el.value = match.value;
                el.dispatchEvent(new Event('change', { bubbles: true }));
                this._confirmAction(`Selected "${match.textContent}"`);
            } else {
                this.speak(`Option "${value}" not found in this dropdown.`);
            }
        } else {
            const selects = document.querySelectorAll('select');
            for (const sel of selects) {
                const match = Array.from(sel.options).find(o =>
                    o.textContent.toLowerCase().includes(value.toLowerCase())
                );
                if (match) {
                    sel.value = match.value;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    sel.focus();
                    this._confirmAction(`Selected "${match.textContent}"`);
                    return;
                }
            }
            this.speak("No dropdown found with that option.");
        }
    }

    _insertCode(text) {
        if (!this.editor) return;
        if (this.editor.replaceSelection) {
            this.editor.replaceSelection(text);
        }
    }

    _readPageContent() {
        const main = document.querySelector('.tab-container, .glass-card, .hero-card, main, [role="main"]');
        if (main) {
            const text = main.textContent?.trim().slice(0, 500);
            this.speak("Here's what's on screen: " + text);
        } else {
            const body = document.body.textContent?.trim().slice(0, 400);
            this.speak("Page content: " + body);
        }
        this._setFeedback('📖 Reading page content...');
    }

    // ═══════════════════════════════════════
    //  COMMAND LIST (for help UI)
    // ═══════════════════════════════════════

    _buildCommandList() {
        const intentDescs = this.nlp.getIntentDescriptions();
        this.commandList = intentDescs.map(i => ({
            description: i.description,
            category: i.category,
            example: i.examples?.slice(0, 2).join(' • ') || '',
        }));
    }

    // ═══════════════════════════════════════
    //  UI STATE MANAGEMENT
    // ═══════════════════════════════════════

    _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    _setFeedback(msg) {
        this.feedbackMessage = msg;
        this._emitState();

        clearTimeout(this._feedbackTimer);
        this._feedbackTimer = setTimeout(() => {
            if (this.isListening) {
                this.feedbackMessage = '🎤 Listening — speak naturally!';
                this._emitState();
            }
        }, 5000);
    }

    _emitState(extra = {}) {
        if (this.onStateChange) {
            this.onStateChange({
                isListening: this.isListening,
                shouldBeListening: this.shouldBeListening,
                transcript: this.transcript,
                feedback: this.feedbackMessage,
                mode: this.mode,
                showHelp: this.showHelp,
                commandList: this.commandList,
                isSpeaking: this.isSpeaking,
                detectedIntent: this.detectedIntent,
                confidence: this.confidence,
                currentLang: this.currentLang,
                supportedLanguages: this.supportedLanguages,
                ...extra,
            });
        }
    }
}
