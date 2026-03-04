import { GoogleGenAI, Type } from '@google/genai';
import type { PedagogicalMode } from '../pedagogy/engine';
import type { Lesson } from '../lessons/context';

// Initialize the Gemini client
// We initialize it dynamically so it doesn't crash builds if the key is missing.
let ai: GoogleGenAI;
const getAI = () => {
    if (!ai) {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is not set. Gemini features will not work.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
};

// Use gemini-2.5-flash as the default model for speed and capability
const DEFAULT_MODEL = 'gemini-2.5-flash';

/**
 * Generates a structured lesson plan using Gemini.
 */
export async function generateLessonPlan(
    topic: string,
    gradeLevel: string,
    pedagogy: PedagogicalMode,
    duration: number = 45
): Promise<Partial<Lesson>> {
    const ai = getAI();

    // Construct the prompt based on the pedagogical mode to ensure the AI behaves accordingly.
    let pedagogyInstructions = '';
    switch (pedagogy) {
        case 'socratic':
            pedagogyInstructions = 'The lesson MUST rely purely on asking the students guiding questions to lead them to the answers. Do not provide direct explanations.';
            break;
        case 'constructivism':
            pedagogyInstructions = 'The lesson MUST focus on having the students build their own understanding through hands-on activities, experiences, and reflection.';
            break;
        case 'direct':
            pedagogyInstructions = 'The lesson MUST provide explicit, step-by-step instruction by the teacher to deliver core factual knowledge efficiently.';
            break;
        case 'inquiry':
            pedagogyInstructions = 'The lesson MUST be centered around a student-led investigation or problem to solve, with the teacher acting as a facilitator.';
            break;
        case 'scaffolded':
            pedagogyInstructions = 'The lesson MUST follow an "I do, We do, You do" structure, gradually releasing responsibility from the teacher to the student.';
            break;
        case 'collaborative':
            pedagogyInstructions = 'The lesson MUST heavily involve peer-to-peer interaction, group work, and collaborative problem solving.';
            break;
    }

    const prompt = `
You are an expert curriculum designer and teacher. Create a comprehensive, engaging lesson plan for the following topic:
Topic: "${topic}"
Target Audience: Grade ${gradeLevel}
Duration: ${duration} minutes
Pedagogical Approach: ${pedagogy}

CRITICAL PEDAGOGY INSTRUCTION: ${pedagogyInstructions}

You must return the result as a valid JSON object matching this exact schema:
{
  "title": "A catchy, appropriate title for the lesson",
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "activities": ["Detailed activity 1", "Detailed activity 2"],
  "avAids": ["Suggested Audio/Visual Aid 1", "Suggested Audio/Visual Aid 2"],
  "safetyNotes": "Any relevant safety notes or content warnings for this age group or topic. Say 'None' if NA."
}
`;

    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: {
                // Ensure structured JSON output
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                        activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                        avAids: { type: Type.ARRAY, items: { type: Type.STRING } },
                        safetyNotes: { type: Type.STRING }
                    },
                    required: ["title", "objectives", "activities", "avAids", "safetyNotes"]
                }
            }
        });

        if (!response.text) {
            throw new Error("No text returned from Gemini.");
        }

        const data = JSON.parse(response.text);
        return {
            title: data.title,
            subject: topic, // Fallback, could be refined
            gradeLevel: gradeLevel,
            pedagogicalMode: pedagogy,
            objectives: data.objectives,
            activities: data.activities,
            avAids: data.avAids,
            safetyNotes: data.safetyNotes,
            duration: duration
        };

    } catch (error) {
        console.error("Error generating lesson plan:", error);
        throw error;
    }
}

/**
 * Interacts with a student using a Strict Socratic method.
 * It takes the conversation history to maintain context.
 */
export async function socraticTutorChat(
    history: { role: 'user' | 'model', content: string }[],
    newMessage: string,
    topicContext: string,
    gradeLevel: string
): Promise<string> {
    const ai = getAI();

    const systemInstruction = `
You are a Strict Socratic Tutor for a Grade ${gradeLevel} student learning about "${topicContext}".
Your CRITICAL directive is to NEVER give the student the direct answer to a factual question.
Instead, you must ALWAYS respond with a thought-provoking question or a small hint that guides the student to figure out the answer themselves.
If the student is frustrated, validate their feelings, but still ask a guiding question to break the problem down into smaller steps.
Keep your responses relatively short, age-appropriate, and encouraging.
`;

    // Convert our generic history to Gemini's expected format
    const contents = history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // Add the new message
    contents.push({
        role: 'user',
        parts: [{ text: newMessage }]
    });

    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7, // A bit of creativity in formulating questions
            }
        });

        return response.text || "I'm having trouble thinking of a question right now. What do you think we should consider next?";
    } catch (error) {
        console.error("Error in Socratic Tutor chat:", error);
        throw error;
    }
}

/**
 * Safety Shield checking functionality.
 * Takes arbitrary content and determines if it is safe for the specified grade level.
 */
export async function safetyCheck(
    content: string,
    gradeLevel: string
): Promise<{ isSafe: boolean; reason?: string }> {
    const ai = getAI();

    const prompt = `
Analyze the following educational content or student input for safety and appropriateness for a Grade ${gradeLevel} student.
Look for:
- Inappropriate language or themes
- Bullying or harassment
- Harmful or dangerous instructions
- PII (Personally Identifiable Information) disclosure
- Content far outside the expected developmental appropriateness for Grade ${gradeLevel}

Content to analyze:
"""
${content}
"""

You must return the result as a valid JSON object matching this exact schema:
{
  "isSafe": boolean,
  "reason": "If isSafe is false, explain why. If isSafe is true, say 'Safe'."
}
`;

    try {
        const response = await ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isSafe: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    },
                    required: ["isSafe", "reason"]
                },
                temperature: 0.1 // Keep it deterministic for safety checks
            }
        });

        if (!response.text) {
            return { isSafe: false, reason: "Safety check failed to evaluate content." };
        }

        const data = JSON.parse(response.text);
        return { isSafe: data.isSafe, reason: data.reason };
    } catch (error) {
        console.error("Error in Safety Check:", error);
        // Fail closed for safety
        return { isSafe: false, reason: "System error during safety evaluation." };
    }
}
