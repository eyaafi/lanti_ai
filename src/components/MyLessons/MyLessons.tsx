'use client';

import { useState } from 'react';
import { useLessons } from '@/lib/lessons/context';
import { useAuth } from '@/lib/auth/context';
import styles from './MyLessons.module.css';

export default function MyLessons() {
    const { user } = useAuth();
    const { getAssignmentsForStudent, submitResponse, submissions } = useLessons();
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [response, setResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const assignments = getAssignmentsForStudent(user?.gradeLevel || '6');

    const handleOpenResponse = (assignment: any) => {
        setSelectedAssignment(assignment);
        setResponse('');
    };

    const handleSubmit = async () => {
        if (!response.trim() || !selectedAssignment) return;
        setIsSubmitting(true);
        await submitResponse(selectedAssignment.id, response);
        setIsSubmitting(false);
        setSelectedAssignment(null);
    };

    const isSubmitted = (assignmentId: string) => {
        return submissions.some(s => s.assignmentId === assignmentId && s.studentId === user?.id);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>My Lessons</h2>
                <p className={styles.subtitle}>Tasks and assignments from your teachers</p>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Tasks
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'completed' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed & Feedback
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {activeTab === 'pending' ? (
                    assignments.filter(a => !isSubmitted(a.id)).length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🎉</div>
                            <h3>All caught up!</h3>
                            <p>No pending lessons at the moment.</p>
                        </div>
                    ) : (
                        assignments.filter(a => !isSubmitted(a.id)).map(assignment => {
                            const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
                            const isOverdue = dueDate && dueDate < new Date();
                            const isDueSoon = dueDate && !isOverdue && (dueDate.getTime() - Date.now()) < 2 * 24 * 60 * 60 * 1000;
                            return (
                                <div key={assignment.id} className={`glass-card ${styles.card}`}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.lessonTitle}>{assignment.lesson.title}</h3>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <span className="badge badge-primary">{assignment.lesson.subject}</span>
                                            {dueDate && (
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    background: isOverdue ? 'rgba(255,107,107,0.15)' : isDueSoon ? 'rgba(255,179,71,0.15)' : 'rgba(108,99,255,0.1)',
                                                    color: isOverdue ? '#FF6B6B' : isDueSoon ? '#FFB347' : 'var(--color-primary)'
                                                }}>
                                                    {isOverdue ? '⚠️ Overdue' : `📅 Due ${dueDate.toLocaleDateString()}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className={styles.lessonDesc}>
                                        {assignment.lesson.objectives[0]}...
                                    </p>
                                    {assignment.instructions && (
                                        <div style={{ padding: '10px 12px', background: 'rgba(108,99,255,0.06)', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid var(--color-primary)' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>📋 Teacher Instructions:</div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{assignment.instructions}</p>
                                        </div>
                                    )}
                                    <div className={styles.meta}>
                                        <span>🛡️ {assignment.lesson.safetyNotes}</span>
                                        <span>⏱ {assignment.lesson.duration} min</span>
                                    </div>
                                    <div className={styles.footer}>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleOpenResponse(assignment)}
                                        >
                                            Respond to Lesson
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )
                ) : (
                    submissions.filter(s => s.studentId === user?.id).length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📝</div>
                            <h3>No completed work</h3>
                            <p>Once you submit a lesson response, it will appear here.</p>
                        </div>
                    ) : (
                        submissions.filter(s => s.studentId === user?.id).map(sub => {
                            const assignment = assignments.find(a => a.id === sub.assignmentId);
                            return (
                                <div key={sub.id} className={`glass-card ${styles.card}`}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.lessonTitle}>{assignment?.lesson.title || 'Completed Lesson'}</h3>
                                        <span className="badge badge-secondary">Submitted</span>
                                    </div>
                                    <p className={styles.submissionText}>"{sub.response}"</p>

                                    {sub.feedback && (
                                        <div className={styles.feedbackBox}>
                                            <div className={styles.feedbackHeader}>👩‍🏫 Teacher's Feedback:</div>
                                            <p className={styles.feedbackText}>{sub.feedback}</p>
                                        </div>
                                    )}

                                    <div className={styles.meta}>
                                        <span>📅 {new Date(sub.submittedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            );
                        })
                    )
                )}
            </div>

            {selectedAssignment && (
                <div className={styles.modalOverlay}>
                    <div className={`glass-card ${styles.modal}`}>
                        <h3>Respond to: {selectedAssignment.lesson.title}</h3>
                        <div className={styles.modalBody}>
                            <div className={styles.objectives}>
                                <h4>Learning Objectives:</h4>
                                <ul>
                                    {selectedAssignment.lesson.objectives.map((obj: string, i: number) => (
                                        <li key={i}>{obj}</li>
                                    ))}
                                </ul>
                            </div>
                            {selectedAssignment.instructions && (
                                <div style={{ padding: '12px', background: 'rgba(108,99,255,0.06)', borderRadius: '8px', marginBottom: '12px', borderLeft: '3px solid var(--color-primary)' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>📋 Homework Instructions:</div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{selectedAssignment.instructions}</p>
                                </div>
                            )}
                            {selectedAssignment.dueDate && (
                                <p style={{ fontSize: '0.85rem', color: new Date(selectedAssignment.dueDate) < new Date() ? '#FF6B6B' : 'var(--text-secondary)', marginBottom: '12px' }}>
                                    📅 Due: {new Date(selectedAssignment.dueDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            )}
                            <label className={styles.label}>Your Response / Work:</label>
                            <textarea
                                className={styles.textarea}
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Share what you've learned or complete the activity..."
                                rows={6}
                            />
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn" onClick={() => setSelectedAssignment(null)}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !response.trim()}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Response'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
