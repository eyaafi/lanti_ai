/**
 * LANTIAI - Audio-Visual Aids Engine
 * 
 * Generates multimodal explanations to demonstrate, explain, and illustrate
 * concepts, ideas, and examples — going beyond text.
 * 
 * Capabilities:
 * - Video Demonstrations (AI-generated concept videos)
 * - Animated Diagrams (SVG/Canvas step-by-step animations)
 * - Audio Narration (TTS synchronized with visuals)
 * - Concept Illustrations (AI-generated images)
 */

export type AVAidType = 'video' | 'animation' | 'audio' | 'illustration' | 'diagram';

export interface AVAidRequest {
    concept: string;
    subject: string;
    gradeLevel: 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
    locale: string;
    pedagogicalMode: string;
    preferredType?: AVAidType;
    avInstructions?: string; // From pedagogical engine
}

export interface AVAidResult {
    type: AVAidType;
    title: string;
    description: string;
    // For video/animation: URL or data URI
    mediaUrl?: string;
    // For diagrams: SVG markup
    svgContent?: string;
    // For audio: URL or data URI
    audioUrl?: string;
    // Narration script (for TTS)
    narrationScript: string;
    // Culturally adapted metadata
    culturalContext: string;
    // Steps for animated diagrams
    animationSteps?: AnimationStep[];
}

export interface AnimationStep {
    id: number;
    label: string;
    description: string;
    highlightElements?: string[];
    duration: number; // milliseconds
}

/**
 * Determines the best AV aid type for a given concept and pedagogical mode.
 */
export function selectAVAidType(
    concept: string,
    subject: string,
    pedagogicalMode: string
): AVAidType {
    // Process-based concepts → animation
    const processKeywords = ['how', 'process', 'cycle', 'steps', 'stages', 'flow', 'reaction', 'grows', 'develops'];
    if (processKeywords.some(kw => concept.toLowerCase().includes(kw))) {
        return 'animation';
    }

    // Abstract math concepts → diagram
    const mathSubjects = ['math', 'algebra', 'geometry', 'calculus', 'statistics'];
    if (mathSubjects.some(s => subject.toLowerCase().includes(s))) {
        return 'diagram';
    }

    // Science demonstrations → video
    const scienceSubjects = ['science', 'biology', 'chemistry', 'physics'];
    if (scienceSubjects.some(s => subject.toLowerCase().includes(s))) {
        return 'video';
    }

    // Constructivist mode → prefer visual illustration
    if (pedagogicalMode === 'constructivism') {
        return 'illustration';
    }

    // Scaffolded mode → prefer step-by-step animation
    if (pedagogicalMode === 'scaffolded') {
        return 'animation';
    }

    return 'illustration';
}

/**
 * Generates narration script adapted for grade level and locale.
 */
export function generateNarrationScript(
    concept: string,
    gradeLevel: AVAidRequest['gradeLevel'],
    locale: string
): string {
    const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
    let vocabLevel: string;
    if (gradeNum <= 2) vocabLevel = 'simple, friendly words. Use "big" instead of "large", "make" instead of "create".';
    else if (gradeNum <= 5) vocabLevel = 'clear, everyday language. Introduce one new vocabulary word at a time.';
    else if (gradeNum <= 8) vocabLevel = 'academic vocabulary with brief definitions. Use analogies to familiar concepts.';
    else vocabLevel = 'precise academic and technical language appropriate to the subject.';

    return `[NARRATION SCRIPT - ${locale.toUpperCase()} - Grade ${gradeLevel}]
Voice tone: Warm, encouraging, curious
Vocabulary level: ${vocabLevel}
Pacing: Slow and clear, with natural pauses

Script:
"Let's explore ${concept} together!
[PAUSE 1s]
[VISUAL: Show opening concept image]
Have you ever wondered about this?
[PAUSE 0.5s]
Watch carefully as we discover it step by step...
[VISUAL: Begin animation sequence]
[NARRATION CONTINUES WITH CONCEPT-SPECIFIC CONTENT]
[PAUSE 1s]
Now, what did you notice?
[END]"

Cultural Note: Adapt examples and imagery for ${locale} cultural context.`;
}

/**
 * Generates an animated diagram definition for mathematical/scientific concepts.
 * Returns structured steps that the DiagramRenderer component will animate.
 */
export function generateDiagramSteps(
    concept: string,
    subject: string
): AnimationStep[] {
    // Fraction example (math)
    if (concept.toLowerCase().includes('fraction') || concept.toLowerCase().includes('1/2')) {
        return [
            {
                id: 1,
                label: 'Start with a whole',
                description: 'Here is one whole apple 🍎',
                highlightElements: ['whole-apple'],
                duration: 2000,
            },
            {
                id: 2,
                label: 'Divide into equal parts',
                description: 'We cut it into 2 equal pieces',
                highlightElements: ['cut-line'],
                duration: 2000,
            },
            {
                id: 3,
                label: 'One half',
                description: 'Each piece is called ONE HALF (1/2)',
                highlightElements: ['half-1', 'label-half'],
                duration: 2500,
            },
            {
                id: 4,
                label: 'Adding halves',
                description: 'When we put 1/2 + 1/2 together...',
                highlightElements: ['half-1', 'half-2', 'plus-sign'],
                duration: 2000,
            },
            {
                id: 5,
                label: 'We get a whole!',
                description: '1/2 + 1/2 = 1 whole apple! 🍎',
                highlightElements: ['whole-result', 'equation'],
                duration: 3000,
            },
        ];
    }

    // Photosynthesis example (biology)
    if (concept.toLowerCase().includes('photosynthesis')) {
        return [
            {
                id: 1,
                label: 'Sunlight arrives',
                description: 'The sun sends light energy to the plant',
                highlightElements: ['sun', 'light-rays'],
                duration: 2000,
            },
            {
                id: 2,
                label: 'Leaves absorb light',
                description: 'Chlorophyll in leaves captures the light',
                highlightElements: ['leaf', 'chlorophyll'],
                duration: 2500,
            },
            {
                id: 3,
                label: 'Water travels up',
                description: 'Roots absorb water from the soil',
                highlightElements: ['roots', 'stem', 'water-flow'],
                duration: 2000,
            },
            {
                id: 4,
                label: 'CO₂ enters',
                description: 'Carbon dioxide enters through tiny pores (stomata)',
                highlightElements: ['stomata', 'co2-molecules'],
                duration: 2500,
            },
            {
                id: 5,
                label: 'Sugar is made!',
                description: 'Light + Water + CO₂ → Sugar (food) + Oxygen',
                highlightElements: ['sugar-output', 'oxygen-output', 'equation'],
                duration: 3000,
            },
        ];
    }

    // Generic steps for unknown concepts
    return [
        {
            id: 1,
            label: 'Introduction',
            description: `Let's explore: ${concept}`,
            duration: 2000,
        },
        {
            id: 2,
            label: 'Key Components',
            description: 'Identifying the main parts...',
            duration: 2500,
        },
        {
            id: 3,
            label: 'How it works',
            description: 'Seeing it in action...',
            duration: 3000,
        },
        {
            id: 4,
            label: 'Real-world example',
            description: 'Where do we see this in everyday life?',
            duration: 2500,
        },
    ];
}

/**
 * Main AV Aid generation function.
 * In production, this would call external APIs (Google Veo, Imagen, TTS).
 * Currently returns structured mock data for the UI to render.
 */
export async function generateAVAid(request: AVAidRequest): Promise<AVAidResult> {
    const aidType = request.preferredType || selectAVAidType(
        request.concept,
        request.subject,
        request.pedagogicalMode
    );

    const narrationScript = generateNarrationScript(
        request.concept,
        request.gradeLevel,
        request.locale
    );

    const animationSteps = (aidType === 'animation' || aidType === 'diagram')
        ? generateDiagramSteps(request.concept, request.subject)
        : undefined;

    // Cultural context adaptation
    const culturalContext = getCulturalContext(request.locale, request.concept);

    return {
        type: aidType,
        title: `Visual Guide: ${request.concept}`,
        description: request.avInstructions ||
            `An interactive ${aidType} demonstration of "${request.concept}" for ${request.gradeLevel} learners.`,
        narrationScript,
        culturalContext,
        animationSteps,
        // In production: mediaUrl would be from Veo/Imagen API
        mediaUrl: aidType === 'video' ? `/api/av/generate?concept=${encodeURIComponent(request.concept)}&locale=${request.locale}` : undefined,
        audioUrl: `/api/av/narrate?script=${encodeURIComponent(narrationScript.substring(0, 200))}&locale=${request.locale}`,
    };
}

/**
 * Returns culturally appropriate context for asset selection.
 * This is the "Cultural Context" differentiator.
 */
function getCulturalContext(locale: string, concept: string): string {
    const culturalMappings: Record<string, Record<string, string>> = {
        'en-US': {
            breakfast: 'pancakes, eggs, toast',
            market: 'grocery store',
            currency: 'dollars',
        },
        'hi-IN': {
            breakfast: 'idli, dosa, paratha',
            market: 'bazaar',
            currency: 'rupees',
        },
        'zh-CN': {
            breakfast: 'congee, dim sum, baozi',
            market: 'wet market',
            currency: 'yuan',
        },
        'ar-SA': {
            breakfast: 'foul, shakshuka, flatbread',
            market: 'souk',
            currency: 'riyals',
        },
        'es-MX': {
            breakfast: 'tamales, chilaquiles, atole',
            market: 'mercado',
            currency: 'pesos',
        },
    };

    const localeMap = culturalMappings[locale] || culturalMappings['en-US'];

    return `Cultural context for ${locale}: Use locally relevant examples. 
For food concepts: ${localeMap.breakfast}. 
For commerce: ${localeMap.market} (${localeMap.currency}).
Ensure character designs reflect local demographics and clothing styles.`;
}
