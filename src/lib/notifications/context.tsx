'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type NotificationType =
    | 'homework_assigned'
    | 'feedback_received'
    | 'session_recorded'
    | 'discussion_reply'
    | 'session_scheduled';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    userId: string;
    organizationId: string;
    createdAt: string;
    read: boolean;
    link?: string; // nav view id like 'lessons', 'discussions', etc.
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'organizationId'>) => void;
    markRead: (id: string) => void;
    markAllRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('lantiai_notifications');
        if (saved) setNotifications(JSON.parse(saved));
    }, []);

    const save = useCallback((data: Notification[]) => {
        setNotifications(data);
        localStorage.setItem('lantiai_notifications', JSON.stringify(data));
    }, []);

    const getUser = () => JSON.parse(localStorage.getItem('lantiai_user') || '{}');

    const addNotification = useCallback((notifData: Omit<Notification, 'id' | 'createdAt' | 'read' | 'organizationId'>) => {
        const user = getUser();
        const newNotif: Notification = {
            ...notifData,
            id: Math.random().toString(36).substr(2, 9),
            organizationId: user.organizationId,
            createdAt: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => {
            const updated = [newNotif, ...prev];
            localStorage.setItem('lantiai_notifications', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const markRead = useCallback((id: string) => {
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
            localStorage.setItem('lantiai_notifications', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            localStorage.setItem('lantiai_notifications', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearAll = useCallback(() => {
        save([]);
    }, [save]);

    const user = typeof window !== 'undefined' ? getUser() : {};
    const filtered = notifications.filter(n => n.organizationId === user.organizationId);
    const unreadCount = filtered.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications: filtered, unreadCount, addNotification, markRead, markAllRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
}
