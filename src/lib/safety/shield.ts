/**
 * LANTIAI - Safety Shield Layer
 * 
 * This is Lantiai's "Pre-Emptive" safety system.
 * Unlike blacklist-based filters that react to bad keywords,
 * this layer analyzes the INTENT of a query before it reaches the main AI.
 * 
 * Architecture: Input Rail → Intent Analysis → Output Rail
 */

export type SafetyLevel = 'safe' | 'caution' | 'blocked';
export type RiskCategory =
    | 'violence'
    | 'self_harm'
    | 'dangerous_activity'
    | 'inappropriate_content'
    | 'privacy_violation'
    | 'jailbreak_attempt'
    | 'deepfake_request'
    | 'personal_data';

export interface SafetyCheckResult {
    level: SafetyLevel;
    riskCategories: RiskCategory[];
    explanation: string;
    redirectSuggestion?: string;
    safeAlternative?: string;
}

export interface InputRailConfig {
    gradeLevel: 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
    subject?: string;
    strictMode?: boolean; // Extra strict for younger grades
}

/**
 * INTENT PATTERNS - Adversarial pattern recognition
 * These patterns detect dangerous intent even when phrased creatively.
 * This is the "adversarial AI layer" concept — analyzing intent, not just words.
 */
const INTENT_PATTERNS: Array<{
    pattern: RegExp;
    category: RiskCategory;
    severity: 'high' | 'medium' | 'low';
    safeRedirect?: string;
}> = [
        // Dangerous chemistry/physics combinations
        {
            pattern: /\b(pressure|explosion|ignite|combust|detonate)\b.*\b(chemical|gas|fuel|powder|compound)\b/i,
            category: 'dangerous_activity',
            severity: 'high',
            safeRedirect: 'baking soda and vinegar reaction experiment',
        },
        {
            pattern: /\b(chemical|gas|fuel|powder|compound)\b.*\b(pressure|explosion|ignite|combust|detonate)\b/i,
            category: 'dangerous_activity',
            severity: 'high',
            safeRedirect: 'baking soda and vinegar reaction experiment',
        },
        {
            pattern: /\b(make|create|build|synthesize)\b.*\b(bomb|weapon|explosive|poison|toxin)\b/i,
            category: 'dangerous_activity',
            severity: 'high',
        },
        // Self-harm patterns
        {
            pattern: /\b(hurt|harm|kill|end)\b.*\b(myself|yourself|self)\b/i,
            category: 'self_harm',
            severity: 'high',
        },
        // Privacy violations
        {
            pattern: /\b(find|locate|track|stalk)\b.*\b(address|phone|location|home)\b.*\b(person|someone|student|teacher)\b/i,
            category: 'privacy_violation',
            severity: 'high',
        },
        // Deepfake / identity manipulation
        {
            pattern: /\b(deepfake|face.?swap|impersonate|fake.?video)\b.*\b(classmate|teacher|celebrity|person)\b/i,
            category: 'deepfake_request',
            severity: 'high',
        },
        // Jailbreak attempts
        {
            pattern: /\b(ignore|forget|override|bypass|pretend|act as|you are now|DAN|jailbreak)\b.*\b(rules|instructions|guidelines|safety|filter)\b/i,
            category: 'jailbreak_attempt',
            severity: 'high',
        },
        // Violence
        {
            pattern: /\b(how to|ways to|best way to)\b.*\b(fight|attack|hurt|injure|assault)\b.*\b(person|someone|people|student)\b/i,
            category: 'violence',
            severity: 'high',
        },
        // Inappropriate content for minors
        {
            pattern: /\b(explicit|graphic|adult|nsfw|18\+|sexual)\b/i,
            category: 'inappropriate_content',
            severity: 'high',
        },
    ];

/**
 * Safe redirect suggestions for dangerous chemistry/science queries.
 * This is the key differentiator: we don't just block, we redirect to learning.
 */
const SAFE_SCIENCE_REDIRECTS: Record<string, string> = {
    'pressure + chemicals': 'Explore how pressure works safely with a sealed bottle of soda! Observe what happens when you shake it vs. open it slowly.',
    'fire + chemistry': 'Learn about combustion safely with a candle experiment! Observe how oxygen affects flame size.',
    'electricity + water': 'Discover electrical conductivity safely with a battery, LED, and saltwater solution.',
    'explosion + science': 'Create a safe "explosion" with baking soda and vinegar in a sealed bag!',
};

/**
 * INPUT RAIL: Analyzes the intent of a student query BEFORE it reaches the main AI.
 * This is the "Guard" model that runs first.
 */
export function runInputRail(
    query: string,
    config: InputRailConfig
): SafetyCheckResult {
    const detectedRisks: RiskCategory[] = [];
    let highestSeverity: 'high' | 'medium' | 'low' = 'low';
    let redirectSuggestion: string | undefined;
    let safeAlternative: string | undefined;

    // Check against all intent patterns
    for (const intentPattern of INTENT_PATTERNS) {
        if (intentPattern.pattern.test(query)) {
            detectedRisks.push(intentPattern.category);
            if (intentPattern.severity === 'high') {
                highestSeverity = 'high';
                if (intentPattern.safeRedirect) {
                    safeAlternative = intentPattern.safeRedirect;
                }
            } else if (intentPattern.severity === 'medium' && highestSeverity !== 'high') {
                highestSeverity = 'medium';
            }
        }
    }

    // Grade-level strictness: younger grades get stricter filtering
    const isYoungLearner = ['K', '1', '2', '3', '4', '5'].includes(config.gradeLevel);
    if (isYoungLearner && config.strictMode) {
        // Additional patterns for young learners
        if (/\b(violence|war|death|kill|blood|gore)\b/i.test(query)) {
            detectedRisks.push('violence');
            highestSeverity = 'medium';
        }
    }

    if (detectedRisks.length === 0) {
        return {
            level: 'safe',
            riskCategories: [],
            explanation: 'Query passed all safety checks.',
        };
    }

    // Determine safety level
    const level: SafetyLevel = highestSeverity === 'high' ? 'blocked' : 'caution';

    // Find a safe redirect for science/chemistry queries
    if (detectedRisks.includes('dangerous_activity')) {
        for (const [key, redirect] of Object.entries(SAFE_SCIENCE_REDIRECTS)) {
            const keywords = key.split(' + ');
            if (keywords.every(kw => query.toLowerCase().includes(kw.toLowerCase()))) {
                redirectSuggestion = redirect;
                break;
            }
        }
        if (!redirectSuggestion) {
            redirectSuggestion = safeAlternative ||
                'Let\'s explore this concept safely! I can show you a safe experiment that demonstrates the same scientific principle.';
        }
    }

    return {
        level,
        riskCategories: detectedRisks,
        explanation: generateSafetyExplanation(detectedRisks, level),
        redirectSuggestion,
        safeAlternative,
    };
}

/**
 * OUTPUT RAIL: Verifies the AI's response before it's shown to the student.
 * Catches cases where the main AI might have been manipulated.
 */
export function runOutputRail(response: string): SafetyCheckResult {
    // Check if the response contains any dangerous information
    const dangerousOutputPatterns = [
        /step.{0,20}(1|one|first).{0,50}(mix|combine|add).{0,100}(chemical|compound|substance)/i,
        /\b(instructions|steps|guide|tutorial)\b.{0,50}\b(make|create|build)\b.{0,50}\b(weapon|explosive|bomb)\b/i,
        /\b(password|credentials|login|hack|exploit)\b.{0,100}\b(bypass|override|access)\b/i,
    ];

    for (const pattern of dangerousOutputPatterns) {
        if (pattern.test(response)) {
            return {
                level: 'blocked',
                riskCategories: ['dangerous_activity'],
                explanation: 'The AI response was flagged as potentially unsafe and has been blocked.',
                redirectSuggestion: 'Let me find a safer way to explore this topic with you.',
            };
        }
    }

    return {
        level: 'safe',
        riskCategories: [],
        explanation: 'Response passed output safety check.',
    };
}

function generateSafetyExplanation(risks: RiskCategory[], level: SafetyLevel): string {
    if (level === 'blocked') {
        return `This question touches on topics that aren't safe to explore here. Let's find a better way to learn about this!`;
    }

    if (risks.includes('dangerous_activity')) {
        return `That's an interesting science question! For safety, let's explore this through a safe experiment instead.`;
    }

    return `I noticed something in your question. Let's rephrase it to make sure we stay on track with your learning.`;
}

/**
 * Full safety pipeline: runs both input and output rails.
 */
export async function runSafetyPipeline(
    query: string,
    config: InputRailConfig,
    getAIResponse: (safeQuery: string) => Promise<string>
): Promise<{ response: string; safetyResult: SafetyCheckResult }> {
    // Step 1: Input Rail
    const inputCheck = runInputRail(query, config);

    if (inputCheck.level === 'blocked') {
        return {
            response: inputCheck.redirectSuggestion ||
                "I can't help with that, but let's explore something amazing instead! What else are you curious about?",
            safetyResult: inputCheck,
        };
    }

    // Step 2: Get AI response (with caution context if needed)
    const safeQuery = inputCheck.level === 'caution'
        ? `[SAFETY CONTEXT: Respond with extra care for a young learner] ${query}`
        : query;

    const aiResponse = await getAIResponse(safeQuery);

    // Step 3: Output Rail
    const outputCheck = runOutputRail(aiResponse);

    if (outputCheck.level === 'blocked') {
        return {
            response: outputCheck.redirectSuggestion ||
                "Let me find a better way to explain this safely.",
            safetyResult: outputCheck,
        };
    }

    return {
        response: aiResponse,
        safetyResult: { level: 'safe', riskCategories: [], explanation: 'All checks passed.' },
    };
}
