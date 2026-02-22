'use client';

import { useState } from 'react';
import { useDiscussions } from '@/lib/discussions/context';
import { useAuth } from '@/lib/auth/context';
import styles from './DiscussionBoard.module.css';

export default function DiscussionBoard() {
    const { discussions, createPost, addReply, togglePin, deletePost } = useDiscussions();
    const { user } = useAuth();
    const [activeThread, setActiveThread] = useState<string | null>(null);
    const [showNewPost, setShowNewPost] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [filterSubject, setFilterSubject] = useState('all');
    const [newPost, setNewPost] = useState({ title: '', content: '', subject: '', lessonTitle: '' });

    const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

    const filtered = discussions
        .filter(d => filterSubject === 'all' || d.subject === filterSubject)
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const subjects = [...new Set(discussions.map(d => d.subject).filter(Boolean))];
    const selectedThread = discussions.find(d => d.id === activeThread);

    const handleSubmitPost = () => {
        if (!newPost.title.trim() || !newPost.content.trim()) return;
        createPost({
            title: newPost.title,
            content: newPost.content,
            subject: newPost.subject,
            lessonTitle: newPost.lessonTitle,
            grade: user?.gradeLevel || '',
        });
        setNewPost({ title: '', content: '', subject: '', lessonTitle: '' });
        setShowNewPost(false);
    };

    const handleReply = () => {
        if (!replyText.trim() || !activeThread) return;
        addReply(activeThread, replyText);
        setReplyText('');
    };

    const roleBadge = (role: string) => {
        const map: Record<string, { label: string; className: string }> = {
            teacher: { label: '👨‍🏫 Teacher', className: styles.badgeTeacher },
            admin: { label: '🛡️ Admin', className: styles.badgeAdmin },
            student: { label: '🎓 Student', className: styles.badgeStudent },
        };
        return map[role] || { label: role, className: '' };
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

    // Thread detail view
    if (selectedThread) {
        const badge = roleBadge(selectedThread.authorRole);
        return (
            <div className={styles.container}>
                <button className={styles.backBtn} onClick={() => setActiveThread(null)}>
                    ← Back to Discussions
                </button>
                <div className={styles.threadDetail}>
                    <div className={styles.threadHeader}>
                        <h2 className={styles.threadTitle}>{selectedThread.title}</h2>
                        <div className={styles.threadMeta}>
                            <span className={badge.className}>{badge.label}</span>
                            <span className={styles.authorName}>{selectedThread.authorName}</span>
                            <span className={styles.timestamp}>{timeAgo(selectedThread.createdAt)}</span>
                            {selectedThread.subject && <span className={styles.subjectTag}>{selectedThread.subject}</span>}
                        </div>
                    </div>
                    <div className={styles.threadContent}>{selectedThread.content}</div>

                    <div className={styles.repliesSection}>
                        <h3 className={styles.repliesTitle}>
                            💬 Replies ({selectedThread.replies.length})
                        </h3>
                        {selectedThread.replies.length === 0 ? (
                            <p className={styles.noReplies}>No replies yet. Be the first to respond!</p>
                        ) : (
                            <div className={styles.repliesList}>
                                {selectedThread.replies.map(reply => {
                                    const rBadge = roleBadge(reply.authorRole);
                                    return (
                                        <div key={reply.id} className={styles.replyCard}>
                                            <div className={styles.replyMeta}>
                                                <span className={rBadge.className}>{rBadge.label}</span>
                                                <span className={styles.authorName}>{reply.authorName}</span>
                                                <span className={styles.timestamp}>{timeAgo(reply.createdAt)}</span>
                                            </div>
                                            <div className={styles.replyContent}>{reply.content}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className={styles.replyForm}>
                            <textarea
                                className={styles.replyInput}
                                placeholder="Write your reply..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                rows={3}
                            />
                            <button className={styles.replySubmit} onClick={handleReply} disabled={!replyText.trim()}>
                                Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Discussion listing view
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>💬 Discussion Board</h2>
                    <p className={styles.subtitle}>Ask questions, share ideas, and learn together</p>
                </div>
                <div className={styles.headerActions}>
                    {subjects.length > 0 && (
                        <select className={styles.filterSelect} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                            <option value="all">All Subjects</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    )}
                    <button className={styles.newPostBtn} onClick={() => setShowNewPost(true)}>
                        + New Discussion
                    </button>
                </div>
            </div>

            {/* New Post Modal */}
            {showNewPost && (
                <div className={styles.modalOverlay} onClick={() => setShowNewPost(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3>📝 Start a Discussion</h3>
                        <div className={styles.formGroup}>
                            <label>Title</label>
                            <input
                                className={styles.formInput}
                                placeholder="What's your question or topic?"
                                value={newPost.title}
                                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Subject (optional)</label>
                            <input
                                className={styles.formInput}
                                placeholder="e.g. Mathematics, Science..."
                                value={newPost.subject}
                                onChange={e => setNewPost({ ...newPost, subject: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Details</label>
                            <textarea
                                className={styles.formTextarea}
                                placeholder="Describe your question or idea in detail..."
                                value={newPost.content}
                                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                rows={5}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <button className={styles.submitBtn} onClick={handleSubmitPost}>Post Discussion</button>
                            <button className={styles.cancelBtn} onClick={() => setShowNewPost(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discussion List */}
            {filtered.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>💬</div>
                    <p>No discussions yet</p>
                    <p className={styles.emptyHint}>Start a conversation to get help or share knowledge</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {filtered.map(d => {
                        const badge = roleBadge(d.authorRole);
                        return (
                            <div key={d.id} className={`${styles.postCard} ${d.isPinned ? styles.pinned : ''}`} onClick={() => setActiveThread(d.id)}>
                                <div className={styles.postLeft}>
                                    <div className={styles.replyCount}>
                                        <span className={styles.replyNum}>{d.replies.length}</span>
                                        <span className={styles.replyLabel}>replies</span>
                                    </div>
                                </div>
                                <div className={styles.postRight}>
                                    <div className={styles.postTitle}>
                                        {d.isPinned && <span className={styles.pinIcon}>📌</span>}
                                        {d.title}
                                    </div>
                                    <div className={styles.postMeta}>
                                        <span className={badge.className}>{badge.label}</span>
                                        <span>{d.authorName}</span>
                                        <span className={styles.timestamp}>{timeAgo(d.createdAt)}</span>
                                        {d.subject && <span className={styles.subjectTag}>{d.subject}</span>}
                                    </div>
                                </div>
                                {isTeacherOrAdmin && (
                                    <div className={styles.postActions} onClick={e => e.stopPropagation()}>
                                        <button className={styles.iconBtn} onClick={() => togglePin(d.id)} title={d.isPinned ? 'Unpin' : 'Pin'}>
                                            {d.isPinned ? '📌' : '📍'}
                                        </button>
                                        <button className={styles.iconBtn} onClick={() => { if (confirm('Delete this discussion?')) deletePost(d.id); }} title="Delete">
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
