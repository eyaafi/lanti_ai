'use client';

import { useRef, useEffect, useState } from 'react';
import { useLiveSession, type SavedSession, type DrawingPath } from '@/lib/live/context';
import { useAuth } from '@/lib/auth/context';
import styles from './RecordedLessons.module.css';

export default function RecordedLessons() {
    const { savedSessions } = useLiveSession();
    const { user } = useAuth();
    const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const [filter, setFilter] = useState('all');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Filter sessions by grade for students
    const visibleSessions = savedSessions.filter(s => {
        if (user?.role === 'admin' || user?.role === 'teacher') return true;
        return s.targetGrade === user?.gradeLevel;
    }).filter(s => filter === 'all' || s.subject === filter);

    const subjects = [...new Set(savedSessions.map(s => s.subject))];

    // Playback engine
    useEffect(() => {
        if (!isPlaying || !selectedSession || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (playbackIndex >= selectedSession.drawingPaths.length) {
            setIsPlaying(false);
            return;
        }

        timerRef.current = setTimeout(() => {
            // Draw the next path
            const path = selectedSession.drawingPaths[playbackIndex];
            drawPath(ctx, path);
            setPlaybackIndex(prev => prev + 1);
        }, 150); // 150ms between paths for smooth replay

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [isPlaying, playbackIndex, selectedSession]);

    // Resize canvas when session is selected
    useEffect(() => {
        if (!selectedSession || !canvasRef.current || !containerRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
    }, [selectedSession]);

    const drawPath = (ctx: CanvasRenderingContext2D, path: DrawingPath) => {
        if (path.points.length === 0) return;
        ctx.beginPath();
        ctx.lineWidth = path.brushSize;
        ctx.strokeStyle = path.isEraser ? '#1A1A2E' : path.color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
    };

    const startPlayback = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        setPlaybackIndex(0);
        setIsPlaying(true);
    };

    const stopPlayback = () => {
        setIsPlaying(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const showFullDrawing = () => {
        if (!selectedSession || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        selectedSession.drawingPaths.forEach(path => drawPath(ctx, path));
        setPlaybackIndex(selectedSession.drawingPaths.length);
        setIsPlaying(false);
    };

    const progress = selectedSession
        ? Math.round((playbackIndex / Math.max(selectedSession.drawingPaths.length, 1)) * 100)
        : 0;

    if (selectedSession) {
        return (
            <div className={styles.container}>
                <button className={styles.backBtn} onClick={() => { setSelectedSession(null); stopPlayback(); }}>
                    ← Back to Recordings
                </button>

                <div className={styles.playerHeader}>
                    <div>
                        <h2 className={styles.playerTitle}>{selectedSession.lessonTitle}</h2>
                        <div className={styles.playerMeta}>
                            <span className={styles.metaBadge}>👤 {selectedSession.teacherName}</span>
                            <span className={styles.metaBadge}>Grade {selectedSession.targetGrade}</span>
                            <span className={styles.metaBadge}>{selectedSession.subject}</span>
                            <span className={styles.metaBadge}>⏱ {selectedSession.duration}m</span>
                            <span className={styles.metaBadge}>
                                📅 {new Date(selectedSession.startedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.playerControls}>
                    {!isPlaying ? (
                        <button className={styles.playBtn} onClick={startPlayback}>▶ Play</button>
                    ) : (
                        <button className={styles.pauseBtn} onClick={stopPlayback}>⏸ Pause</button>
                    )}
                    <button className={styles.skipBtn} onClick={showFullDrawing}>⏩ Show All</button>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                    <span className={styles.progressText}>{progress}%</span>
                </div>

                <div className={styles.canvasContainer} ref={containerRef}>
                    <canvas ref={canvasRef} className={styles.canvas} />
                    {playbackIndex === 0 && !isPlaying && (
                        <div className={styles.canvasPlaceholder}>
                            Press ▶ Play to watch the recorded session
                        </div>
                    )}
                </div>

                {selectedSession.prompts.length > 0 && (
                    <div className={styles.promptsSection}>
                        <h3 className={styles.promptsTitle}>💡 AI Prompts Used</h3>
                        <div className={styles.promptsList}>
                            {selectedSession.prompts.map((p, i) => (
                                <div key={i} className={styles.promptItem}>
                                    <span className={styles.promptTime}>
                                        {new Date(p.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={styles.promptText}>{p.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>📺 Recorded Lessons</h2>
                    <p className={styles.subtitle}>Watch past live sessions at your own pace</p>
                </div>
                {subjects.length > 0 && (
                    <select className={styles.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">All Subjects</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                )}
            </div>

            {visibleSessions.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📼</div>
                    <p>No recorded sessions available yet</p>
                    <p className={styles.emptyHint}>Sessions will appear here after a teacher ends a live class</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {visibleSessions.map(session => (
                        <div key={session.id} className={styles.card} onClick={() => setSelectedSession(session)}>
                            <div className={styles.cardPreview}>
                                <span className={styles.playOverlay}>▶</span>
                            </div>
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>{session.lessonTitle}</h3>
                                <div className={styles.cardMeta}>
                                    <span>👤 {session.teacherName}</span>
                                    <span>Grade {session.targetGrade}</span>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>{session.subject}</span>
                                    <span>⏱ {session.duration}m</span>
                                    <span>{session.drawingPaths.length} drawings</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
