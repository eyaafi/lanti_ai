'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Reply {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorRole: 'student' | 'teacher' | 'admin';
    createdAt: string;
}

export interface Discussion {
    id: string;
    lessonId?: string;
    lessonTitle?: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorRole: 'student' | 'teacher' | 'admin';
    grade: string;
    subject?: string;
    organizationId: string;
    createdAt: string;
    replies: Reply[];
    isPinned?: boolean;
}

interface DiscussionContextType {
    discussions: Discussion[];
    createPost: (post: Omit<Discussion, 'id' | 'createdAt' | 'replies' | 'authorId' | 'authorName' | 'authorRole' | 'organizationId'>) => void;
    addReply: (discussionId: string, content: string) => void;
    togglePin: (discussionId: string) => void;
    deletePost: (discussionId: string) => void;
}

const DiscussionContext = createContext<DiscussionContextType | undefined>(undefined);

export function DiscussionProvider({ children }: { children: React.ReactNode }) {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('lantiai_discussions');
        if (saved) setDiscussions(JSON.parse(saved));
    }, []);

    const save = (data: Discussion[]) => {
        setDiscussions(data);
        localStorage.setItem('lantiai_discussions', JSON.stringify(data));
    };

    const getUser = () => JSON.parse(localStorage.getItem('lantiai_user') || '{}');

    const createPost = (postData: Omit<Discussion, 'id' | 'createdAt' | 'replies' | 'authorId' | 'authorName' | 'authorRole' | 'organizationId'>) => {
        const user = getUser();
        const newPost: Discussion = {
            ...postData,
            id: Math.random().toString(36).substr(2, 9),
            authorId: user.id,
            authorName: user.name,
            authorRole: user.role,
            organizationId: user.organizationId,
            createdAt: new Date().toISOString(),
            replies: [],
        };
        save([newPost, ...discussions]);
    };

    const addReply = (discussionId: string, content: string) => {
        const user = getUser();
        const reply: Reply = {
            id: Math.random().toString(36).substr(2, 9),
            content,
            authorId: user.id,
            authorName: user.name,
            authorRole: user.role,
            createdAt: new Date().toISOString(),
        };
        save(discussions.map(d =>
            d.id === discussionId ? { ...d, replies: [...d.replies, reply] } : d
        ));
    };

    const togglePin = (discussionId: string) => {
        save(discussions.map(d =>
            d.id === discussionId ? { ...d, isPinned: !d.isPinned } : d
        ));
    };

    const deletePost = (discussionId: string) => {
        save(discussions.filter(d => d.id !== discussionId));
    };

    const filtered = discussions.filter(d => {
        const user = typeof window !== 'undefined' ? getUser() : {};
        return d.organizationId === user.organizationId;
    });

    return (
        <DiscussionContext.Provider value={{ discussions: filtered, createPost, addReply, togglePin, deletePost }}>
            {children}
        </DiscussionContext.Provider>
    );
}

export function useDiscussions() {
    const context = useContext(DiscussionContext);
    if (!context) throw new Error('useDiscussions must be used within DiscussionProvider');
    return context;
}
