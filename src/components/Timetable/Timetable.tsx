'use client';

import { useState } from 'react';
import styles from './Timetable.module.css';
import { useAuth } from '@/lib/auth/context';
import { useLiveSession, type ScheduledSession } from '@/lib/live/context';
import { useLessons } from '@/lib/lessons/context';

export default function Timetable({ onNavigate }: { onNavigate?: (viewId: string) => void }) {
    const { user } = useAuth();
    const { scheduledSessions, savedSessions, scheduleSession, deleteScheduledSession, activeSessionInfo } = useLiveSession();
    const { lessons } = useLessons();
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [form, setForm] = useState({
        lessonId: '',
        subject: '',
        targetGrade: '6',
        scheduledAt: '',
        duration: 45,
    });

    const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

    // Filter sessions by role
    const visibleSessions = scheduledSessions.filter(s => {
        if (user?.role === 'admin') return true;
        if (user?.role === 'teacher') return s.teacherId === user.id;
        // Students only see sessions for their grade
        return s.targetGrade === user?.gradeLevel;
    });

    const upcoming = visibleSessions
        .filter(s => s.status === 'scheduled' || s.status === 'live')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    const past = visibleSessions
        .filter(s => s.status === 'completed')
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .slice(0, 10);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return {
            day: d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
            time: d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        };
    };

    const handleSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.lessonId || !form.scheduledAt) return;

        const lesson = lessons.find(l => l.id === form.lessonId);
        scheduleSession({
            lessonId: form.lessonId,
            lessonTitle: lesson?.title || 'Untitled',
            teacherId: user!.id,
            teacherName: user!.name,
            subject: lesson?.subject || form.subject,
            targetGrade: form.targetGrade,
            scheduledAt: form.scheduledAt,
            duration: form.duration,
        });

        setShowScheduleModal(false);
        setForm({ lessonId: '', subject: '', targetGrade: '6', scheduledAt: '', duration: 45 });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>📅 Session Timetable</h2>
                {isTeacherOrAdmin && (
                    <button className={styles.scheduleBtn} onClick={() => setShowScheduleModal(true)}>
                        + Schedule Session
                    </button>
                )}
            </div>

            {/* Live Now Banner */}
            {activeSessionInfo && (user?.role === 'admin' || user?.role === 'teacher' || activeSessionInfo.targetGrade === user?.gradeLevel) && (
                <div className={styles.sessionCard} style={{ marginBottom: '24px', borderColor: '#FF6B6B', background: 'rgba(255,107,107,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className={styles.liveTag} style={{ marginBottom: '8px' }}>
                            <span className={styles.liveDot}></span>
                            LIVE NOW
                        </div>
                        <div className={styles.sessionInfo}>
                            <div className={styles.sessionTitle}>{activeSessionInfo.lessonTitle}</div>
                            <div className={styles.sessionMeta}>
                                <span className={`${styles.metaBadge} ${styles.badgeTeacher}`}>👤 {activeSessionInfo.teacherName}</span>
                                <span className={`${styles.metaBadge} ${styles.badgeGrade}`}>Grade {activeSessionInfo.targetGrade}</span>
                                <span className={`${styles.metaBadge} ${styles.badgeSubject}`}>{activeSessionInfo.subject}</span>
                            </div>
                        </div>
                    </div>
                    {user?.role === 'student' && onNavigate && (
                        <button
                            className="btn btn-primary"
                            style={{ background: '#FF6B6B', border: 'none', padding: '10px 20px', borderRadius: '24px', fontWeight: 'bold' }}
                            onClick={() => onNavigate('inquiry')}
                        >
                            Join Class →
                        </button>
                    )}
                </div>
            )}

            <div className={styles.sections}>
                {/* Upcoming Sessions */}
                <section>
                    <div className={styles.sectionTitle}>📋 Upcoming Sessions</div>
                    {upcoming.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📭</div>
                            No upcoming sessions scheduled
                        </div>
                    ) : (
                        <div className={styles.sessionList}>
                            {upcoming.map(session => {
                                const dt = formatDate(session.scheduledAt);
                                const isLive = session.status === 'live';
                                return (
                                    <div key={session.id} className={`${styles.sessionCard} ${isLive ? styles.sessionCardLive : ''}`}>
                                        <div className={styles.sessionTime}>
                                            <span className={styles.sessionDay}>{dt.day}</span>
                                            <span className={styles.sessionHour}>{dt.time}</span>
                                        </div>
                                        <div className={styles.sessionInfo}>
                                            <div className={styles.sessionTitle}>{session.lessonTitle}</div>
                                            <div className={styles.sessionMeta}>
                                                <span className={`${styles.metaBadge} ${styles.badgeGrade}`}>Grade {session.targetGrade}</span>
                                                <span className={`${styles.metaBadge} ${styles.badgeSubject}`}>{session.subject}</span>
                                                <span className={`${styles.metaBadge} ${styles.badgeTeacher}`}>👤 {session.teacherName}</span>
                                                <span className={styles.badgeDuration}>⏱ {session.duration} min</span>
                                            </div>
                                        </div>
                                        <div className={styles.sessionActions}>
                                            {isLive && (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                    <span className={styles.liveTag}>
                                                        <span className={styles.liveDot}></span>
                                                        LIVE
                                                    </span>
                                                    {user?.role === 'student' && onNavigate && (
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ fontSize: '0.8rem', padding: '6px 16px', background: '#FF6B6B', border: 'none', borderRadius: '20px' }}
                                                            onClick={() => onNavigate('inquiry')}
                                                        >
                                                            Join
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {isTeacherOrAdmin && !isLive && (
                                                <button className={styles.deleteBtn} onClick={() => deleteScheduledSession(session.id)}>🗑️</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Past Sessions */}
                {past.length > 0 && (
                    <section>
                        <div className={styles.sectionTitle}>📚 Past Sessions</div>
                        <div className={styles.sessionList}>
                            {past.map(session => {
                                const dt = formatDate(session.scheduledAt);
                                return (
                                    <div key={session.id} className={styles.sessionCard} style={{ opacity: 0.7 }}>
                                        <div className={styles.sessionTime}>
                                            <span className={styles.sessionDay}>{dt.day}</span>
                                            <span className={styles.sessionHour}>{dt.time}</span>
                                        </div>
                                        <div className={styles.sessionInfo}>
                                            <div className={styles.sessionTitle}>{session.lessonTitle}</div>
                                            <div className={styles.sessionMeta}>
                                                <span className={`${styles.metaBadge} ${styles.badgeGrade}`}>Grade {session.targetGrade}</span>
                                                <span className={`${styles.metaBadge} ${styles.badgeSubject}`}>{session.subject}</span>
                                                <span className={`${styles.metaBadge} ${styles.badgeTeacher}`}>👤 {session.teacherName}</span>
                                            </div>
                                        </div>
                                        <div className={styles.sessionActions}>
                                            <span className={styles.completedBadge}>✅ Completed</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Saved Sessions (from recordings) */}
                {savedSessions.length > 0 && isTeacherOrAdmin && (
                    <section>
                        <div className={styles.sectionTitle}>💾 Saved Recordings</div>
                        <div className={styles.sessionList}>
                            {savedSessions.map(session => (
                                <div key={session.id} className={styles.sessionCard}>
                                    <div className={styles.sessionTime}>
                                        <span className={styles.sessionDay}>{new Date(session.startedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                                        <span className={styles.sessionHour}>{session.duration}m</span>
                                    </div>
                                    <div className={styles.sessionInfo}>
                                        <div className={styles.sessionTitle}>{session.lessonTitle}</div>
                                        <div className={styles.sessionMeta}>
                                            <span className={`${styles.metaBadge} ${styles.badgeGrade}`}>Grade {session.targetGrade}</span>
                                            <span className={`${styles.metaBadge} ${styles.badgeSubject}`}>{session.subject}</span>
                                            <span className={styles.badgeDuration}>{session.drawingPaths.length} drawings, {session.prompts.length} prompts</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className={styles.modalOverlay} onClick={() => setShowScheduleModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3>📅 Schedule Live Session</h3>
                        <form onSubmit={handleSchedule}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Lesson</label>
                                <select
                                    className={styles.formSelect}
                                    value={form.lessonId}
                                    onChange={e => {
                                        const lesson = lessons.find(l => l.id === e.target.value);
                                        setForm({ ...form, lessonId: e.target.value, subject: lesson?.subject || '' });
                                    }}
                                    required
                                >
                                    <option value="">Select a lesson...</option>
                                    {lessons.map(l => (
                                        <option key={l.id} value={l.id}>{l.title} ({l.subject})</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Target Grade</label>
                                <select className={styles.formSelect} value={form.targetGrade} onChange={e => setForm({ ...form, targetGrade: e.target.value })} required>
                                    <option value="K">Kindergarten</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={String(i + 1)}>Grade {i + 1}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className={styles.formInput}
                                    value={form.scheduledAt}
                                    onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Duration (minutes)</label>
                                <input
                                    type="number"
                                    className={styles.formInput}
                                    value={form.duration}
                                    onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                                    min={15}
                                    max={120}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button type="submit" className={styles.formSubmit}>Schedule Session</button>
                                <button type="button" className={styles.formCancel} onClick={() => setShowScheduleModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
