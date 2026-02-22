'use client';

import { useState, useEffect } from 'react';
import { useLessons, type Lesson } from '@/lib/lessons/context';
import { useAuth } from '@/lib/auth/context';
import styles from './SelfPacedLesson.module.css';

interface LessonProgress {
    lessonId: string;
    studentId: string;
    completedObjectives: number[];
    startedAt: string;
    completedAt?: string;
}

interface SelfPacedLessonProps {
    onBack: () => void;
    lessonId: string;
}

export default function SelfPacedLesson({ onBack, lessonId }: SelfPacedLessonProps) {
    const { lessons } = useLessons();
    const { user } = useAuth();
    const lesson = lessons.find(l => l.id === lessonId);
    const [progress, setProgress] = useState<LessonProgress | null>(null);
    const [activeSection, setActiveSection] = useState<'objectives' | 'activities' | 'aids'>('objectives');

    // Load progress from localStorage
    useEffect(() => {
        const allProgress: LessonProgress[] = JSON.parse(localStorage.getItem('lantiai_lesson_progress') || '[]');
        const existing = allProgress.find(p => p.lessonId === lessonId && p.studentId === user?.id);
        if (existing) {
            setProgress(existing);
        } else {
            const newProgress: LessonProgress = {
                lessonId,
                studentId: user?.id || '',
                completedObjectives: [],
                startedAt: new Date().toISOString(),
            };
            setProgress(newProgress);
            saveProgress(newProgress);
        }
    }, [lessonId, user?.id]);

    const saveProgress = (p: LessonProgress) => {
        const allProgress: LessonProgress[] = JSON.parse(localStorage.getItem('lantiai_lesson_progress') || '[]');
        const idx = allProgress.findIndex(x => x.lessonId === p.lessonId && x.studentId === p.studentId);
        if (idx >= 0) allProgress[idx] = p;
        else allProgress.push(p);
        localStorage.setItem('lantiai_lesson_progress', JSON.stringify(allProgress));
    };

    const toggleObjective = (index: number) => {
        if (!progress) return;
        const updated = progress.completedObjectives.includes(index)
            ? { ...progress, completedObjectives: progress.completedObjectives.filter(i => i !== index) }
            : { ...progress, completedObjectives: [...progress.completedObjectives, index] };
        setProgress(updated);
        saveProgress(updated);
    };

    const markComplete = () => {
        if (!progress) return;
        const updated = { ...progress, completedAt: new Date().toISOString() };
        setProgress(updated);
        saveProgress(updated);
    };

    if (!lesson) {
        return (
            <div className={styles.container}>
                <button className={styles.backBtn} onClick={onBack}>← Back</button>
                <div className={styles.emptyState}>Lesson not found</div>
            </div>
        );
    }

    const totalObjectives = lesson.objectives.length;
    const completedCount = progress?.completedObjectives.length || 0;
    const progressPercent = totalObjectives > 0 ? Math.round((completedCount / totalObjectives) * 100) : 0;
    const isCompleted = !!progress?.completedAt;

    return (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={onBack}>← Back to My Homework</button>

            <div className={styles.lessonHeader}>
                <div className={styles.lessonInfo}>
                    <h2 className={styles.lessonTitle}>{lesson.title}</h2>
                    <div className={styles.lessonMeta}>
                        <span className={styles.badge}>{lesson.subject}</span>
                        <span className={styles.badge}>Grade {lesson.gradeLevel}</span>
                        <span className={styles.badge}>⏱ {lesson.duration} min</span>
                    </div>
                </div>
                <div className={styles.progressRing}>
                    <svg viewBox="0 0 80 80" className={styles.progressSvg}>
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        <circle
                            cx="40" cy="40" r="34" fill="none"
                            stroke={isCompleted ? '#66BB6A' : 'var(--color-primary)'}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${progressPercent * 2.136} 213.6`}
                            transform="rotate(-90, 40, 40)"
                        />
                    </svg>
                    <span className={styles.progressLabel}>
                        {isCompleted ? '✅' : `${progressPercent}%`}
                    </span>
                </div>
            </div>

            {isCompleted && (
                <div className={styles.completedBanner}>
                    🎉 You completed this lesson on {new Date(progress!.completedAt!).toLocaleDateString('en', { month: 'long', day: 'numeric' })}
                </div>
            )}

            <div className={styles.sectionTabs}>
                {(['objectives', 'activities', 'aids'] as const).map(tab => (
                    <button
                        key={tab}
                        className={`${styles.sectionTab} ${activeSection === tab ? styles.tabActive : ''}`}
                        onClick={() => setActiveSection(tab)}
                    >
                        {tab === 'objectives' ? `🎯 Objectives (${completedCount}/${totalObjectives})` :
                            tab === 'activities' ? '📋 Activities' : '🎬 AV Aids'}
                    </button>
                ))}
            </div>

            <div className={styles.sectionContent}>
                {activeSection === 'objectives' && (
                    <div className={styles.objectivesList}>
                        {lesson.objectives.map((obj, i) => {
                            const done = progress?.completedObjectives.includes(i);
                            return (
                                <div
                                    key={i}
                                    className={`${styles.objectiveItem} ${done ? styles.objectiveDone : ''}`}
                                    onClick={() => !isCompleted && toggleObjective(i)}
                                >
                                    <span className={styles.checkbox}>{done ? '✅' : '⬜'}</span>
                                    <span className={styles.objectiveText}>{obj}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeSection === 'activities' && (
                    <div className={styles.activitiesList}>
                        {lesson.activities.map((act, i) => (
                            <div key={i} className={styles.activityItem}>
                                <span className={styles.activityNum}>{i + 1}</span>
                                <span>{act}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeSection === 'aids' && (
                    <div className={styles.aidsList}>
                        {lesson.avAids.map((aid, i) => (
                            <div key={i} className={styles.aidItem}>
                                <span className={styles.aidIcon}>🎬</span>
                                <span>{aid}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!isCompleted && progressPercent === 100 && (
                <div className={styles.completeSection}>
                    <button className={styles.completeBtn} onClick={markComplete}>
                        ✅ Mark Lesson as Complete
                    </button>
                </div>
            )}
        </div>
    );
}
