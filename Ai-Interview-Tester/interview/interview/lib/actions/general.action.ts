"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;

    try {
        const formattedTranscript = transcript
            .map(
                (sentence: { role: string; content: string }) =>
                    `- ${sentence.role}: ${sentence.content}\n`
            )
            .join("");

        let object:
            | z.infer<typeof feedbackSchema>
            | null = null;

        try {
            const result = await generateObject({
                model: google("gemini-2.0-flash-001"),
                schema: feedbackSchema,
                prompt: `
You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
Transcript:
${formattedTranscript}

Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
- Communication Skills: Clarity, articulation, structured responses.
- Technical Knowledge: Understanding of key concepts for the role.
- Problem Solving: Ability to analyze problems and propose solutions.
- Cultural Fit: Alignment with company values and job role.
- Confidence and Clarity: Confidence in responses, engagement, and clarity.
`,
                system:
                    "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
            });
            object = result.object as any;
        } catch {
            // Local fallback: simple heuristic-based feedback
            const userUtterances = transcript
                .filter((t) => t.role === "user")
                .map((t) => t.content);
            const totalWords = userUtterances
                .join(" ")
                .split(/\s+/)
                .filter(Boolean).length;
            const avgLen =
                userUtterances.length > 0
                    ? totalWords / userUtterances.length
                    : 0;
            const hasTechTerms = /react|node|api|database|optimiz|design|pattern|algorithm|typescript|python|java/i.test(
                userUtterances.join(" ")
            );
            const clarityScore = Math.min(100, Math.max(30, Math.round(avgLen * 4)));
            const technicalScore = hasTechTerms ? Math.min(95, clarityScore + 5) : Math.max(30, clarityScore - 10);
            const problemScore = Math.max(30, Math.round((clarityScore + technicalScore) / 2));
            const cultureScore = Math.min(90, Math.round(60 + (avgLen > 12 ? 10 : 0)));
            const confidenceScore = Math.min(95, Math.round(clarityScore + 5));
            const totalScore = Math.round(
                (clarityScore + technicalScore + problemScore + cultureScore + confidenceScore) / 5
            );

            object = {
                totalScore,
                categoryScores: [
                    {
                        name: "Communication Skills",
                        score: clarityScore,
                        comment:
                            "Communication is generally clear. Structuring answers with concise points will improve clarity.",
                    },
                    {
                        name: "Technical Knowledge",
                        score: technicalScore,
                        comment:
                            hasTechTerms
                                ? "Demonstrates awareness of technical concepts relevant to the role."
                                : "Provide more concrete technical details and examples.",
                    },
                    {
                        name: "Problem Solving",
                        score: problemScore,
                        comment:
                            "Explain your reasoning steps and trade-offs to strengthen problem-solving.",
                    },
                    {
                        name: "Cultural Fit",
                        score: cultureScore,
                        comment:
                            "Maintain collaborative tone and show alignment with team practices.",
                    },
                    {
                        name: "Confidence and Clarity",
                        score: confidenceScore,
                        comment:
                            "Maintain steady pace and avoid filler words to project confidence.",
                    },
                ],
                strengths: [
                    avgLen > 12 ? "Provides sufficiently detailed answers" : "Answers are concise",
                    hasTechTerms ? "Shows familiarity with relevant technologies" : "Open to elaboration on technical points",
                ],
                areasForImprovement: [
                    "Use examples and quantify outcomes where possible",
                    "Outline approach before diving into details",
                ],
                finalAssessment:
                    totalScore >= 75
                        ? "Strong overall performance. Continue refining structure and technical depth."
                        : "Solid foundation. Focus on clearer structuring and deeper technical examples.",
            };
        }

        const feedback = {
            interviewId: interviewId,
            userId: userId,
            totalScore: (object as any).totalScore,
            categoryScores: (object as any).categoryScores,
            strengths: (object as any).strengths,
            areasForImprovement: (object as any).areasForImprovement,
            finalAssessment: (object as any).finalAssessment,
            createdAt: new Date().toISOString(),
        };

        let feedbackRef;

        if (feedbackId) {
            feedbackRef = db.collection("feedback").doc(feedbackId);
        } else {
            feedbackRef = db.collection("feedback").doc();
        }

        await feedbackRef.set(feedback);

        return { success: true, feedbackId: feedbackRef.id };
    } catch (error) {
        console.error("Error saving feedback:", error);
        return { success: false };
    }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
    const interview = await db.collection("interviews").doc(id).get();
    if (!interview.exists) return null;
    return { id: interview.id, ...interview.data() } as Interview;
}

export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    const querySnapshot = await db
        .collection("feedback")
        .where("interviewId", "==", interviewId)
        .where("userId", "==", userId)
        .limit(1)
        .get();

    if (querySnapshot.empty) return null;

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
    params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    const snapshot = await db
        .collection("interviews")
        .where("finalized", "==", true)
        .limit(limit * 3)
        .get();

    const items = snapshot.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((doc: any) => doc.userId !== userId)
        .sort(
            (a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit);

    return items as Interview[];
}

export async function getInterviewsByUserId(
    userId: string
): Promise<Interview[] | null> {
    const snapshot = await db
        .collection("interviews")
        .where("userId", "==", userId)
        .get();

    const items = snapshot.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
        .sort(
            (a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

    return items as Interview[];
}

import { generateText } from "ai";

export async function generateAIResponse(params: {
    messages: { role: "user" | "assistant" | "system"; content: string }[];
    questions: string[];
    role: string;
}) {
    const { messages, questions, role } = params;

    try {
        const { text } = await generateText({
            model: google("gemini-2.5-flash"),
            system: `You are a professional job interviewer for a ${role} position. 
            You must follow these questions: ${questions.join(", ")}.
            
            Guidelines:
            - Stick to the interview flow.
            - Ask one question at a time.
            - Provide a brief acknowledgment of the candidate's last answer before moving to the next question.
            - For HR rounds, be more conversational and ask about their thought process if it's a logical question.
            - If it's a logical reasoning question, wait for them to explain their logic.
            - Be professional and encouraging.
            - When all questions are finished, thank the candidate and end the interview clearly.`,
            messages: messages,
        });

        return { success: true, text };
    } catch (error) {
        // Graceful local fallback when external AI is unavailable
        // Determine the next unasked question robustly (case and punctuation insensitive)
        const normalize = (s: string) =>
            s
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, " ")
                .replace(/\s+/g, " ")
                .trim();

        const questionsNorm = questions.map((q) => normalize(q));
        const assistantTexts = messages
            .filter((m) => m.role === "assistant")
            .map((m) => m.content);

        const asked = new Set<number>();

        // Prefer explicit index marker if present
        for (const t of assistantTexts) {
            const idxMatch = t.match(/QIDX:(\d+)/i);
            if (idxMatch) {
                const idx = parseInt(idxMatch[1], 10);
                if (!Number.isNaN(idx)) asked.add(idx);
            }
        }
        // Fallback to text inclusion match (normalized)
        if (asked.size === 0) {
            const aTextsNorm = assistantTexts.map((t) => normalize(t));
            questionsNorm.forEach((qNorm, idx) => {
                if (aTextsNorm.some((t) => t.includes(qNorm))) asked.add(idx);
            });
        }

        let nextIdx = -1;
        for (let i = 0; i < questions.length; i++) {
            if (!asked.has(i)) {
                nextIdx = i;
                break;
            }
        }

        const acknowledgment = "Thanks for your answer.";
        const fallbackText =
            nextIdx >= 0
                ? `${acknowledgment} QIDX:${nextIdx} Next question: ${questions[nextIdx]}`
                : `${acknowledgment} We've reached the end of the planned questions. That concludes the interview.`;

        return { success: true, text: fallbackText };
    }
}

