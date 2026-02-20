'use client';

import { useState } from 'react';
import { useAuth, User, UserRole } from '@/lib/auth/context';
import styles from './AdminDashboard.module.css';

type AdminTab = 'overview' | 'teachers' | 'students' | 'parents';

export default function AdminDashboard() {
    const { user, organization, createUser, updateUser, deleteUser, getOrganizationUsers } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');

    // Form States
    const [isCreating, setIsCreating] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newUserType, setNewUserType] = useState<UserRole>('teacher');
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserSubjects, setNewUserSubjects] = useState<string[]>(['Math']);
    const [newUserPedagogy, setNewUserPedagogy] = useState('socratic');
    const [newUserGradeLevel, setNewUserGradeLevel] = useState('6');
    const [newParentName, setNewParentName] = useState('');
    const [newParentEmail, setNewParentEmail] = useState('');

    const resetForm = () => {
        setIsCreating(false);
        setEditingUser(null);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserSubjects(['Math']);
        setNewUserPedagogy('socratic');
        setNewUserGradeLevel('6');
        setNewParentName('');
        setNewParentEmail('');
    };

    const openEdit = (u: User) => {
        setEditingUser(u);
        setNewUserType(u.role);
        setNewUserName(u.name);
        setNewUserEmail(u.email || '');
        setNewUserSubjects(u.subjects || ['Math']);
        setNewUserPedagogy(u.pedagogicalMode || 'socratic');
        setNewUserGradeLevel(u.gradeLevel || '6');
        setIsCreating(true);
    };

    const teachers = getOrganizationUsers('teacher');
    const students = getOrganizationUsers('student');
    const parents = getOrganizationUsers('parent');

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !organization) return;

        // EDIT mode
        if (editingUser) {
            const updates: Partial<User> = { name: newUserName, email: newUserEmail };
            if (editingUser.role === 'teacher') {
                updates.subjects = newUserSubjects;
                updates.pedagogicalMode = newUserPedagogy;
            }
            if (editingUser.role === 'student') {
                updates.gradeLevel = newUserGradeLevel;
                // Handle parent linking on edit
                if (newParentName && newParentEmail) {
                    const existingParent = parents.find(p => p.email === newParentEmail);
                    if (existingParent) {
                        updates.parentId = existingParent.id;
                    } else {
                        const parent = await createUser({
                            organizationId: user.organizationId,
                            name: newParentName,
                            email: newParentEmail,
                            role: 'parent'
                        });
                        updates.parentId = parent.id;
                    }
                }
            }
            updateUser(editingUser.id, updates);
            resetForm();
            return;
        }

        // CREATE mode
        let parentId: string | undefined = undefined;

        // If recording a student with parent info, find existing or create new parent
        if (newUserType === 'student' && newParentName && newParentEmail) {
            const existingParent = parents.find(p => p.email === newParentEmail);
            if (existingParent) {
                parentId = existingParent.id;
            } else {
                const parent = await createUser({
                    organizationId: user.organizationId,
                    name: newParentName,
                    email: newParentEmail,
                    role: 'parent'
                });
                parentId = parent.id;
            }
        }

        await createUser({
            organizationId: user.organizationId,
            name: newUserName,
            email: newUserEmail,
            role: newUserType,
            subjects: newUserType === 'teacher' ? newUserSubjects : undefined,
            pedagogicalMode: newUserType === 'teacher' ? newUserPedagogy : undefined,
            gradeLevel: newUserType === 'student' ? newUserGradeLevel : undefined,
            parentId: parentId
        });

        resetForm();
    };

    const promoteStudent = (student: User) => {
        const gradeOrder = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        const currentIndex = gradeOrder.indexOf(student.gradeLevel || 'K');
        if (currentIndex < gradeOrder.length - 1) {
            const nextGrade = gradeOrder[currentIndex + 1];
            updateUser(student.id, { gradeLevel: nextGrade });
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    {user?.role === 'admin' ? 'Organization Overview' : 'Student Management'}
                </h1>
                <p className={styles.subtitle}>
                    {user?.role === 'admin' ? `${organization?.name} • Administrative Management` : 'Manage your private students and cohorts'}
                </p>
            </header>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{teachers.length}</div>
                    <div className={styles.statLabel}>Active Teachers</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{students.length}</div>
                    <div className={styles.statLabel}>Enrolled Students</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>98%</div>
                    <div className={styles.statLabel}>Safety Score</div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'teachers' ? styles.tabActive : ''}`}
                    onClick={() => { setActiveTab('teachers'); setIsCreating(false); }}
                >
                    Teachers
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'students' ? styles.tabActive : ''}`}
                    onClick={() => { setActiveTab('students'); setIsCreating(false); }}
                >
                    Students
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'parents' ? styles.tabActive : ''}`}
                    onClick={() => { setActiveTab('parents'); setIsCreating(false); }}
                >
                    Parents
                </button>
            </div>

            {/* Teacher Management */}
            {activeTab === 'teachers' && (
                <section>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Teacher Directory</h2>
                        <button className={styles.actionBtn} onClick={() => { setIsCreating(true); setNewUserType('teacher'); }}>
                            + Add Teacher
                        </button>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Subjects</th>
                                <th>Default Mode</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((t) => (
                                <tr key={t.id}>
                                    <td>{t.name}</td>
                                    <td>{t.email}</td>
                                    <td>{t.subjects?.join(', ')}</td>
                                    <td>
                                        <span className={styles.roleBadge}>{t.pedagogicalMode}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className={styles.editBtn} onClick={() => openEdit(t)}>✏️ Edit</button>
                                            <button className={styles.deleteBtn} onClick={() => { if (confirm(`Delete ${t.name}?`)) deleteUser(t.id); }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Student Management */}
            {activeTab === 'students' && (
                <section>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Student Roster</h2>
                        <button className={styles.actionBtn} onClick={() => { setIsCreating(true); setNewUserType('student'); }}>
                            + Add Student
                        </button>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>User ID</th>
                                <th>Username / Email</th>
                                <th>Grade</th>
                                <th>Parent</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.name}</td>
                                    <td>
                                        <code style={{ padding: '2px 6px', background: 'rgba(108,99,255,0.08)', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace', cursor: 'pointer', userSelect: 'all' }}
                                            title="Click to select — share this ID with the student for login"
                                        >
                                            {s.id}
                                        </code>
                                    </td>
                                    <td>{s.username || s.email}</td>
                                    <td>{s.gradeLevel}</td>
                                    <td>{s.parentId ? (parents.find(p => p.id === s.parentId)?.name || '—') : '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            {s.gradeLevel !== '12' ? (
                                                <button className={styles.promoteBtn} onClick={() => { if (confirm(`Promote ${s.name} from Grade ${s.gradeLevel || 'K'} to Grade ${s.gradeLevel === 'K' ? '1' : String(Number(s.gradeLevel) + 1)}?`)) promoteStudent(s); }} title={`Promote to next grade`}>⬆ Promote</button>
                                            ) : (
                                                <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', background: 'rgba(0, 212, 170, 0.1)', color: '#00D4AA' }}>🎓 Graduated</span>
                                            )}
                                            <button className={styles.editBtn} onClick={() => openEdit(s)}>✏️ Edit</button>
                                            <button className={styles.deleteBtn} onClick={() => { if (confirm(`Delete ${s.name}?`)) deleteUser(s.id); }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Parent Management */}
            {activeTab === 'parents' && (
                <section>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Parent Directory</h2>
                        <button className={styles.actionBtn} onClick={() => { setIsCreating(true); setNewUserType('parent'); }}>
                            + Add Parent
                        </button>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Connected Children</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parents.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{p.email}</td>
                                    <td>{(() => {
                                        const linked = students.filter(s => s.parentId === p.id);
                                        if (linked.length === 0) return <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No children linked</span>;
                                        return (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }} title={linked.map(s => s.name).join(', ')}>
                                                {linked.map(s => (
                                                    <span key={s.id} style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.78rem', background: 'rgba(108, 99, 255, 0.1)', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                                                        {s.name.split(' ')[0]}
                                                    </span>
                                                ))}
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({linked.length})</span>
                                            </div>
                                        );
                                    })()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className={styles.editBtn} onClick={() => openEdit(p)}>✏️ Edit</button>
                                            <button className={styles.deleteBtn} onClick={() => { if (confirm(`Delete ${p.name}?`)) deleteUser(p.id); }}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Creation Modal (Simplified) */}
            {isCreating && (
                <div className={styles.modalOverlay} onClick={resetForm}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3>{editingUser ? `Edit ${newUserType.charAt(0).toUpperCase() + newUserType.slice(1)}` : `Add New ${newUserType.charAt(0).toUpperCase() + newUserType.slice(1)}`}</h3>
                        <form onSubmit={handleCreateUser}>
                            <input
                                placeholder="Full Name"
                                value={newUserName}
                                onChange={e => setNewUserName(e.target.value)}
                                required
                            />

                            {/* Email required for Teachers and Parents */}
                            {(newUserType === 'teacher' || newUserType === 'parent') && (
                                <input
                                    placeholder="Email"
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    required
                                />
                            )}

                            {newUserType === 'teacher' && (
                                <>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Subjects (select all that apply)</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                        {['Math', 'Science', 'History', 'English', 'Art', 'Music', 'Physical Education', 'Computer Science'].map(subj => (
                                            <label
                                                key={subj}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                                                    fontSize: '0.85rem', transition: 'all 0.2s',
                                                    background: newUserSubjects.includes(subj) ? 'rgba(108, 99, 255, 0.15)' : 'var(--bg-card)',
                                                    border: `1px solid ${newUserSubjects.includes(subj) ? 'var(--color-primary)' : 'var(--border-glass)'}`,
                                                    color: newUserSubjects.includes(subj) ? 'var(--color-primary)' : 'var(--text-secondary)',
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={newUserSubjects.includes(subj)}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setNewUserSubjects(prev => [...prev, subj]);
                                                        } else {
                                                            setNewUserSubjects(prev => prev.filter(s => s !== subj));
                                                        }
                                                    }}
                                                    style={{ display: 'none' }}
                                                />
                                                {newUserSubjects.includes(subj) ? '✓' : '+'} {subj}
                                            </label>
                                        ))}
                                    </div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Default Pedagogical Mode</label>
                                    <select value={newUserPedagogy} onChange={e => setNewUserPedagogy(e.target.value)}>
                                        <option value="socratic">Socratic</option>
                                        <option value="constructivist">Constructivist</option>
                                        <option value="direct">Direct Instruction</option>
                                        <option value="inquiry">Inquiry</option>
                                        <option value="scaffolded">Scaffolded</option>
                                        <option value="collaborative">Collaborative</option>
                                    </select>
                                </>
                            )}

                            {/* Grade Selection for Students */}
                            {newUserType === 'student' && (
                                <>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Assign Grade Level</label>
                                    <select value={newUserGradeLevel} onChange={e => setNewUserGradeLevel(e.target.value)}>
                                        <option value="K">Kindergarten</option>
                                        <option value="1">Grade 1</option>
                                        <option value="2">Grade 2</option>
                                        <option value="3">Grade 3</option>
                                        <option value="4">Grade 4</option>
                                        <option value="5">Grade 5</option>
                                        <option value="6">Grade 6</option>
                                        <option value="7">Grade 7</option>
                                        <option value="8">Grade 8</option>
                                        <option value="9">Grade 9</option>
                                        <option value="10">Grade 10</option>
                                        <option value="11">Grade 11</option>
                                        <option value="12">Grade 12</option>
                                    </select>

                                    <div className={styles.divider} />
                                    <h4 className={styles.modalSubTitle}>Parent Recording (Optional)</h4>
                                    <input
                                        placeholder="Parent Name"
                                        value={newParentName}
                                        onChange={e => setNewParentName(e.target.value)}
                                    />
                                    <input
                                        placeholder="Parent Email"
                                        value={newParentEmail}
                                        type="email"
                                        onChange={e => setNewParentEmail(e.target.value)}
                                    />
                                </>
                            )}

                            <button type="submit">{editingUser ? 'Save Changes' : 'Create User'}</button>
                            <button type="button" onClick={resetForm} style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', marginTop: '8px' }}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
