const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'interview_system.db');
const db = new Database(dbPath);

console.log('--- Starting DB Seeding from Datasets ---');

// Parse CSV with semicolons
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(';');
        if (parts.length >= 6) {
            data.push({
                question: parts[0],
                a: parts[1],
                b: parts[2],
                c: parts[3],
                d: parts[4],
                ans: parts[5]
            });
        }
    }
    return data;
}

try {
    // 1. Delete old data
    console.log('Deleting existing questions and problems...');
    db.pragma('foreign_keys = OFF');
    db.exec('DELETE FROM aptitude_answers');
    db.exec('DELETE FROM coding_submissions');
    db.exec('DELETE FROM aptitude_questions');
    db.exec('DELETE FROM coding_problems');
    db.pragma('foreign_keys = ON');

    // 2. Insert Aptitude Questions
    const aptitudeStmt = db.prepare(`INSERT INTO aptitude_questions (id, question_text, options, correct_answer, topic, difficulty, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)`);

    const insertAptitude = (dataset, topic) => {
        let count = 0;
        for (const row of dataset) {
            const options = [row.a, row.b, row.c, row.d].filter(Boolean);
            if (options.length !== 4) continue;

            let correctOpt = options[0];
            if (row.ans === 'A') correctOpt = options[0];
            else if (row.ans === 'B') correctOpt = options[1];
            else if (row.ans === 'C') correctOpt = options[2];
            else if (row.ans === 'D') correctOpt = options[3];

            // Random difficulty to distribute among easy/medium/hard
            const diffs = ['easy', 'medium', 'hard'];
            const diff = diffs[count % 3];

            aptitudeStmt.run(uuidv4(), row.question, JSON.stringify(options), correctOpt, topic, diff, "Refer to syllabus and reasoning principles for this answer.");
            count++;
            if (count >= 100) break; // Limit to 100 per topic
        }
        console.log(`Seeded ${count} ${topic} questions from dataset.`);
    };

    console.log('Seeding Aptitude Questions...');

    const quantData = parseCSV(path.join(__dirname, '..', 'archive (13)', 'clean_general_aptitude_dataset.csv'));
    insertAptitude(quantData, 'quant');

    const logicalData = parseCSV(path.join(__dirname, '..', 'archive (13)', 'logical_reasoning_questions.csv'));
    insertAptitude(logicalData, 'logical');

    const verbalData = parseCSV(path.join(__dirname, '..', 'archive (13)', 'cse_dataset.csv'));
    insertAptitude(verbalData, 'verbal'); // Using CSE dataset for verbal section representation 

    // 3. Insert Coding Problems
    console.log('Seeding Coding Problems...');
    const leetcodePath = path.join(__dirname, '..', 'archive (13)', 'leetcode_problems.json');
    const leetcodeData = JSON.parse(fs.readFileSync(leetcodePath, 'utf-8'));

    const codingStmt = db.prepare(`INSERT INTO coding_problems 
        (id, title, difficulty, topic, problem_statement, sample_input, sample_output, constraints_text, test_cases, starter_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    let codingCount = 0;
    for (const prob of leetcodeData) {
        if (!prob.title || !prob.description) continue;

        let difficulty = prob.difficulty.toLowerCase();
        if (!['easy', 'medium', 'hard'].includes(difficulty)) difficulty = 'medium';

        const topic = (prob.topics && prob.topics.length > 0) ? prob.topics[0].toLowerCase() : 'algorithms';

        const problemStatement = prob.description.replace(/<[^>]*>?/gm, ''); // Stripping HTML

        const starterCode = JSON.stringify({
            python: prob.solution_code_python || 'def solution():\\n    pass',
            java: prob.solution_code_java || 'class Solution {\\n}',
            cpp: prob.solution_code_cpp || 'class Solution {\\n};',
            javascript: 'function solution() {\\n\\n}'
        });

        // Add dummy test cases payload to fit SQLite requirements without crashing frontend tests initially.
        const testCases = JSON.stringify([
            { input: "1", expected: "1" }
        ]);

        codingStmt.run(
            uuidv4(),
            prob.title,
            difficulty,
            topic.replace(/ /g, '-'),
            problemStatement,
            "See problem description.", // Sample input
            "See problem description.", // Sample output
            "Refer to standard algorithmic constraints.", // Constraints
            testCases,
            starterCode
        );

        codingCount++;
        if (codingCount >= 100) break; // Limit to 100 problems
    }
    console.log(`Seeded ${codingCount} coding problems from dataset.`);
    console.log('--- Seeding Complete ---');

} catch (err) {
    console.error('Error during seeding:', err);
}
