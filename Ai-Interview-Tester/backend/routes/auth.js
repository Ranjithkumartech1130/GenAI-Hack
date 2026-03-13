const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Sync user from SkillGPS (auto-auth: create or update and return token)
router.post('/sync', (req, res) => {
    try {
        const { email, name, password, skill_level } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const db = getDb();
        const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (existing) {
            // Update password and name for existing user
            const hash = bcrypt.hashSync(password, 10);
            db.prepare('UPDATE users SET password_hash = ?, name = COALESCE(?, name) WHERE id = ?').run(hash, name, existing.id);
            const token = jwt.sign({ userId: existing.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return res.json({
                message: 'User synced',
                token,
                user: { id: existing.id, email: existing.email, name: name || existing.name, role: existing.role, skill_level: existing.skill_level }
            });
        } else {
            // Create new user
            const hash = bcrypt.hashSync(password, 10);
            const id = uuidv4();
            db.prepare('INSERT INTO users (id, email, name, password_hash, skill_level, preferred_language) VALUES (?, ?, ?, ?, ?, ?)').run(
                id, email, name || 'SkillGPS User', hash, skill_level || 'intermediate', 'python'
            );
            const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return res.status(201).json({
                message: 'User created',
                token,
                user: { id, email, name: name || 'SkillGPS User', role: 'candidate', skill_level: skill_level || 'intermediate' }
            });
        }
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'User sync failed' });
    }
});

// Register
router.post('/register', (req, res) => {
    try {
        const { email, name, password, skill_level, preferred_language } = req.body;
        if (!email || !name || !password) {
            return res.status(400).json({ error: 'Email, name and password are required' });
        }
        const db = getDb();
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const hash = bcrypt.hashSync(password, 10);
        const id = uuidv4();
        db.prepare(`INSERT INTO users (id, email, name, password_hash, skill_level, preferred_language) VALUES (?, ?, ?, ?, ?, ?)`).run(
            id, email, name, hash, skill_level || 'intermediate', preferred_language || 'python'
        );
        const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id, email, name, role: 'candidate', skill_level: skill_level || 'intermediate', preferred_language: preferred_language || 'python' }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                skill_level: user.skill_level,
                preferred_language: user.preferred_language
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get profile
router.get('/profile', authenticate, (req, res) => {
    res.json({ user: req.user });
});

// Update profile
router.put('/profile', authenticate, (req, res) => {
    try {
        const { name, skill_level, preferred_language } = req.body;
        const db = getDb();
        db.prepare('UPDATE users SET name = COALESCE(?, name), skill_level = COALESCE(?, skill_level), preferred_language = COALESCE(?, preferred_language), updated_at = datetime("now") WHERE id = ?').run(
            name, skill_level, preferred_language, req.user.id
        );
        const updated = db.prepare('SELECT id, email, name, role, skill_level, preferred_language FROM users WHERE id = ?').get(req.user.id);
        res.json({ user: updated });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Profile update failed' });
    }
});

module.exports = router;
