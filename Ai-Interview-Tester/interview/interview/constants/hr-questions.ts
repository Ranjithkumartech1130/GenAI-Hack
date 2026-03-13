export const GENERAL_QUESTIONS_POOL = [
    // Behavioral (Classic HR)
    "Tell me about a time you had to work with a difficult team member. How did you handle it?",
    "What is your greatest professional achievement so far?",
    "How do you prioritize your work when you have multiple deadlines?",
    "Tell me about a mistake you made at work and what you learned from it.",
    "Where do you see yourself in five years?",
    "Why should we hire you for this role?",

    // Logical Reasoning (From the dataset)
    "Look at this series: -16, -25, -34, -43, ... What number should come next? (Options: -41, -52, -50, -54)",
    "Look at this series: 97, 89, 81, 73, ... What number should come next? (Options: 61, 65, 67, 80)",
    "If CLOUD is coded as DMPVE, how is RAIN coded? (Options: SBJO, SBJM, RAJO, QZHO)",
    "Identify the figure of speech: 'The wind whispered through the trees.' (Options: Metaphor, Simile, Personification, Hyperbole)",
    "Choose the correct synonym for 'Benevolent': (Options: Hostile, Kind, Greedy, Lazy)",

    // Aptitude (From the dataset)
    "What is 25% of 200? (Options: 40, 50, 60, 45)",
    "If a train travels 60 km in 1 hour, how far does it travel in 3.5 hours? (Options: 180 km, 200 km, 210 km, 240 km)",
    "The reflex angle between the hands of a clock at 10:25 is: (Options: 180º, 192.5º, 195º, 197.5º)",
    "An error of 2% in excess is made while measuring the side of a square. The percentage of error in the calculated area is: (Options: 2%, 2.02%, 4%, 4.04%)",
];

export const getRandomHRQuestions = (count = 5) => {
    const shuffled = [...GENERAL_QUESTIONS_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
