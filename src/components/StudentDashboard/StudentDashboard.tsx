'use client';

import styles from './StudentDashboard.module.css';
import { useAuth } from '@/lib/auth/context';
import { useLessons } from '@/lib/lessons/context';
import { useLiveSession } from '@/lib/live/context';

interface StudentDashboardProps {
    onNavigate: (view: string) => void;
}

export default function StudentDashboard({ onNavigate }: StudentDashboardProps) {
    const { user } = useAuth();
    const { getAssignmentsForStudent, submissions } = useLessons();
    const { activeSessionInfo, scheduledSessions, savedSessions } = useLiveSession();

    const assignments = getAssignmentsForStudent(user?.gradeLevel || '6');

    const pendingAssignments = assignments.filter(
        a => !submissions.some(s => s.assignmentId === a.id && s.studentId === user?.id)
    );

    const completedCount = submissions.filter(s => s.studentId === user?.id).length;

    const feedbackCount = submissions.filter(
        s => s.studentId === user?.id && s.feedback
    ).length;

    // Upcoming sessions for this student's grade
    const upcomingSessions = scheduledSessions
        .filter(s => s.targetGrade === user?.gradeLevel && (s.status === 'scheduled' || s.status === 'live'))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 4);

    // Is there a live session for my grade?
    const myLiveSession = activeSessionInfo && activeSessionInfo.targetGrade === user?.gradeLevel
        ? activeSessionInfo : null;

    const gradeLabel = user?.gradeLevel === 'K' ? 'Kindergarten' : `Grade ${user?.gradeLevel}`;

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className={styles.container}>
            {/* Greeting */}
            <div className={styles.greeting}>
                <h1 className={styles.greetingTitle}>
                    {getTimeOfDay()}, {user?.name?.split(' ')[0]}! 👋
                    <span className={styles.gradeTag}>🎓 {gradeLabel}</span>
                </h1>
                <p className={styles.greetingSubtitle}>Here's your learning overview for today</p>
            </div>

            {/* Live Session Alert */}
            {myLiveSession && (
                <div className={styles.liveAlert}>
                    <span className={styles.liveTag}>
                        <span className={styles.liveDot}></span>
                        LIVE NOW
                    </span>
                    <div className={styles.liveInfo}>
                        <div className={styles.liveTitle}>{myLiveSession.lessonTitle}</div>
                        <div className={styles.liveMeta}>
                            👤 {myLiveSession.teacherName} · {myLiveSession.subject}
                        </div>
                    </div>
                    <button className={styles.joinBtn} onClick={() => onNavigate('inquiry')}>
                        Join Class →
                    </button>
                </div>
            )}

            {/* Stats Row */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📋</span>
                    <span className={styles.statValue}>{pendingAssignments.length}</span>
                    <span className={styles.statLabel}>Pending Tasks</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>✅</span>
                    <span className={styles.statValue}>{completedCount}</span>
                    <span className={styles.statLabel}>Completed</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>💬</span>
                    <span className={styles.statValue}>{feedbackCount}</span>
                    <span className={styles.statLabel}>Feedback</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📅</span>
                    <span className={styles.statValue}>{upcomingSessions.length}</span>
                    <span className={styles.statLabel}>Upcoming Sessions</span>
                </div>
            </div>

            <div className={styles.sectionsGrid}>
                {/* Pending Assignments */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>📝 Pending Assignments</div>
                    {pendingAssignments.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🎉</div>
                            All caught up! No pending tasks.
                        </div>
                    ) : (
                        pendingAssignments.slice(0, 5).map(assignment => {
                            const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
                            const isOverdue = dueDate && dueDate < new Date();
                            const isDueSoon = dueDate && !isOverdue && (dueDate.getTime() - Date.now()) < 2 * 24 * 60 * 60 * 1000;
                            return (
                                <div key={assignment.id} className={styles.miniCard} onClick={() => onNavigate('lessons')} style={{ cursor: 'pointer' }}>
                                    <div className={styles.miniCardIcon} style={{ background: 'rgba(108, 99, 255, 0.1)' }}>📖</div>
                                    <div className={styles.miniCardInfo}>
                                        <div className={styles.miniCardTitle}>{assignment.lesson.title}</div>
                                        <div className={styles.miniCardMeta}>{assignment.lesson.subject} · {assignment.lesson.duration} min</div>
                                    </div>
                                    {dueDate && (
                                        <span className={`${styles.dueBadge} ${isOverdue ? styles.dueOverdue : isDueSoon ? styles.dueSoon : styles.dueNormal}`}>
                                            {isOverdue ? '⚠️ Overdue' : dueDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                    {pendingAssignments.length > 5 && (
                        <button onClick={() => onNavigate('lessons')} style={{ width: '100%', padding: '8px', background: 'rgba(108,99,255,0.06)', border: 'none', borderRadius: '8px', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', marginTop: '8px' }}>
                            View All ({pendingAssignments.length}) →
                        </button>
                    )}
                </div>

                {/* Upcoming Sessions */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>📅 Upcoming Live Sessions</div>
                    {upcomingSessions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📭</div>
                            No upcoming sessions for your grade
                        </div>
                    ) : (
                        upcomingSessions.map(session => {
                            const d = new Date(session.scheduledAt);
                            return (
                                <div key={session.id} className={styles.sessionItem}>
                                    <div className={styles.sessionTime}>
                                        {d.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                        <br />
                                        {d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className={styles.sessionName}>{session.lessonTitle}</div>
                                    <span className={styles.sessionSubject}>{session.subject}</span>
                                </div>
                            );
                        })
                    )}
                    <button onClick={() => onNavigate('timetable')} style={{ width: '100%', padding: '8px', background: 'rgba(108,99,255,0.06)', border: 'none', borderRadius: '8px', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', marginTop: '8px' }}>
                        View Full Timetable →
                    </button>
                </div>

                {/* Quick Links */}
                <div className={`${styles.section} ${styles.sectionFull}`}>
                    <div className={styles.sectionTitle}>⚡ Quick Links</div>
                    <div className={styles.quickLinks}>
                        <button className={styles.quickLink} onClick={() => onNavigate('inquiry')}>
                            <span className={styles.quickLinkIcon}>🧠</span>
                            <span className={styles.quickLinkLabel}>
                                Ask AI Tutor
                                <span className={styles.quickLinkDesc}>Get help with any topic</span>
                            </span>
                        </button>
                        <button className={styles.quickLink} onClick={() => onNavigate('lessons')}>
                            <span className={styles.quickLinkIcon}>📝</span>
                            <span className={styles.quickLinkLabel}>
                                My Homework
                                <span className={styles.quickLinkDesc}>{pendingAssignments.length} pending</span>
                            </span>
                        </button>
                        <button className={styles.quickLink} onClick={() => onNavigate('sandbox')}>
                            <span className={styles.quickLinkIcon}>🎨</span>
                            <span className={styles.quickLinkLabel}>
                                Creation Sandbox
                                <span className={styles.quickLinkDesc}>Safe creative tools</span>
                            </span>
                        </button>
                        <button className={styles.quickLink} onClick={() => onNavigate('timetable')}>
                            <span className={styles.quickLinkIcon}>📅</span>
                            <span className={styles.quickLinkLabel}>
                                Timetable
                                <span className={styles.quickLinkDesc}>Session schedule</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
