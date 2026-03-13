const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get leaderboard
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const limit = parseInt(req.query.limit) || 50;
        const leaderboard = db.prepare(`
      SELECT user_name, total_sessions, avg_aptitude_score, avg_coding_score, overall_score, rank, updated_at
      FROM leaderboard
      ORDER BY rank ASC
      LIMIT ?
    `).all(limit);
        res.json({ leaderboard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Get current user's rank
router.get('/me', authenticate, (req, res) => {
    try {
        const db = getDb();
        const entry = db.prepare('SELECT * FROM leaderboard WHERE user_id = ?').get(req.user.id);
        const total = db.prepare('SELECT COUNT(*) as count FROM leaderboard').get().count;
        res.json({ rank: entry?.rank || null, total, entry });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rank' });
    }
});

module.exports = router;
