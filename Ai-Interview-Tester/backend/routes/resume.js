const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

router.post('/evaluate', authenticate, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No resume file uploaded' });
        }

        const jobDescription = req.body.jobDescription || 'Software Engineer';

        let dataBuffer = fs.readFileSync(req.file.path);
        let pdfData = await pdf(dataBuffer);
        let text = pdfData.text.toLowerCase();

        // Simulated AI evaluation
        const commonSkills = ['python', 'javascript', 'java', 'c++', 'react', 'node', 'sql', 'aws', 'docker', 'machine learning', 'api', 'algorithms', 'front-end', 'backend', 'full-stack', 'html', 'css', 'typescript', 'express', 'git', 'next.js', 'mongodb', 'postgresql', 'data structures'];

        let matchedSkills = [];
        for (let skill of commonSkills) {
            if (text.includes(skill.toLowerCase())) {
                matchedSkills.push(skill);
            }
        }

        const score = Math.min(100, matchedSkills.length * 8 + 30); // Base 30, +8 per skill

        let suitability = 'Moderate';
        if (score >= 85) suitability = 'Highly Suitable';
        else if (score >= 60) suitability = 'Suitable';
        else if (score < 45) suitability = 'Not Suitable';

        const feedback = generateResumeFeedback(matchedSkills, score, jobDescription);

        // Cleanup uploaded file
        try { fs.unlinkSync(req.file.path); } catch (e) { }

        res.json({
            score,
            suitability,
            matched_skills: matchedSkills,
            feedback,
            parsed_text_length: text.length
        });
    } catch (error) {
        console.error('Resume evaluation error:', error);
        res.status(500).json({ error: 'Failed to evaluate resume. Make sure it is a valid PDF.' });
    }
});

function generateResumeFeedback(skills, score, role) {
    let feedback = `## Resume Analysis for ${role}\n\n`;
    if (score >= 85) {
        feedback += `✅ **Excellent match!** Your resume strongly aligns with typical requirements for a ${role}.\n`;
    } else if (score >= 60) {
        feedback += `⚠️ **Good potential.** You have some foundational skills for a ${role}, but could improve certain areas.\n`;
    } else {
        feedback += `🛑 **Needs improvement.** Your resume lacks key skills consistently found in ${role} positions.\n`;
    }

    if (skills.length > 0) {
        feedback += `\n### Identified Strengths:\nWe found the following relevant keywords in your resume:\n`;
        skills.forEach(s => feedback += `- **${s.toUpperCase()}**\n`);
    } else {
        feedback += `\n### Identified Strengths:\nWe couldn't clearly identify technical keywords. Ensure your skills section is prominent.\n`;
    }

    feedback += `\n### AI Suggestions:\n`;
    feedback += `- Ensure your impact is measurable (e.g., "Improved performance by 20%").\n`;
    if (skills.length < 5) {
        feedback += `- Consider acquiring and listing more technical skills (e.g., Python, React, SQL, etc.) relevant to your target role.\n`;
    }
    feedback += `- Check for formatting issues and ensure your resume is ATS-friendly.\n`;
    feedback += `- Tailor your resume specifically to each job description, ensuring key terms match their requirements.\n`;

    return feedback;
}

module.exports = router;
