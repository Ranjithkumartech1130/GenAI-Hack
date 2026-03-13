const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all sessions for current user
router.get('/', authenticate, (req, res) => {
    try {
        const db = getDb();
        const sessions = db.prepare(`
      SELECT id, session_type, status, skill_level, preferred_language,
        start_time, end_time, total_score, max_score, percentage,
        tab_switches, ai_feedback, created_at
      FROM exam_sessions WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Get session details
router.get('/:id', authenticate, (req, res) => {
    try {
        const db = getDb();
        const session = db.prepare('SELECT * FROM exam_sessions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        let details = {};
        if (session.session_type === 'aptitude') {
            details.answers = db.prepare(`
        SELECT aa.*, aq.question_text, aq.options, aq.correct_answer, aq.topic, aq.difficulty, aq.explanation
        FROM aptitude_answers aa
        JOIN aptitude_questions aq ON aa.question_id = aq.id
        WHERE aa.session_id = ?
      `).all(session.id).map(a => ({
                ...a,
                options: JSON.parse(a.options),
                is_correct: !!a.is_correct
            }));
        } else if (session.session_type === 'coding') {
            details.submissions = db.prepare(`
        SELECT cs.*, cp.title, cp.difficulty, cp.topic, cp.problem_statement
        FROM coding_submissions cs
        JOIN coding_problems cp ON cs.problem_id = cp.id
        WHERE cs.session_id = ?
      `).all(session.id).map(s => ({
                ...s,
                test_results: s.test_results ? JSON.parse(s.test_results) : []
            }));
        }

        let performanceAnalysis = null;
        try {
            performanceAnalysis = session.performance_analysis ? JSON.parse(session.performance_analysis) : null;
        } catch (e) { }

        res.json({
            session: {
                ...session,
                performance_analysis: performanceAnalysis
            },
            ...details
        });
    } catch (error) {
        console.error('Session detail error:', error);
        res.status(500).json({ error: 'Failed to fetch session details' });
    }
});

module.exports = router;
