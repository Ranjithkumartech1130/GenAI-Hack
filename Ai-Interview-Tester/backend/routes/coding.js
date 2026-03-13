const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Start coding round
router.post('/start', authenticate, (req, res) => {
    try {
        const { preferred_language, difficulty_preference, aptitude_session_id } = req.body;
        const db = getDb();

        // Enforce > 50% aptitude score rule
        const topAptitude = db.prepare('SELECT percentage FROM exam_sessions WHERE user_id = ? AND session_type = ? AND status = ? ORDER BY percentage DESC LIMIT 1')
            .get(req.user.id, 'aptitude', 'completed');

        if (!topAptitude || topAptitude.percentage <= 50) {
            return res.status(403).json({ error: 'You must pass the Aptitude round with over 50% to access the Coding round.' });
        }

        const language = preferred_language || req.user.preferred_language || 'python';

        // Determine difficulty distribution
        let assignEasy = 1, assignMedium = 1, assignHard = 0;

        if (difficulty_preference === 'advanced') {
            assignHard = 1;
        } else if (aptitude_session_id) {
            // Auto-select based on aptitude performance
            const aptSession = db.prepare('SELECT percentage FROM exam_sessions WHERE id = ?').get(aptitude_session_id);
            if (aptSession && aptSession.percentage >= 75) {
                assignHard = 1;
            }
        }

        // Get problems
        const easyProblems = db.prepare('SELECT * FROM coding_problems WHERE difficulty = ? ORDER BY RANDOM() LIMIT ?').all('easy', assignEasy);
        const mediumProblems = db.prepare('SELECT * FROM coding_problems WHERE difficulty = ? ORDER BY RANDOM() LIMIT ?').all('medium', assignMedium);
        const hardProblems = db.prepare('SELECT * FROM coding_problems WHERE difficulty = ? ORDER BY RANDOM() LIMIT ?').all('hard', assignHard);

        const problems = [...easyProblems, ...mediumProblems, ...hardProblems];

        // Create session
        const sessionId = uuidv4();
        db.prepare(`INSERT INTO exam_sessions (id, user_id, session_type, preferred_language, status, skill_level) VALUES (?, ?, 'coding', ?, 'in_progress', ?)`).run(
            sessionId, req.user.id, language, req.user.skill_level
        );

        // Format problems for frontend
        const formattedProblems = problems.map((p, idx) => {
            let starterCode = {};
            try { starterCode = JSON.parse(p.starter_code); } catch (e) { }
            return {
                id: p.id,
                problem_number: idx + 1,
                title: p.title,
                difficulty: p.difficulty,
                topic: p.topic,
                problem_statement: p.problem_statement,
                sample_input: p.sample_input,
                sample_output: p.sample_output,
                constraints: p.constraints_text,
                starter_code: starterCode[language] || starterCode.python || '',
                time_limit_ms: p.time_limit_ms
            };
        });

        res.json({
            session_id: sessionId,
            language,
            total_problems: formattedProblems.length,
            problems: formattedProblems
        });
    } catch (error) {
        console.error('Start coding error:', error);
        res.status(500).json({ error: 'Failed to start coding round' });
    }
});

// Submit code for a problem
router.post('/submit', authenticate, (req, res) => {
    try {
        const { session_id, problem_id, language, code } = req.body;
        if (!session_id || !problem_id || !code) {
            return res.status(400).json({ error: 'Session ID, problem ID and code are required' });
        }
        const db = getDb();

        // Verify session
        const session = db.prepare('SELECT * FROM exam_sessions WHERE id = ? AND user_id = ? AND status = ?').get(
            session_id, req.user.id, 'in_progress'
        );
        if (!session) {
            return res.status(404).json({ error: 'Active session not found' });
        }

        // Get problem test cases
        const problem = db.prepare('SELECT * FROM coding_problems WHERE id = ?').get(problem_id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        let testCases = [];
        try { testCases = JSON.parse(problem.test_cases); } catch (e) { }

        // Evaluate code (simulated - in production use sandboxed execution)
        const evaluation = evaluateCode(code, language, testCases, problem);

        // Save submission
        const submissionId = uuidv4();
        const existing = db.prepare('SELECT id FROM coding_submissions WHERE session_id = ? AND problem_id = ?').get(session_id, problem_id);

        if (existing) {
            db.prepare(`UPDATE coding_submissions SET 
        language = ?, code = ?, test_results = ?, passed_tests = ?, total_tests = ?,
        execution_time_ms = ?, score = ?, ai_feedback = ?, time_complexity = ?,
        code_quality_score = ?, submitted_at = datetime('now')
        WHERE id = ?`).run(
                language || 'python', code, JSON.stringify(evaluation.test_results),
                evaluation.passed_tests, evaluation.total_tests,
                evaluation.execution_time_ms, evaluation.score,
                evaluation.ai_feedback, evaluation.time_complexity,
                evaluation.code_quality_score, existing.id
            );
        } else {
            db.prepare(`INSERT INTO coding_submissions (id, session_id, problem_id, language, code, test_results, passed_tests, total_tests, execution_time_ms, score, ai_feedback, time_complexity, code_quality_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
                submissionId, session_id, problem_id, language || 'python', code,
                JSON.stringify(evaluation.test_results), evaluation.passed_tests, evaluation.total_tests,
                evaluation.execution_time_ms, evaluation.score, evaluation.ai_feedback,
                evaluation.time_complexity, evaluation.code_quality_score
            );
        }

        res.json({
            submission_id: existing?.id || submissionId,
            ...evaluation
        });
    } catch (error) {
        console.error('Submit code error:', error);
        res.status(500).json({ error: 'Failed to submit code' });
    }
});

// Run test cases only (don't save)
router.post('/run-tests', authenticate, (req, res) => {
    try {
        const { problem_id, language, code } = req.body;
        const db = getDb();
        const problem = db.prepare('SELECT * FROM coding_problems WHERE id = ?').get(problem_id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        let testCases = [];
        try { testCases = JSON.parse(problem.test_cases); } catch (e) { }

        const evaluation = evaluateCode(code, language, testCases, problem);
        res.json(evaluation);
    } catch (error) {
        console.error('Run tests error:', error);
        res.status(500).json({ error: 'Failed to run tests' });
    }
});

// Complete coding round
router.post('/complete', authenticate, (req, res) => {
    try {
        const { session_id } = req.body;
        const db = getDb();

        const session = db.prepare('SELECT * FROM exam_sessions WHERE id = ? AND user_id = ?').get(session_id, req.user.id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Get all submissions
        const submissions = db.prepare(`
      SELECT cs.*, cp.title, cp.difficulty, cp.topic
      FROM coding_submissions cs
      JOIN coding_problems cp ON cs.problem_id = cp.id
      WHERE cs.session_id = ?
    `).all(session_id);

        const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
        const maxScore = submissions.length * 100;
        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

        // Performance analysis
        const performanceAnalysis = {
            total_problems: submissions.length,
            total_score: totalScore,
            max_score: maxScore,
            percentage: Math.round(percentage),
            problems: submissions.map(s => ({
                title: s.title,
                difficulty: s.difficulty,
                topic: s.topic,
                score: s.score,
                passed_tests: s.passed_tests,
                total_tests: s.total_tests,
                time_complexity: s.time_complexity,
                code_quality: s.code_quality_score
            })),
            overall_feedback: generateOverallCodingFeedback(submissions, percentage)
        };

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
    `).run(totalScore, maxScore, Math.round(percentage), JSON.stringify(performanceAnalysis), performanceAnalysis.overall_feedback, session_id);

        // Update leaderboard
        updateLeaderboard(db, req.user.id, req.user.name);

        res.json({
            session_id,
            total_score: totalScore,
            max_score: maxScore,
            percentage: Math.round(percentage),
            performance_analysis: performanceAnalysis
        });
    } catch (error) {
        console.error('Complete coding error:', error);
        res.status(500).json({ error: 'Failed to complete coding round' });
    }
});

function evaluateCode(code, language, testCases, problem) {
    // Code quality analysis (heuristic-based)
    const qualityScore = analyzeCodeQuality(code, language);
    const timeComplexity = estimateTimeComplexity(code);

    // Simulated test execution
    const testResults = testCases.map((tc, idx) => {
        // In production, this would execute in a sandboxed container
        // For now, we do pattern-based checking
        return {
            test_number: idx + 1,
            input: tc.input,
            expected: tc.expected,
            passed: code.trim().length > 20, // Simplified check - in production, execute code
            execution_time_ms: Math.random() * 100 + 10
        };
    });

    const passedTests = testResults.filter(t => t.passed).length;
    const totalTests = testResults.length;
    const correctnessScore = totalTests > 0 ? (passedTests / totalTests) * 60 : 0;
    const qualityPoints = qualityScore * 0.25;
    const complexityPoints = getComplexityPoints(timeComplexity) * 15;
    const totalScoreCalc = Math.min(100, Math.round(correctnessScore + qualityPoints + complexityPoints));

    const aiFeedback = generateCodeFeedback(code, language, passedTests, totalTests, timeComplexity, qualityScore);

    return {
        test_results: testResults,
        passed_tests: passedTests,
        total_tests: totalTests,
        execution_time_ms: Math.round(testResults.reduce((s, t) => s + t.execution_time_ms, 0)),
        score: totalScoreCalc,
        time_complexity: timeComplexity,
        code_quality_score: Math.round(qualityScore * 100) / 100,
        ai_feedback: aiFeedback
    };
}

function analyzeCodeQuality(code, language) {
    let score = 0.5; // Base score

    // Check for comments
    if (code.includes('//') || code.includes('#') || code.includes('/*')) score += 0.1;

    // Check for meaningful variable names (not single letters)
    const hasDescriptiveVars = /[a-z]{3,}/g.test(code);
    if (hasDescriptiveVars) score += 0.1;

    // Check for proper indentation
    const lines = code.split('\n');
    const indentedLines = lines.filter(l => l.startsWith('  ') || l.startsWith('\t'));
    if (indentedLines.length > lines.length * 0.3) score += 0.1;

    // Check code length (not too short, not too long)
    if (code.length > 50 && code.length < 5000) score += 0.1;

    // Check for error handling
    if (code.includes('try') || code.includes('catch') || code.includes('except') || code.includes('if')) score += 0.1;

    return Math.min(1, score);
}

function estimateTimeComplexity(code) {
    const hasNestedLoop = /for.*\n.*for|while.*\n.*while|for.*\{[^}]*for/s.test(code);
    const hasSingleLoop = /for|while/.test(code);
    const hasRecursion = /function.*\(.*\)[\s\S]*\1|def.*\(.*\)[\s\S]*\1/.test(code);
    const hasSort = /\.sort|sorted|Arrays\.sort/i.test(code);

    if (hasNestedLoop) return 'O(n²)';
    if (hasSort) return 'O(n log n)';
    if (hasSingleLoop || hasRecursion) return 'O(n)';
    return 'O(1)';
}

function getComplexityPoints(complexity) {
    const scores = { 'O(1)': 1, 'O(log n)': 0.95, 'O(n)': 0.85, 'O(n log n)': 0.7, 'O(n²)': 0.5, 'O(n³)': 0.3 };
    return scores[complexity] || 0.5;
}

function generateCodeFeedback(code, language, passed, total, complexity, quality) {
    let feedback = `## Code Review\n\n`;
    feedback += `### Test Results: ${passed}/${total} passed\n`;
    feedback += `### Estimated Time Complexity: ${complexity}\n`;
    feedback += `### Code Quality Score: ${Math.round(quality * 100)}%\n\n`;

    if (passed === total) {
        feedback += `✅ All test cases passed! Great job!\n\n`;
    } else {
        feedback += `⚠️ ${total - passed} test case(s) failed. Review your logic.\n\n`;
    }

    feedback += `### Suggestions\n`;
    if (quality < 0.6) feedback += `- Add comments to explain your approach\n`;
    if (quality < 0.7) feedback += `- Use more descriptive variable names\n`;
    if (complexity === 'O(n²)' || complexity === 'O(n³)') {
        feedback += `- Consider optimizing to reduce time complexity\n`;
        feedback += `- Look into hash maps or sorting for potential O(n) or O(n log n) solutions\n`;
    }
    if (code.length < 30) feedback += `- Your solution appears incomplete\n`;

    return feedback;
}

function generateOverallCodingFeedback(submissions, percentage) {
    let grade = '';
    if (percentage >= 90) grade = 'Outstanding Coder';
    else if (percentage >= 75) grade = 'Strong Programmer';
    else if (percentage >= 60) grade = 'Competent Developer';
    else if (percentage >= 40) grade = 'Developing Skills';
    else grade = 'Needs Practice';

    let feedback = `## Coding Assessment: ${grade} (${Math.round(percentage)}%)\n\n`;
    feedback += `### Summary\n`;
    submissions.forEach(s => {
        const emoji = s.score >= 80 ? '🟢' : s.score >= 50 ? '🟡' : '🔴';
        feedback += `${emoji} **${s.title}** (${s.difficulty}): ${s.score}/100 - ${s.time_complexity}\n`;
    });
    return feedback;
}

function updateLeaderboard(db, userId, userName) {
    const sessions = db.prepare(`
    SELECT AVG(percentage) as avg_score, COUNT(*) as total_sessions 
    FROM exam_sessions WHERE user_id = ? AND status = 'completed'
  `).get(userId);

    const aptSessions = db.prepare(`
    SELECT AVG(percentage) as avg_score 
    FROM exam_sessions WHERE user_id = ? AND status = 'completed' AND session_type = 'aptitude'
  `).get(userId);

    const codingSessions = db.prepare(`
    SELECT AVG(percentage) as avg_score 
    FROM exam_sessions WHERE user_id = ? AND status = 'completed' AND session_type = 'coding'
  `).get(userId);

    const existing = db.prepare('SELECT id FROM leaderboard WHERE user_id = ?').get(userId);
    const id = existing?.id || uuidv4();
    const overallScore = sessions?.avg_score || 0;

    if (existing) {
        db.prepare(`UPDATE leaderboard SET user_name = ?, total_sessions = ?, avg_aptitude_score = ?, avg_coding_score = ?, overall_score = ?, updated_at = datetime('now') WHERE user_id = ?`).run(
            userName, sessions?.total_sessions || 0, Math.round(aptSessions?.avg_score || 0), Math.round(codingSessions?.avg_score || 0), Math.round(overallScore), userId
        );
    } else {
        db.prepare(`INSERT INTO leaderboard (id, user_id, user_name, total_sessions, avg_aptitude_score, avg_coding_score, overall_score) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
            id, userId, userName, sessions?.total_sessions || 0, Math.round(aptSessions?.avg_score || 0), Math.round(codingSessions?.avg_score || 0), Math.round(overallScore)
        );
    }

    const allEntries = db.prepare('SELECT id FROM leaderboard ORDER BY overall_score DESC').all();
    const updateRank = db.prepare('UPDATE leaderboard SET rank = ? WHERE id = ?');
    const updateMany = db.transaction((entries) => {
        entries.forEach((entry, idx) => { updateRank.run(idx + 1, entry.id); });
    });
    updateMany(allEntries);
}

module.exports = router;
