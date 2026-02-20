'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/context';

export interface Point {
    x: number;
    y: number;
}

export interface DrawingPath {
    id: string;
    points: Point[];
    color: string;
    brushSize: number;
    isEraser?: boolean;
}

export interface TeacherPrompt {
    id: string;
    studentId: string;
    text: string;
    timestamp: number;
}

export interface StudentStatus {
    isHandRaised: boolean;
    lastActive: number;
}

export interface ScheduledSession {
    id: string;
    lessonId: string;
    lessonTitle: string;
    teacherId: string;
    teacherName: string;
    subject: string;
    targetGrade: string;
    scheduledAt: string; // ISO date-time
    duration: number; // minutes
    status: 'scheduled' | 'live' | 'completed';
}

export interface SavedSession {
    id: string;
    lessonId: string;
    lessonTitle: string;
    teacherName: string;
    targetGrade: string;
    subject: string;
    drawingPaths: DrawingPath[];
    prompts: TeacherPrompt[];
    startedAt: string;
    endedAt: string;
    duration: number;
}

export interface ActiveSessionInfo {
    sessionId: string;
    lessonId: string;
    lessonTitle: string;
    teacherName: string;
    targetGrade: string;
    subject: string;
}

interface LiveSessionContextType {
    activeSessionId: string | null;
    activeSessionInfo: ActiveSessionInfo | null;
    drawingPaths: DrawingPath[];
    teacherPrompts: TeacherPrompt[];
    studentStatuses: Record<string, StudentStatus>;
    scheduledSessions: ScheduledSession[];
    savedSessions: SavedSession[];

    // Actions
    scheduleSession: (session: Omit<ScheduledSession, 'id' | 'status'>) => void;
    deleteScheduledSession: (sessionId: string) => void;
    startSession: (lessonId: string, targetGrade: string, lessonTitle: string, subject: string) => void;
    endSession: () => void;
    broadcastDrawing: (path: DrawingPath) => void;
    clearBoard: () => void;
    pushAIPrompt: (studentId: string, text: string) => void;
    raiseHand: () => void;
    lowerHand: (studentId: string) => void;
}

const LiveSessionContext = createContext<LiveSessionContextType | undefined>(undefined);

export function LiveSessionProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [activeSessionInfo, setActiveSessionInfo] = useState<ActiveSessionInfo | null>(null);
    const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
    const [teacherPrompts, setTeacherPrompts] = useState<TeacherPrompt[]>([]);
    const [studentStatuses, setStudentStatuses] = useState<Record<string, StudentStatus>>({});
    const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);
    const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

    // Sync from localStorage
    const loadState = useCallback(() => {
        const session = localStorage.getItem('lantiai_live_session');
        const sessionInfo = localStorage.getItem('lantiai_live_session_info');
        const paths = localStorage.getItem('lantiai_live_paths');
        const prompts = localStorage.getItem('lantiai_live_prompts');
        const statuses = localStorage.getItem('lantiai_live_statuses');
        const scheduled = localStorage.getItem('lantiai_scheduled_sessions');
        const saved = localStorage.getItem('lantiai_saved_sessions');

        if (session) setActiveSessionId(session);
        else setActiveSessionId(null);

        if (sessionInfo) setActiveSessionInfo(JSON.parse(sessionInfo));
        else setActiveSessionInfo(null);

        if (paths) setDrawingPaths(JSON.parse(paths));
        else setDrawingPaths([]);

        if (prompts) setTeacherPrompts(JSON.parse(prompts));
        else setTeacherPrompts([]);

        if (statuses) setStudentStatuses(JSON.parse(statuses));
        else setStudentStatuses({});

        if (scheduled) setScheduledSessions(JSON.parse(scheduled));
        else setScheduledSessions([]);

        if (saved) setSavedSessions(JSON.parse(saved));
        else setSavedSessions([]);
    }, []);

    useEffect(() => {
        loadState();

        const handleStorage = (e: StorageEvent) => {
            if (e.key?.startsWith('lantiai_live_') || e.key?.startsWith('lantiai_scheduled_') || e.key?.startsWith('lantiai_saved_')) {
                loadState();
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [loadState]);

    // Poll for changes every 2 seconds (for same-tab updates)
    useEffect(() => {
        const interval = setInterval(loadState, 2000);
        return () => clearInterval(interval);
    }, [loadState]);

    const scheduleSession = (sessionData: Omit<ScheduledSession, 'id' | 'status'>) => {
        const newSession: ScheduledSession = {
            ...sessionData,
            id: Math.random().toString(36).substr(2, 9),
            status: 'scheduled',
        };
        const updated = [...scheduledSessions, newSession];
        setScheduledSessions(updated);
        localStorage.setItem('lantiai_scheduled_sessions', JSON.stringify(updated));
    };

    const deleteScheduledSession = (sessionId: string) => {
        const updated = scheduledSessions.filter(s => s.id !== sessionId);
        setScheduledSessions(updated);
        localStorage.setItem('lantiai_scheduled_sessions', JSON.stringify(updated));
    };

    const startSession = (lessonId: string, targetGrade: string, lessonTitle: string, subject: string) => {
        if (user?.role !== 'teacher' && user?.role !== 'admin') return;

        const info: ActiveSessionInfo = {
            sessionId: lessonId,
            lessonId,
            lessonTitle,
            teacherName: user.name,
            targetGrade,
            subject,
        };

        localStorage.setItem('lantiai_live_session', lessonId);
        localStorage.setItem('lantiai_live_session_info', JSON.stringify(info));
        localStorage.setItem('lantiai_live_session_start', new Date().toISOString());
        localStorage.removeItem('lantiai_live_paths');
        localStorage.removeItem('lantiai_live_prompts');
        localStorage.setItem('lantiai_live_statuses', JSON.stringify({}));

        // Update scheduled session status if it exists
        const updated = scheduledSessions.map(s =>
            s.lessonId === lessonId && s.targetGrade === targetGrade ? { ...s, status: 'live' as const } : s
        );
        setScheduledSessions(updated);
        localStorage.setItem('lantiai_scheduled_sessions', JSON.stringify(updated));

        loadState();
    };

    const endSession = () => {
        if (user?.role !== 'teacher' && user?.role !== 'admin') return;

        // Save session for later reference
        const startTime = localStorage.getItem('lantiai_live_session_start');
        const currentPaths = JSON.parse(localStorage.getItem('lantiai_live_paths') || '[]');
        const currentPrompts = JSON.parse(localStorage.getItem('lantiai_live_prompts') || '[]');

        if (activeSessionInfo) {
            const saved: SavedSession = {
                id: Math.random().toString(36).substr(2, 9),
                lessonId: activeSessionInfo.lessonId,
                lessonTitle: activeSessionInfo.lessonTitle,
                teacherName: activeSessionInfo.teacherName,
                targetGrade: activeSessionInfo.targetGrade,
                subject: activeSessionInfo.subject,
                drawingPaths: currentPaths,
                prompts: currentPrompts,
                startedAt: startTime || new Date().toISOString(),
                endedAt: new Date().toISOString(),
                duration: startTime ? Math.round((Date.now() - new Date(startTime).getTime()) / 60000) : 0,
            };

            const currentSaved = JSON.parse(localStorage.getItem('lantiai_saved_sessions') || '[]');
            currentSaved.push(saved);
            localStorage.setItem('lantiai_saved_sessions', JSON.stringify(currentSaved));
        }

        // Update scheduled session status
        const updated = scheduledSessions.map(s =>
            s.status === 'live' ? { ...s, status: 'completed' as const } : s
        );
        localStorage.setItem('lantiai_scheduled_sessions', JSON.stringify(updated));

        localStorage.removeItem('lantiai_live_session');
        localStorage.removeItem('lantiai_live_session_info');
        localStorage.removeItem('lantiai_live_session_start');
        localStorage.removeItem('lantiai_live_paths');
        localStorage.removeItem('lantiai_live_prompts');
        localStorage.removeItem('lantiai_live_statuses');
        loadState();
    };

    const broadcastDrawing = (path: DrawingPath) => {
        if (user?.role !== 'teacher' && user?.role !== 'admin') return;
        const newPaths = [...drawingPaths, path];
        localStorage.setItem('lantiai_live_paths', JSON.stringify(newPaths));
        setDrawingPaths(newPaths);
    };

    const clearBoard = () => {
        if (user?.role !== 'teacher' && user?.role !== 'admin') return;
        localStorage.setItem('lantiai_live_paths', JSON.stringify([]));
        setDrawingPaths([]);
    };

    const pushAIPrompt = (studentId: string, text: string) => {
        if (user?.role !== 'teacher' && user?.role !== 'admin') return;
        const prompt: TeacherPrompt = {
            id: Math.random().toString(36).substr(2, 9),
            studentId,
            text,
            timestamp: Date.now()
        };
        const newPrompts = [...teacherPrompts, prompt];
        localStorage.setItem('lantiai_live_prompts', JSON.stringify(newPrompts));
        setTeacherPrompts(newPrompts);
    };

    const raiseHand = () => {
        if (user?.role !== 'student') return;
        const currentStatuses = JSON.parse(localStorage.getItem('lantiai_live_statuses') || '{}');
        currentStatuses[user.id] = {
            isHandRaised: true,
            lastActive: Date.now()
        };
        localStorage.setItem('lantiai_live_statuses', JSON.stringify(currentStatuses));
        setStudentStatuses(currentStatuses);
    };

    const lowerHand = (studentId: string) => {
        if (user?.role !== 'teacher' && user?.role !== 'admin') return;
        const currentStatuses = JSON.parse(localStorage.getItem('lantiai_live_statuses') || '{}');
        if (currentStatuses[studentId]) {
            currentStatuses[studentId].isHandRaised = false;
            currentStatuses[studentId].lastActive = Date.now();
            localStorage.setItem('lantiai_live_statuses', JSON.stringify(currentStatuses));
            setStudentStatuses(currentStatuses);
        }
    };

    return (
        <LiveSessionContext.Provider value={{
            activeSessionId,
            activeSessionInfo,
            drawingPaths,
            teacherPrompts,
            studentStatuses,
            scheduledSessions,
            savedSessions,
            scheduleSession,
            deleteScheduledSession,
            startSession,
            endSession,
            broadcastDrawing,
            clearBoard,
            pushAIPrompt,
            raiseHand,
            lowerHand
        }}>
            {children}
        </LiveSessionContext.Provider>
    );
}

export function useLiveSession() {
    const context = useContext(LiveSessionContext);
    if (context === undefined) {
        throw new Error('useLiveSession must be used within a LiveSessionProvider');
    }
    return context;
}
