const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'interview_system.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const db = getDb();

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'candidate' CHECK(role IN ('candidate', 'admin')),
      skill_level TEXT CHECK(skill_level IN ('beginner', 'intermediate', 'advanced')),
      preferred_language TEXT DEFAULT 'python',
      resume_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Aptitude Questions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS aptitude_questions (
      id TEXT PRIMARY KEY,
      question_text TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      topic TEXT NOT NULL CHECK(topic IN ('quant', 'logical', 'verbal')),
      difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
      explanation TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Coding Problems table
  db.exec(`
    CREATE TABLE IF NOT EXISTS coding_problems (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
      topic TEXT NOT NULL,
      problem_statement TEXT NOT NULL,
      sample_input TEXT NOT NULL,
      sample_output TEXT NOT NULL,
      constraints_text TEXT,
      test_cases TEXT NOT NULL,
      starter_code TEXT,
      solution TEXT,
      time_limit_ms INTEGER DEFAULT 5000,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Exam Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_type TEXT NOT NULL CHECK(session_type IN ('aptitude', 'coding', 'full')),
      status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed', 'abandoned')),
      skill_level TEXT,
      preferred_language TEXT,
      start_time TEXT DEFAULT (datetime('now')),
      end_time TEXT,
      total_score REAL DEFAULT 0,
      max_score REAL DEFAULT 0,
      percentage REAL DEFAULT 0,
      tab_switches INTEGER DEFAULT 0,
      ai_feedback TEXT,
      performance_analysis TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Aptitude Answers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS aptitude_answers (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      selected_answer TEXT,
      is_correct INTEGER DEFAULT 0,
      time_taken_seconds INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES exam_sessions(id),
      FOREIGN KEY (question_id) REFERENCES aptitude_questions(id)
    );
  `);

  // Coding Submissions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS coding_submissions (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      test_results TEXT,
      passed_tests INTEGER DEFAULT 0,
      total_tests INTEGER DEFAULT 0,
      execution_time_ms INTEGER,
      score REAL DEFAULT 0,
      ai_feedback TEXT,
      time_complexity TEXT,
      code_quality_score REAL DEFAULT 0,
      submitted_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES exam_sessions(id),
      FOREIGN KEY (problem_id) REFERENCES coding_problems(id)
    );
  `);

  // Leaderboard materialized view (using a regular table updated on demand)
  db.exec(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      user_name TEXT NOT NULL,
      total_sessions INTEGER DEFAULT 0,
      avg_aptitude_score REAL DEFAULT 0,
      avg_coding_score REAL DEFAULT 0,
      overall_score REAL DEFAULT 0,
      rank INTEGER,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_aptitude_topic_diff ON aptitude_questions(topic, difficulty);
    CREATE INDEX IF NOT EXISTS idx_coding_diff ON coding_problems(difficulty);
    CREATE INDEX IF NOT EXISTS idx_session_user ON exam_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_answers_session ON aptitude_answers(session_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_session ON coding_submissions(session_id);
    CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(overall_score DESC);
  `);

  // Seed default admin user
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    const { v4: uuidv4 } = require('uuid');
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(`INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)`).run(
      uuidv4(), 'admin@interview.ai', 'System Admin', hash, 'admin'
    );
    console.log('✅ Default admin created: admin@interview.ai / admin123');
  }

  // Seed sample aptitude questions
  seedAptitudeQuestions(db);
  // Seed sample coding problems
  seedCodingProblems(db);

  console.log('✅ Database initialized successfully');
}

function seedAptitudeQuestions(db) {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM aptitude_questions').get();
  if (count.cnt > 0) return;

  const { v4: uuidv4 } = require('uuid');
  const questions = [
    // QUANT - Easy
    { text: 'What is 25% of 200?', options: JSON.stringify(['40', '50', '60', '45']), correct: '50', topic: 'quant', difficulty: 'easy', explanation: '25/100 × 200 = 50' },
    { text: 'If a train travels 60 km in 1 hour, how far does it travel in 3.5 hours?', options: JSON.stringify(['180 km', '200 km', '210 km', '240 km']), correct: '210 km', topic: 'quant', difficulty: 'easy', explanation: '60 × 3.5 = 210 km' },
    { text: 'What is the next number in the series: 2, 6, 18, 54, ...?', options: JSON.stringify(['108', '162', '148', '128']), correct: '162', topic: 'quant', difficulty: 'easy', explanation: 'Each number is multiplied by 3: 54 × 3 = 162' },
    { text: 'A shirt costs $40 after a 20% discount. What was the original price?', options: JSON.stringify(['$48', '$50', '$55', '$60']), correct: '$50', topic: 'quant', difficulty: 'easy', explanation: '40 = 0.8 × original. Original = 40/0.8 = $50' },
    { text: 'What is the simple interest on $5000 at 8% per annum for 2 years?', options: JSON.stringify(['$600', '$700', '$800', '$900']), correct: '$800', topic: 'quant', difficulty: 'easy', explanation: 'SI = P×R×T/100 = 5000×8×2/100 = $800' },
    { text: 'If 5 workers can complete a job in 10 days, how many days will 10 workers take?', options: JSON.stringify(['5 days', '20 days', '8 days', '15 days']), correct: '5 days', topic: 'quant', difficulty: 'easy', explanation: 'Work is inversely proportional: 5×10/10 = 5 days' },
    // QUANT - Medium
    { text: 'A mixture contains milk and water in the ratio 3:1. How much water must be added to 60 liters of mixture to make the ratio 3:2?', options: JSON.stringify(['10 liters', '15 liters', '20 liters', '12 liters']), correct: '15 liters', topic: 'quant', difficulty: 'medium', explanation: 'Milk = 45L, Water = 15L. For 3:2 ratio: 45/(15+x) = 3/2, x = 15' },
    { text: 'Two pipes A and B can fill a tank in 12 and 15 hours respectively. If both are opened together, how long will it take to fill the tank?', options: JSON.stringify(['6 hrs 40 min', '7 hrs', '8 hrs', '5 hrs 30 min']), correct: '6 hrs 40 min', topic: 'quant', difficulty: 'medium', explanation: '1/12 + 1/15 = 9/60 = 3/20. Time = 20/3 = 6 hrs 40 min' },
    { text: 'The compound interest on $10,000 at 10% per annum for 2 years is?', options: JSON.stringify(['$2000', '$2100', '$2200', '$1900']), correct: '$2100', topic: 'quant', difficulty: 'medium', explanation: 'CI = 10000(1.1)² - 10000 = 12100 - 10000 = $2100' },
    { text: 'A boat goes 12 km upstream in 2 hours and 12 km downstream in 1 hour. Find the speed of the stream.', options: JSON.stringify(['2 km/h', '3 km/h', '4 km/h', '5 km/h']), correct: '3 km/h', topic: 'quant', difficulty: 'medium', explanation: 'Upstream = 6, Downstream = 12. Stream speed = (12-6)/2 = 3 km/h' },
    { text: 'In how many ways can 5 people be seated in a row?', options: JSON.stringify(['60', '100', '120', '150']), correct: '120', topic: 'quant', difficulty: 'medium', explanation: '5! = 5×4×3×2×1 = 120' },
    // QUANT - Hard
    { text: 'The probability of getting at least one head in 3 coin tosses is?', options: JSON.stringify(['7/8', '3/4', '1/2', '5/8']), correct: '7/8', topic: 'quant', difficulty: 'hard', explanation: '1 - P(all tails) = 1 - (1/2)³ = 1 - 1/8 = 7/8' },
    { text: 'A sum of money doubles itself in 10 years at simple interest. What is the rate of interest?', options: JSON.stringify(['5%', '8%', '10%', '12%']), correct: '10%', topic: 'quant', difficulty: 'hard', explanation: 'If P doubles, SI = P. P×R×10/100 = P, R = 10%' },
    { text: 'How many 3-digit numbers are divisible by 7?', options: JSON.stringify(['128', '129', '130', '127']), correct: '128', topic: 'quant', difficulty: 'hard', explanation: 'First = 105, Last = 994. Count = (994-105)/7 + 1 = 128' },

    // LOGICAL - Easy
    { text: 'Complete the analogy: Book is to Reading as Fork is to ___?', options: JSON.stringify(['Writing', 'Eating', 'Drawing', 'Cooking']), correct: 'Eating', topic: 'logical', difficulty: 'easy', explanation: 'A book is used for reading, a fork is used for eating' },
    { text: 'If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?', options: JSON.stringify(['Yes', 'No', 'Cannot determine', 'Sometimes']), correct: 'Yes', topic: 'logical', difficulty: 'easy', explanation: 'By transitivity: Bloops → Razzies → Lazzies' },
    { text: 'Which number does not belong: 2, 5, 10, 17, 26, __(37)__, 50?', options: JSON.stringify(['5', '__(37)__', '26', '50']), correct: '__(37)__', topic: 'logical', difficulty: 'easy', explanation: 'Pattern: differences are 3,5,7,9,11,13. 26+11=37, but 37 should follow this pattern correctly.' },
    { text: 'Pointing to a photograph, a man says "She is the daughter of my grandmother\'s only son." How is the woman related to the man?', options: JSON.stringify(['Sister', 'Mother', 'Aunt', 'Cousin']), correct: 'Sister', topic: 'logical', difficulty: 'easy', explanation: 'Grandmother\'s only son = father. Father\'s daughter = sister' },
    { text: 'If CLOUD is coded as DMPVE, how is RAIN coded?', options: JSON.stringify(['SBJO', 'SBJM', 'RAJO', 'QZHO']), correct: 'SBJO', topic: 'logical', difficulty: 'easy', explanation: 'Each letter is shifted by +1: R→S, A→B, I→J, N→O' },

    // LOGICAL - Medium
    { text: 'A clock shows 3:15. What is the angle between the hour and minute hands?', options: JSON.stringify(['0°', '7.5°', '15°', '22.5°']), correct: '7.5°', topic: 'logical', difficulty: 'medium', explanation: 'Hour hand at 3:15 = 97.5°, Minute hand at 90°. Angle = 7.5°' },
    { text: 'If you rearrange the letters "CIFAIPC" you would have the name of a(n):', options: JSON.stringify(['City', 'Ocean', 'Animal', 'Country']), correct: 'Ocean', topic: 'logical', difficulty: 'medium', explanation: 'CIFAIPC rearranges to PACIFIC' },
    { text: 'In a family of 6 persons A,B,C,D,E,F: A is the mother of B. B is sister of C. D is brother of E. E is daughter of A. F is brother of B. How many male members are in the family?', options: JSON.stringify(['2', '3', '4', '1']), correct: '3', topic: 'logical', difficulty: 'medium', explanation: 'Males: D (brother), F (brother), and we need C. Since B and E are female, C and D and F are possibilities. D, F and C(by elimination) = 3 males' },
    { text: 'Statement: All dogs are animals. Some animals are cats. Conclusion: Some dogs are cats.', options: JSON.stringify(['Follows', 'Does not follow', 'Sometimes follows', 'Cannot determine']), correct: 'Does not follow', topic: 'logical', difficulty: 'medium', explanation: 'The cats could be animals that are not dogs' },

    // LOGICAL - Hard
    { text: 'Five people (A,B,C,D,E) sit in a row. B sits next to D. A does not sit next to C. E sits at one end. C is not at an end. Which combination is valid?', options: JSON.stringify(['E,B,D,C,A', 'E,A,C,B,D', 'A,B,D,C,E', 'E,B,D,A,C']), correct: 'E,B,D,C,A', topic: 'logical', difficulty: 'hard', explanation: 'Check all conditions: E at end ✓, B next to D ✓, A not next to C ✓, C not at end ✓' },
    { text: 'If "→" means "is greater than", "←" means "is less than", "↑" means "is equal to", then if A→B, B←C, C↑D, what is the relationship between A and D?', options: JSON.stringify(['A > D', 'A < D', 'A = D', 'Cannot be determined']), correct: 'Cannot be determined', topic: 'logical', difficulty: 'hard', explanation: 'A>B, B<C, C=D. So A>B and B<D but we cannot determine A vs D directly.' },

    // VERBAL - Easy
    { text: 'Choose the correct synonym for "Benevolent":', options: JSON.stringify(['Hostile', 'Kind', 'Greedy', 'Lazy']), correct: 'Kind', topic: 'verbal', difficulty: 'easy', explanation: 'Benevolent means well-meaning and kindly' },
    { text: 'Choose the antonym of "Transparent":', options: JSON.stringify(['Clear', 'Opaque', 'Visible', 'Obvious']), correct: 'Opaque', topic: 'verbal', difficulty: 'easy', explanation: 'Transparent means see-through, opaque is its opposite' },
    { text: '"The project was completed _____ schedule." Choose the correct preposition:', options: JSON.stringify(['in', 'ahead of', 'with', 'at']), correct: 'ahead of', topic: 'verbal', difficulty: 'easy', explanation: 'Ahead of schedule is the correct phrase' },
    { text: 'Find the correctly spelled word:', options: JSON.stringify(['Accomodation', 'Accommodation', 'Acomodation', 'Accommadation']), correct: 'Accommodation', topic: 'verbal', difficulty: 'easy', explanation: 'Accommodation has double c and double m' },
    { text: 'Which sentence is grammatically correct?', options: JSON.stringify(['He don\'t know nothing', 'He doesn\'t know anything', 'He don\'t knows anything', 'He doesn\'t knows nothing']), correct: 'He doesn\'t know anything', topic: 'verbal', difficulty: 'easy', explanation: 'Correct subject-verb agreement and no double negative' },

    // VERBAL - Medium
    { text: 'Choose the word that best completes: "The scientist\'s theory was too _____ for most people to understand."', options: JSON.stringify(['simple', 'abstruse', 'clear', 'relevant']), correct: 'abstruse', topic: 'verbal', difficulty: 'medium', explanation: 'Abstruse means difficult to understand' },
    { text: 'Identify the figure of speech: "The wind whispered through the trees."', options: JSON.stringify(['Metaphor', 'Simile', 'Personification', 'Hyperbole']), correct: 'Personification', topic: 'verbal', difficulty: 'medium', explanation: 'Personification gives human qualities (whispering) to non-human things (wind)' },
    { text: '"Ephemeral" most closely means:', options: JSON.stringify(['Permanent', 'Fleeting', 'Significant', 'Ethereal']), correct: 'Fleeting', topic: 'verbal', difficulty: 'medium', explanation: 'Ephemeral means lasting for a very short time' },
    { text: 'Choose the sentence with correct punctuation:', options: JSON.stringify(["Its a beautiful day isn't it?", "It's a beautiful day, isn't it?", "Its a beautiful day, isnt it?", "It's a beautiful day isn't it?"]), correct: "It's a beautiful day, isn't it?", topic: 'verbal', difficulty: 'medium', explanation: 'Correct use of apostrophes and comma before tag question' },

    // VERBAL - Hard
    { text: '"The company\'s _____ approach to sustainability has earned it numerous accolades." Choose the best word.', options: JSON.stringify(['perfunctory', 'holistic', 'desultory', 'superficial']), correct: 'holistic', topic: 'verbal', difficulty: 'hard', explanation: 'Holistic means considering the whole system, which would earn accolades for sustainability' },
    { text: 'Identify the logical fallacy: "Everyone is buying this product, so it must be excellent."', options: JSON.stringify(['Ad hominem', 'Bandwagon fallacy', 'Straw man', 'Red herring']), correct: 'Bandwagon fallacy', topic: 'verbal', difficulty: 'hard', explanation: 'Bandwagon fallacy assumes something is true because many people do/believe it' },
    { text: '"The CEO\'s _____ remarks during the crisis _____ the stakeholders." Choose the best pair:', options: JSON.stringify(['tactful / reassured', 'careless / delighted', 'prudent / alarmed', 'reckless / soothed']), correct: 'tactful / reassured', topic: 'verbal', difficulty: 'hard', explanation: 'Tactful remarks would logically reassure stakeholders during a crisis' },
  ];

  const stmt = db.prepare(`INSERT INTO aptitude_questions (id, question_text, options, correct_answer, topic, difficulty, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertMany = db.transaction((items) => {
    for (const q of items) {
      stmt.run(uuidv4(), q.text, q.options, q.correct, q.topic, q.difficulty, q.explanation);
    }
  });
  insertMany(questions);
  console.log(`✅ Seeded ${questions.length} aptitude questions`);
}

function seedCodingProblems(db) {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM coding_problems').get();
  if (count.cnt > 0) return;

  const { v4: uuidv4 } = require('uuid');
  const problems = [
    // Easy
    {
      title: 'Two Sum',
      difficulty: 'easy',
      topic: 'arrays',
      problem_statement: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      sample_input: 'nums = [2, 7, 11, 15], target = 9',
      sample_output: '[0, 1]',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
      test_cases: JSON.stringify([
        { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
        { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
        { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
      ]),
      starter_code: JSON.stringify({
        python: 'def two_sum(nums, target):\n    # Your code here\n    pass',
        javascript: 'function twoSum(nums, target) {\n    // Your code here\n}',
        java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}',
        cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};'
      })
    },
    {
      title: 'Reverse String',
      difficulty: 'easy',
      topic: 'strings',
      problem_statement: 'Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
      sample_input: 's = ["h","e","l","l","o"]',
      sample_output: '["o","l","l","e","h"]',
      constraints: '1 <= s.length <= 10^5\ns[i] is a printable ascii character.',
      test_cases: JSON.stringify([
        { input: { s: ['h','e','l','l','o'] }, expected: ['o','l','l','e','h'] },
        { input: { s: ['H','a','n','n','a','h'] }, expected: ['h','a','n','n','a','H'] }
      ]),
      starter_code: JSON.stringify({
        python: 'def reverse_string(s):\n    # Your code here - modify s in-place\n    pass',
        javascript: 'function reverseString(s) {\n    // Your code here - modify s in-place\n}',
        java: 'class Solution {\n    public void reverseString(char[] s) {\n        // Your code here\n    }\n}',
        cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Your code here\n    }\n};'
      })
    },
    {
      title: 'Valid Parentheses',
      difficulty: 'easy',
      topic: 'stacks',
      problem_statement: 'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
      sample_input: 's = "()"',
      sample_output: 'true',
      constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'.',
      test_cases: JSON.stringify([
        { input: { s: '()' }, expected: true },
        { input: { s: '()[]{}' }, expected: true },
        { input: { s: '(]' }, expected: false },
        { input: { s: '([)]' }, expected: false },
        { input: { s: '{[]}' }, expected: true }
      ]),
      starter_code: JSON.stringify({
        python: 'def is_valid(s):\n    # Your code here\n    pass',
        javascript: 'function isValid(s) {\n    // Your code here\n}',
        java: 'class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n        return false;\n    }\n}',
        cpp: '#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n        return false;\n    }\n};'
      })
    },
    // Medium
    {
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'medium',
      topic: 'sliding-window',
      problem_statement: 'Given a string `s`, find the length of the longest substring without repeating characters.',
      sample_input: 's = "abcabcbb"',
      sample_output: '3',
      constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
      test_cases: JSON.stringify([
        { input: { s: 'abcabcbb' }, expected: 3 },
        { input: { s: 'bbbbb' }, expected: 1 },
        { input: { s: 'pwwkew' }, expected: 3 },
        { input: { s: '' }, expected: 0 }
      ]),
      starter_code: JSON.stringify({
        python: 'def length_of_longest_substring(s):\n    # Your code here\n    pass',
        javascript: 'function lengthOfLongestSubstring(s) {\n    // Your code here\n}',
        java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n        return 0;\n    }\n}',
        cpp: '#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n        return 0;\n    }\n};'
      })
    },
    {
      title: 'Container With Most Water',
      difficulty: 'medium',
      topic: 'two-pointers',
      problem_statement: 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the ith line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.',
      sample_input: 'height = [1,8,6,2,5,4,8,3,7]',
      sample_output: '49',
      constraints: 'n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4',
      test_cases: JSON.stringify([
        { input: { height: [1,8,6,2,5,4,8,3,7] }, expected: 49 },
        { input: { height: [1,1] }, expected: 1 },
        { input: { height: [4,3,2,1,4] }, expected: 16 }
      ]),
      starter_code: JSON.stringify({
        python: 'def max_area(height):\n    # Your code here\n    pass',
        javascript: 'function maxArea(height) {\n    // Your code here\n}',
        java: 'class Solution {\n    public int maxArea(int[] height) {\n        // Your code here\n        return 0;\n    }\n}',
        cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Your code here\n        return 0;\n    }\n};'
      })
    },
    {
      title: 'Group Anagrams',
      difficulty: 'medium',
      topic: 'hash-map',
      problem_statement: 'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
      sample_input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
      sample_output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
      constraints: '1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100\nstrs[i] consists of lowercase English letters.',
      test_cases: JSON.stringify([
        { input: { strs: ['eat','tea','tan','ate','nat','bat'] }, expected: [['eat','tea','ate'],['tan','nat'],['bat']] },
        { input: { strs: [''] }, expected: [['']] },
        { input: { strs: ['a'] }, expected: [['a']] }
      ]),
      starter_code: JSON.stringify({
        python: 'def group_anagrams(strs):\n    # Your code here\n    pass',
        javascript: 'function groupAnagrams(strs) {\n    // Your code here\n}',
        java: 'import java.util.*;\n\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}',
        cpp: '#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        // Your code here\n        return {};\n    }\n};'
      })
    },
    // Hard
    {
      title: 'Merge K Sorted Lists',
      difficulty: 'hard',
      topic: 'linked-lists',
      problem_statement: 'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.',
      sample_input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
      sample_output: '[1,1,2,3,4,4,5,6]',
      constraints: 'k == lists.length\n0 <= k <= 10^4\n0 <= lists[i].length <= 500\n-10^4 <= lists[i][j] <= 10^4',
      test_cases: JSON.stringify([
        { input: { lists: [[1,4,5],[1,3,4],[2,6]] }, expected: [1,1,2,3,4,4,5,6] },
        { input: { lists: [] }, expected: [] },
        { input: { lists: [[]] }, expected: [] }
      ]),
      starter_code: JSON.stringify({
        python: 'def merge_k_lists(lists):\n    # Your code here\n    # lists is a list of sorted lists\n    pass',
        javascript: 'function mergeKLists(lists) {\n    // Your code here\n    // lists is an array of sorted arrays\n}',
        java: 'import java.util.*;\n\nclass Solution {\n    public int[] mergeKLists(int[][] lists) {\n        // Your code here\n        return new int[]{};\n    }\n}',
        cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> mergeKLists(vector<vector<int>>& lists) {\n        // Your code here\n        return {};\n    }\n};'
      })
    },
    {
      title: 'Trapping Rain Water',
      difficulty: 'hard',
      topic: 'arrays',
      problem_statement: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
      sample_input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
      sample_output: '6',
      constraints: 'n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5',
      test_cases: JSON.stringify([
        { input: { height: [0,1,0,2,1,0,1,3,2,1,2,1] }, expected: 6 },
        { input: { height: [4,2,0,3,2,5] }, expected: 9 }
      ]),
      starter_code: JSON.stringify({
        python: 'def trap(height):\n    # Your code here\n    pass',
        javascript: 'function trap(height) {\n    // Your code here\n}',
        java: 'class Solution {\n    public int trap(int[] height) {\n        // Your code here\n        return 0;\n    }\n}',
        cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Your code here\n        return 0;\n    }\n};'
      })
    },
    {
      title: 'Median of Two Sorted Arrays',
      difficulty: 'hard',
      topic: 'binary-search',
      problem_statement: 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).',
      sample_input: 'nums1 = [1,3], nums2 = [2]',
      sample_output: '2.0',
      constraints: 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6',
      test_cases: JSON.stringify([
        { input: { nums1: [1,3], nums2: [2] }, expected: 2.0 },
        { input: { nums1: [1,2], nums2: [3,4] }, expected: 2.5 }
      ]),
      starter_code: JSON.stringify({
        python: 'def find_median_sorted_arrays(nums1, nums2):\n    # Your code here\n    pass',
        javascript: 'function findMedianSortedArrays(nums1, nums2) {\n    // Your code here\n}',
        java: 'class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Your code here\n        return 0.0;\n    }\n}',
        cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Your code here\n        return 0.0;\n    }\n};'
      })
    }
  ];

  const stmt = db.prepare(`INSERT INTO coding_problems (id, title, difficulty, topic, problem_statement, sample_input, sample_output, constraints_text, test_cases, starter_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertMany = db.transaction((items) => {
    for (const p of items) {
      stmt.run(uuidv4(), p.title, p.difficulty, p.topic, p.problem_statement, p.sample_input, p.sample_output, p.constraints, p.test_cases, p.starter_code);
    }
  });
  insertMany(problems);
  console.log(`✅ Seeded ${problems.length} coding problems`);
}

module.exports = { getDb, initializeDatabase };
