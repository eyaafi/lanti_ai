import { NextRequest, NextResponse } from 'next/server';

/**
 * LANTIAI - Student Inquiry API Route
 * 
 * This route receives a pedagogically-transformed prompt from the client
 * and returns an AI response. The Safety Shield has already been applied
 * on the client side (Input Rail). This route applies the Output Rail.
 * 
 * In production: integrate with Google Gemini, OpenAI, or Anthropic.
 * Currently: returns pedagogically-appropriate mock responses for development.
 */

interface InquiryRequest {
    query: string;
    systemPrompt: string;
    guidelines: string[];
}

// Mock pedagogical responses for development/demo
const MOCK_RESPONSES: Record<string, string> = {
    fraction: `That's a wonderful question to explore! 🤔

Before I tell you anything, let me ask you something first:

If you had a whole pizza and you cut it into 2 equal pieces, what would you call each piece?

Take a moment to think about it. What do you notice about the size of each piece compared to the whole pizza?

*[Visual aid: Two half-apples merging together is being generated for you...]*`,

    photosynthesis: `Ooh, you're asking about one of nature's most amazing processes! 🌱

Here's my question for you: Have you ever noticed that plants seem to "need" sunlight to survive? 

What do YOU think is happening inside a leaf when sunlight hits it? 

Think about what a plant needs to grow — what ingredients might it be collecting?

*[An animated diagram of the photosynthesis cycle is being prepared...]*`,

    default: `That's a fascinating question! Let me help you discover the answer rather than just tell you. 🧠

First, tell me: what do you already know about this topic? Even a small guess is a great starting point!

What have you observed or experienced that might give you a clue?`,
};

function getMockResponse(query: string, systemPrompt: string): string {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('fraction') || lowerQuery.includes('1/2') || lowerQuery.includes('half')) {
        return MOCK_RESPONSES.fraction;
    }

    if (lowerQuery.includes('photosynthesis') || lowerQuery.includes('plant') || lowerQuery.includes('chlorophyll')) {
        return MOCK_RESPONSES.photosynthesis;
    }

    // Check if it's direct instruction mode (systemPrompt contains "direct")
    if (systemPrompt.toLowerCase().includes('direct, accurate')) {
        return `Great question! Here's a clear explanation:

**${query}** is a concept that involves several key ideas:

1. **Definition**: The core meaning of this concept
2. **Example**: A real-world instance you can observe
3. **Application**: How this shows up in everyday life

*[A visual explanation is being generated to reinforce this concept...]*`;
    }

    return MOCK_RESPONSES.default;
}

export async function POST(request: NextRequest) {
    try {
        const body: InquiryRequest = await request.json();
        const { query, systemPrompt, guidelines } = body;

        if (!query || !systemPrompt) {
            return NextResponse.json(
                { error: 'Missing required fields: query and systemPrompt' },
                { status: 400 }
            );
        }

        // In production, call your AI provider here:
        // const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
        //   method: 'POST',
        //   headers: { 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`, 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     contents: [{ role: 'user', parts: [{ text: query }] }],
        //     systemInstruction: { parts: [{ text: systemPrompt }] },
        //   }),
        // });

        // Development mock response
        const mockResponse = getMockResponse(query, systemPrompt);

        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({
            response: mockResponse,
            guidelines,
            pedagogicalMode: systemPrompt.includes('Socratic') ? 'socratic' :
                systemPrompt.includes('Constructivist') ? 'constructivism' : 'direct',
        });

    } catch (error) {
        console.error('Inquiry API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
