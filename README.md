# LantiAI Educational Ecosystem

Welcome to the LantiAI Educational Ecosystem, a full-stack Next.js application designed to revolutionize digital learning through "Pedagogy over Prompting." This platform emphasizes a structured, safety-first environment tailored for multiple user roles, from Super Admins down to Students and Parents.

## Features Let by Pedagogy

*   **Teacher Studio**: A powerful dashboard for educators featuring the **AI Lesson Architect**, which uses Gemini 2.5 Flash to automatically construct detailed, pedagogically sound lesson plans (direct instruction, socratic, inquiry, constructivist).
*   **Student Inquiry Module**: A chat interface powered by a **Strict Socratic Tutor** AI. Students are guided to discover answers through thought-provoking questions, never direct answers.
*   **Safety Shield**: An intent-based Input Rail system that analyzes student queries before they reach the main AI, preemptively intercepting dangerous or inappropriate topics and smoothly redirecting learners to safe alternatives.
*   **Real-time Collaboration**: Live classroom sessions with synchronized whiteboards (Blackboard) and a Discourse community powered by WidgetBot widgets.
*   **Firebase Backend**: True user authentication, role management, and real-time Firestore synchronization for context state like discussions.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (React)
- **Styling**: Vanilla CSS Modules with custom Design System
- **Backend & Database**: Firebase (Auth, Firestore, Storage) & GCP Admin SDK
- **AI Engine**: Google GenAI (`@google/genai`) using the `gemini-2.5-flash` model.

## Getting Started

### 1. Prerequisites
You will need Node.js and npm installed.

### 2. Environment Setup

*Copy the `.env.example` file to `.env.local`:*
\`\`\`bash
cp .env.example .env.local
\`\`\`

**A. Firebase Configuration**
You must create a project in the [Firebase Console](https://console.firebase.google.com/).
1. Add a Web App, and fill the `NEXT_PUBLIC_FIREBASE_*` variables with your Client SDK config.
2. Enable Authentication (Email/Password).
3. Create a Firestore Database.
4. Go to Project Settings -> Service Accounts, generate a new Node.js private key, and fill the Admin SDK `FIREBASE_*` variables in the `.env.local`.

**B. Gemini AI Configuration**
Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and add it to your `.env.local`:
\`\`\`env
GEMINI_API_KEY=your_gemini_api_key_here
\`\`\`

### 3. Running the App

Install dependencies and start the development server:
\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can now register a user account, explore the Teacher Panel, or test out the Student Inquiry chat!

## Deployment

The application is fully SSR compatible and ready to be deployed on [Vercel](https://vercel.com/new). The build step (`npm run build`) is resilient and handles missing environment variables gracefully during prerender stages. Ensure your API keys and Service Account strings are added directly to the Vercel project environment settings.
