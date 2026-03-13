const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Dashboard stats
router.get('/dashboard', authenticate, requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const totalCandidates = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'candidate'").get().count;
        const totalSessions = db.prepare('SELECT COUNT(*) as count FROM exam_sessions').get().count;
        const completedSessions = db.prepare("SELECT COUNT(*) as count FROM exam_sessions WHERE status = 'completed'").get().count;
        const avgScore = db.prepare("SELECT AVG(percentage) as avg FROM exam_sessions WHERE status = 'completed'").get().avg || 0;
        const totalAptitudeQ = db.prepare('SELECT COUNT(*) as count FROM aptitude_questions').get().count;
        const totalCodingP = db.prepare('SELECT COUNT(*) as count FROM coding_problems').get().count;

        const recentSessions = db.prepare(`
      SELECT es.id, es.session_type, es.status, es.percentage, es.tab_switches, es.created_at, u.name, u.email
      FROM exam_sessions es JOIN users u ON es.user_id = u.id
      ORDER BY es.created_at DESC LIMIT 10
    `).all();

        const topicPerformance = db.prepare(`
      SELECT aq.topic, 
        COUNT(*) as total,
        SUM(CASE WHEN aa.is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM aptitude_answers aa
      JOIN aptitude_questions aq ON aa.question_id = aq.id
      GROUP BY aq.topic
    `).all();

        const difficultyPerformance = db.prepare(`
      SELECT aq.difficulty,
        COUNT(*) as total,
        SUM(CASE WHEN aa.is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM aptitude_answers aa
      JOIN aptitude_questions aq ON aa.question_id = aq.id
      GROUP BY aq.difficulty
    `).all();

        const cheatingAlerts = db.prepare(`
      SELECT es.id, es.tab_switches, es.created_at, u.name, u.email
      FROM exam_sessions es JOIN users u ON es.user_id = u.id
      WHERE es.tab_switches > 3
      ORDER BY es.tab_switches DESC LIMIT 10
    `).all();

        res.json({
            stats: {
                totalCandidates,
                totalSessions,
                completedSessions,
                avgScore: Math.round(avgScore),
                totalAptitudeQ,
                totalCodingP
            },
            recentSessions,
            topicPerformance: topicPerformance.map(t => ({
                ...t,
                percentage: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0
            })),
            difficultyPerformance: difficultyPerformance.map(d => ({
                ...d,
                percentage: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
            })),
            cheatingAlerts
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// Get all candidates
router.get('/candidates', authenticate, requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const candidates = db.prepare(`
      SELECT u.id, u.email, u.name, u.skill_level, u.created_at,
        (SELECT COUNT(*) FROM exam_sessions WHERE user_id = u.id) as total_sessions,
        (SELECT AVG(percentage) FROM exam_sessions WHERE user_id = u.id AND status = 'completed') as avg_score
      FROM users u WHERE u.role = 'candidate'
      ORDER BY u.created_at DESC
    `).all();
        res.json({ candidates });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
});

// Get candidate detail
router.get('/candidates/:id', authenticate, requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const candidate = db.prepare('SELECT id, email, name, skill_level, preferred_language, created_at FROM users WHERE id = ?').get(req.params.id);
        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

        const sessions = db.prepare(`
      SELECT id, session_type, status, percentage, tab_switches, total_score, max_score, ai_feedback, created_at
      FROM exam_sessions WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.params.id);

        res.json({ candidate, sessions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch candidate' });
    }
});

// Upload aptitude dataset (JSON)
router.post('/upload/aptitude', authenticate, requireAdmin, upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'File required' });
        const db = getDb();
        const ext = path.extname(req.file.originalname).toLowerCase();

        if (ext === '.json') {
            const data = JSON.parse(fs.readFileSync(req.file.path, 'utf-8'));
            const questions = Array.isArray(data) ? data : data.questions || [];
            const stmt = db.prepare(`INSERT OR IGNORE INTO aptitude_questions (id, question_text, options, correct_answer, topic, difficulty, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            const insertMany = db.transaction((items) => {
                let count = 0;
                for (const q of items) {
                    const opts = typeof q.options === 'string' ? q.options : JSON.stringify(q.options);
                    stmt.run(q.question_id || uuidv4(), q.question_text, opts, q.correct_answer, q.topic, q.difficulty, q.explanation || '');
                    count++;
                }
                return count;
            });
            const count = insertMany(questions);
            fs.unlinkSync(req.file.path);
            res.json({ message: `Successfully uploaded ${count} aptitude questions` });
        } else if (ext === '.csv') {
            const results = [];
            fs.createReadStream(req.file.path)
                .pipe(csvParser())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    const stmt = db.prepare(`INSERT OR IGNORE INTO aptitude_questions (id, question_text, options, correct_answer, topic, difficulty, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)`);
                    const insertMany = db.transaction((items) => {
                        let count = 0;
                        for (const q of items) {
                            const opts = q.options || JSON.stringify([q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean));
                            stmt.run(q.question_id || uuidv4(), q.question_text, opts, q.correct_answer, q.topic, q.difficulty, q.explanation || '');
                            count++;
                        }
                        return count;
                    });
                    const count = insertMany(results);
                    fs.unlinkSync(req.file.path);
                    res.json({ message: `Successfully uploaded ${count} aptitude questions from CSV` });
                });
        } else {
            fs.unlinkSync(req.file.path);
            res.status(400).json({ error: 'Only JSON and CSV files are supported' });
        }
    } catch (error) {
        console.error('Upload aptitude error:', error);
        res.status(500).json({ error: 'Failed to upload aptitude dataset' });
    }
});

// Upload coding problems dataset (JSON)
router.post('/upload/coding', authenticate, requireAdmin, upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'File required' });
        const db = getDb();
        const data = JSON.parse(fs.readFileSync(req.file.path, 'utf-8'));
        const problems = Array.isArray(data) ? data : data.problems || [];

        const stmt = db.prepare(`INSERT OR IGNORE INTO coding_problems (id, title, difficulty, topic, problem_statement, sample_input, sample_output, constraints_text, test_cases, starter_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        const insertMany = db.transaction((items) => {
            let count = 0;
            for (const p of items) {
                const testCases = typeof p.test_cases === 'string' ? p.test_cases : JSON.stringify(p.test_cases || []);
                const starterCode = typeof p.starter_code === 'string' ? p.starter_code : JSON.stringify(p.starter_code || {});
                stmt.run(p.problem_id || uuidv4(), p.title, p.difficulty, p.topic, p.problem_statement, p.sample_input, p.sample_output, p.constraints || p.constraints_text || '', testCases, starterCode);
                count++;
            }
            return count;
        });
        const count = insertMany(problems);
        fs.unlinkSync(req.file.path);
        res.json({ message: `Successfully uploaded ${count} coding problems` });
    } catch (error) {
        console.error('Upload coding error:', error);
        res.status(500).json({ error: 'Failed to upload coding dataset' });
    }
});

// Export results as CSV
router.get('/export/results', authenticate, requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const results = db.prepare(`
      SELECT u.name, u.email, u.skill_level,
        es.session_type, es.status, es.total_score, es.max_score, es.percentage,
        es.tab_switches, es.start_time, es.end_time
      FROM exam_sessions es
      JOIN users u ON es.user_id = u.id
      ORDER BY es.created_at DESC
    `).all();

        let csv = 'Name,Email,Skill Level,Session Type,Status,Score,Max Score,Percentage,Tab Switches,Start Time,End Time\n';
        for (const r of results) {
            csv += `"${r.name}","${r.email}","${r.skill_level}","${r.session_type}","${r.status}",${r.total_score},${r.max_score},${r.percentage},${r.tab_switches},"${r.start_time}","${r.end_time}"\n`;
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=interview_results.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: 'Failed to export results' });
    }
});

// Get all aptitude questions
router.get('/questions/aptitude', authenticate, requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const questions = db.prepare('SELECT * FROM aptitude_questions ORDER BY topic, difficulty').all();
        res.json({ questions: questions.map(q => ({ ...q, options: JSON.parse(q.options) })) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Get all coding problems
router.get('/questions/coding', authenticate, requireAdmin, (req, res) => {
    try {
        const db = getDb();
        const problems = db.prepare('SELECT * FROM coding_problems ORDER BY difficulty').all();
        res.json({ problems });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
});

// Delete aptitude question
router.delete('/questions/aptitude/:id', authenticate, requireAdmin, (req, res) => {
    try {
        const db = getDb();
        db.prepare('DELETE FROM aptitude_questions WHERE id = ?').run(req.params.id);
        res.json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

// Delete coding problem
router.delete('/questions/coding/:id', authenticate, requireAdmin, (req, res) => {
    try {
        const db = getDb();
        db.prepare('DELETE FROM coding_problems WHERE id = ?').run(req.params.id);
        res.json({ message: 'Problem deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete problem' });
    }
});

module.exports = router;
