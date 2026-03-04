'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    orderBy,
    arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth, UserRole } from '../auth/context';

export interface Reply {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorRole: UserRole;
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
    authorRole: UserRole;
    grade: string;
    subject?: string;
    organizationId: string;
    createdAt: string;
    replies: Reply[];
    isPinned?: boolean;
}

interface DiscussionContextType {
    discussions: Discussion[];
    createPost: (post: Omit<Discussion, 'id' | 'createdAt' | 'replies' | 'authorId' | 'authorName' | 'authorRole' | 'organizationId'>) => Promise<void>;
    addReply: (discussionId: string, content: string) => Promise<void>;
    togglePin: (discussionId: string, currentPinStatus: boolean) => Promise<void>;
    deletePost: (discussionId: string) => Promise<void>;
}

const DiscussionContext = createContext<DiscussionContextType | undefined>(undefined);

export function DiscussionProvider({ children }: { children: React.ReactNode }) {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const { user, organization } = useAuth();

    useEffect(() => {
        if (!user || !organization) {
            setDiscussions([]);
            return;
        }

        const q = query(
            collection(db, 'discussions'),
            where('organizationId', '==', organization.id),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedDiscussions: Discussion[] = [];
            snapshot.forEach((doc) => {
                fetchedDiscussions.push({ id: doc.id, ...doc.data() } as Discussion);
            });
            setDiscussions(fetchedDiscussions);
        }, (error) => {
            console.error("Error fetching discussions snapshot:", error);
        });

        return () => unsubscribe();
    }, [user?.id, organization?.id]);


    const createPost = async (postData: Omit<Discussion, 'id' | 'createdAt' | 'replies' | 'authorId' | 'authorName' | 'authorRole' | 'organizationId'>) => {
        if (!user || !organization) return;

        try {
            const newDocRef = doc(collection(db, 'discussions'));
            const newPost: Discussion = {
                ...postData,
                id: newDocRef.id,
                authorId: user.id,
                authorName: user.name,
                authorRole: user.role,
                organizationId: organization.id,
                createdAt: new Date().toISOString(),
                replies: [],
                isPinned: false
            };

            await setDoc(newDocRef, newPost);
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const addReply = async (discussionId: string, content: string) => {
        if (!user) return;

        try {
            const reply: Reply = {
                id: Math.random().toString(36).substr(2, 9), // Simple ID for sub-obj
                content,
                authorId: user.id,
                authorName: user.name,
                authorRole: user.role,
                createdAt: new Date().toISOString(),
            };

            const discussionRef = doc(db, 'discussions', discussionId);
            await updateDoc(discussionRef, {
                replies: arrayUnion(reply)
            });
        } catch (error) {
            console.error("Error adding reply:", error);
        }
    };

    const togglePin = async (discussionId: string, currentPinStatus: boolean) => {
        try {
            const discussionRef = doc(db, 'discussions', discussionId);
            await updateDoc(discussionRef, {
                isPinned: !currentPinStatus
            });
        } catch (error) {
            console.error("Error toggling pin:", error);
        }
    };

    const deletePost = async (discussionId: string) => {
        try {
            const discussionRef = doc(db, 'discussions', discussionId);
            await deleteDoc(discussionRef);
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    return (
        <DiscussionContext.Provider value={{ discussions, createPost, addReply, togglePin, deletePost }}>
            {children}
        </DiscussionContext.Provider>
    );
}

export function useDiscussions() {
    const context = useContext(DiscussionContext);
    if (!context) throw new Error('useDiscussions must be used within DiscussionProvider');
    return context;
}
