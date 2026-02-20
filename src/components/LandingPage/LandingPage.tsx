'use client';

import { useState } from 'react';
import styles from './LandingPage.module.css';
import { useAuth } from '@/lib/auth/context';

export default function LandingPage() {
    const { login, createOrganization, signupSolo } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'school' | 'solo' | 'student'>('login');
    const [orgName, setOrgName] = useState('');
    const [adminName, setAdminName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        if (authMode === 'student') {
            if (!studentId) return;
            setIsLoggingIn(true);
            await login(studentId);
            // Check if login actually worked (user should exist)
            const storedUsers = JSON.parse(localStorage.getItem('lantiai_db_users') || '[]');
            const found = storedUsers.find((u: any) =>
                u.email?.toLowerCase() === studentId.trim().toLowerCase() ||
                u.username?.toLowerCase() === studentId.trim().toLowerCase() ||
                u.id?.toLowerCase() === studentId.trim().toLowerCase()
            );
            if (!found) {
                setLoginError('No student found with that ID. Please check with your teacher.');
                setIsLoggingIn(false);
                return;
            }
        } else if (!email) {
            return;
        } else {
            setIsLoggingIn(true);
            if (authMode === 'school') {
                if (!orgName || !adminName) {
                    setIsLoggingIn(false);
                    return;
                }
                await createOrganization(orgName, adminName, email);
            } else if (authMode === 'solo') {
                if (!adminName) {
                    setIsLoggingIn(false);
                    return;
                }
                await signupSolo(adminName, email);
            } else {
                await login(email);
            }
        }
    };

    return (
        <div className={styles.container}>
            {/* Dynamic Background Elements */}
            <div className={styles.bgGlow1}></div>
            <div className={styles.bgGlow2}></div>
            <div className={styles.grid}></div>

            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>🧠</span>
                    <span className={styles.logoText}>Lantiai</span>
                </div>
                <div className={styles.navLinks}>
                    <a href="#features">Features</a>
                    <a href="#safety">Safety</a>
                    <button className="btn btn-primary" onClick={() => setShowLogin(true)}>Enter Platform</button>
                </div>
            </nav>

            <main className={styles.hero}>
                <div className={styles.heroContent} id="features">
                    <div className={styles.badge}>Next-Gen AI Education</div>
                    <h1 className={styles.heroTitle}>
                        Pedagogy <span className={styles.gradientText}>over</span> Prompting
                    </h1>
                    <p className={styles.heroSubtitle}>
                        The first AI-native educational ecosystem designed to teach, not just answer.
                        Powered by the Safety Shield and the Audio-Visual Aids Engine.
                    </p>
                    <div className={styles.heroActions}>
                        <button className={`${styles.ctaBtn} btn-primary`} onClick={() => setShowLogin(true)}>
                            Get Started Free
                        </button>
                        <button
                            className={`${styles.secBtn} btn-ghost`}
                            onClick={() => document.getElementById('safety')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Watch Demonstration
                        </button>
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>6+</div>
                            <div className={styles.statLabel}>Pedagogical Modes</div>
                        </div>
                        <div className={styles.statDivider}></div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>10</div>
                            <div className={styles.statLabel}>Locales Supported</div>
                        </div>
                        <div className={styles.statDivider}></div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>24/7</div>
                            <div className={styles.statLabel}>Safety Shield</div>
                        </div>
                    </div>
                </div>

                <div className={styles.heroVisual} id="safety">
                    <div className={styles.visualCard}>
                        <div className={styles.visualHeader}>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                        </div>
                        <div className={styles.visualContent}>
                            <div className={styles.mockChat}>
                                <div className={styles.mockBubbleStudent}>"What is 1/2 + 1/2?"</div>
                                <div className={styles.mockBubbleAI}>
                                    "Wonderful question! 🍎 If you have two halves of an apple, what happens when you bring them together?"
                                </div>
                                <div className={styles.mockIndicator}>Constructivist Mode Active</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.floatingTag1}>🛡️ Safety Shield Active</div>
                    <div className={styles.floatingTag2}>🎬 AV Engine Ready</div>
                </div>
            </main>

            {/* Login Modal */}
            {showLogin && (
                <div className={styles.modalOverlay} onClick={() => setShowLogin(false)}>
                    <div className={`glass-card ${styles.modal}`} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowLogin(false)}>&times;</button>

                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                {authMode === 'school' ? 'Create Your School' :
                                    authMode === 'solo' ? 'Teacher Signup' :
                                        authMode === 'student' ? 'Student Login' : 'Welcome Back'}
                            </h2>
                            <p className={styles.modalSubtitle}>
                                {authMode === 'school' ? 'Start your AI-native educational journey.' :
                                    authMode === 'solo' ? 'Your personal pedagogical studio awaits.' :
                                        authMode === 'student' ? 'Enter the User ID given by your teacher.' :
                                            'Enter your email to access the platform.'}
                            </p>
                        </div>

                        <div className={styles.toggleContainer}>
                            <button
                                className={`${styles.toggleBtn} ${authMode === 'login' ? styles.toggleActive : ''}`}
                                onClick={() => { setAuthMode('login'); setLoginError(''); }}
                            >
                                Login
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${authMode === 'student' ? styles.toggleActive : ''}`}
                                onClick={() => { setAuthMode('student'); setLoginError(''); }}
                            >
                                🎓 Student
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${authMode === 'solo' ? styles.toggleActive : ''}`}
                                onClick={() => { setAuthMode('solo'); setLoginError(''); }}
                            >
                                Solo Teacher
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${authMode === 'school' ? styles.toggleActive : ''}`}
                                onClick={() => { setAuthMode('school'); setLoginError(''); }}
                            >
                                Create School
                            </button>
                        </div>

                        <form className={styles.form} onSubmit={handleLogin}>
                            {authMode === 'student' ? (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>User ID / Username</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Enter your User ID or username"
                                        value={studentId}
                                        onChange={e => { setStudentId(e.target.value); setLoginError(''); }}
                                        required
                                        autoFocus
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Your teacher or school admin will provide your User ID
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {authMode === 'school' && (
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>School / Organization Name</label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                placeholder="Ex: Lincoln High School"
                                                value={orgName}
                                                onChange={e => setOrgName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}

                                    {(authMode === 'school' || authMode === 'solo') && (
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                {authMode === 'school' ? 'Admin Name' : 'Profile Name'}
                                            </label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                placeholder="Your Full Name"
                                                value={adminName}
                                                onChange={e => setAdminName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email Address</label>
                                        <input
                                            type="email"
                                            className={styles.input}
                                            placeholder="name@school.edu"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {loginError && (
                                <div style={{ padding: '8px 12px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', color: '#FF6B6B', fontSize: '0.85rem', marginBottom: '8px' }}>
                                    ⚠️ {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`btn btn-primary ${styles.loginSubmit}`}
                                disabled={isLoggingIn}
                            >
                                {isLoggingIn ? 'Processing...' :
                                    (authMode === 'school' ? 'Create School 🚀' :
                                        authMode === 'solo' ? 'Create Profile ✨' :
                                            authMode === 'student' ? 'Login as Student 🎓' : 'Enter Platform ✨')}
                            </button>
                        </form>
                        <p className={styles.disclaimer}>
                            By continuing, you agree to our pedagogical guidelines and safety protocols.
                        </p>
                    </div>
                </div>
            )}

            <footer className={styles.footer}>
                <p>© 2026 Lantiai AI. Built for the future of learning.</p>
            </footer>
        </div>
    );
}
