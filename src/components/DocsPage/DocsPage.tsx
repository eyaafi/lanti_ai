'use client';

import { useState } from 'react';
import styles from './DocsPage.module.css';

interface DocSection {
    id: string;
    title: string;
    icon: string;
    content: React.ReactNode;
}

export default function DocsPage({ onBack }: { onBack: () => void }) {
    const [activeSection, setActiveSection] = useState('overview');

    const sections: DocSection[] = [
        {
            id: 'overview',
            title: 'Overview',
            icon: '🏠',
            content: (
                <div>
                    <h2 className={styles.sectionTitle}>Welcome to LantiAI</h2>
                    <p className={styles.text}>
                        LantiAI is an AI-native educational platform built around the principle of <strong>"Pedagogy over Prompting"</strong>.
                        Unlike traditional AI tools that simply answer questions, LantiAI guides learners to <em>discover</em> answers
                        through structured pedagogical approaches.
                    </p>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>🧠</span>
                            <h4>6+ Pedagogical Modes</h4>
                            <p>Socratic, Constructivist, Montessori, Project-Based, Bloom's, and more.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>🛡️</span>
                            <h4>Safety Shield</h4>
                            <p>Every AI interaction passes through a safety filter powered by Gemini Flash.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>🌍</span>
                            <h4>10 Locales</h4>
                            <p>Support for English, Arabic, French, Swahili, Hindi, and more with RTL support.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>📺</span>
                            <h4>Async Learning</h4>
                            <p>Recorded lessons, discussions, self-paced modules, and notifications.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: '🚀',
            content: (
                <div>
                    <h2 className={styles.sectionTitle}>Getting Started</h2>
                    <div className={styles.stepList}>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>1</div>
                            <div>
                                <h4>Create Your School</h4>
                                <p>Click <strong>"Enter Platform"</strong> → <strong>"Create School"</strong> tab. Enter your school name, admin name, email, and set a password.</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>2</div>
                            <div>
                                <h4>Add Teachers & Students</h4>
                                <p>Navigate to <strong>School Management</strong> to create teacher and student accounts. Each user gets a unique ID and password.</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>3</div>
                            <div>
                                <h4>Create Lessons</h4>
                                <p>Teachers use the <strong>Teacher Studio</strong> to build pedagogically-structured lessons with objectives, activities, and AV aids.</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>4</div>
                            <div>
                                <h4>Students Learn</h4>
                                <p>Students access assigned lessons, ask the AI tutor questions, join live sessions, and complete self-paced modules.</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.codeBlock}>
                        <div className={styles.codeHeader}>Demo Credentials</div>
                        <pre>{`Admin:    admin@school.com  /  admin123\nTeacher:  teacher@school.com  /  teacher123\nStudent:  (created by admin via School Management)`}</pre>
                    </div>
                </div>
            )
        },
        {
            id: 'roles',
            title: 'User Roles',
            icon: '👥',
            content: (
                <div>
                    <h2 className={styles.sectionTitle}>User Roles & Permissions</h2>
                    <div className={styles.roleGrid}>
                        <div className={styles.roleCard}>
                            <div className={styles.roleHeader}>
                                <span>🛡️</span>
                                <h4>Admin</h4>
                            </div>
                            <ul>
                                <li>Create and manage teacher & student accounts</li>
                                <li>Configure pedagogical modes and grade levels</li>
                                <li>Access all platform features and analytics</li>
                                <li>Manage parent accounts and permissions</li>
                            </ul>
                        </div>
                        <div className={styles.roleCard}>
                            <div className={styles.roleHeader}>
                                <span>👨‍🏫</span>
                                <h4>Teacher</h4>
                            </div>
                            <ul>
                                <li>Create and assign structured lessons</li>
                                <li>Host live whiteboard sessions</li>
                                <li>Review student submissions and give feedback</li>
                                <li>Pin and moderate discussion posts</li>
                            </ul>
                        </div>
                        <div className={styles.roleCard}>
                            <div className={styles.roleHeader}>
                                <span>🎓</span>
                                <h4>Student</h4>
                            </div>
                            <ul>
                                <li>Ask the AI tutor — guided by pedagogy, not answers</li>
                                <li>Complete assigned lessons and self-paced modules</li>
                                <li>Join live sessions and watch recordings</li>
                                <li>Participate in discussion boards</li>
                            </ul>
                        </div>
                        <div className={styles.roleCard}>
                            <div className={styles.roleHeader}>
                                <span>👪</span>
                                <h4>Parent</h4>
                            </div>
                            <ul>
                                <li>View linked children's progress</li>
                                <li>Monitor safety reports</li>
                                <li>Access performance summaries</li>
                                <li>Receive notification updates</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'pedagogy',
            title: 'Pedagogical Modes',
            icon: '📚',
            content: (
                <div>
                    <h2 className={styles.sectionTitle}>Pedagogical Modes</h2>
                    <p className={styles.text}>
                        LantiAI's AI tutor adapts its teaching style based on the selected pedagogical mode.
                        This ensures each interaction is educationally meaningful, not just a quick answer.
                    </p>
                    <div className={styles.modeList}>
                        {[
                            { name: 'Socratic', desc: 'Guides through questions — never gives direct answers. Encourages critical thinking by asking "Why?" and "What if?"', color: '#6C63FF' },
                            { name: 'Constructivist', desc: 'Students build knowledge from experience. Uses real-world examples and hands-on exploration.', color: '#00D4AA' },
                            { name: 'Montessori', desc: 'Self-directed, sensory-based learning. Students choose their exploration path at their own pace.', color: '#FFB347' },
                            { name: 'Project-Based', desc: 'Learning through creating. Students work on projects that integrate multiple subjects.', color: '#FF6B6B' },
                            { name: "Bloom's Taxonomy", desc: 'Structured progression: Remember → Understand → Apply → Analyze → Evaluate → Create.', color: '#4ECDC4' },
                            { name: 'Inquiry-Based', desc: 'Students ask questions and investigate. The AI guides the research process, not the conclusion.', color: '#A78BFA' },
                        ].map(mode => (
                            <div key={mode.name} className={styles.modeItem}>
                                <div className={styles.modeDot} style={{ background: mode.color }} />
                                <div>
                                    <h4>{mode.name}</h4>
                                    <p>{mode.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'safety',
            title: 'Safety Shield',
            icon: '🛡️',
            content: (
                <div>
                    <h2 className={styles.sectionTitle}>Safety Shield</h2>
                    <p className={styles.text}>
                        Every AI interaction is screened by a dedicated safety layer before reaching the student.
                        The Safety Shield uses Gemini Flash to detect and filter inappropriate content in real-time.
                    </p>
                    <div className={styles.safetyFlow}>
                        <div className={styles.flowStep}>
                            <div className={styles.flowIcon}>💬</div>
                            <span>Student Input</span>
                        </div>
                        <div className={styles.flowArrow}>→</div>
                        <div className={styles.flowStep}>
                            <div className={styles.flowIcon}>🛡️</div>
                            <span>Safety Check</span>
                        </div>
                        <div className={styles.flowArrow}>→</div>
                        <div className={styles.flowStep}>
                            <div className={styles.flowIcon}>🧠</div>
                            <span>AI Tutor</span>
                        </div>
                        <div className={styles.flowArrow}>→</div>
                        <div className={styles.flowStep}>
                            <div className={styles.flowIcon}>🛡️</div>
                            <span>Response Check</span>
                        </div>
                        <div className={styles.flowArrow}>→</div>
                        <div className={styles.flowStep}>
                            <div className={styles.flowIcon}>✅</div>
                            <span>Safe Response</span>
                        </div>
                    </div>
                    <div className={styles.alertBox}>
                        <strong>⚠️ Important:</strong> The Safety Shield is always active and cannot be disabled by students.
                        Teachers and admins can configure sensitivity levels.
                    </div>
                </div>
            )
        },
        {
            id: 'features',
            title: 'Features',
            icon: '⚡',
            content: (
                <div>
                    <h2 className={styles.sectionTitle}>Platform Features</h2>
                    <div className={styles.featureList}>
                        {[
                            { title: 'Student Inquiry', desc: 'AI-guided Q&A with pedagogical modes', icon: '🧠' },
                            { title: 'Teacher Studio', desc: 'Lesson architect with structured templates', icon: '📚' },
                            { title: 'Live Sessions', desc: 'Real-time whiteboard with AI assistance', icon: '🎥' },
                            { title: 'Recorded Lessons', desc: 'Playback past sessions with canvas replay', icon: '📺' },
                            { title: 'Discussion Board', desc: 'Threaded Q&A with role badges and pinning', icon: '💬' },
                            { title: 'Self-Paced Modules', desc: 'Objective checklists with progress tracking', icon: '📝' },
                            { title: 'Notifications', desc: 'Real-time alerts for homework, feedback, and more', icon: '🔔' },
                            { title: 'Creation Sandbox', desc: 'Safe creative tools for students', icon: '🎨' },
                            { title: 'School Management', desc: 'Admin console for users, cohorts, and parents', icon: '🏫' },
                            { title: 'Multi-Locale', desc: '10 languages with RTL support', icon: '🌍' },
                        ].map(f => (
                            <div key={f.title} className={styles.featureRow}>
                                <span className={styles.featureRowIcon}>{f.icon}</span>
                                <div>
                                    <strong>{f.title}</strong>
                                    <span className={styles.featureRowDesc}> — {f.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'api',
            title: 'API & Tech Stack',
            icon: '🔧',
            content: (
                <div>
                    <h2 className={styles.sectionTitle}>Technical Architecture</h2>
                    <div className={styles.techGrid}>
                        <div className={styles.techCard}>
                            <h4>Frontend</h4>
                            <ul>
                                <li>Next.js 16 (App Router)</li>
                                <li>React 19 with TypeScript</li>
                                <li>CSS Modules for styling</li>
                                <li>Canvas API for whiteboard</li>
                            </ul>
                        </div>
                        <div className={styles.techCard}>
                            <h4>AI Layer</h4>
                            <ul>
                                <li>Google Gemini API</li>
                                <li>Safety Shield (Gemini Flash)</li>
                                <li>Pedagogical prompt engineering</li>
                                <li>Context-aware responses</li>
                            </ul>
                        </div>
                        <div className={styles.techCard}>
                            <h4>Deployment</h4>
                            <ul>
                                <li>Vercel (Production)</li>
                                <li>Edge Functions for API</li>
                                <li>localStorage (Demo persistence)</li>
                                <li>Firebase ready (Production)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.bgGlow} />

            <nav className={styles.topNav}>
                <button className={styles.backBtn} onClick={onBack}>
                    ← Back to Home
                </button>
                <h1 className={styles.pageTitle}>📖 Documentation</h1>
                <div style={{ width: 140 }} />
            </nav>

            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    {sections.map(s => (
                        <button
                            key={s.id}
                            className={`${styles.sidebarItem} ${activeSection === s.id ? styles.sidebarItemActive : ''}`}
                            onClick={() => setActiveSection(s.id)}
                        >
                            <span>{s.icon}</span>
                            <span>{s.title}</span>
                        </button>
                    ))}
                </aside>

                <main className={styles.content}>
                    {sections.find(s => s.id === activeSection)?.content}
                </main>
            </div>
        </div>
    );
}
