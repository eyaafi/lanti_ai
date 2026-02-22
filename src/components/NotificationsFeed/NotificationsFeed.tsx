'use client';

import { useState } from 'react';
import { useNotifications } from '@/lib/notifications/context';
import styles from './NotificationsFeed.module.css';

interface NotificationsFeedProps {
    onNavigate?: (viewId: string) => void;
    onClose: () => void;
}

export default function NotificationsFeed({ onNavigate, onClose }: NotificationsFeedProps) {
    const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filtered = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const iconMap: Record<string, string> = {
        homework_assigned: '📝',
        feedback_received: '💬',
        session_recorded: '📺',
        discussion_reply: '🗣️',
        session_scheduled: '📅',
    };

    const timeAgo = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h3 className={styles.title}>🔔 Notifications</h3>
                <div className={styles.headerActions}>
                    {unreadCount > 0 && (
                        <button className={styles.markAllBtn} onClick={markAllRead}>
                            Mark all read
                        </button>
                    )}
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
            </div>

            <div className={styles.filterTabs}>
                <button
                    className={`${styles.filterTab} ${filter === 'all' ? styles.filterActive : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({notifications.length})
                </button>
                <button
                    className={`${styles.filterTab} ${filter === 'unread' ? styles.filterActive : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            <div className={styles.list}>
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>🔕</span>
                        <p>{filter === 'unread' ? 'All caught up!' : 'No notifications yet'}</p>
                    </div>
                ) : (
                    filtered.map(n => (
                        <div
                            key={n.id}
                            className={`${styles.item} ${!n.read ? styles.unread : ''}`}
                            onClick={() => {
                                markRead(n.id);
                                if (n.link && onNavigate) {
                                    onNavigate(n.link);
                                    onClose();
                                }
                            }}
                        >
                            <span className={styles.itemIcon}>{iconMap[n.type] || '🔔'}</span>
                            <div className={styles.itemContent}>
                                <div className={styles.itemTitle}>{n.title}</div>
                                <div className={styles.itemMessage}>{n.message}</div>
                                <div className={styles.itemTime}>{timeAgo(n.createdAt)}</div>
                            </div>
                            {!n.read && <span className={styles.unreadDot} />}
                        </div>
                    ))
                )}
            </div>

            {notifications.length > 0 && (
                <div className={styles.footer}>
                    <button className={styles.clearBtn} onClick={() => { if (confirm('Clear all notifications?')) clearAll(); }}>
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
}
