/**
 * NLPEngine — Client-Side Natural Language Processing for SkillGPS Voice Assistant
 * ═══════════════════════════════════════════════════════════════════════════════════
 *
 * This engine transforms raw speech into structured intents + entities.
 * It runs entirely in the browser — no API calls, no latency.
 *
 * Pipeline:
 *   1. Normalize    → lowercase, strip punctuation, expand contractions
 *   2. Tokenize     → split into words
 *   3. Remove stops → filter out "the", "a", "please", "can you", etc.
 *   4. Stem         → reduce words to root form ("navigating" → "navig")
 *   5. Expand       → add synonyms ("show" → ["display", "open", "view"])
 *   6. Classify     → score each intent by weighted keyword overlap
 *   7. Extract      → pull out entities (page names, text values, etc.)
 *   8. Resolve      → return { intent, entities, confidence, raw }
 *
 * Example inputs that all map to intent "navigate" with entity { target: "dashboard" }:
 *   • "go to dashboard"
 *   • "take me to the dashboard"
 *   • "can you open the dashboard please"
 *   • "I want to see my dashboard"
 *   • "show me the dashboard page"
 *   • "navigate to dashboard"
 *   • "dashboard please"
 *   • "let's go to the dashboard"
 */

// ═══════════════════════════════════════
//  STOP WORDS — filtered out from input
// ═══════════════════════════════════════
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
    'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than',
    'too', 'very', 'just', 'because', 'as', 'until', 'while',
    'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my',
    'mine', 'we', 'our', 'ours', 'you', 'your', 'yours', 'he', 'him',
    'his', 'she', 'her', 'hers', 'they', 'them', 'their', 'theirs',
    'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
    'if', 'then', 'else', 'when', 'there', 'here', 'am',
    // Polite filler words (important for natural speech)
    'please', 'kindly', 'maybe', 'actually', 'basically', 'literally',
    'like', 'well', 'okay', 'ok', 'so', 'right', 'um', 'uh', 'hmm',
    'yeah', 'yes', 'no', 'hey', 'hi', 'hello', 'thanks', 'thank',
    'let', 'lets', "let's", 'gonna', 'wanna', 'gotta',
    'now', 'currently', 'also', 'already', 'still', 'even', 'bit',
]);

// ═══════════════════════════════════════
//  CONTRACTIONS — expanded before tokenization
// ═══════════════════════════════════════
const CONTRACTIONS = {
    "i'm": "i am", "i'd": "i would", "i'll": "i will", "i've": "i have",
    "you're": "you are", "you'd": "you would", "you'll": "you will", "you've": "you have",
    "he's": "he is", "she's": "she is", "it's": "it is",
    "we're": "we are", "we'd": "we would", "we'll": "we will", "we've": "we have",
    "they're": "they are", "they'd": "they would", "they'll": "they will", "they've": "they have",
    "that's": "that is", "who's": "who is", "what's": "what is", "where's": "where is",
    "there's": "there is", "here's": "here is", "how's": "how is",
    "isn't": "is not", "aren't": "are not", "wasn't": "was not", "weren't": "were not",
    "hasn't": "has not", "haven't": "have not", "hadn't": "had not",
    "doesn't": "does not", "don't": "do not", "didn't": "did not",
    "won't": "will not", "wouldn't": "would not", "couldn't": "could not",
    "shouldn't": "should not", "can't": "can not", "cannot": "can not",
    "let's": "let us",
};

// ═══════════════════════════════════════
//  SYNONYMS — for semantic expansion
// ═══════════════════════════════════════
const SYNONYM_GROUPS = [
    // Navigation verbs
    ['go', 'navigate', 'move', 'take', 'bring', 'switch', 'change', 'head', 'jump', 'travel', 'proceed', 'redirect', 'route', 'transfer', 'visit'],
    ['open', 'show', 'display', 'view', 'see', 'reveal', 'present', 'load', 'pull', 'bring', 'access', 'launch', 'look', 'check', 'get'],
    ['close', 'hide', 'dismiss', 'remove', 'shut', 'collapse', 'minimize', 'exit', 'leave'],
    ['click', 'press', 'tap', 'hit', 'push', 'select', 'activate', 'trigger'],
    ['type', 'write', 'enter', 'input', 'fill', 'put', 'insert', 'add', 'set', 'compose'],
    ['scroll', 'move', 'slide', 'pan', 'swipe', 'drag'],
    ['stop', 'pause', 'halt', 'cease', 'end', 'quit', 'mute', 'silence', 'hush', 'quiet', 'shut'],
    ['start', 'begin', 'activate', 'enable', 'turn', 'launch', 'initiate', 'run', 'fire', 'kick'],
    ['delete', 'remove', 'clear', 'erase', 'wipe', 'reset', 'empty', 'clean'],
    ['read', 'tell', 'say', 'speak', 'announce', 'describe', 'narrate', 'recite', 'articulate'],
    ['help', 'assist', 'support', 'guide', 'instructions', 'commands', 'options', 'what', 'how'],
    ['repeat', 'again', 'replay', 'redo', 'once'],
    ['back', 'previous', 'return', 'backward', 'reverse', 'prior', 'last'],
    ['next', 'forward', 'ahead', 'continue', 'subsequent', 'following'],
    ['up', 'above', 'higher', 'top', 'upper', 'upward', 'upwards', 'ascending'],
    ['down', 'below', 'lower', 'bottom', 'beneath', 'downward', 'downwards', 'descending'],
    ['fast', 'quick', 'faster', 'rapid', 'speed', 'quicker', 'increase'],
    ['slow', 'slower', 'decrease', 'reduce'],
    ['logout', 'signout', 'logoff', 'signoff'],
    ['login', 'signin', 'authenticate', 'log'],
    ['refresh', 'reload', 'update', 'renew', 'reset'],
    ['save', 'store', 'keep', 'preserve', 'submit', 'apply', 'confirm'],
    ['code', 'coding', 'program', 'programming', 'develop', 'script', 'write'],
    ['run', 'execute', 'compile', 'build', 'launch', 'test'],
];

// Build a fast lookup: word → set of synonyms
const SYNONYM_MAP = new Map();
for (const group of SYNONYM_GROUPS) {
    for (const word of group) {
        if (!SYNONYM_MAP.has(word)) SYNONYM_MAP.set(word, new Set());
        for (const syn of group) {
            if (syn !== word) SYNONYM_MAP.get(word).add(syn);
        }
    }
}

// ═══════════════════════════════════════
//  ENTITY DEFINITIONS — recognizable targets
// ═══════════════════════════════════════
const PAGE_ENTITIES = {
    // value → list of recognized forms
    'dashboard': ['dashboard', 'dash', 'main', 'home page', 'main page', 'control panel'],
    'landing': ['landing', 'home', 'front', 'homepage', 'front page', 'welcome', 'main page', 'start page'],
    'auth': ['login', 'log in', 'sign in', 'signin', 'authenticate', 'auth', 'register', 'signup', 'sign up', 'account'],
    'overview': ['overview', 'summary', 'main view', 'general', 'main tab'],
    'profile': ['profile', 'my profile', 'account', 'user', 'settings', 'my account', 'personal', 'my info'],
    'ide': ['ide', 'editor', 'code', 'code editor', 'coding', 'playground', 'workspace', 'tasks', 'terminal', 'console', 'develop'],
    'resume': ['resume', 'cv', 'resume builder', 'curriculum', 'resume maker', 'ai resume', 'document'],
    'progress': ['progress', 'stats', 'statistics', 'analytics', 'tracking', 'performance', 'report', 'growth', 'achievements'],
    'path': ['learning path', 'path', 'learning', 'roadmap', 'curriculum', 'course', 'courses', 'plan', 'learning plan', 'study', 'study plan', 'syllabus', 'modules'],
};

const DIRECTION_ENTITIES = {
    'up': ['up', 'upward', 'upwards', 'above', 'higher', 'top', 'upper', 'ascending'],
    'down': ['down', 'downward', 'downwards', 'below', 'lower', 'bottom', 'beneath', 'descending'],
    'top': ['top', 'beginning', 'start', 'very top', 'page top', 'first'],
    'bottom': ['bottom', 'end', 'page bottom', 'very bottom', 'last', 'footer'],
};

const SPEED_ENTITIES = {
    'faster': ['faster', 'fast', 'quick', 'quicker', 'speed up', 'increase', 'rapid'],
    'slower': ['slower', 'slow', 'decrease', 'reduce', 'slow down'],
};

// ═══════════════════════════════════════
//  INTENT DEFINITIONS
// ═══════════════════════════════════════
const INTENTS = [
    {
        id: 'greet',
        keywords: ['hello', 'hi', 'hey', 'greet', 'howdy', 'sup', 'morning', 'evening', 'afternoon', 'good'],
        weight: 0.5,
        description: 'Greeting the assistant',
        examples: ['hello', 'hi there', 'good morning', 'hey'],
    },
    {
        id: 'navigate',
        keywords: ['go', 'navigate', 'open', 'show', 'take', 'switch', 'move', 'bring', 'see', 'view', 'display', 'load', 'visit', 'access', 'jump', 'head', 'look', 'check', 'get', 'want', 'need', 'launch', 'pull'],
        weight: 1.0, // Higher weight — navigation is the most common action
        entityType: 'page',
        description: 'Navigate to a page or tab',
        examples: ['take me to dashboard', 'can you show my profile', 'I want to see my learning path', 'open the IDE'],
    },
    {
        id: 'scroll',
        keywords: ['scroll', 'move', 'slide', 'pan', 'page', 'swipe'],
        weight: 0.9,
        entityType: 'direction',
        description: 'Scroll the page',
        examples: ['scroll down', 'go to the top', 'take me to the bottom', 'move up a bit'],
    },
    {
        id: 'scroll_more',
        keywords: ['more', 'keep', 'continue', 'further', 'lot'],
        weight: 0.6,
        requireIntent: 'scroll', // Only if scroll context is also present
        entityType: 'direction',
        description: 'Scroll more',
        examples: ['scroll down more', 'keep scrolling', 'a little more'],
    },
    {
        id: 'click',
        keywords: ['click', 'press', 'tap', 'hit', 'push', 'trigger', 'activate', 'button'],
        weight: 0.9,
        entityType: 'text',
        description: 'Click a button or element',
        examples: ['click the save button', 'press submit', 'tap on login', 'hit the next button'],
    },
    {
        id: 'type_text',
        keywords: ['type', 'write', 'enter', 'input', 'fill', 'put', 'insert', 'compose', 'text', 'spell'],
        weight: 0.9,
        entityType: 'text',
        description: 'Type text into focused field',
        examples: ['type John Doe', 'write hello world', 'enter my email address', 'fill in Python'],
    },
    {
        id: 'clear_field',
        keywords: ['clear', 'erase', 'wipe', 'empty', 'reset', 'delete', 'remove', 'clean', 'blank'],
        secondaryKeywords: ['field', 'input', 'text', 'box', 'area', 'form', 'content'],
        weight: 0.7,
        description: 'Clear the current input field',
        examples: ['clear the field', 'erase the input', 'wipe the text', 'clear this'],
    },
    {
        id: 'select_option',
        keywords: ['select', 'choose', 'pick', 'option', 'dropdown'],
        weight: 0.8,
        entityType: 'text',
        description: 'Select a dropdown option',
        examples: ['select Beginner', 'choose Advanced', 'pick the first option'],
    },
    {
        id: 'focus_next',
        keywords: ['next', 'forward', 'tab', 'following'],
        secondaryKeywords: ['field', 'input', 'box', 'element', 'item', 'section'],
        weight: 0.7,
        description: 'Move to next input field',
        examples: ['next field', 'go to the next input', 'tab forward', 'move to next'],
    },
    {
        id: 'focus_prev',
        keywords: ['previous', 'back', 'prior', 'last', 'backward', 'before'],
        secondaryKeywords: ['field', 'input', 'box', 'element', 'item', 'section'],
        weight: 0.7,
        description: 'Move to previous input field',
        examples: ['previous field', 'go back to the last input', 'previous input'],
    },
    {
        id: 'start_coding',
        keywords: ['start', 'begin', 'enable', 'activate', 'enter', 'switch', 'turn', 'initiate'],
        secondaryKeywords: ['coding', 'code', 'programming', 'program', 'develop', 'development', 'script', 'writing'],
        weight: 0.85,
        description: 'Enable coding/dictation mode',
        examples: ['start coding', 'enable coding mode', 'I want to write code', 'switch to coding'],
    },
    {
        id: 'stop_coding',
        keywords: ['stop', 'end', 'disable', 'exit', 'leave', 'quit', 'finish', 'turn', 'switch'],
        secondaryKeywords: ['coding', 'code', 'programming', 'program', 'navigation', 'normal', 'voice'],
        weight: 0.85,
        description: 'Return to navigation mode',
        examples: ['stop coding', 'go back to navigation', 'exit coding mode', 'switch to voice mode'],
    },
    {
        id: 'run_code',
        keywords: ['run', 'execute', 'compile', 'build', 'test', 'launch'],
        secondaryKeywords: ['code', 'program', 'script', 'project', 'file'],
        weight: 0.8,
        description: 'Run / execute code',
        examples: ['run the code', 'execute this program', 'compile and run', 'test my code'],
    },
    {
        id: 'undo',
        keywords: ['undo', 'revert', 'reverse', 'back', 'cancel'],
        secondaryKeywords: ['last', 'action', 'change', 'step', 'that'],
        weight: 0.7,
        description: 'Undo last action',
        examples: ['undo', 'undo that', 'revert the last change', 'go back one step'],
    },
    {
        id: 'redo',
        keywords: ['redo', 'redo'],
        secondaryKeywords: ['last', 'action', 'change', 'step', 'that'],
        weight: 0.7,
        description: 'Redo last action',
        examples: ['redo', 'redo that'],
    },
    {
        id: 'new_line',
        keywords: ['new', 'newline', 'line', 'enter', 'break'],
        secondaryKeywords: ['line', 'new', 'next', 'blank'],
        weight: 0.6,
        description: 'Insert new line (coding mode)',
        examples: ['new line', 'add a new line', 'line break', 'enter'],
    },
    {
        id: 'help',
        keywords: ['help', 'assist', 'support', 'guide', 'instructions', 'commands', 'options', 'available', 'list', 'abilities', 'capabilities', 'features'],
        weight: 0.8,
        description: 'Show help / available commands',
        examples: ['help', 'what can you do', 'show me the commands', 'I need help', 'what are the options'],
    },
    {
        id: 'close_help',
        keywords: ['close', 'hide', 'dismiss', 'remove', 'shut'],
        secondaryKeywords: ['help', 'panel', 'commands', 'menu', 'list', 'options'],
        weight: 0.75,
        description: 'Close help panel',
        examples: ['close help', 'hide the commands', 'dismiss the panel'],
    },
    {
        id: 'logout',
        keywords: ['logout', 'log', 'sign', 'signout', 'leave', 'exit', 'bye', 'goodbye'],
        secondaryKeywords: ['out', 'off', 'account', 'session'],
        weight: 0.8,
        description: 'Log out of the application',
        examples: ['log me out', 'sign out', 'I want to leave', 'logout please', 'goodbye'],
    },
    {
        id: 'go_back',
        keywords: ['back', 'return', 'previous', 'backward', 'last'],
        secondaryKeywords: ['page', 'view', 'screen', 'go'],
        weight: 0.6,
        description: 'Go to previous page',
        examples: ['go back', 'return to the previous page', 'take me back'],
    },
    {
        id: 'refresh',
        keywords: ['refresh', 'reload', 'restart', 'renew', 'update'],
        secondaryKeywords: ['page', 'screen', 'app', 'application', 'site'],
        weight: 0.7,
        description: 'Refresh the page',
        examples: ['refresh the page', 'reload', 'restart the app'],
    },
    {
        id: 'stop_voice',
        keywords: ['stop', 'pause', 'halt', 'mute', 'silence', 'quiet', 'shut', 'hush', 'disable', 'off', 'deactivate'],
        secondaryKeywords: ['listening', 'voice', 'assistant', 'microphone', 'mic', 'recognition', 'hearing', 'recording'],
        weight: 0.9,
        description: 'Stop the voice assistant',
        examples: ['stop listening', 'pause the assistant', 'mute the mic', 'be quiet please', 'shut up'],
    },
    {
        id: 'repeat',
        keywords: ['repeat', 'again', 'replay', 'say', 'tell'],
        secondaryKeywords: ['that', 'again', 'last', 'once', 'more', 'what', 'said'],
        weight: 0.7,
        description: 'Repeat last response',
        examples: ['repeat that', 'say that again', 'what did you say', 'tell me again'],
    },
    {
        id: 'speak_speed',
        keywords: ['speak', 'talk', 'voice', 'speech', 'speed'],
        entityType: 'speed',
        weight: 0.6,
        description: 'Change speech speed',
        examples: ['speak faster', 'talk slower', 'speed up', 'slow down your voice'],
    },
    {
        id: 'read_page',
        keywords: ['read', 'tell', 'describe', 'narrate', 'what', 'announce', 'recite'],
        secondaryKeywords: ['page', 'screen', 'content', 'text', 'see', 'showing', 'displayed', 'visible', 'here', 'written'],
        weight: 0.75,
        description: 'Read aloud page content',
        examples: ['read the page', 'what is on the screen', 'tell me what you see', 'describe the content'],
    },
    {
        id: 'read_heading',
        keywords: ['read', 'tell', 'what'],
        secondaryKeywords: ['heading', 'title', 'header', 'name', 'headline'],
        weight: 0.7,
        description: 'Read the page heading',
        examples: ['read the heading', 'what is the title', 'tell me the heading'],
    },
    {
        id: 'status',
        keywords: ['status', 'who', 'what', 'are', 'about', 'introduce', 'yourself', 'abilities'],
        secondaryKeywords: ['you', 'yourself', 'are', 'do', 'can', 'capabilities'],
        weight: 0.5,
        description: 'Ask about assistant status/capabilities',
        examples: ['what can you do', 'who are you', 'tell me about yourself', 'what are your abilities'],
    },
    {
        id: 'save',
        keywords: ['save', 'store', 'keep', 'preserve', 'submit', 'apply', 'confirm', 'done', 'finish'],
        weight: 0.7,
        description: 'Save / submit current form or data',
        examples: ['save this', 'submit the form', 'I am done', 'apply changes'],
    },
    {
        id: 'get_started',
        keywords: ['start', 'begin', 'get', 'started', 'onboard', 'setup', 'join'],
        secondaryKeywords: ['started', 'now', 'begin', 'journey', 'learning'],
        weight: 0.6,
        description: 'Get started / begin onboarding',
        examples: ['get started', 'let us begin', 'start my journey', 'I want to start'],
    },
];

// ═══════════════════════════════════════
//  PORTER STEMMER (Simplified)
// ═══════════════════════════════════════

function stem(word) {
    if (word.length < 4) return word;
    let w = word;

    // Step 1: common suffixes
    const suffixes = [
        ['ational', 'ate'], ['tional', 'tion'], ['enci', 'ence'], ['anci', 'ance'],
        ['izer', 'ize'], ['ously', 'ous'], ['iveness', 'ive'], ['fulness', 'ful'],
        ['alli', 'al'], ['ment', ''], ['ible', ''], ['able', ''],
        ['ings', ''], ['ing', ''], ['tion', ''], ['sion', ''],
        ['ness', ''], ['ment', ''], ['ence', ''], ['ance', ''],
        ['ated', 'ate'], ['ized', 'ize'],
        ['ies', 'y'], ['ical', 'ic'], ['ful', ''], ['ous', ''],
        ['ive', ''], ['ize', ''], ['ise', ''], ['ally', ''],
        ['ly', ''], ['ed', ''], ['er', ''], ['es', ''], ['s', ''],
    ];

    for (const [suffix, replacement] of suffixes) {
        if (w.endsWith(suffix) && w.length - suffix.length + replacement.length >= 3) {
            w = w.slice(0, -suffix.length) + replacement;
            break;
        }
    }

    return w;
}

// ═══════════════════════════════════════
//  NLP ENGINE CLASS
// ═══════════════════════════════════════

import { getIntentKeywords, getPageEntities, getDirectionEntities } from './LanguagePack.js';

export class NLPEngine {
    constructor() {
        this.intents = INTENTS;
        this.pageEntities = { ...PAGE_ENTITIES };
        this.directionEntities = { ...DIRECTION_ENTITIES };
        this.speedEntities = SPEED_ENTITIES;
        this.minConfidence = 0.25;
        this.lastIntent = null;
        this.currentLang = 'en-US';
        this._langKeywords = {}; // extra keywords from LanguagePack
    }

    /**
     * Switch the active language — merges translated keywords into scoring.
     */
    setLanguage(langCode) {
        this.currentLang = langCode;
        this._langKeywords = getIntentKeywords(langCode);

        // Merge page entities for this language
        const extraPages = getPageEntities(langCode);
        this.pageEntities = { ...PAGE_ENTITIES };
        for (const [pageId, aliases] of Object.entries(extraPages)) {
            if (this.pageEntities[pageId]) {
                this.pageEntities[pageId] = [...PAGE_ENTITIES[pageId], ...aliases];
            } else {
                this.pageEntities[pageId] = aliases;
            }
        }

        // Merge direction entities
        const extraDirs = getDirectionEntities(langCode);
        this.directionEntities = { ...DIRECTION_ENTITIES };
        for (const [dirId, aliases] of Object.entries(extraDirs)) {
            if (this.directionEntities[dirId]) {
                this.directionEntities[dirId] = [...DIRECTION_ENTITIES[dirId], ...aliases];
            } else {
                this.directionEntities[dirId] = aliases;
            }
        }
    }

    /**
     * Main processing pipeline.
     * @param {string} rawText — The raw speech transcript
     * @returns {{ intent: string|null, entities: object, confidence: number, raw: string, tokens: string[] }}
     */
    process(rawText) {
        const raw = rawText.trim();
        if (!raw) return { intent: null, entities: {}, confidence: 0, raw, tokens: [] };

        // 1. Normalize
        let normalized = this._normalize(raw);

        // 2. Expand contractions
        normalized = this._expandContractions(normalized);

        // 3. Tokenize
        const allTokens = normalized.split(/\s+/).filter(Boolean);

        // 4. Remove stop words (but keep a copy of full tokens for entity extraction)
        const meaningfulTokens = allTokens.filter(t => !STOP_WORDS.has(t));

        // 5. Stem the meaningful tokens
        const stemmedTokens = meaningfulTokens.map(stem);

        // 6. Expand via synonyms
        const expandedTokenSet = new Set([...meaningfulTokens, ...stemmedTokens]);
        for (const token of meaningfulTokens) {
            const syns = SYNONYM_MAP.get(token);
            if (syns) {
                for (const syn of syns) expandedTokenSet.add(syn);
            }
        }

        // 7. Score each intent
        const scores = this._scoreIntents(meaningfulTokens, stemmedTokens, expandedTokenSet, allTokens, raw);

        // 8. Sort by score descending
        scores.sort((a, b) => b.score - a.score);

        const topScore = scores[0];

        // 9. Apply minimum confidence threshold
        if (!topScore || topScore.score < this.minConfidence) {
            // Check if this could be a direct page name utterance (e.g., just "dashboard")
            const directPageMatch = this._extractPageEntity(allTokens);
            if (directPageMatch) {
                this.lastIntent = 'navigate';
                return {
                    intent: 'navigate',
                    entities: { target: directPageMatch },
                    confidence: 0.6,
                    raw,
                    tokens: meaningfulTokens,
                };
            }

            return { intent: null, entities: {}, confidence: topScore?.score || 0, raw, tokens: meaningfulTokens };
        }

        // 10. Extract entities for the winning intent
        const entities = this._extractEntities(topScore.intentDef, allTokens, meaningfulTokens, raw);

        // 11. Store context for followups
        this.lastIntent = topScore.intentDef.id;

        return {
            intent: topScore.intentDef.id,
            entities,
            confidence: Math.min(topScore.score, 1.0),
            raw,
            tokens: meaningfulTokens,
        };
    }

    // ── Normalization ──
    _normalize(text) {
        return text
            .toLowerCase()
            .replace(/[.,!?;:'"()\[\]{}\-–—…]+/g, ' ')  // Strip punctuation
            .replace(/\s+/g, ' ')                        // Collapse whitespace
            .trim();
    }

    // ── Contraction expansion ──
    _expandContractions(text) {
        let result = text;
        for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
            result = result.replace(new RegExp(`\\b${contraction.replace("'", "'")}\\b`, 'gi'), expansion);
        }
        return result;
    }

    // ── Intent scoring ──
    _scoreIntents(tokens, stemmedTokens, expandedSet, allTokens, rawText) {
        return this.intents.map(intent => {
            let score = 0;
            let matchCount = 0;
            const totalKeywords = intent.keywords.length;

            // Primary keyword matches
            for (const kw of intent.keywords) {
                const kwStem = stem(kw);

                // Direct token match (highest value)
                if (tokens.includes(kw)) {
                    score += 1.0 * intent.weight;
                    matchCount++;
                }
                // Stemmed match
                else if (stemmedTokens.includes(kwStem)) {
                    score += 0.85 * intent.weight;
                    matchCount++;
                }
                // Synonym expansion match
                else if (expandedSet.has(kw)) {
                    score += 0.7 * intent.weight;
                    matchCount++;
                }
                // Substring match in raw text
                else if (rawText.includes(kw)) {
                    score += 0.5 * intent.weight;
                    matchCount++;
                }
            }

            // Secondary keyword bonus
            if (intent.secondaryKeywords) {
                let secondaryMatches = 0;
                for (const skw of intent.secondaryKeywords) {
                    if (tokens.includes(skw) || stemmedTokens.includes(stem(skw)) || expandedSet.has(skw) || rawText.includes(skw)) {
                        secondaryMatches++;
                    }
                }
                if (secondaryMatches > 0) {
                    score += secondaryMatches * 0.4 * intent.weight;
                    matchCount += secondaryMatches;
                }
            }

            // Entity presence bonus — if intent expects a page entity and one is found, boost score
            if (intent.entityType === 'page') {
                const pageMatch = this._extractPageEntity(allTokens);
                if (pageMatch) score += 0.5;
            }

            if (intent.entityType === 'direction') {
                const dirMatch = this._extractDirectionEntity(allTokens);
                if (dirMatch) score += 0.5;
            }

            // Language-specific keyword bonus (for non-English languages)
            const langKws = this._langKeywords[intent.id];
            if (langKws && langKws.length > 0) {
                let langMatches = 0;
                for (const lkw of langKws) {
                    if (tokens.includes(lkw) || rawText.includes(lkw)) {
                        langMatches++;
                    }
                }
                if (langMatches > 0) {
                    score += langMatches * 1.2 * intent.weight; // Strong boost for native-language match
                    matchCount += langMatches;
                }
            }

            // Normalize: ratio of matched keywords
            const ratio = matchCount / (totalKeywords + (intent.secondaryKeywords?.length || 0));
            score = score * (0.5 + 0.5 * ratio); // Blend absolute score with coverage ratio

            return { intentDef: intent, score, matchCount };
        });
    }

    // ── Entity extraction ──
    _extractEntities(intentDef, allTokens, tokens, rawText) {
        const entities = {};

        if (intentDef.entityType === 'page' || intentDef.id === 'navigate') {
            const page = this._extractPageEntity(allTokens);
            if (page) entities.target = page;
        }

        if (intentDef.entityType === 'direction' || intentDef.id === 'scroll' || intentDef.id === 'scroll_more') {
            const dir = this._extractDirectionEntity(allTokens);
            if (dir) entities.direction = dir;
        }

        if (intentDef.entityType === 'speed' || intentDef.id === 'speak_speed') {
            const speed = this._extractSpeedEntity(allTokens);
            if (speed) entities.speed = speed;
        }

        if (intentDef.entityType === 'text' || ['type_text', 'click', 'select_option'].includes(intentDef.id)) {
            const text = this._extractTextEntity(intentDef, allTokens, rawText);
            if (text) entities.text = text;
        }

        return entities;
    }

    _extractPageEntity(tokens) {
        // Check multi-word entities first (e.g., "learning path")
        const joined = tokens.join(' ');
        for (const [pageId, aliases] of Object.entries(this.pageEntities)) {
            for (const alias of aliases) {
                if (alias.includes(' ')) {
                    if (joined.includes(alias)) return pageId;
                }
            }
        }
        // Then single-word
        for (const [pageId, aliases] of Object.entries(this.pageEntities)) {
            for (const alias of aliases) {
                if (!alias.includes(' ') && tokens.includes(alias)) return pageId;
            }
        }
        return null;
    }

    _extractDirectionEntity(tokens) {
        const joined = tokens.join(' ');
        for (const [dirId, aliases] of Object.entries(this.directionEntities)) {
            for (const alias of aliases) {
                if (tokens.includes(alias) || joined.includes(alias)) return dirId;
            }
        }
        return null;
    }

    _extractSpeedEntity(tokens) {
        for (const [speedId, aliases] of Object.entries(this.speedEntities)) {
            for (const alias of aliases) {
                if (tokens.includes(alias)) return speedId;
            }
        }
        return null;
    }

    _extractTextEntity(intentDef, allTokens, rawText) {
        // For commands like "type hello world" or "click the save button",
        // extract everything after the action verb
        const actionVerbs = intentDef.keywords;
        const lower = rawText.toLowerCase();

        for (const verb of actionVerbs) {
            const idx = lower.indexOf(verb);
            if (idx !== -1) {
                let remainder = lower.slice(idx + verb.length).trim();
                // Remove common filler words from start
                remainder = remainder.replace(/^(the|a|an|my|this|that|on|in|into)\s+/gi, '').trim();
                // Remove "button" suffix for click commands
                if (intentDef.id === 'click') {
                    remainder = remainder.replace(/\s*(button|btn|link|tab|option)$/gi, '').trim();
                }
                if (remainder) return remainder;
            }
        }

        // Fallback: return non-keyword tokens joined
        const kwAll = new Set([...actionVerbs, ...(intentDef.secondaryKeywords || [])]);
        const remaining = allTokens.filter(t => !kwAll.has(t) && !STOP_WORDS.has(t));
        return remaining.join(' ') || null;
    }

    /**
     * Get all available intent descriptions for help UI
     */
    getIntentDescriptions() {
        return this.intents.map(i => ({
            id: i.id,
            description: i.description,
            examples: i.examples || [],
            category: this._categorizeIntent(i.id),
        }));
    }

    _categorizeIntent(id) {
        const cats = {
            greet: 'General', status: 'General', help: 'General', close_help: 'General',
            navigate: 'Navigation', go_back: 'Navigation', get_started: 'Navigation',
            scroll: 'Scrolling', scroll_more: 'Scrolling',
            click: 'Interaction', type_text: 'Interaction', clear_field: 'Interaction',
            select_option: 'Interaction', focus_next: 'Interaction', focus_prev: 'Interaction', save: 'Interaction',
            start_coding: 'Coding', stop_coding: 'Coding', run_code: 'Coding',
            undo: 'Coding', redo: 'Coding', new_line: 'Coding',
            logout: 'Actions', refresh: 'Actions',
            stop_voice: 'Voice Control', repeat: 'Voice Control', speak_speed: 'Voice Control',
            read_page: 'Accessibility', read_heading: 'Accessibility',
        };
        return cats[id] || 'General';
    }
}
