'use client';

import { useState } from 'react';
import { useAuth, User } from '@/lib/auth/context';
import { useLessons } from '@/lib/lessons/context';
import styles from './SoloTeacherStudio.module.css';

type StudioTab = 'students' | 'tutorials' | 'progress' | 'settings';

interface PrivateTutorial {
    id: string;
    title: string;
    subject: string;
    studentId: string;
    studentName: string;
    description: string;
    scheduledDate: string;
    duration: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
}

export default function SoloTeacherStudio() {
    const { user, organization, createUser, getOrganizationUsers, deleteUser } = useAuth();
    const { lessons } = useLessons();
    const [activeTab, setActiveTab] = useState<StudioTab>('students');

    // Student form state
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [studentGrade, setStudentGrade] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [parentEmail, setParentEmail] = useState('');

    // Tutorial form state
    const [showAddTutorial, setShowAddTutorial] = useState(false);
    const [tutTitle, setTutTitle] = useState('');
    const [tutSubject, setTutSubject] = useState('');
    const [tutStudentId, setTutStudentId] = useState('');
    const [tutDescription, setTutDescription] = useState('');
    const [tutDate, setTutDate] = useState('');
    const [tutDuration, setTutDuration] = useState('60');

    // Settings state
    const [studioName, setStudioName] = useState(organization?.name || '');
    const [teachingSubjects, setTeachingSubjects] = useState(user?.subjects?.join(', ') || '');
    const [settingsSaved, setSettingsSaved] = useState(false);

    // Get students from this solo teacher's org
    const myStudents = getOrganizationUsers('student');

    // Get tutorials from localStorage
    const getTutorials = (): PrivateTutorial[] => {
        const stored = localStorage.getItem(`lantiai_tutorials_${user?.id}`);
        return stored ? JSON.parse(stored) : [];
    };

    const [tutorials, setTutorials] = useState<PrivateTutorial[]>(getTutorials());

    const saveTutorials = (updated: PrivateTutorial[]) => {
        localStorage.setItem(`lantiai_tutorials_${user?.id}`, JSON.stringify(updated));
        setTutorials(updated);
    };

    const generateUsername = (name: string) => {
        const base = name.toLowerCase().replace(/\s+/g, '.');
        const suffix = Math.floor(Math.random() * 900) + 100;
        return `${base}.${suffix}`;
    };

    const generatePassword = () => {
        const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
        let pw = '';
        for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
        return pw;
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName) return;

        const username = generateUsername(studentName);
        const password = studentPassword || generatePassword();

        const newStudent = await createUser({
            organizationId: user?.organizationId || '',
            name: studentName,
            email: `${username}@lantiai.local`,
            username: username,
            password: password,
            role: 'student' as const,
            gradeLevel: studentGrade || undefined,
        });

        // Show the credentials alert
        alert(`Student created!\n\nUsername: ${username}\nPassword: ${password}\n\nShare these with your student so they can log in.`);

        setStudentName('');
        setStudentGrade('');
        setStudentPassword('');
        setParentEmail('');
        setShowAddStudent(false);
    };

    const handleAddTutorial = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tutTitle || !tutStudentId) return;

        const student = myStudents.find(s => s.id === tutStudentId);
        const newTutorial: PrivateTutorial = {
            id: Math.random().toString(36).substr(2, 9),
            title: tutTitle,
            subject: tutSubject,
            studentId: tutStudentId,
            studentName: student?.name || 'Unknown',
            description: tutDescription,
            scheduledDate: tutDate,
            duration: tutDuration,
            status: 'scheduled',
        };

        saveTutorials([newTutorial, ...tutorials]);
        setTutTitle('');
        setTutSubject('');
        setTutStudentId('');
        setTutDescription('');
        setTutDate('');
        setTutDuration('60');
        setShowAddTutorial(false);
    };

    const updateTutorialStatus = (id: string, status: 'completed' | 'cancelled') => {
        saveTutorials(tutorials.map(t => t.id === id ? { ...t, status } : t));
    };

    const handleSaveSettings = () => {
        // Update org name in localStorage
        if (organization) {
            const updatedOrg = { ...organization, name: studioName };
            localStorage.setItem('lantiai_org', JSON.stringify(updatedOrg));
        }
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
    };

    const tabs: { id: StudioTab; label: string; icon: string }[] = [
        { id: 'students', label: 'My Students', icon: '👨‍🎓' },
        { id: 'tutorials', label: 'Private Tutorials', icon: '📖' },
        { id: 'progress', label: 'Progress', icon: '📊' },
        { id: 'settings', label: 'Studio Settings', icon: '⚙️' },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>🎯 My Studio</h1>
                    <p className={styles.subtitle}>{organization?.name || 'Solo Teacher Studio'} — Independent Tutoring</p>
                </div>
                <div className={styles.headerStats}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{myStudents.length}</span>
                        <span className={styles.statLabel}>Students</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{tutorials.filter(t => t.status === 'scheduled').length}</span>
                        <span className={styles.statLabel}>Upcoming</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{tutorials.filter(t => t.status === 'completed').length}</span>
                        <span className={styles.statLabel}>Completed</span>
                    </div>
                </div>
            </div>

            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {/* ======== MY STUDENTS TAB ======== */}
                {activeTab === 'students' && (
                    <div>
                        <div className={styles.sectionHeader}>
                            <h2>My Students</h2>
                            <button className={styles.addBtn} onClick={() => setShowAddStudent(!showAddStudent)}>
                                {showAddStudent ? '✕ Cancel' : '+ Add Student'}
                            </button>
                        </div>

                        {showAddStudent && (
                            <form className={styles.form} onSubmit={handleAddStudent}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Student Name *</label>
                                        <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Sarah Johnson" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Grade Level</label>
                                        <select value={studentGrade} onChange={e => setStudentGrade(e.target.value)}>
                                            <option value="">Select grade</option>
                                            {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'University'].map(g => (
                                                <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : g === 'University' ? 'University' : `Grade ${g}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Set Password (optional — auto-generated if blank)</label>
                                        <input type="text" value={studentPassword} onChange={e => setStudentPassword(e.target.value)} placeholder="Leave blank to auto-generate" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Parent Email (optional)</label>
                                        <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="parent@example.com" />
                                    </div>
                                </div>
                                <button type="submit" className={styles.submitBtn}>Create Student Account</button>
                            </form>
                        )}

                        {myStudents.length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>👨‍🎓</span>
                                <h3>No students yet</h3>
                                <p>Add your first student to start private tutoring sessions.</p>
                            </div>
                        ) : (
                            <div className={styles.studentGrid}>
                                {myStudents.map(student => (
                                    <div key={student.id} className={styles.studentCard}>
                                        <div className={styles.studentAvatar}>{student.name.charAt(0)}</div>
                                        <div className={styles.studentInfo}>
                                            <h4>{student.name}</h4>
                                            <p className={styles.studentMeta}>
                                                {student.gradeLevel && <span>Grade {student.gradeLevel}</span>}
                                                <span>ID: {student.username || student.id}</span>
                                            </p>
                                        </div>
                                        <button className={styles.deleteBtn} onClick={() => { if (confirm(`Remove ${student.name}?`)) deleteUser(student.id); }} title="Remove student">🗑️</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ======== PRIVATE TUTORIALS TAB ======== */}
                {activeTab === 'tutorials' && (
                    <div>
                        <div className={styles.sectionHeader}>
                            <h2>Private Tutorials</h2>
                            <button className={styles.addBtn} onClick={() => setShowAddTutorial(!showAddTutorial)}>
                                {showAddTutorial ? '✕ Cancel' : '+ Schedule Tutorial'}
                            </button>
                        </div>

                        {showAddTutorial && (
                            <form className={styles.form} onSubmit={handleAddTutorial}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Tutorial Title *</label>
                                        <input type="text" value={tutTitle} onChange={e => setTutTitle(e.target.value)} placeholder="e.g. Algebra Fundamentals" required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Subject</label>
                                        <input type="text" value={tutSubject} onChange={e => setTutSubject(e.target.value)} placeholder="e.g. Mathematics" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Student *</label>
                                        <select value={tutStudentId} onChange={e => setTutStudentId(e.target.value)} required>
                                            <option value="">Select a student</option>
                                            {myStudents.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        {myStudents.length === 0 && <p style={{ fontSize: '0.75rem', color: '#FF6B6B', marginTop: 4 }}>Add students first before scheduling tutorials.</p>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Scheduled Date & Time</label>
                                        <input type="datetime-local" value={tutDate} onChange={e => setTutDate(e.target.value)} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Duration (minutes)</label>
                                        <select value={tutDuration} onChange={e => setTutDuration(e.target.value)}>
                                            <option value="30">30 min</option>
                                            <option value="45">45 min</option>
                                            <option value="60">1 hour</option>
                                            <option value="90">1.5 hours</option>
                                            <option value="120">2 hours</option>
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.formGroup} style={{ marginTop: 12 }}>
                                    <label>Description / Lesson Plan</label>
                                    <textarea value={tutDescription} onChange={e => setTutDescription(e.target.value)} placeholder="What will you cover in this tutorial?" rows={3} />
                                </div>
                                <button type="submit" className={styles.submitBtn}>Schedule Tutorial</button>
                            </form>
                        )}

                        {tutorials.length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>📖</span>
                                <h3>No tutorials scheduled</h3>
                                <p>Create your first private tutorial for a student.</p>
                            </div>
                        ) : (
                            <div className={styles.tutorialList}>
                                {tutorials.map(tut => (
                                    <div key={tut.id} className={`${styles.tutorialCard} ${styles[`status_${tut.status}`]}`}>
                                        <div className={styles.tutorialMain}>
                                            <div className={styles.tutorialHeader}>
                                                <h4>{tut.title}</h4>
                                                <span className={`${styles.statusBadge} ${styles[`badge_${tut.status}`]}`}>{tut.status}</span>
                                            </div>
                                            <p className={styles.tutorialMeta}>
                                                <span>👨‍🎓 {tut.studentName}</span>
                                                {tut.subject && <span>📚 {tut.subject}</span>}
                                                {tut.scheduledDate && <span>📅 {new Date(tut.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                                                <span>⏱️ {tut.duration} min</span>
                                            </p>
                                            {tut.description && <p className={styles.tutorialDesc}>{tut.description}</p>}
                                        </div>
                                        {tut.status === 'scheduled' && (
                                            <div className={styles.tutorialActions}>
                                                <button className={styles.completeBtn} onClick={() => updateTutorialStatus(tut.id, 'completed')}>✓ Complete</button>
                                                <button className={styles.cancelBtn} onClick={() => updateTutorialStatus(tut.id, 'cancelled')}>✕ Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ======== PROGRESS TAB ======== */}
                {activeTab === 'progress' && (
                    <div>
                        <h2 className={styles.sectionTitle}>Student Progress</h2>
                        {myStudents.length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>📊</span>
                                <h3>No students to track</h3>
                                <p>Add students to see their learning progress.</p>
                            </div>
                        ) : (
                            <div className={styles.progressGrid}>
                                {myStudents.map(student => {
                                    const studentTutorials = tutorials.filter(t => t.studentId === student.id);
                                    const completed = studentTutorials.filter(t => t.status === 'completed').length;
                                    const scheduled = studentTutorials.filter(t => t.status === 'scheduled').length;
                                    const total = studentTutorials.length;
                                    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

                                    return (
                                        <div key={student.id} className={styles.progressCard}>
                                            <div className={styles.progressHeader}>
                                                <div className={styles.studentAvatar}>{student.name.charAt(0)}</div>
                                                <div>
                                                    <h4>{student.name}</h4>
                                                    <p>{student.gradeLevel ? `Grade ${student.gradeLevel}` : 'No grade set'}</p>
                                                </div>
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
                                            </div>
                                            <div className={styles.progressStats}>
                                                <span>✅ {completed} completed</span>
                                                <span>📅 {scheduled} upcoming</span>
                                                <span>📖 {total} total</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ======== SETTINGS TAB ======== */}
                {activeTab === 'settings' && (
                    <div>
                        <h2 className={styles.sectionTitle}>Studio Settings</h2>
                        <div className={styles.settingsForm}>
                            <div className={styles.settingsCard}>
                                <h3>Profile</h3>
                                <div className={styles.formGroup}>
                                    <label>Your Name</label>
                                    <input type="text" value={user?.name || ''} disabled />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input type="email" value={user?.email || ''} disabled />
                                </div>
                            </div>

                            <div className={styles.settingsCard}>
                                <h3>Studio</h3>
                                <div className={styles.formGroup}>
                                    <label>Studio Name</label>
                                    <input type="text" value={studioName} onChange={e => setStudioName(e.target.value)} placeholder="e.g. Sarah's Math Studio" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Teaching Subjects</label>
                                    <input type="text" value={teachingSubjects} onChange={e => setTeachingSubjects(e.target.value)} placeholder="e.g. Mathematics, Physics, Chemistry" />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Separate subjects with commas</p>
                                </div>
                                <button className={styles.submitBtn} onClick={handleSaveSettings}>
                                    {settingsSaved ? '✓ Saved!' : 'Save Settings'}
                                </button>
                            </div>

                            <div className={styles.settingsCard}>
                                <h3>Quick Reference</h3>
                                <div className={styles.infoRow}>
                                    <span>Organization ID</span>
                                    <code>{user?.organizationId}</code>
                                </div>
                                <div className={styles.infoRow}>
                                    <span>Account Type</span>
                                    <code>Solo Teacher</code>
                                </div>
                                <div className={styles.infoRow}>
                                    <span>Total Students</span>
                                    <code>{myStudents.length}</code>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
