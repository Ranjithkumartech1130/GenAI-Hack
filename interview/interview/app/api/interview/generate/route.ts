import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  // Normalize inputs
  const techs = String(techstack || "")
    .split(",")
    .map((t: string) => t.trim())
    .filter(Boolean);
  const total = Math.max(1, Math.min(Number(amount) || 5, 20));

  // Attempt LLM question generation, with a graceful local fallback
  let questionsList: string[] | null = null;
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techs.join(", ")}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${total}.
Please return only the questions, without any additional text.
The questions are going to be read by a voice assistant so do not use special characters.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3"]`,
    });
    questionsList = JSON.parse(text);
    if (!Array.isArray(questionsList)) questionsList = null;
  } catch (_) {
    // Ignore and fallback locally
  }

  if (!questionsList) {
    // Local deterministic fallback without external API dependency
    const templatesBehavioral = [
      "Tell me about a challenging problem you solved recently",
      "Describe a time you received constructive feedback and how you acted on it",
      "How do you prioritize tasks when deadlines compete",
      "Tell me about a time you led an initiative",
      "Describe a failure and what you learned from it",
    ];
    const makeTechQuestion = (tech: string) => [
      `Explain the core principles of ${tech}`,
      `How do you debug issues in ${tech} applications`,
      `What best practices do you follow when writing ${tech} code`,
      `Describe a performance optimization you have implemented with ${tech}`,
    ];

    const pool: string[] = [];
    if (/technical/i.test(type) || /mixed/i.test(type)) {
      if (techs.length > 0) {
        techs.forEach((t) => {
          pool.push(...makeTechQuestion(t));
        });
      } else {
        pool.push(
          "Explain event loop and concurrency in JavaScript",
          "What is the difference between REST and GraphQL",
          "How do you approach testing and code quality",
          "Describe how you design scalable APIs",
        );
      }
    }
    if (/behavioral/i.test(type) || /mixed/i.test(type)) {
      pool.push(...templatesBehavioral);
    }
    // Ensure enough questions
    while (pool.length < total) {
      pool.push(`What would you improve in your approach to ${role}`);
    }
    questionsList = pool.slice(0, total);
  }

  const interview = {
    role: String(role),
    type: String(type),
    level: String(level),
    techstack: techs,
    questions: questionsList,
    userId: String(userid),
    finalized: true,
    coverImage: getRandomInterviewCover(),
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await db.collection("interviews").add(interview);
    return Response.json({ success: true, id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error("Error saving interview:", error);
    return Response.json({ success: false, error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
