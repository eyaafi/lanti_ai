'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PedagogicalMode } from '@/lib/pedagogy/engine';

export interface Lesson {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    pedagogicalMode: PedagogicalMode;
    objectives: string[];
    activities: string[];
    avAids: string[];
    safetyNotes: string;
    duration: number;
    createdAt: string;
    teacherId: string;
    organizationId: string;
}

export interface Assignment {
    id: string;
    lessonId: string;
    organizationId: string;
    targetGrade: string; // Required: specific grade like '6'
    dueDate?: string; // ISO date
    instructions?: string; // Custom homework questions/instructions
    assignedAt: string;
    teacherId: string;
}

export interface Submission {
    id: string;
    assignmentId: string;
    studentId: string;
    studentName: string;
    response: string;
    submittedAt: string;
    status: 'completed' | 'pending';
    feedback?: string;
    reviewedAt?: string;
}

interface LessonContextType {
    lessons: Lesson[];
    assignments: Assignment[];
    submissions: Submission[];
    isLoading: boolean;

    // Actions
    createLesson: (lesson: Omit<Lesson, 'id' | 'createdAt' | 'teacherId' | 'organizationId'>) => Promise<void>;
    assignLesson: (lessonId: string, targetGrade: string, dueDate?: string, instructions?: string) => Promise<void>;
    submitResponse: (assignmentId: string, response: string) => Promise<void>;
    addFeedback: (submissionId: string, feedback: string) => Promise<void>;
    getAssignmentsForStudent: (studentGrade: string) => (Assignment & { lesson: Lesson })[];
    getSubmissionsForTeacher: (teacherId: string) => (Submission & { lessonTitle: string })[];
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

export function LessonProvider({ children }: { children: React.ReactNode }) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Persistence
    useEffect(() => {
        const savedLessons = localStorage.getItem('lantiai_lessons');
        const savedAssignments = localStorage.getItem('lantiai_assignments');
        const savedSubmissions = localStorage.getItem('lantiai_submissions');

        if (savedLessons) setLessons(JSON.parse(savedLessons));
        if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
        if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));

        setIsLoading(false);
    }, []);

    const saveToLocal = (key: string, data: any) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    const createLesson = async (lessonData: Omit<Lesson, 'id' | 'createdAt' | 'teacherId' | 'organizationId'>) => {
        const user = JSON.parse(localStorage.getItem('lantiai_user') || '{}');
        const newLesson: Lesson = {
            ...lessonData,
            id: Math.random().toString(36).substr(2, 9),
            teacherId: user.id,
            organizationId: user.organizationId,
            createdAt: new Date().toISOString()
        };

        const updated = [...lessons, newLesson];
        setLessons(updated);
        saveToLocal('lantiai_lessons', updated);
    };

    const assignLesson = async (lessonId: string, targetGrade: string, dueDate?: string, instructions?: string) => {
        const user = JSON.parse(localStorage.getItem('lantiai_user') || '{}');
        const newAssignment: Assignment = {
            id: Math.random().toString(36).substr(2, 9),
            lessonId,
            organizationId: user.organizationId,
            targetGrade,
            dueDate,
            instructions,
            teacherId: user.id,
            assignedAt: new Date().toISOString()
        };

        const updated = [...assignments, newAssignment];
        setAssignments(updated);
        saveToLocal('lantiai_assignments', updated);
    };

    const submitResponse = async (assignmentId: string, response: string) => {
        const user = JSON.parse(localStorage.getItem('lantiai_user') || '{}');
        const newSubmission: Submission = {
            id: Math.random().toString(36).substr(2, 9),
            assignmentId,
            studentId: user.id,
            studentName: user.name,
            response,
            submittedAt: new Date().toISOString(),
            status: 'completed'
        };

        const updated = [...submissions, newSubmission];
        setSubmissions(updated);
        saveToLocal('lantiai_submissions', updated);
    };

    const addFeedback = async (submissionId: string, feedback: string) => {
        const updated = submissions.map(s =>
            s.id === submissionId
                ? { ...s, feedback, reviewedAt: new Date().toISOString() }
                : s
        );
        setSubmissions(updated);
        saveToLocal('lantiai_submissions', updated);
    };

    const getAssignmentsForStudent = (studentGrade: string) => {
        const user = JSON.parse(localStorage.getItem('lantiai_user') || '{}');
        return assignments
            .filter(a => a.organizationId === user.organizationId && (!a.targetGrade || a.targetGrade === studentGrade))
            .map(a => ({
                ...a,
                lesson: lessons.find(l => l.id === a.lessonId)!
            }))
            .filter(a => a.lesson); // Ensure lesson exists
    };

    const getSubmissionsForTeacher = (teacherId: string) => {
        const user = JSON.parse(localStorage.getItem('lantiai_user') || '{}');
        return submissions
            .filter(s => {
                const assignment = assignments.find(a => a.id === s.assignmentId);
                return assignment?.organizationId === user.organizationId &&
                    (user.role === 'admin' || assignment?.teacherId === teacherId);
            })
            .map(s => {
                const assignment = assignments.find(a => a.id === s.assignmentId);
                const lesson = assignment ? lessons.find(l => l.id === assignment.lessonId) : null;
                return {
                    ...s,
                    lessonTitle: lesson?.title || 'Unknown Lesson'
                };
            });
    };

    return (
        <LessonContext.Provider value={{
            lessons: lessons.filter(l => {
                const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lantiai_user') || '{}') : {};
                return l.organizationId === user.organizationId;
            }),
            assignments: assignments.filter(a => {
                const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lantiai_user') || '{}') : {};
                return a.organizationId === user.organizationId;
            }),
            submissions: submissions.filter(s => {
                const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lantiai_user') || '{}') : {};
                const assignment = assignments.find(at => at.id === s.assignmentId);
                return assignment?.organizationId === user.organizationId;
            }),
            isLoading,
            createLesson,
            assignLesson,
            submitResponse,
            addFeedback,
            getAssignmentsForStudent,
            getSubmissionsForTeacher
        }}>
            {children}
        </LessonContext.Provider>
    );
}

export function useLessons() {
    const context = useContext(LessonContext);
    if (context === undefined) {
        throw new Error('useLessons must be used within a LessonProvider');
    }
    return context;
}
