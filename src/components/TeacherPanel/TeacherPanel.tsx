'use client';

import { useState } from 'react';
import styles from './TeacherPanel.module.css';
import { usePedagogy } from '@/components/providers';
import { useAuth } from '@/lib/auth/context';
import { useLessons, type Lesson } from '@/lib/lessons/context';
import type { PedagogicalMode } from '@/lib/pedagogy/engine';
import { useLiveSession } from '@/lib/live/context';
import Blackboard from './Blackboard/Blackboard';

interface LessonPlan {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    pedagogicalMode: PedagogicalMode;
    objectives: string[];
    activities: string[];
    avAids: string[];
    safetyNotes: string;
    duration: number; // minutes
    createdAt: Date;
}

const SAMPLE_LESSONS: LessonPlan[] = [
    {
        id: '1',
        title: 'Introduction to Fractions',
        subject: 'Mathematics',
        gradeLevel: '4',
        pedagogicalMode: 'constructivism',
        objectives: ['Understand what a fraction represents', 'Identify numerator and denominator', 'Compare simple fractions'],
        activities: ['Apple-cutting visual exercise', 'Fraction wall building', 'Real-world fraction hunt'],
        avAids: ['Animated fraction diagram', 'Interactive number line', 'Video: Fractions in cooking'],
        safetyNotes: 'All content age-appropriate for grades 3-5.',
        duration: 45,
        createdAt: new Date(),
    },
    {
        id: '2',
        title: 'Photosynthesis Deep Dive',
        subject: 'Biology',
        gradeLevel: '7',
        pedagogicalMode: 'inquiry',
        objectives: ['Explain the photosynthesis equation', 'Identify inputs and outputs', 'Connect to real ecosystems'],
        activities: ['Leaf observation experiment', 'Hypothesis formation', 'Data collection from plants'],
        avAids: ['Animated photosynthesis cycle', 'Microscope video of chloroplasts', 'Audio narration: The plant\'s perspective'],
        safetyNotes: 'Standard lab safety applies. No chemicals required.',
        duration: 60,
        createdAt: new Date(),
    },
];

export default function TeacherPanel() {
    const { user } = useAuth();
    const { lessons, createLesson, assignLesson, submissions, addFeedback, assignments } = useLessons();
    const [activeTab, setActiveTab] = useState<'lessons' | 'create' | 'analytics' | 'submissions' | 'blackboard'>('lessons');
    const [feedbackText, setFeedbackText] = useState<{ [key: string]: string }>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const { activeSessionId, startSession, endSession } = useLiveSession();
    const [newLesson, setNewLesson] = useState({
        title: '',
        subject: '',
        objectives: '',
        duration: 45,
    });
    const { pedagogyContext, setPedagogyMode } = usePedagogy();

    // Assign modal state
    const [assignModalLesson, setAssignModalLesson] = useState<string | null>(null);
    const [assignGrade, setAssignGrade] = useState('6');
    const [assignDueDate, setAssignDueDate] = useState('');
    const [assignInstructions, setAssignInstructions] = useState('');

    // Go Live modal state
    const [goLiveLesson, setGoLiveLesson] = useState<{ id: string; title: string; subject: string } | null>(null);
    const [goLiveGrade, setGoLiveGrade] = useState('6');

    const handleGenerateLesson = async () => {
        if (!newLesson.title || !newLesson.subject) return;
        setIsGenerating(true);
        // Simulate AI generation
        await new Promise(r => setTimeout(r, 1500));

        await createLesson({
            title: newLesson.title,
            subject: newLesson.subject,
            gradeLevel: pedagogyContext.gradeLevel,
            pedagogicalMode: pedagogyContext.mode,
            objectives: newLesson.objectives.split('\n').filter(o => o.trim()),
            activities: ['Activity 1', 'Activity 2'],
            avAids: ['Visual Aid', 'Audio Reinforcement'],
            safetyNotes: 'Standard safety shields active.',
            duration: newLesson.duration
        });

        setIsGenerating(false);
        setActiveTab('lessons');
        setNewLesson({ title: '', subject: '', objectives: '', duration: 45 });
    };

    const modeOptions: { id: PedagogicalMode; label: string; icon: string; description: string }[] = [
        { id: 'constructivism', label: 'Constructivist', icon: '🏗️', description: 'Students build knowledge through experience' },
        { id: 'socratic', label: 'Socratic', icon: '❓', description: 'Guide through questioning only' },
        { id: 'direct', label: 'Direct', icon: '📖', description: 'Explicit instruction for foundational facts' },
        { id: 'inquiry', label: 'Inquiry', icon: '🔬', description: 'Student-led investigation' },
        { id: 'scaffolded', label: 'Scaffolded', icon: '🪜', description: 'Gradual release of responsibility' },
        { id: 'collaborative', label: 'Collaborative', icon: '🤝', description: 'Peer-learning simulation' },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>
                        Teacher Studio
                        {activeSessionId && (
                            <span style={{ marginLeft: '12px', fontSize: '0.9rem', padding: '4px 10px', background: 'rgba(255,107,107,0.15)', color: '#FF6B6B', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', verticalAlign: 'middle' }}>
                                <span style={{ width: '8px', height: '8px', background: '#FF6B6B', borderRadius: '50%', display: 'inline-block', filter: 'drop-shadow(0 0 4px #FF6B6B)' }}></span>
                                LIVE
                            </span>
                        )}
                    </h2>
                    <p className={styles.subtitle}>Lesson Architect · Pedagogical Control Center</p>
                </div>
                <div className={styles.tabs}>
                    {(['lessons', 'create', 'blackboard', 'submissions', 'analytics'] as const).map(tab => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'lessons' ? '📚 My Studio' :
                                tab === 'create' ? '✨ Create' :
                                    tab === 'blackboard' ? '🎨 Blackboard' :
                                        tab === 'submissions' ? '📥 Work' : '📊 Analytics'}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.content}>
                {/* Lessons Tab */}
                {activeTab === 'lessons' && (
                    <div className={styles.lessonsGrid}>
                        {lessons.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
                                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>No lessons yet</h3>
                                <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                                    Create your first AI-powered lesson using the <strong>✨ Create</strong> tab.
                                    Your lessons will appear here for assigning and going live.
                                </p>
                                <button
                                    style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6C63FF, #00D4AA)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                                    onClick={() => setActiveTab('create')}
                                >
                                    ✨ Create Your First Lesson
                                </button>
                            </div>
                        )}
                        {lessons.map(lesson => (
                            <div key={lesson.id} className={`glass-card ${styles.lessonCard}`}>
                                <div className={styles.lessonHeader}>
                                    <div>
                                        <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                                        <div className={styles.lessonMeta}>
                                            <span className="badge badge-primary">{lesson.subject}</span>
                                            <span className="badge badge-green">Grade {lesson.gradeLevel}</span>
                                            <span className={styles.lessonDuration}>⏱ {lesson.duration} min</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.lessonMode}>
                                    <span className={styles.lessonModeLabel}>Pedagogical Mode:</span>
                                    <span className={styles.lessonModeValue}>
                                        {modeOptions.find(m => m.id === lesson.pedagogicalMode)?.icon}{' '}
                                        {modeOptions.find(m => m.id === lesson.pedagogicalMode)?.label}
                                    </span>
                                </div>

                                <div className={styles.lessonSection}>
                                    <div className={styles.lessonSectionTitle}>🎯 Learning Objectives</div>
                                    <ul className={styles.lessonList}>
                                        {lesson.objectives.map((obj, i) => (
                                            <li key={i}>{obj}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={styles.lessonSection}>
                                    <div className={styles.lessonSectionTitle}>🎬 AV Aids</div>
                                    <div className={styles.avAidTags}>
                                        {lesson.avAids.map((aid, i) => (
                                            <span key={i} className={styles.avAidTag}>{aid}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.lessonFooter}>
                                    <div className={styles.safetyNote}>
                                        <span>🛡️</span>
                                        <span>{lesson.safetyNotes}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                                            onClick={() => setAssignModalLesson(lesson.id)}
                                        >
                                            📋 Assign
                                        </button>
                                        {activeSessionId === lesson.id ? (
                                            <button
                                                className="btn"
                                                style={{ fontSize: '0.8rem', padding: '8px 16px', backgroundColor: 'rgba(255, 107, 107, 0.2)', border: '1px solid #FF6B6B', color: '#FF6B6B' }}
                                                onClick={endSession}
                                            >
                                                Stop Session
                                            </button>
                                        ) : (
                                            <button
                                                className="btn"
                                                style={{ fontSize: '0.8rem', padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)' }}
                                                onClick={() => setGoLiveLesson({ id: lesson.id, title: lesson.title, subject: lesson.subject })}
                                                disabled={!!activeSessionId}
                                                title={activeSessionId ? "Another session is already active" : "Start a real-time lesson"}
                                            >
                                                Go Live
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Tab */}
                {activeTab === 'create' && (
                    <div className={styles.createPanel}>
                        <div className={styles.createForm}>
                            <h3 className={styles.createTitle}>AI Lesson Architect</h3>
                            <p className={styles.createSubtitle}>
                                Describe your lesson goals and Lantiai will generate a complete pedagogically-structured lesson plan with AV aids.
                            </p>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Lesson Title</label>
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="e.g., The Water Cycle"
                                    value={newLesson.title}
                                    onChange={e => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Subject</label>
                                <input
                                    className={styles.formInput}
                                    type="text"
                                    placeholder="e.g., Earth Science"
                                    value={newLesson.subject}
                                    onChange={e => setNewLesson(prev => ({ ...prev, subject: e.target.value }))}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Learning Objectives</label>
                                <textarea
                                    className={styles.formTextarea}
                                    placeholder="What should students understand by the end of this lesson?"
                                    value={newLesson.objectives}
                                    onChange={e => setNewLesson(prev => ({ ...prev, objectives: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Pedagogical Mode</label>
                                <div className={styles.modeSelector}>
                                    {modeOptions.map(mode => (
                                        <button
                                            key={mode.id}
                                            className={`${styles.modeOption} ${pedagogyContext.mode === mode.id ? styles.modeOptionActive : ''}`}
                                            onClick={() => setPedagogyMode(mode.id)}
                                        >
                                            <span className={styles.modeOptionIcon}>{mode.icon}</span>
                                            <div>
                                                <div className={styles.modeOptionLabel}>{mode.label}</div>
                                                <div className={styles.modeOptionDesc}>{mode.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleGenerateLesson}
                                disabled={isGenerating || !newLesson.title}
                                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                            >
                                {isGenerating ? (
                                    <>⏳ Generating Lesson Plan...</>
                                ) : (
                                    <>✨ Generate Lesson with AV Aids</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className={styles.analyticsPanel}>
                        <div className={styles.statsGrid}>
                            {[
                                { label: 'Total Lessons', value: lessons.length.toString(), icon: '📚', color: '#6C63FF' },
                                { label: 'Submissions', value: submissions.length.toString(), icon: '📥', color: '#00D4AA' },
                                { label: 'Feedback Given', value: submissions.filter(s => s.feedback).length.toString(), icon: '✍️', color: '#FFB347' },
                                { label: 'Safety Blocks', value: '3', icon: '🛡️', color: '#FF6B6B' },
                            ].map(stat => (
                                <div key={stat.label} className={`glass-card ${styles.statCard}`}>
                                    <div className={styles.statIcon} style={{ color: stat.color }}>{stat.icon}</div>
                                    <div className={styles.statValue} style={{ color: stat.color }}>{stat.value}</div>
                                    <div className={stat.label}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                        <div className={`glass-card ${styles.analyticsNote}`}>
                            <h4>📊 Parent Report Preview</h4>
                            <p>Weekly progress reports are automatically generated and sent to parents. Reports include learning objectives achieved, pedagogical mode effectiveness, and safety activity summary.</p>
                        </div>
                    </div>
                )}

                {/* Submissions Tab */}
                {activeTab === 'submissions' && (
                    <div className={styles.submissionsPanel}>
                        <h3 className={styles.sectionTitle}>Student Work & Responses</h3>
                        {submissions.length === 0 ? (
                            <div className={styles.emptyState}>No submissions yet.</div>
                        ) : (
                            <div className={styles.submissionList}>
                                {submissions.map(sub => (
                                    <div key={sub.id} className={`glass-card ${styles.submissionCard}`}>
                                        <div className={styles.submissionHeader}>
                                            <strong>{sub.studentName}</strong>
                                            <span className="badge badge-primary">
                                                {lessons.find(l =>
                                                    assignments.find((a: any) => a.id === sub.assignmentId)?.lessonId === l.id
                                                )?.title || 'Lesson Response'}
                                            </span>
                                        </div>
                                        <p className={styles.submissionText}>{sub.response}</p>

                                        {sub.feedback ? (
                                            <div className={styles.feedbackGiven}>
                                                <strong>Feedback Given:</strong>
                                                <p>{sub.feedback}</p>
                                            </div>
                                        ) : (
                                            <div className={styles.feedbackForm}>
                                                <textarea
                                                    placeholder="Add pedagogical feedback..."
                                                    className={styles.feedbackInput}
                                                    value={feedbackText[sub.id] || ''}
                                                    onChange={(e) => setFeedbackText(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                                />
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                                    onClick={() => {
                                                        addFeedback(sub.id, feedbackText[sub.id]);
                                                        setFeedbackText(prev => {
                                                            const n = { ...prev };
                                                            delete n[sub.id];
                                                            return n;
                                                        });
                                                    }}
                                                    disabled={!feedbackText[sub.id]?.trim()}
                                                >
                                                    Send Feedback
                                                </button>
                                            </div>
                                        )}

                                        <div className={styles.submissionMeta}>
                                            <span>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                                            {sub.reviewedAt && <span> · Reviewed: {new Date(sub.reviewedAt).toLocaleDateString()}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* Blackboard Tab */}
                {activeTab === 'blackboard' && (
                    <div className={styles.blackboardPanel}>
                        <Blackboard />
                    </div>
                )}
            </div>

            {/* Assign Homework Modal */}
            {assignModalLesson && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}
                    onClick={() => setAssignModalLesson(null)}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', width: '450px', maxWidth: '90vw' }}
                        onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>📋 Assign Homework</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            Assigning: <strong>{lessons.find(l => l.id === assignModalLesson)?.title}</strong>
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Target Grade *</label>
                                <select value={assignGrade} onChange={e => setAssignGrade(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                                    <option value="K">Kindergarten</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={String(i + 1)}>Grade {i + 1}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Due Date</label>
                                <input type="date" value={assignDueDate} onChange={e => setAssignDueDate(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Homework Instructions & Questions</label>
                                <textarea
                                    value={assignInstructions}
                                    onChange={e => setAssignInstructions(e.target.value)}
                                    placeholder="e.g. Answer the following questions based on the lesson...&#10;1. What is...&#10;2. Explain..."
                                    rows={5}
                                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                            <button
                                style={{ flex: 1, padding: '10px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => {
                                    assignLesson(assignModalLesson, assignGrade, assignDueDate || undefined, assignInstructions || undefined);
                                    setAssignModalLesson(null);
                                    setAssignGrade('6');
                                    setAssignDueDate('');
                                    setAssignInstructions('');
                                }}
                            >
                                Assign to Grade {assignGrade} Students
                            </button>
                            <button
                                style={{ padding: '10px 20px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px', cursor: 'pointer' }}
                                onClick={() => setAssignModalLesson(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Go Live Grade Picker Modal */}
            {goLiveLesson && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}
                    onClick={() => setGoLiveLesson(null)}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', width: '400px', maxWidth: '90vw' }}
                        onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>🔴 Go Live</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            Starting: <strong>{goLiveLesson.title}</strong>
                        </p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Which grade are you teaching?</label>
                            <select value={goLiveGrade} onChange={e => setGoLiveGrade(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                                <option value="K">Kindergarten</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={String(i + 1)}>Grade {i + 1}</option>
                                ))}
                            </select>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Only Grade {goLiveGrade} students will see the live session banner and be able to join.
                        </p>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                style={{ flex: 1, padding: '10px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => {
                                    startSession(goLiveLesson.id, goLiveGrade, goLiveLesson.title, goLiveLesson.subject);
                                    setGoLiveLesson(null);
                                    setActiveTab('blackboard');
                                }}
                            >
                                🔴 Start Live Session
                            </button>
                            <button
                                style={{ padding: '10px 20px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px', cursor: 'pointer' }}
                                onClick={() => setGoLiveLesson(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
