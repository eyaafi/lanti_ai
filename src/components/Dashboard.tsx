'use client';

import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import StudentInquiry from '@/components/StudentInquiry/StudentInquiry';
import TeacherPanel from '@/components/TeacherPanel/TeacherPanel';
import CreationSandbox from '@/components/CreationSandbox/CreationSandbox';
import { usePedagogy, useLocale } from '@/components/providers';
import { useAuth } from '@/lib/auth/context';
import { SUPPORTED_LOCALES, formatLocaleDisplay } from '@/lib/i18n/engine';

import AdminDashboard from '@/components/AdminDashboard/AdminDashboard';
import MyLessons from './MyLessons/MyLessons';
import Timetable from '@/components/Timetable/Timetable';
import StudentDashboard from '@/components/StudentDashboard/StudentDashboard';

type ActiveView = 'student_home' | 'inquiry' | 'lessons' | 'teacher' | 'sandbox' | 'admin' | 'timetable';

export default function Dashboard() {
    const { user, logout } = useAuth();

    const navItemsList: { id: ActiveView; label: string; icon: string; description: string; allowedRoles: string[] }[] = [
        { id: 'student_home', label: 'My Dashboard', icon: '🏠', description: 'Your learning overview', allowedRoles: ['student'] },
        { id: 'inquiry', label: 'Student Inquiry', icon: '🧠', description: 'AI-guided learning', allowedRoles: ['student', 'admin'] },
        { id: 'lessons', label: 'My Homework', icon: '📝', description: 'Teacher assigned tasks', allowedRoles: ['student', 'admin'] },
        { id: 'teacher', label: 'Teacher Studio', icon: '📚', description: 'Lesson architect', allowedRoles: ['teacher', 'admin'] },
        { id: 'sandbox', label: 'Creation Sandbox', icon: '🎨', description: 'Safe creative tools', allowedRoles: ['student', 'teacher', 'admin'] },
        { id: 'timetable', label: 'Timetable', icon: '📅', description: 'Live session schedule', allowedRoles: ['student', 'teacher', 'admin'] },
        { id: 'admin', label: 'Student Management', icon: '🛡️', description: 'Manage cohorts', allowedRoles: ['admin', 'teacher'] },
    ];

    const navItems = navItemsList.filter(item => item.allowedRoles.includes(user?.role || ''));

    const [activeView, setActiveView] = useState<ActiveView>(
        navItems.length > 0 ? navItems[0].id : (user?.role === 'admin' ? 'admin' : 'inquiry')
    );
    const [showLocaleMenu, setShowLocaleMenu] = useState(false);
    const { pedagogyContext, setPedagogyMode, setGradeLevel, setSubject } = usePedagogy();
    const { locale, setLocale } = useLocale();

    // Reset active view when user role changes
    useEffect(() => {
        if (navItems.length > 0) {
            setActiveView(navItems[0].id);
        }
    }, [user?.role]);

    const pedagogyModes = [
        { id: 'socratic', label: 'Socratic', icon: '❓', color: '#6C63FF' },
        { id: 'constructivism', label: 'Constructivist', icon: '🏗️', color: '#00D4AA' },
        { id: 'direct', label: 'Direct', icon: '📖', color: '#FFB347' },
        { id: 'inquiry', label: 'Inquiry', icon: '🔬', color: '#FF6B6B' },
        { id: 'scaffolded', label: 'Scaffolded', icon: '🪜', color: '#A78BFA' },
        { id: 'collaborative', label: 'Collaborative', icon: '🤝', color: '#34D399' },
    ] as const;


    return (
        <div className={styles.dashboard}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>L</div>
                    <div>
                        <div className={styles.logoText}>Lantiai</div>
                        <div className={styles.logoTagline}>Pedagogy over Prompting</div>
                    </div>
                </div>

                <div className={styles.sidebarContent}>
                    <nav className={styles.nav}>
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                className={`${styles.navItem} ${activeView === item.id ? styles.navItemActive : ''}`}
                                onClick={() => setActiveView(item.id)}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <div className={styles.navLabel}>
                                    <span className={styles.navTitle}>{item.label}</span>
                                    <span className={styles.navDesc}>{item.description}</span>
                                </div>
                            </button>
                        ))}
                    </nav>

                    {/* Pedagogical Mode Selector */}
                    <div className={styles.modeSection}>
                        <div className={styles.modeSectionTitle}>
                            <span>⚙️</span> Pedagogical Mode
                        </div>
                        <div className={`${styles.modeGrid} ${user?.role === 'student' ? styles.disabledGrid : ''}`}>
                            {pedagogyModes.map(mode => (
                                <button
                                    key={mode.id}
                                    className={`${styles.modeChip} ${pedagogyContext.mode === mode.id ? styles.modeChipActive : ''}`}
                                    onClick={() => user?.role !== 'student' && setPedagogyMode(mode.id)}
                                    style={pedagogyContext.mode === mode.id ? { borderColor: mode.color, color: mode.color } : {}}
                                    title={mode.label}
                                    disabled={user?.role === 'student'}
                                >
                                    <span>{mode.icon}</span>
                                    <span>{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grade Level */}
                    <div className={styles.settingRow}>
                        <label className={styles.settingLabel}>Grade Level</label>
                        <select
                            className={styles.settingSelect}
                            value={pedagogyContext.gradeLevel}
                            onChange={e => setGradeLevel(e.target.value as any)}
                            disabled={user?.role === 'student'}
                        >
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
                    </div>

                    {/* Subject */}
                    <div className={styles.settingRow}>
                        <label className={styles.settingLabel}>Subject</label>
                        <select
                            className={styles.settingSelect}
                            value={pedagogyContext.subject}
                            onChange={e => setSubject(e.target.value)}
                            disabled={user?.role === 'student'}
                        >
                            <option value="General">General</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Science">Science</option>
                            <option value="Biology">Biology</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Physics">Physics</option>
                            <option value="History">History</option>
                            <option value="Geography">Geography</option>
                            <option value="Literature">Literature</option>
                            <option value="Art">Art</option>
                        </select>
                    </div>

                    {/* Locale Switcher */}
                    <div className={styles.localeSection}>
                        <button
                            className={`${styles.localeBtn} ${user?.role === 'student' ? styles.disabledLocale : ''}`}
                            onClick={() => user?.role !== 'student' && setShowLocaleMenu(!showLocaleMenu)}
                            disabled={user?.role === 'student'}
                        >
                            <span>🌐</span>
                            <span>{formatLocaleDisplay(locale)}</span>
                            <span className={styles.chevron}>{showLocaleMenu ? '▲' : '▼'}</span>
                        </button>
                        {showLocaleMenu && (
                            <div className={styles.localeMenu}>
                                {SUPPORTED_LOCALES.map(loc => (
                                    <button
                                        key={loc.code}
                                        className={`${styles.localeOption} ${locale === loc.code ? styles.localeOptionActive : ''}`}
                                        onClick={() => { setLocale(loc.code); setShowLocaleMenu(false); }}
                                    >
                                        <span>{loc.flag}</span>
                                        <span>{loc.nativeName}</span>
                                        <span className={styles.localeRegion}>{loc.region}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Safety Indicator */}
                    <div className={styles.safetyBadge}>
                        <span className={styles.safetyDot}></span>
                        <span>Safety Shield Active</span>
                    </div>
                </div>

                {/* User & Logout - Fixed at bottom of sidebar container but outside the scrolling content if desired, 
                    actually current .sidebar has overflow-y: auto. Wrapping top in .sidebarContent. */}
                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>{user?.name.charAt(0)}</div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>{user?.name}</div>
                            <div className={styles.userRole}>{user?.role}</div>
                        </div>
                    </div>
                    <button className={styles.logoutBtn} onClick={logout}>
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                {activeView === 'student_home' && <StudentDashboard onNavigate={(v) => setActiveView(v as ActiveView)} />}
                {activeView === 'inquiry' && <StudentInquiry />}
                {activeView === 'lessons' && <MyLessons />}
                {activeView === 'teacher' && <TeacherPanel />}
                {activeView === 'sandbox' && <CreationSandbox />}
                {activeView === 'timetable' && <Timetable />}
                {activeView === 'admin' && <AdminDashboard />}
            </main>
        </div>
    );
}
