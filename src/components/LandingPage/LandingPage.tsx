'use client';

import { useState } from 'react';
import styles from './LandingPage.module.css';
import { useAuth } from '@/lib/auth/context';
import DocsPage from '../DocsPage/DocsPage';
import BlogPage from '../BlogPage/BlogPage';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

export default function LandingPage() {
    const { login, createOrganization, signupSolo } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [activePage, setActivePage] = useState<'home' | 'docs' | 'blog'>('home');
    const [authMode, setAuthMode] = useState<'login' | 'school' | 'solo' | 'student'>('login');
    const [orgName, setOrgName] = useState('');
    const [adminName, setAdminName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        if (authMode === 'student') {
            if (!studentId) return;
            setIsLoggingIn(true);
            const result = await login(studentId, password);
            if (!result.success) {
                setLoginError(result.error || 'Login failed.');
                setIsLoggingIn(false);
                return;
            }
        } else if (!email) {
            return;
        } else {
            setIsLoggingIn(true);
            if (authMode === 'school') {
                if (!orgName || !adminName || !password) {
                    setLoginError('All fields including password are required.');
                    setIsLoggingIn(false);
                    return;
                }
                await createOrganization(orgName, adminName, email, password);
            } else if (authMode === 'solo') {
                if (!adminName || !password) {
                    setLoginError('Name, email, and password are required.');
                    setIsLoggingIn(false);
                    return;
                }
                await signupSolo(adminName, email, password);
            } else {
                // Regular login
                if (!password) {
                    setLoginError('Password is required.');
                    setIsLoggingIn(false);
                    return;
                }
                const result = await login(email, password);
                if (!result.success) {
                    setLoginError(result.error || 'Login failed.');
                    setIsLoggingIn(false);
                    return;
                }
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
                <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
                    <span /><span /><span />
                </button>
                <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.navLinksOpen : ''}`}>
                    <a href="#features" onClick={(e) => { e.preventDefault(); setActivePage('home'); setMobileMenuOpen(false); }}>Features</a>
                    <a href="#safety" onClick={(e) => { e.preventDefault(); setActivePage('home'); setMobileMenuOpen(false); }}>Safety</a>
                    <a href="#docs" className={activePage === 'docs' ? styles.navActive : ''} onClick={(e) => { e.preventDefault(); setActivePage('docs'); setMobileMenuOpen(false); }}>Docs</a>
                    <a href="#blog" className={activePage === 'blog' ? styles.navActive : ''} onClick={(e) => { e.preventDefault(); setActivePage('blog'); setMobileMenuOpen(false); }}>Blog</a>
                    <ThemeToggle className={styles.themeToggle} />
                    <button className="btn btn-primary" onClick={() => { setShowLogin(true); setMobileMenuOpen(false); }}>Enter Platform</button>
                </div>
                {mobileMenuOpen && <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)} />}
            </nav>

            {activePage === 'docs' ? (
                <DocsPage onBack={() => setActivePage('home')} />
            ) : activePage === 'blog' ? (
                <BlogPage onBack={() => setActivePage('home')} />
            ) : (
                <>

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

                </>
            )}

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
                                <>
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
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Password</label>
                                        <input
                                            type="password"
                                            className={styles.input}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                                            required
                                        />
                                    </div>
                                </>
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

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Password</label>
                                        <input
                                            type="password"
                                            className={styles.input}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={e => { setPassword(e.target.value); setLoginError(''); }}
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
