import { NextRequest, NextResponse } from 'next/server';
import { safetyCheck } from '@/lib/gemini/client';

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

import { GoogleGenAI } from '@google/genai';

interface InquiryRequest {
    query: string;
    systemPrompt: string;
    guidelines: string[];
    gradeLevel?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: InquiryRequest = await request.json();
        const { query, systemPrompt, guidelines, gradeLevel } = body;

        if (!query || !systemPrompt) {
            return NextResponse.json(
                { error: 'Missing required fields: query and systemPrompt' },
                { status: 400 }
            );
        }

        // Run deep safety check using Gemini
        if (gradeLevel) {
            const safety = await safetyCheck(query, gradeLevel);
            if (!safety.isSafe) {
                return NextResponse.json({
                    response: `[Safety Shield Interception] ${safety.reason}`,
                    safetyBlocked: true,
                });
            }
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Server configuration error: GEMINI_API_KEY is not set.' },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        let fullSystemInstruction = systemPrompt;
        if (guidelines && guidelines.length > 0) {
            fullSystemInstruction += '\n\nAdditional Pedagogy Guidelines:\n' + guidelines.map(g => '- ' + g).join('\n');
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: query,
            config: {
                systemInstruction: fullSystemInstruction,
                temperature: 0.7,
            }
        });

        return NextResponse.json({
            response: response.text || "I'm having trouble thinking of how to guide you on this right now.",
            guidelines,
            pedagogicalMode: systemPrompt.toLowerCase().includes('socratic') ? 'socratic' :
                systemPrompt.toLowerCase().includes('constructivist') ? 'constructivism' : 'direct',
        });

    } catch (error) {
        console.error('Inquiry API error:', error);
        return NextResponse.json(
            { error: 'Internal server error while calling AI provider' },
            { status: 500 }
        );
    }
}
