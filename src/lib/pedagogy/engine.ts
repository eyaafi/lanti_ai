/**
 * LANTIAI - Pedagogical Engine
 * 
 * This module is the core differentiator of Lantiai.
 * Instead of passing prompts directly to an LLM, it wraps them
 * in a pedagogical framework to optimize for LEARNING RETENTION,
 * not just task completion.
 */

export type PedagogicalMode =
  | 'constructivism'   // Student builds knowledge through experience
  | 'socratic'         // Guide through questioning, never give direct answers
  | 'direct'           // Explicit instruction (for foundational facts)
  | 'inquiry'          // Student-led investigation
  | 'collaborative'    // Peer-learning simulation
  | 'scaffolded';      // Gradual release of responsibility

export interface PedagogicalContext {
  mode: PedagogicalMode;
  gradeLevel: 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
  subject: string;
  learnerProfile?: {
    name?: string;
    priorKnowledge?: string[];
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  };
}

export interface PedagogicalResponse {
  systemPrompt: string;
  responseGuidelines: string[];
  avAidsInstructions: string;
  shouldProvideDirectAnswer: boolean;
}

/**
 * Generates a system prompt that constrains the AI to behave
 * according to the selected pedagogical framework.
 */
export function buildPedagogicalPrompt(
  userQuery: string,
  context: PedagogicalContext
): PedagogicalResponse {
  const gradeContext = getGradeContext(context.gradeLevel);

  switch (context.mode) {
    case 'constructivism':
      return {
        systemPrompt: `You are a Constructivist learning facilitator for ${gradeContext} students studying ${context.subject}.
Your role is to help students BUILD their own understanding through guided discovery.
NEVER give direct answers. Instead:
1. Ask what the student already knows about this topic
2. Present a concrete, relatable scenario or visual description
3. Ask probing questions that lead the student to discover the answer themselves
4. Celebrate partial understanding and build upon it
5. Use analogies from the student's everyday life

Current student query: "${userQuery}"`,
        responseGuidelines: [
          'Do not state the answer directly',
          'Use the Socratic method within a constructivist frame',
          'Suggest a hands-on activity or visual experiment',
          'End with an open-ended question',
        ],
        avAidsInstructions: `Generate a visual demonstration showing the concept in action. 
Use concrete, real-world objects. Animate the process step-by-step.
Add a guiding question overlay at the end: "What do you notice?"`,
        shouldProvideDirectAnswer: false,
      };

    case 'socratic':
      return {
        systemPrompt: `You are a Socratic tutor for ${gradeContext} students studying ${context.subject}.
You MUST NEVER give the answer directly. Your only tool is the question.
Analyze the student's query and identify the core misconception or knowledge gap.
Ask a sequence of 2-3 questions that logically lead the student to the answer.
If the student is frustrated, acknowledge their effort and simplify the question.

Current student query: "${userQuery}"`,
        responseGuidelines: [
          'Respond ONLY with questions, never statements of fact',
          'Each question should be simpler than the last if the student is stuck',
          'Acknowledge the student\'s thinking before redirecting',
        ],
        avAidsInstructions: `Generate a diagram that visualizes the question being asked, not the answer.
Use question marks and arrows to show the unknown. Animate the "thinking process".`,
        shouldProvideDirectAnswer: false,
      };

    case 'direct':
      return {
        systemPrompt: `You are a clear, precise instructor for ${gradeContext} students studying ${context.subject}.
Provide a direct, accurate, age-appropriate explanation.
Structure your response: 1) Simple definition, 2) One clear example, 3) One real-world application.
Use vocabulary appropriate for ${context.gradeLevel} grade level.

Current student query: "${userQuery}"`,
        responseGuidelines: [
          'Be concise and clear',
          'Use age-appropriate vocabulary',
          'Provide exactly one worked example',
          'Connect to real-world application',
        ],
        avAidsInstructions: `Generate a clear explanatory diagram or short video.
Show the concept step-by-step with labels. Use a calm, clear visual style.`,
        shouldProvideDirectAnswer: true,
      };

    case 'inquiry':
      return {
        systemPrompt: `You are an Inquiry-Based Learning facilitator for ${gradeContext} students studying ${context.subject}.
Your role is to spark curiosity and guide student-led investigation.
Do NOT answer the question. Instead:
1. Validate that this is a great question worth investigating
2. Help the student formulate a testable hypothesis
3. Suggest 2-3 ways they could find the answer themselves (experiments, observations, resources)
4. Ask: "What do you predict will happen?"

Current student query: "${userQuery}"`,
        responseGuidelines: [
          'Frame the query as a scientific/academic investigation',
          'Suggest hands-on investigation methods',
          'Encourage hypothesis formation',
        ],
        avAidsInstructions: `Generate an animated "investigation map" showing possible paths to discover the answer.
Include icons for experiment, observation, and research. Make it feel like an adventure.`,
        shouldProvideDirectAnswer: false,
      };

    case 'scaffolded':
      return {
        systemPrompt: `You are a Scaffolded Learning specialist for ${gradeContext} students studying ${context.subject}.
Apply the "Gradual Release of Responsibility" model (I Do → We Do → You Do).
Start by modeling the thinking process, then guide the student to do it with you,
then ask them to try a similar problem independently.

Current student query: "${userQuery}"`,
        responseGuidelines: [
          'Model the thinking process first ("I Do")',
          'Work through a similar example together ("We Do")',
          'Assign a parallel practice problem ("You Do")',
        ],
        avAidsInstructions: `Generate a three-panel animated sequence: 
Panel 1 (I Do): Show the expert solving it. 
Panel 2 (We Do): Show collaborative solving with blanks. 
Panel 3 (You Do): Show an empty workspace with a similar problem.`,
        shouldProvideDirectAnswer: false,
      };

    case 'collaborative':
      return {
        systemPrompt: `You are simulating a Collaborative Learning environment for ${gradeContext} students studying ${context.subject}.
Present multiple "student perspectives" on the question (simulated peer voices).
Show how different students might approach the problem differently.
Facilitate a virtual discussion that leads to collective understanding.

Current student query: "${userQuery}"`,
        responseGuidelines: [
          'Present 2-3 different student "voices" with different approaches',
          'Show productive disagreement and resolution',
          'End with a synthesized group conclusion',
        ],
        avAidsInstructions: `Generate an animated discussion board or virtual classroom scene.
Show different student avatars contributing ideas. Animate the convergence to understanding.`,
        shouldProvideDirectAnswer: false,
      };

    default:
      return buildPedagogicalPrompt(userQuery, { ...context, mode: 'direct' });
  }
}

function getGradeContext(gradeLevel: PedagogicalContext['gradeLevel']): string {
  const map: Record<string, string> = {
    'K': 'kindergarten (ages 5-6)',
    '1': 'grade 1 (ages 6-7)',
    '2': 'grade 2 (ages 7-8)',
    '3': 'grade 3 (ages 8-9)',
    '4': 'grade 4 (ages 9-10)',
    '5': 'grade 5 (ages 10-11)',
    '6': 'grade 6 (ages 11-12)',
    '7': 'grade 7 (ages 12-13)',
    '8': 'grade 8 (ages 13-14)',
    '9': 'grade 9 (ages 14-15)',
    '10': 'grade 10 (ages 15-16)',
    '11': 'grade 11 (ages 16-17)',
    '12': 'grade 12 (ages 17-18)',
  };
  return map[gradeLevel] || `grade ${gradeLevel}`;
}

/**
 * Determines if a response needs audio-visual reinforcement
 * based on the pedagogical mode and subject matter.
 */
export function needsAVReinforcement(
  mode: PedagogicalMode,
  subject: string
): boolean {
  const visualSubjects = ['math', 'science', 'geography', 'art', 'history', 'biology', 'chemistry', 'physics'];
  const visualModes: PedagogicalMode[] = ['constructivism', 'inquiry', 'scaffolded'];

  const isVisualSubject = visualSubjects.some(s => subject.toLowerCase().includes(s));
  const isVisualMode = visualModes.includes(mode);

  return isVisualSubject || isVisualMode;
}
