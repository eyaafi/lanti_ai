'use client';

import { useState, useEffect } from 'react';
import { useAuth, User, Organization } from '@/lib/auth/context';
import styles from './SuperAdminDashboard.module.css';

type SuperAdminTab = 'overview' | 'users' | 'organizations' | 'approvals';

export default function SuperAdminDashboard() {
    const { user, getGlobalUsers, getAllOrganizations, updateUser, deleteUser } = useAuth();
    const [activeTab, setActiveTab] = useState<SuperAdminTab>('overview');

    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        if (!user || user.role !== 'superadmin') return;

        const fetchData = async () => {
            setIsLoadingData(true);
            const users = await getGlobalUsers();
            const orgs = await getAllOrganizations();

            setAllUsers(users);
            setAllOrgs(orgs);
            setIsLoadingData(false);
        };
        fetchData();
    }, [user, getGlobalUsers, getAllOrganizations]);

    const handleApproveUser = async (u: User) => {
        if (confirm(`Approve access for ${u.name}?`)) {
            await updateUser(u.id, { isApproved: true });
            setAllUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, isApproved: true } : usr));
        }
    };

    const handleRevokeUser = async (u: User) => {
        if (confirm(`Revoke access for ${u.name}?`)) {
            await updateUser(u.id, { isApproved: false });
            setAllUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, isApproved: false } : usr));
        }
    };

    const handleChangeRole = async (u: User, newRole: User['role']) => {
        if (confirm(`Change role for ${u.name} to ${newRole}?`)) {
            await updateUser(u.id, { role: newRole });
            setAllUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, role: newRole } : usr));
        }
    };

    const getOrgName = (orgId: string) => {
        const org = allOrgs.find(o => o.id === orgId);
        return org ? org.name : 'Unknown / Orphaned';
    };

    if (user?.role !== 'superadmin') {
        return (
            <div className={styles.container}>
                <div className={styles.errorCard}>
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view the Super Admin dashboard.</p>
                </div>
            </div>
        );
    }

    const pendingApprovals = allUsers.filter(u => u.isApproved === false);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Super Admin Control Center</h1>
                <p className={styles.subtitle}>Ecosystem-wide Management & Approvals</p>
            </header>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{allUsers.length}</div>
                    <div className={styles.statLabel}>Total Platform Users</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{allOrgs.length}</div>
                    <div className={styles.statLabel}>Active Organizations</div>
                </div>
                <div className={styles.statCard} style={{ background: pendingApprovals.length > 0 ? 'rgba(255, 60, 100, 0.1)' : undefined }}>
                    <div className={styles.statValue} style={{ color: pendingApprovals.length > 0 ? '#ff3c64' : undefined }}>
                        {pendingApprovals.length}
                    </div>
                    <div className={styles.statLabel}>Pending Approvals</div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Global User List
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'approvals' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('approvals')}
                >
                    Approvals {pendingApprovals.length > 0 && <span className={styles.badge}>{pendingApprovals.length}</span>}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'organizations' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('organizations')}
                >
                    Organizations
                </button>
            </div>

            {/* Content Area */}
            <div className={styles.contentArea}>
                {isLoadingData ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Loading ecosystem data...
                    </div>
                ) : (
                    <>
                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <section>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>All Users</h2>
                                </div>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Name / Email</th>
                                            <th>Role</th>
                                            <th>Organization</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.map((u) => (
                                            <tr key={u.id}>
                                                <td>
                                                    <strong>{u.name}</strong><br />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                                                </td>
                                                <td>
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleChangeRole(u, e.target.value as any)}
                                                        className={styles.roleSelect}
                                                        disabled={u.id === user.id}
                                                    >
                                                        <option value="superadmin">Super Admin</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="teacher">Teacher</option>
                                                        <option value="student">Student</option>
                                                        <option value="parent">Parent</option>
                                                    </select>
                                                </td>
                                                <td>{getOrgName(u.organizationId)}</td>
                                                <td>
                                                    {u.isApproved !== false ? (
                                                        <span className={styles.statusActive}>Active</span>
                                                    ) : (
                                                        <span className={styles.statusPending}>Pending</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className={styles.actionGroup}>
                                                        {u.isApproved !== false ? (
                                                            <button className={styles.warningBtn} onClick={() => handleRevokeUser(u)} disabled={u.id === user.id}>Revoke</button>
                                                        ) : (
                                                            <button className={styles.successBtn} onClick={() => handleApproveUser(u)}>Approve</button>
                                                        )}
                                                        <button
                                                            className={styles.deleteBtn}
                                                            onClick={async () => {
                                                                if (confirm(`Completely delete ${u.name}?`)) {
                                                                    await deleteUser(u.id);
                                                                    setAllUsers(prev => prev.filter(usr => usr.id !== u.id));
                                                                }
                                                            }}
                                                            disabled={u.id === user.id}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}

                        {/* Approvals Tab */}
                        {activeTab === 'approvals' && (
                            <section>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>Pending Approvals</h2>
                                </div>
                                {pendingApprovals.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                                        No users are currently pending approval.
                                    </div>
                                ) : (
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Name / Email</th>
                                                <th>Requested Role</th>
                                                <th>Organization</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingApprovals.map((u) => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <strong>{u.name}</strong><br />
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                                                    </td>
                                                    <td>{u.role.toUpperCase()}</td>
                                                    <td>{getOrgName(u.organizationId)}</td>
                                                    <td>
                                                        <div className={styles.actionGroup}>
                                                            <button className={styles.successBtn} onClick={() => handleApproveUser(u)}>Approve Access</button>
                                                            <button className={styles.deleteBtn} onClick={async () => {
                                                                if (confirm(`Reject and delete ${u.name}?`)) {
                                                                    await deleteUser(u.id);
                                                                    setAllUsers(prev => prev.filter(usr => usr.id !== u.id));
                                                                }
                                                            }}>Reject & Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </section>
                        )}

                        {/* Organizations Tab */}
                        {activeTab === 'organizations' && (
                            <section>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>All Organizations</h2>
                                </div>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Plan</th>
                                            <th>Members</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allOrgs.map((org) => (
                                            <tr key={org.id}>
                                                <td><code style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{org.id}</code></td>
                                                <td><strong>{org.name}</strong></td>
                                                <td><span style={{ padding: '4px 12px', borderRadius: '12px', background: 'rgba(108,99,255,0.1)', color: 'var(--color-primary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>{org.plan}</span></td>
                                                <td>{allUsers.filter(u => u.organizationId === org.id).length} Users</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
