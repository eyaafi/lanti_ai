'use client';

import { useState } from 'react';
import styles from './BlogPage.module.css';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author: string;
    tag: string;
    tagColor: string;
    readTime: string;
}

const BLOG_POSTS: BlogPost[] = [
    {
        id: 'launch-v1',
        title: 'LantiAI v1.0 — Pedagogy Over Prompting is Live',
        excerpt: 'We\'re thrilled to announce the public launch of LantiAI, the AI-native educational platform that puts pedagogy first.',
        content: `Today marks a milestone for LantiAI. After months of development, we're launching our v1.0 platform — the first AI education tool built on the principle of "Pedagogy over Prompting."

What makes LantiAI different? While other AI tools simply answer student questions, LantiAI's AI tutor adapts its teaching style based on proven pedagogical frameworks. Whether it's Socratic questioning, Constructivist exploration, or Bloom's Taxonomy scaffolding — every interaction is designed to help students think, not just receive.

Key highlights of v1.0:
• 6 pedagogical modes with distinct teaching approaches
• Safety Shield powered by Gemini Flash — every AI interaction is screened
• Multi-role support: Admins, Teachers, Students, and Parents
• 10 locale support including RTL languages
• Live whiteboard sessions with AI-assisted teaching
• Full lesson management and assignment system

This is just the beginning. We believe AI in education should be a guide, not a shortcut. LantiAI is designed to amplify teachers, not replace them — and to help students develop genuine understanding.

Try it today at lantiai.vercel.app`,
        date: '2026-02-21',
        author: 'LantiAI Team',
        tag: 'Launch',
        tagColor: '#6C63FF',
        readTime: '3 min read'
    },
    {
        id: 'async-features',
        title: 'Introducing Async Learning: Recorded Lessons, Discussions & More',
        excerpt: 'New asynchronous capabilities let students learn at their own pace — watch recorded sessions, discuss with peers, and track progress.',
        content: `We've just shipped four powerful async features that fundamentally change how students can engage with LantiAI outside of live sessions:

📺 Recorded Lessons
Every live whiteboard session is now automatically saved. Students can browse past sessions and replay them — watching the teacher's drawings animate step-by-step on the canvas, complete with AI prompt history. It's like being in class again, but at your own pace.

💬 Discussion Board
A threaded Q&A system where students can ask questions and teachers respond asynchronously. Posts are filterable by subject, and teachers can pin important discussions. Role badges (Teacher, Student, Admin) make it easy to identify who's helping.

📝 Self-Paced Modules
Students can now access lessons independently with interactive objective checklists. A progress ring tracks completion, and once all objectives are checked off, students can mark the lesson complete. Progress is saved so they can pick up where they left off.

🔔 Notifications Feed
A slide-in notification panel aggregates all activity — homework assigned, feedback received, new discussion replies, upcoming sessions. Filter between All and Unread, and click any notification to jump directly to the relevant section.

These features move LantiAI from a purely synchronous tool to a comprehensive learning platform that works on the student's schedule.`,
        date: '2026-02-21',
        author: 'LantiAI Team',
        tag: 'Feature',
        tagColor: '#00D4AA',
        readTime: '4 min read'
    },
    {
        id: 'safety-first',
        title: 'Why Safety Shield is Non-Negotiable in AI Education',
        excerpt: 'Every AI interaction in LantiAI passes through a dual-layer safety check. Here\'s why we built it this way.',
        content: `When we designed LantiAI, one thing was clear from day one: safety can't be an afterthought.

The Safety Shield is a dual-layer content moderation system that sits between every student interaction and the AI. Here's how it works:

Layer 1: Input Screening
Before a student's message ever reaches the AI tutor, it passes through Gemini Flash for content screening. Inappropriate, harmful, or off-topic content is caught and redirected with age-appropriate guidance.

Layer 2: Response Validation
Even after the AI generates a response, it goes through a second safety check before being shown to the student. This catches any edge cases where the AI might generate content that isn't suitable for the educational context.

Why both layers?
Single-layer filtering misses edge cases. A question might seem innocent but lead to an inappropriate response, or vice versa. By checking both directions, we create a truly safe learning environment.

The Safety Shield is always active — students cannot disable it, and it operates behind the scenes without interrupting the learning flow. Teachers and admins can configure sensitivity levels based on their school's requirements.

AI education without safety is just a chatbot. LantiAI is committed to being more than that.`,
        date: '2026-02-20',
        author: 'LantiAI Team',
        tag: 'Safety',
        tagColor: '#FF6B6B',
        readTime: '3 min read'
    },
    {
        id: 'roadmap-2026',
        title: 'LantiAI Roadmap: What\'s Coming in 2026',
        excerpt: 'A look at what we\'re building next — from Firebase integration to mobile apps and AI model upgrades.',
        content: `We're excited to share our roadmap for LantiAI in 2026. Here's what's on the horizon:

🔥 Q1 2026 — Production Backend
• Migrate from localStorage to Firebase Firestore for real multi-user persistence
• Implement Firebase Authentication for secure login
• Add real-time data sync across devices
• Cloud Functions for server-side AI processing

📱 Q2 2026 — Mobile Experience
• Progressive Web App (PWA) with offline support
• Native-like mobile optimizations
• Push notifications via Firebase Cloud Messaging
• Touch-optimized whiteboard for tablets

🤖 Q2 2026 — AI Enhancements
• Gemini 2.0 Flash integration for faster, smarter responses
• Multi-modal AI tutoring (image analysis, voice input)
• AI-generated lesson plans based on curriculum standards
• Personalized learning paths based on student performance

📊 Q3 2026 — Analytics & Insights
• Teacher analytics dashboard with student performance metrics
• AI-powered progress reports for parents
• Learning gap identification and recommendation engine
• Engagement scoring and intervention alerts

🌐 Q3 2026 — Scale & Ecosystem
• Multi-school district management
• Curriculum marketplace for teacher-created content
• Third-party LMS integrations (Google Classroom, Canvas)
• API for custom integrations

🎯 Q4 2026 — Advanced Features
• Peer tutoring with AI supervision
• Gamification layer with achievement system
• Virtual labs and simulations
• Real-time translation for multilingual classrooms

We build in the open and welcome feedback. If you have ideas, reach out through our Discussion Board or contact us directly.

The future of education is pedagogical AI — and we're building it.`,
        date: '2026-02-19',
        author: 'LantiAI Team',
        tag: 'Roadmap',
        tagColor: '#A78BFA',
        readTime: '5 min read'
    },
    {
        id: 'pedagogy-modes',
        title: 'Deep Dive: How Pedagogical Modes Transform AI Tutoring',
        excerpt: 'Every teaching style produces different outcomes. Here\'s how LantiAI\'s 6 pedagogical modes actually work.',
        content: `Most AI education tools have one mode: answer the question. LantiAI has six.

Each pedagogical mode fundamentally changes how the AI tutor interacts with students. It's not just a label — it changes the prompt engineering, response structure, and teaching strategy.

🏛️ Socratic Mode
The AI never gives direct answers. Instead, it asks guided questions to lead students toward understanding. "What do you think would happen if...?" and "Can you explain why...?" are the AI's primary tools.

Best for: Critical thinking, philosophy, debate preparation

🧱 Constructivist Mode
Students build knowledge from experience. The AI connects abstract concepts to real-world examples and hands-on scenarios. It asks students to relate new ideas to things they already know.

Best for: Science, early math, experiential subjects

🌸 Montessori Mode
Self-directed, sensory-based exploration. The AI presents multiple paths and lets students choose. It respects the student's pace and never rushes toward a "correct" answer.

Best for: Early childhood, creative subjects, independent learners

📐 Project-Based Mode
Everything is connected to a project. The AI helps students plan, execute, and reflect on projects that integrate multiple subjects and skills.

Best for: Engineering, group work, interdisciplinary learning

📊 Bloom's Taxonomy Mode
Structured cognitive progression. The AI starts with recall, moves through understanding and application, then pushes toward analysis, evaluation, and creation.

Best for: Structured curricula, exam preparation, skill assessment

🔬 Inquiry-Based Mode
Students drive the investigation. The AI helps them formulate hypotheses, design experiments (mental or physical), and draw conclusions from evidence.

Best for: Science labs, research skills, evidence-based thinking

Each mode is configurable per classroom, per teacher, or even per lesson. Teachers can switch modes mid-session if the pedagogical approach isn't fitting the topic.`,
        date: '2026-02-18',
        author: 'LantiAI Team',
        tag: 'Education',
        tagColor: '#FFB347',
        readTime: '5 min read'
    }
];

export default function BlogPage({ onBack }: { onBack: () => void }) {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [filter, setFilter] = useState('all');

    const tags = ['all', ...new Set(BLOG_POSTS.map(p => p.tag))];

    const filteredPosts = filter === 'all' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.tag === filter);

    if (selectedPost) {
        return (
            <div className={styles.container}>
                <div className={styles.bgGlow} />
                <nav className={styles.topNav}>
                    <button className={styles.backBtn} onClick={() => setSelectedPost(null)}>
                        ← Back to Blog
                    </button>
                    <h1 className={styles.pageTitle}>📝 Blog</h1>
                    <div style={{ width: 140 }} />
                </nav>

                <article className={styles.article}>
                    <div className={styles.articleMeta}>
                        <span className={styles.articleTag} style={{ background: `${selectedPost.tagColor}20`, color: selectedPost.tagColor, borderColor: `${selectedPost.tagColor}40` }}>
                            {selectedPost.tag}
                        </span>
                        <span className={styles.articleDate}>{new Date(selectedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className={styles.articleReadTime}>{selectedPost.readTime}</span>
                    </div>
                    <h1 className={styles.articleTitle}>{selectedPost.title}</h1>
                    <div className={styles.articleAuthor}>
                        <div className={styles.authorAvatar}>L</div>
                        <span>{selectedPost.author}</span>
                    </div>
                    <div className={styles.articleContent}>
                        {selectedPost.content.split('\n\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                        ))}
                    </div>
                </article>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.bgGlow} />

            <nav className={styles.topNav}>
                <button className={styles.backBtn} onClick={onBack}>
                    ← Back to Home
                </button>
                <h1 className={styles.pageTitle}>📝 Blog</h1>
                <div style={{ width: 140 }} />
            </nav>

            <div className={styles.blogHeader}>
                <h2 className={styles.blogTitle}>Latest Updates</h2>
                <p className={styles.blogSubtitle}>News, features, and the road ahead for LantiAI</p>
                <div className={styles.filters}>
                    {tags.map(tag => (
                        <button
                            key={tag}
                            className={`${styles.filterBtn} ${filter === tag ? styles.filterActive : ''}`}
                            onClick={() => setFilter(tag)}
                        >
                            {tag === 'all' ? 'All Posts' : tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.postsGrid}>
                {filteredPosts.map(post => (
                    <button key={post.id} className={styles.postCard} onClick={() => setSelectedPost(post)}>
                        <div className={styles.postTag} style={{ background: `${post.tagColor}15`, color: post.tagColor, borderColor: `${post.tagColor}30` }}>
                            {post.tag}
                        </div>
                        <h3 className={styles.postTitle}>{post.title}</h3>
                        <p className={styles.postExcerpt}>{post.excerpt}</p>
                        <div className={styles.postFooter}>
                            <span className={styles.postDate}>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className={styles.postRead}>{post.readTime}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
