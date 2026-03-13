import React, { useState, useRef } from 'react';
import { Zap, Layers, Map, BookOpen, FileText, Image as ImageIcon, ExternalLink, Globe, GraduationCap, Target, Wrench, ChevronDown, ChevronUp, Sparkles, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { marked } from 'marked';
import api from '../../services/api';

// Configure marked to open links in new tab
marked.setOptions({
    breaks: true,
    gfm: true
});
const renderer = new marked.Renderer();
renderer.link = function (href, title, text) {
    const url = typeof href === 'object' ? href.href : href;
    const label = typeof href === 'object' ? href.text : text;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="curriculum-link">${label}</a>`;
};
marked.use({ renderer });

// Open source course links based on search goal
const getOpenSourceLinks = (searchGoal) => {
    if (!searchGoal) return [];
    const g = searchGoal.toLowerCase();
    const links = [];

    // Always include these universal platforms
    links.push(
        { name: 'freeCodeCamp', url: `https://www.freecodecamp.org/learn/`, desc: 'Free coding bootcamp with certifications', color: '#0a0a23', icon: '💻' },
        { name: 'MIT OpenCourseWare', url: `https://ocw.mit.edu/search/?q=${encodeURIComponent(searchGoal)}`, desc: 'Free MIT courses & materials', color: '#a31f34', icon: '🏛️' },
    );

    if (g.includes('python') || g.includes('data') || g.includes('machine learning') || g.includes('ml') || g.includes('ai') || g.includes('artificial')) {
        links.push(
            { name: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', desc: 'Free micro-courses for Data Science & ML', color: '#20beff', icon: '📊' },
            { name: 'Fast.ai', url: 'https://www.fast.ai/', desc: 'Practical Deep Learning for Coders (Free)', color: '#00b2a9', icon: '⚡' },
            { name: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', desc: 'Free Machine Learning crash course by Google', color: '#4285f4', icon: '🧠' },
            { name: 'Papers With Code', url: 'https://paperswithcode.com/', desc: 'ML papers with implementation code', color: '#21cbce', icon: '📄' },
            { name: 'Scikit-learn Tutorials', url: 'https://scikit-learn.org/stable/tutorial/', desc: 'Official scikit-learn tutorials', color: '#f89939', icon: '🔬' },
        );
    }

    if (g.includes('web') || g.includes('frontend') || g.includes('react') || g.includes('fullstack') || g.includes('full stack') || g.includes('javascript') || g.includes('html') || g.includes('css')) {
        links.push(
            { name: 'The Odin Project', url: 'https://www.theodinproject.com/', desc: 'Full stack curriculum — completely free', color: '#ce973e', icon: '🛤️' },
            { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Learn', desc: 'Mozilla official web development learning path', color: '#83d0f2', icon: '🌐' },
            { name: 'JavaScript.info', url: 'https://javascript.info/', desc: 'Modern JavaScript tutorial', color: '#f0db4f', icon: '📜' },
            { name: 'CSS-Tricks', url: 'https://css-tricks.com/', desc: 'Tips, tricks, and techniques on CSS', color: '#ff7a59', icon: '🎨' },
            { name: 'web.dev by Google', url: 'https://web.dev/learn', desc: 'Learn web development from Google', color: '#1a73e8', icon: '🏗️' },
        );
    }

    if (g.includes('java') || g.includes('android') || g.includes('kotlin') || g.includes('mobile')) {
        links.push(
            { name: 'Android Developers', url: 'https://developer.android.com/courses', desc: 'Official Android development courses', color: '#3ddc84', icon: '📱' },
            { name: 'Codecademy (Free)', url: `https://www.codecademy.com/catalog/language/java`, desc: 'Interactive Java coding lessons', color: '#204056', icon: '☕' },
            { name: 'MOOC.fi', url: 'https://java-programming.mooc.fi/', desc: 'Free Java programming MOOC from University of Helsinki', color: '#e4002b', icon: '🎓' },
        );
    }

    if (g.includes('cloud') || g.includes('devops') || g.includes('aws') || g.includes('azure') || g.includes('docker') || g.includes('kubernetes')) {
        links.push(
            { name: 'AWS Skill Builder', url: 'https://explore.skillbuilder.aws/learn', desc: 'Free AWS training & certification prep', color: '#ff9900', icon: '☁️' },
            { name: 'Google Cloud Training', url: 'https://cloud.google.com/training/free', desc: 'Free GCP training resources', color: '#4285f4', icon: '🌥️' },
            { name: 'KodeKloud', url: 'https://kodekloud.com/courses/', desc: 'DevOps & Cloud hands-on labs', color: '#0095ff', icon: '⚙️' },
            { name: 'Docker Docs', url: 'https://docs.docker.com/get-started/', desc: 'Official Docker getting started guide', color: '#2496ed', icon: '🐳' },
        );
    }

    if (g.includes('cyber') || g.includes('security') || g.includes('hacking') || g.includes('penetration')) {
        links.push(
            { name: 'TryHackMe', url: 'https://tryhackme.com/', desc: 'Hands-on cybersecurity training', color: '#212c42', icon: '🔐' },
            { name: 'Hack The Box', url: 'https://www.hackthebox.com/', desc: 'Cybersecurity labs & challenges', color: '#9fef00', icon: '🛡️' },
            { name: 'OWASP', url: 'https://owasp.org/www-project-web-security-testing-guide/', desc: 'Web App Security Testing Guide', color: '#404040', icon: '🔒' },
        );
    }

    if (g.includes('data analyst') || g.includes('sql') || g.includes('database') || g.includes('analytics')) {
        links.push(
            { name: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/', desc: 'Interactive SQL tutorial for analysts', color: '#5c44e4', icon: '💾' },
            { name: 'Khan Academy Stats', url: 'https://www.khanacademy.org/math/statistics-probability', desc: 'Statistics & Probability (free)', color: '#14bf96', icon: '📈' },
            { name: 'W3Schools SQL', url: 'https://www.w3schools.com/sql/', desc: 'Interactive SQL learning', color: '#04aa6d', icon: '🗃️' },
        );
    }

    // Always include GitHub & Coursera & edX
    links.push(
        { name: 'GitHub Topics', url: `https://github.com/topics/${encodeURIComponent(searchGoal.replace(/\s+/g, '-').toLowerCase())}`, desc: 'Open source projects & repositories', color: '#333', icon: '🐙' },
        { name: 'Coursera (Audit Free)', url: `https://www.coursera.org/search?query=${encodeURIComponent(searchGoal)}`, desc: 'Audit top university courses for free', color: '#0056d2', icon: '🎓' },
        { name: 'edX Free Courses', url: `https://www.edx.org/search?q=${encodeURIComponent(searchGoal)}`, desc: 'Free courses from Harvard, MIT & more', color: '#02262b', icon: '📚' },
    );

    return links;
};

const LearningPath = ({ user, onUserUpdate }) => {
    const [goal, setGoal] = useState('');
    const [usePrev, setUsePrev] = useState(true);
    const [loading, setLoading] = useState(false);
    const [pathResult, setPathResult] = useState(user.learning_paths?.[user.learning_paths.length - 1] || null);
    const [courseLinks, setCourseLinks] = useState([]);
    const [expandedSections, setExpandedSections] = useState({});
    const resultRef = useRef(null);

    // Restore course links if a path already exists
    React.useEffect(() => {
        if (pathResult && pathResult.goal) {
            setCourseLinks(getOpenSourceLinks(pathResult.goal));
            setGoal(pathResult.goal);
        }
    }, [pathResult]);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleGenerate = async () => {
        if (!goal) return alert('Please enter a learning goal!');
        setLoading(true);

        // Generate open source links immediately
        setCourseLinks(getOpenSourceLinks(goal));

        try {
            const response = await api.post('/generate-path', {
                user_profile: user.profile,
                goal,
                use_previous_skills: usePrev
            });

            const newPath = {
                content: response.data.path,
                created_at: new Date().toISOString(),
                goal: goal
            };

            setPathResult(newPath);

            // Scroll to results
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);

            // Save to backend and update user state
            const saveResponse = await api.post('/user/save-path', {
                username: user.username,
                path: response.data.path
            });

            if (saveResponse.data.success && saveResponse.data.user && onUserUpdate) {
                onUserUpdate(saveResponse.data.user);
            }

        } catch (err) {
            const serverMsg = err.response?.data?.message || err.response?.data?.error;
            if (err.response?.status === 503) {
                alert('AI service is not running. Please start it with: python main.py (in the ai/ folder)');
            } else if (serverMsg) {
                alert('Error: ' + serverMsg);
            } else {
                alert('Error: ' + err.message + '\n\nMake sure both backend (node index.js) and AI service (python main.py) are running.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tab-path glass-card">
            {/* Hero Header */}
            <div className="lp-hero">
                <div className="lp-hero-glow"></div>
                <div className="lp-hero-content">
                    <div className="lp-hero-badge">
                        <Sparkles size={14} />
                        AI-Powered Learning
                    </div>
                    <h3 className="lp-hero-title">
                        🎯 Create Your Learning Path
                    </h3>
                    <p className="lp-hero-subtitle">
                        Enter your learning goal and let AI craft a personalized, structured curriculum with the best resources, milestone projects, and specialized tracks.
                    </p>
                </div>
            </div>

            {/* Input Section */}
            <div className="lp-input-section">
                <div className="lp-input-group">
                    <label className="lp-label">
                        <GraduationCap size={16} />
                        What do you want to learn?
                    </label>
                    <div className="lp-input-wrapper">
                        <input
                            type="text"
                            className="lp-input"
                            placeholder="e.g. Machine Learning, Data Analyst, Full Stack Developer, Cloud Engineer..."
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <div className="lp-input-icon">
                            <Target size={18} />
                        </div>
                    </div>
                </div>

                <div className="lp-toggle-group">
                    <label className="lp-label">
                        <Layers size={16} />
                        Leverage existing skills?
                    </label>
                    <div className="lp-toggle-options">
                        <button
                            className={`lp-toggle-btn ${usePrev ? 'active' : ''}`}
                            onClick={() => setUsePrev(true)}
                        >
                            <CheckCircle2 size={14} />
                            Yes, accelerate my path
                        </button>
                        <button
                            className={`lp-toggle-btn ${!usePrev ? 'active' : ''}`}
                            onClick={() => setUsePrev(false)}
                        >
                            <BookOpen size={14} />
                            Start from foundations
                        </button>
                    </div>
                </div>

                <button
                    className="lp-generate-btn"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="lp-loading">
                            <span className="lp-spinner"></span>
                            <span>Crafting your personalized curriculum...</span>
                        </span>
                    ) : (
                        <>
                            <Zap size={18} />
                            Generate My Learning Curriculum
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </div>

            {/* Results Section */}
            {pathResult && (
                <div ref={resultRef} className="lp-results animate-fade-in">

                    {/* Timeline Progress Bar */}
                    <div className="lp-timeline-bar">
                        <div className="lp-timeline-item active">
                            <div className="lp-timeline-dot"></div>
                            <span>Phase 1</span>
                            <small>Weeks 1-8</small>
                        </div>
                        <div className="lp-timeline-connector"></div>
                        <div className="lp-timeline-item">
                            <div className="lp-timeline-dot"></div>
                            <span>Phase 2</span>
                            <small>Weeks 9-16</small>
                        </div>
                        <div className="lp-timeline-connector"></div>
                        <div className="lp-timeline-item">
                            <div className="lp-timeline-dot"></div>
                            <span>Phase 3</span>
                            <small>Weeks 17-24</small>
                        </div>
                    </div>

                    {/* Open Source Course Links */}
                    <div className="lp-section lp-resources-section">
                        <div
                            className="lp-section-header"
                            onClick={() => toggleSection('resources')}
                        >
                            <h5 className="lp-section-title">
                                <Globe size={20} className="lp-section-icon" />
                                <span>Free & Open Source Resources</span>
                                <span className="lp-badge">{courseLinks.length} platforms</span>
                            </h5>
                            {expandedSections.resources === false ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </div>

                        {expandedSections.resources !== false && courseLinks.length > 0 && (
                            <div className="lp-resources-grid">
                                {courseLinks.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="lp-resource-card"
                                        style={{ '--card-accent': link.color }}
                                    >
                                        <div className="lp-resource-icon-wrapper" style={{ background: link.color }}>
                                            <span className="lp-resource-emoji">{link.icon}</span>
                                        </div>
                                        <div className="lp-resource-info">
                                            <p className="lp-resource-name">{link.name}</p>
                                            <p className="lp-resource-desc">{link.desc}</p>
                                        </div>
                                        <ExternalLink size={14} className="lp-resource-arrow" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>



                    {/* AI Generated Curriculum Content */}
                    <div className="lp-section lp-curriculum-section">
                        <div className="lp-section-header">
                            <h5 className="lp-section-title">
                                <BookOpen size={20} className="lp-section-icon" />
                                <span>Your Structured Curriculum</span>
                                <span className="lp-badge lp-badge-ai">
                                    <Sparkles size={10} /> AI Generated
                                </span>
                            </h5>
                        </div>
                        <div
                            className="lp-curriculum-content"
                            dangerouslySetInnerHTML={{ __html: marked.parse(pathResult.content) }}
                        />
                    </div>
                </div>
            )}

            <style>{`
                /* ========== HERO SECTION ========== */
                .lp-hero {
                    position: relative;
                    padding: 2rem 0 1.5rem;
                    margin-bottom: 1.5rem;
                    overflow: hidden;
                }
                .lp-hero-glow {
                    position: absolute;
                    top: -40px;
                    right: -40px;
                    width: 200px;
                    height: 200px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(120, 184, 184, 0.15), transparent 70%);
                    pointer-events: none;
                    animation: pulse-glow 4s ease-in-out infinite;
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                .lp-hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: linear-gradient(135deg, rgba(120, 184, 184, 0.15), rgba(120, 184, 184, 0.05));
                    border: 1px solid rgba(120, 184, 184, 0.25);
                    color: #78B8B8;
                    padding: 5px 14px;
                    border-radius: 100px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                }
                .lp-hero-title {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #f3f4f6;
                    margin-bottom: 8px;
                    line-height: 1.2;
                }
                .lp-hero-subtitle {
                    color: #94a3b8;
                    font-size: 0.88rem;
                    line-height: 1.6;
                    max-width: 600px;
                }

                /* ========== INPUT SECTION ========== */
                .lp-input-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    padding: 1.5rem;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .lp-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #cbd5e1;
                    margin-bottom: 8px;
                }
                .lp-input-wrapper {
                    position: relative;
                }
                .lp-input {
                    width: 100%;
                    padding: 14px 18px 14px 46px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    color: #f3f4f6;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    outline: none;
                }
                .lp-input:focus {
                    border-color: rgba(120, 184, 184, 0.4);
                    background: rgba(255, 255, 255, 0.06);
                    box-shadow: 0 0 0 3px rgba(120, 184, 184, 0.1);
                }
                .lp-input::placeholder {
                    color: #4b5563;
                }
                .lp-input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #78B8B8;
                    opacity: 0.6;
                }

                /* ========== TOGGLE BUTTONS ========== */
                .lp-toggle-options {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .lp-toggle-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    color: #94a3b8;
                    font-size: 0.82rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .lp-toggle-btn:hover {
                    background: rgba(120, 184, 184, 0.08);
                    border-color: rgba(120, 184, 184, 0.2);
                }
                .lp-toggle-btn.active {
                    background: rgba(120, 184, 184, 0.12);
                    border-color: rgba(120, 184, 184, 0.35);
                    color: #78B8B8;
                }

                /* ========== GENERATE BUTTON ========== */
                .lp-generate-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 14px 32px;
                    background: linear-gradient(135deg, #78B8B8 0%, #5a9d9f 50%, #4a8b8d 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.92rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 20px rgba(120, 184, 184, 0.3), 0 0 60px rgba(120, 184, 184, 0.05);
                    position: relative;
                    overflow: hidden;
                }
                .lp-generate-btn::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    transition: left 0.5s ease;
                }
                .lp-generate-btn:hover::before {
                    left: 100%;
                }
                .lp-generate-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(120, 184, 184, 0.4);
                }
                .lp-generate-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
                .lp-loading {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .lp-spinner {
                    display: inline-block;
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* ========== RESULTS SECTION ========== */
                .lp-results {
                    margin-top: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .animate-fade-in {
                    animation: fadeSlideUp 0.6s ease-out;
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* ========== TIMELINE BAR ========== */
                .lp-timeline-bar {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0;
                    padding: 1.5rem 1rem;
                    background: linear-gradient(135deg, rgba(120, 184, 184, 0.06), rgba(90, 157, 160, 0.03));
                    border-radius: 16px;
                    border: 1px solid rgba(120, 184, 184, 0.12);
                }
                .lp-timeline-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    position: relative;
                }
                .lp-timeline-item span {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: #94a3b8;
                }
                .lp-timeline-item small {
                    font-size: 0.65rem;
                    color: #64748b;
                }
                .lp-timeline-item.active span {
                    color: #78B8B8;
                }
                .lp-timeline-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: rgba(120, 184, 184, 0.15);
                    border: 2px solid rgba(120, 184, 184, 0.3);
                    transition: all 0.3s ease;
                }
                .lp-timeline-item.active .lp-timeline-dot {
                    background: #78B8B8;
                    border-color: #78B8B8;
                    box-shadow: 0 0 12px rgba(120, 184, 184, 0.5);
                }
                .lp-timeline-connector {
                    flex: 1;
                    height: 2px;
                    background: linear-gradient(90deg, rgba(120, 184, 184, 0.3), rgba(120, 184, 184, 0.08));
                    margin: 0 12px;
                    margin-bottom: 20px;
                }

                /* ========== SECTION CARDS ========== */
                .lp-section {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 16px;
                    overflow: hidden;
                }
                .lp-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.25rem 1.5rem;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                }
                .lp-section-header:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
                .lp-section-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #e2e8f0;
                }
                .lp-section-icon {
                    color: #78B8B8;
                    flex-shrink: 0;
                }
                .lp-badge {
                    font-size: 0.65rem;
                    padding: 3px 10px;
                    background: rgba(120, 184, 184, 0.1);
                    border: 1px solid rgba(120, 184, 184, 0.2);
                    border-radius: 100px;
                    color: #78B8B8;
                    font-weight: 600;
                }
                .lp-badge-ai {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(120, 184, 184, 0.15));
                    border-color: rgba(168, 85, 247, 0.3);
                    color: #c084fc;
                }

                /* ========== RESOURCES GRID ========== */
                .lp-resources-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 10px;
                    padding: 1rem 1.25rem 1.25rem;
                }
                .lp-resource-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 14px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    text-decoration: none;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .lp-resource-card:hover {
                    background: rgba(120, 184, 184, 0.08);
                    border-color: rgba(120, 184, 184, 0.2);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                }
                .lp-resource-icon-wrapper {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                .lp-resource-emoji {
                    font-size: 1rem;
                    filter: brightness(1.2);
                }
                .lp-resource-info {
                    flex: 1;
                    min-width: 0;
                }
                .lp-resource-name {
                    color: #e2e8f0;
                    font-weight: 700;
                    font-size: 0.8rem;
                    margin-bottom: 2px;
                }
                .lp-resource-desc {
                    color: #64748b;
                    font-size: 0.68rem;
                    line-height: 1.3;
                }
                .lp-resource-arrow {
                    color: #78B8B8;
                    flex-shrink: 0;
                    opacity: 0.4;
                    transition: all 0.2s;
                }
                .lp-resource-card:hover .lp-resource-arrow {
                    opacity: 1;
                    transform: translateX(2px);
                }

                /* ========== ROADMAP ========== */
                .lp-roadmap-container {
                    padding: 1rem 1.25rem;
                    display: flex;
                    justify-content: center;
                }
                .lp-roadmap-img {
                    max-width: 100%;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                .lp-roadmap-actions {
                    display: flex;
                    gap: 10px;
                    padding: 0 1.25rem 1.25rem;
                    justify-content: center;
                }
                .lp-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: rgba(114, 135, 171, 0.15);
                    border: 1px solid rgba(114, 135, 171, 0.2);
                    border-radius: 8px;
                    color: #94a3b8;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .lp-action-btn:hover {
                    background: rgba(114, 135, 171, 0.25);
                    color: #e2e8f0;
                }

                /* ========== CURRICULUM CONTENT (AI Generated) ========== */
                .lp-curriculum-content {
                    padding: 1.5rem 1.75rem 2rem;
                    line-height: 1.8;
                    color: #cbd5e1;
                }

                /* Headings */
                .lp-curriculum-content h1 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #f1f5f9;
                    margin: 1.5rem 0 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid rgba(120, 184, 184, 0.2);
                    line-height: 1.3;
                }
                .lp-curriculum-content h2 {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #78B8B8;
                    margin: 2rem 0 0.75rem;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid rgba(120, 184, 184, 0.12);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .lp-curriculum-content h3 {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #e2e8f0;
                    margin: 1.5rem 0 0.5rem;
                    padding: 12px 16px;
                    background: linear-gradient(135deg, rgba(120, 184, 184, 0.08), rgba(120, 184, 184, 0.02));
                    border-left: 3px solid #78B8B8;
                    border-radius: 0 8px 8px 0;
                }
                .lp-curriculum-content h4 {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #D89F9E;
                    margin: 1.25rem 0 0.5rem;
                }

                /* Blockquotes (AI Assistant Note) */
                .lp-curriculum-content blockquote {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(120, 184, 184, 0.06));
                    border-left: 3px solid #a855f7;
                    border-radius: 0 12px 12px 0;
                    padding: 1rem 1.25rem;
                    margin: 1rem 0;
                    font-size: 0.88rem;
                    color: #c4b5fd;
                    line-height: 1.6;
                }
                .lp-curriculum-content blockquote p {
                    margin: 0;
                }

                /* Tables (Resources & Tools) */
                .lp-curriculum-content table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin: 1rem 0 1.5rem;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid rgba(120, 184, 184, 0.12);
                }
                .lp-curriculum-content thead {
                    background: linear-gradient(135deg, rgba(120, 184, 184, 0.15), rgba(120, 184, 184, 0.08));
                }
                .lp-curriculum-content th {
                    padding: 12px 16px;
                    color: #78B8B8;
                    font-weight: 700;
                    font-size: 0.78rem;
                    text-align: left;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid rgba(120, 184, 184, 0.15);
                }
                .lp-curriculum-content td {
                    padding: 10px 16px;
                    font-size: 0.82rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    color: #cbd5e1;
                }
                .lp-curriculum-content tr:last-child td {
                    border-bottom: none;
                }
                .lp-curriculum-content tbody tr {
                    transition: background 0.2s ease;
                }
                .lp-curriculum-content tbody tr:hover {
                    background: rgba(120, 184, 184, 0.04);
                }

                /* Lists */
                .lp-curriculum-content ul, .lp-curriculum-content ol {
                    padding-left: 1.25rem;
                    margin: 0.5rem 0;
                }
                .lp-curriculum-content li {
                    margin: 6px 0;
                    font-size: 0.85rem;
                    line-height: 1.6;
                }
                .lp-curriculum-content li::marker {
                    color: #78B8B8;
                }

                /* Links */
                .lp-curriculum-content a,
                .curriculum-link {
                    color: #78B8B8 !important;
                    text-decoration: none !important;
                    font-weight: 600;
                    border-bottom: 1px dashed rgba(120, 184, 184, 0.3);
                    transition: all 0.2s ease;
                    padding-bottom: 1px;
                }
                .lp-curriculum-content a:hover,
                .curriculum-link:hover {
                    color: #93d0d0 !important;
                    border-bottom-color: #78B8B8;
                    text-shadow: 0 0 8px rgba(120, 184, 184, 0.3);
                }

                /* Paragraphs */
                .lp-curriculum-content p {
                    margin: 0.5rem 0;
                    font-size: 0.86rem;
                }

                /* Strong text */
                .lp-curriculum-content strong {
                    color: #f1f5f9;
                    font-weight: 700;
                }

                /* Horizontal rules (section dividers) */
                .lp-curriculum-content hr {
                    border: none;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(120, 184, 184, 0.2), transparent);
                    margin: 1.5rem 0;
                }

                /* Code blocks */
                .lp-curriculum-content code {
                    background: rgba(120, 184, 184, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.82rem;
                    color: #78B8B8;
                }

                /* ========== RESPONSIVE ========== */
                @media (max-width: 768px) {
                    .lp-hero-title { font-size: 1.3rem; }
                    .lp-resources-grid { grid-template-columns: 1fr; }
                    .lp-timeline-bar { flex-wrap: wrap; gap: 8px; }
                    .lp-timeline-connector { display: none; }
                    .lp-toggle-options { flex-direction: column; }
                    .lp-curriculum-content { padding: 1rem; }
                    .lp-curriculum-content table { font-size: 0.75rem; }
                    .lp-curriculum-content th, .lp-curriculum-content td { padding: 8px; }
                }
            `}</style>
        </div>
    );
};

export default LearningPath;
