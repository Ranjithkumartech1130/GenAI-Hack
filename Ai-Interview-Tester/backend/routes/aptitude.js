const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Difficulty distribution map
const DIFFICULTY_DISTRIBUTION = {
    beginner: { easy: 0.7, medium: 0.3, hard: 0 },
    intermediate: { easy: 0.4, medium: 0.4, hard: 0.2 },
    advanced: { easy: 0, medium: 0.3, hard: 0.7 }
};

const TOTAL_QUESTIONS = 15;

// Start aptitude round
router.post('/start', authenticate, (req, res) => {
    try {
        const { skill_level } = req.body;
        const level = skill_level || req.user.skill_level || 'intermediate';
        const db = getDb();

        // Create session
        const sessionId = uuidv4();
        db.prepare(`INSERT INTO exam_sessions (id, user_id, session_type, skill_level, status) VALUES (?, ?, 'aptitude', ?, 'in_progress')`).run(
            sessionId, req.user.id, level
        );

        // Select questions based on difficulty distribution
        const dist = DIFFICULTY_DISTRIBUTION[level] || DIFFICULTY_DISTRIBUTION.intermediate;
        const easyCount = Math.round(TOTAL_QUESTIONS * dist.easy);
        const mediumCount = Math.round(TOTAL_QUESTIONS * dist.medium);
        const hardCount = TOTAL_QUESTIONS - easyCount - mediumCount;

        // Get previously answered question IDs for this user
        const previousIds = db.prepare(`
      SELECT DISTINCT aa.question_id FROM aptitude_answers aa
      JOIN exam_sessions es ON aa.session_id = es.id
      WHERE es.user_id = ?
    `).all(req.user.id).map(r => r.question_id);

        const placeholders = previousIds.length > 0 ? `AND id NOT IN (${previousIds.map(() => '?').join(',')})` : '';

        const getQuestions = (difficulty, count) => {
            const params = [difficulty, ...(previousIds.length > 0 ? previousIds : [])];
            return db.prepare(`
        SELECT id, question_text, options, topic, difficulty FROM aptitude_questions 
        WHERE difficulty = ? ${placeholders}
        ORDER BY RANDOM() LIMIT ?
      `).all(...params, count);
        };

        let questions = [
            ...getQuestions('easy', easyCount),
            ...getQuestions('medium', mediumCount),
            ...getQuestions('hard', hardCount)
        ];

        // Shuffle questions
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }

        // Parse options JSON
        questions = questions.map((q, idx) => ({
            ...q,
            question_number: idx + 1,
            options: JSON.parse(q.options)
        }));

        res.json({
            session_id: sessionId,
            skill_level: level,
            total_questions: questions.length,
            time_per_question: 60,
            questions
        });
    } catch (error) {
        console.error('Start aptitude error:', error);
        res.status(500).json({ error: 'Failed to start aptitude round' });
    }
});

// Submit answer for a question
router.post('/answer', authenticate, (req, res) => {
    try {
        const { session_id, question_id, selected_answer, time_taken } = req.body;
        if (!session_id || !question_id) {
            return res.status(400).json({ error: 'Session ID and question ID required' });
        }
        const db = getDb();

        // Verify session belongs to user and is active
        const session = db.prepare('SELECT * FROM exam_sessions WHERE id = ? AND user_id = ? AND status = ?').get(
            session_id, req.user.id, 'in_progress'
        );
        if (!session) {
            return res.status(404).json({ error: 'Active session not found' });
        }

        // Check correct answer
        const question = db.prepare('SELECT correct_answer FROM aptitude_questions WHERE id = ?').get(question_id);
        const isCorrect = question && selected_answer === question.correct_answer ? 1 : 0;

        // Check if already answered
        const existing = db.prepare('SELECT id FROM aptitude_answers WHERE session_id = ? AND question_id = ?').get(session_id, question_id);
        if (existing) {
            db.prepare('UPDATE aptitude_answers SET selected_answer = ?, is_correct = ?, time_taken_seconds = ? WHERE id = ?').run(
                selected_answer, isCorrect, time_taken || 0, existing.id
            );
        } else {
            db.prepare(`INSERT INTO aptitude_answers (id, session_id, question_id, selected_answer, is_correct, time_taken_seconds) VALUES (?, ?, ?, ?, ?, ?)`).run(
                uuidv4(), session_id, question_id, selected_answer, isCorrect, time_taken || 0
            );
        }

        res.json({ is_correct: !!isCorrect, correct_answer: question?.correct_answer });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

// Complete aptitude round
router.post('/complete', authenticate, (req, res) => {
    try {
        const { session_id } = req.body;
        const db = getDb();

        const session = db.prepare('SELECT * FROM exam_sessions WHERE id = ? AND user_id = ?').get(session_id, req.user.id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Calculate scores
        const answers = db.prepare(`
      SELECT aa.*, aq.topic, aq.difficulty, aq.correct_answer, aq.explanation
      FROM aptitude_answers aa
      JOIN aptitude_questions aq ON aa.question_id = aq.id
      WHERE aa.session_id = ?
    `).all(session_id);

        const totalQuestions = answers.length;
        const correctAnswers = answers.filter(a => a.is_correct).length;
        const score = correctAnswers;
        const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        // Topic-wise analysis
        const topicAnalysis = {};
        for (const topic of ['quant', 'logical', 'verbal']) {
            const topicAnswers = answers.filter(a => a.topic === topic);
            const topicCorrect = topicAnswers.filter(a => a.is_correct).length;
            topicAnalysis[topic] = {
                total: topicAnswers.length,
                correct: topicCorrect,
                percentage: topicAnswers.length > 0 ? Math.round((topicCorrect / topicAnswers.length) * 100) : 0
            };
        }

        // Difficulty-wise analysis
        const diffAnalysis = {};
        for (const diff of ['easy', 'medium', 'hard']) {
            const diffAnswers = answers.filter(a => a.difficulty === diff);
            const diffCorrect = diffAnswers.filter(a => a.is_correct).length;
            diffAnalysis[diff] = {
                total: diffAnswers.length,
                correct: diffCorrect,
                percentage: diffAnswers.length > 0 ? Math.round((diffCorrect / diffAnswers.length) * 100) : 0
            };
        }

        // Determine strengths and weaknesses
        const topicScores = Object.entries(topicAnalysis).map(([topic, data]) => ({ topic, ...data }));
        topicScores.sort((a, b) => b.percentage - a.percentage);
        const strengths = topicScores.filter(t => t.percentage >= 70).map(t => t.topic);
        const weaknesses = topicScores.filter(t => t.percentage < 50).map(t => t.topic);

        // AI Performance Analysis
        const performanceAnalysis = {
            overall_score: score,
            max_score: totalQuestions,
            percentage: Math.round(percentage),
            topic_analysis: topicAnalysis,
            difficulty_analysis: diffAnalysis,
            strengths: strengths.length > 0 ? strengths : ['No strong areas yet - keep practicing!'],
            weaknesses: weaknesses.length > 0 ? weaknesses : ['No major weaknesses detected!'],
            suggestions: generateSuggestions(topicAnalysis, diffAnalysis, percentage),
            time_analysis: {
                avg_time: Math.round(answers.reduce((sum, a) => sum + a.time_taken_seconds, 0) / Math.max(answers.length, 1)),
                fastest_topic: topicScores[topicScores.length - 1]?.topic,
                slowest_topic: topicScores[0]?.topic
            }
        };

        // AI Feedback
        const aiFeedback = generateAIFeedback(performanceAnalysis);

        // Update session
        db.prepare(`
      UPDATE exam_sessions SET 
        status = 'completed', 
        end_time = datetime('now'), 
        total_score = ?, 
        max_score = ?, 
        percentage = ?,
        performance_analysis = ?,
        ai_feedback = ?
      WHERE id = ?
    `).run(score, totalQuestions, Math.round(percentage), JSON.stringify(performanceAnalysis), aiFeedback, session_id);

        // Update leaderboard
        updateLeaderboard(db, req.user.id, req.user.name);

        res.json({
            session_id,
            score,
            total_questions: totalQuestions,
            percentage: Math.round(percentage),
            performance_analysis: performanceAnalysis,
            ai_feedback: aiFeedback,
            detailed_results: answers.map(a => ({
                question_id: a.question_id,
                topic: a.topic,
                difficulty: a.difficulty,
                selected_answer: a.selected_answer,
                correct_answer: a.correct_answer,
                is_correct: !!a.is_correct,
                time_taken: a.time_taken_seconds,
                explanation: a.explanation
            }))
        });
    } catch (error) {
        console.error('Complete aptitude error:', error);
        res.status(500).json({ error: 'Failed to complete aptitude round' });
    }
});

// Track tab switch
router.post('/tab-switch', authenticate, (req, res) => {
    try {
        const { session_id } = req.body;
        const db = getDb();
        db.prepare('UPDATE exam_sessions SET tab_switches = tab_switches + 1 WHERE id = ? AND user_id = ?').run(session_id, req.user.id);
        const session = db.prepare('SELECT tab_switches FROM exam_sessions WHERE id = ?').get(session_id);
        res.json({ tab_switches: session?.tab_switches || 0 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to track tab switch' });
    }
});

function generateSuggestions(topicAnalysis, diffAnalysis, percentage) {
    const suggestions = [];
    if (topicAnalysis.quant?.percentage < 50) {
        suggestions.push('📊 Focus on Quantitative Aptitude: Practice arithmetic, percentages, ratios, and word problems daily.');
    }
    if (topicAnalysis.logical?.percentage < 50) {
        suggestions.push('🧩 Improve Logical Reasoning: Work on puzzles, pattern recognition, and syllogisms.');
    }
    if (topicAnalysis.verbal?.percentage < 50) {
        suggestions.push('📚 Strengthen Verbal Ability: Read more articles, practice vocabulary, and work on comprehension.');
    }
    if (diffAnalysis.hard?.percentage < 30) {
        suggestions.push('🎯 Challenge yourself with harder problems to improve problem-solving under pressure.');
    }
    if (percentage >= 80) {
        suggestions.push('🌟 Excellent performance! Try increasing the difficulty level for greater challenge.');
    }
    if (percentage < 40) {
        suggestions.push('💪 Start with fundamentals. Review basics of each topic before attempting practice tests.');
    }
    if (suggestions.length === 0) {
        suggestions.push('✅ Good overall performance. Continue practicing to maintain and improve your skills.');
    }
    return suggestions;
}

function generateAIFeedback(analysis) {
    const { percentage, strengths, weaknesses, topic_analysis } = analysis;
    let grade = '';
    if (percentage >= 90) grade = 'Outstanding';
    else if (percentage >= 75) grade = 'Excellent';
    else if (percentage >= 60) grade = 'Good';
    else if (percentage >= 40) grade = 'Average';
    else grade = 'Needs Improvement';

    let feedback = `## Performance Grade: ${grade} (${percentage}%)\n\n`;
    feedback += `### Strengths\n`;
    strengths.forEach(s => { feedback += `- ${s.charAt(0).toUpperCase() + s.slice(1)}\n`; });
    feedback += `\n### Areas for Improvement\n`;
    weaknesses.forEach(w => { feedback += `- ${w.charAt(0).toUpperCase() + w.slice(1)}\n`; });
    feedback += `\n### Topic Breakdown\n`;
    for (const [topic, data] of Object.entries(topic_analysis)) {
        feedback += `- **${topic.charAt(0).toUpperCase() + topic.slice(1)}**: ${data.correct}/${data.total} (${data.percentage}%)\n`;
    }
    return feedback;
}

function updateLeaderboard(db, userId, userName) {
    const sessions = db.prepare(`
    SELECT AVG(percentage) as avg_score, COUNT(*) as total_sessions 
    FROM exam_sessions WHERE user_id = ? AND status = 'completed' AND session_type = 'aptitude'
  `).get(userId);

    const codingSessions = db.prepare(`
    SELECT AVG(percentage) as avg_score 
    FROM exam_sessions WHERE user_id = ? AND status = 'completed' AND session_type = 'coding'
  `).get(userId);

    const aptitudeScore = sessions?.avg_score || 0;
    const codingScore = codingSessions?.avg_score || 0;
    const overallScore = (aptitudeScore + codingScore) / 2;

    const existing = db.prepare('SELECT id FROM leaderboard WHERE user_id = ?').get(userId);
    if (existing) {
        db.prepare(`UPDATE leaderboard SET user_name = ?, total_sessions = ?, avg_aptitude_score = ?, avg_coding_score = ?, overall_score = ?, updated_at = datetime('now') WHERE user_id = ?`).run(
            userName, sessions?.total_sessions || 0, Math.round(aptitudeScore), Math.round(codingScore), Math.round(overallScore), userId
        );
    } else {
        db.prepare(`INSERT INTO leaderboard (id, user_id, user_name, total_sessions, avg_aptitude_score, avg_coding_score, overall_score) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
            require('uuid').v4(), userId, userName, sessions?.total_sessions || 0, Math.round(aptitudeScore), Math.round(codingScore), Math.round(overallScore)
        );
    }

    // Update ranks
    const allEntries = db.prepare('SELECT id FROM leaderboard ORDER BY overall_score DESC').all();
    const updateRank = db.prepare('UPDATE leaderboard SET rank = ? WHERE id = ?');
    const updateMany = db.transaction((entries) => {
        entries.forEach((entry, idx) => { updateRank.run(idx + 1, entry.id); });
    });
    updateMany(allEntries);
}

module.exports = router;
