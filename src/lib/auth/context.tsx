'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * LANTIAI - Auth Context & Data Model
 * 
 * Manages Authentication and Organization Data.
 * Simplified for demo purposes using localStorage persistence.
 */

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
    id: string;
    organizationId: string;
    name: string;
    email: string;
    username?: string;
    password?: string; // Hashed in production, plain for demo
    role: UserRole;

    // Role specific fields
    subjects?: string[];        // For teachers
    pedagogicalMode?: string;   // For teachers (default mode)
    gradeLevel?: string;        // For students
    parentId?: string;          // For students
    childrenIds?: string[];     // For parents
}

export interface Organization {
    id: string;
    name: string;
    plan: 'free' | 'pro' | 'enterprise';
}

interface AuthContextType {
    user: User | null;
    organization: Organization | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Auth Actions
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    signupSolo: (name: string, email: string, password: string) => Promise<void>;

    // Admin Actions (Mock)
    createOrganization: (orgName: string, adminName: string, adminEmail: string, password: string) => Promise<void>;
    createUser: (currUser: Omit<User, 'id'>) => Promise<User>;
    updateUser: (userId: string, updates: Partial<User>) => void;
    deleteUser: (userId: string) => void;
    getOrganizationUsers: (role?: UserRole) => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Persistence check
    useEffect(() => {
        const savedUser = localStorage.getItem('lantiai_user');
        const savedOrg = localStorage.getItem('lantiai_org');

        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedOrg) setOrganization(JSON.parse(savedOrg));

        // Seed default admin if DB is empty for demo/testing
        const storedUsers = localStorage.getItem('lantiai_db_users');
        if (!storedUsers) {
            const defaultOrg: Organization = {
                id: 'school-org',
                name: 'Lanti Academy',
                plan: 'enterprise'
            };
            const defaultAdmin: User = {
                id: 'admin-1',
                organizationId: defaultOrg.id,
                name: 'School Admin',
                email: 'admin@school.edu',
                role: 'admin'
            };
            localStorage.setItem('lantiai_db_orgs', JSON.stringify([defaultOrg]));
            localStorage.setItem('lantiai_db_users', JSON.stringify([defaultAdmin]));
        }

        setIsLoading(false);
    }, []);

    const login = async (emailOrId: string, password: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const storedUsers = JSON.parse(localStorage.getItem('lantiai_db_users') || '[]');
        const identifier = emailOrId.trim().toLowerCase();

        // Check reserved demo identifiers FIRST
        if (['admin@school.edu', 'admin@school.org', 'admin@school.com', 'admin'].includes(identifier)) {
            if (password !== 'admin123') {
                setIsLoading(false);
                return { success: false, error: 'Incorrect password.' };
            }
            const adminOrg: Organization = { id: 'school-org', name: 'Lanti Academy', plan: 'enterprise' };
            const adminUser: User = {
                id: 'admin-1', organizationId: adminOrg.id, name: 'School Admin',
                email: 'admin@school.edu', password: 'admin123', role: 'admin'
            };
            setUser(adminUser); setOrganization(adminOrg);
            localStorage.setItem('lantiai_user', JSON.stringify(adminUser));
            localStorage.setItem('lantiai_org', JSON.stringify(adminOrg));

            const currentUsers = JSON.parse(localStorage.getItem('lantiai_db_users') || '[]');
            const existingIdx = currentUsers.findIndex((u: User) => u.email === adminUser.email);
            if (existingIdx >= 0) { currentUsers[existingIdx] = adminUser; } else { currentUsers.push(adminUser); }
            localStorage.setItem('lantiai_db_users', JSON.stringify(currentUsers));
            const currentOrgs = JSON.parse(localStorage.getItem('lantiai_db_orgs') || '[]');
            if (!currentOrgs.find((o: Organization) => o.id === adminOrg.id)) { currentOrgs.push(adminOrg); localStorage.setItem('lantiai_db_orgs', JSON.stringify(currentOrgs)); }

        } else if (['teacher@school.edu', 'teacher@school.org', 'teacher@school.com', 'teacher'].includes(identifier)) {
            if (password !== 'teacher123') {
                setIsLoading(false);
                return { success: false, error: 'Incorrect password.' };
            }
            const teacherOrg: Organization = { id: 'school-org', name: 'Lanti Academy', plan: 'enterprise' };
            const teacherUser: User = {
                id: 'teacher-1', organizationId: teacherOrg.id, name: 'Demo Teacher',
                email: 'teacher@school.edu', password: 'teacher123', role: 'teacher', subjects: ['Mathematics', 'Science']
            };
            setUser(teacherUser); setOrganization(teacherOrg);
            localStorage.setItem('lantiai_user', JSON.stringify(teacherUser));
            localStorage.setItem('lantiai_org', JSON.stringify(teacherOrg));

            const currentUsers = JSON.parse(localStorage.getItem('lantiai_db_users') || '[]');
            const existingIdx = currentUsers.findIndex((u: User) => u.email === teacherUser.email);
            if (existingIdx >= 0) { currentUsers[existingIdx] = teacherUser; } else { currentUsers.push(teacherUser); }
            localStorage.setItem('lantiai_db_users', JSON.stringify(currentUsers));
            const currentOrgs = JSON.parse(localStorage.getItem('lantiai_db_orgs') || '[]');
            if (!currentOrgs.find((o: Organization) => o.id === teacherOrg.id)) { currentOrgs.push(teacherOrg); localStorage.setItem('lantiai_db_orgs', JSON.stringify(currentOrgs)); }

        } else {
            // Check DB for registered users
            const foundUser = storedUsers.find((u: User) =>
                u.email?.toLowerCase() === identifier ||
                u.username?.toLowerCase() === identifier ||
                u.id?.toLowerCase() === identifier
            );

            if (foundUser) {
                // Validate password (students created by admin may have a password set)
                if (foundUser.password && foundUser.password !== password) {
                    setIsLoading(false);
                    return { success: false, error: 'Incorrect password.' };
                }
                setUser(foundUser);
                localStorage.setItem('lantiai_user', JSON.stringify(foundUser));

                const storedOrgs = JSON.parse(localStorage.getItem('lantiai_db_orgs') || '[]');
                const foundOrg = storedOrgs.find((o: Organization) => o.id === foundUser.organizationId);
                if (foundOrg) { setOrganization(foundOrg); localStorage.setItem('lantiai_org', JSON.stringify(foundOrg)); }
            } else {
                setIsLoading(false);
                return { success: false, error: 'No account found with that email or ID.' };
            }
        }
        setIsLoading(false);
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('lantiai_user');
    };

    const createOrganization = async (orgName: string, adminName: string, adminEmail: string, password: string) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newOrg: Organization = {
            id: Math.random().toString(36).substr(2, 9),
            name: orgName,
            plan: 'enterprise'
        };

        const newAdmin: User = {
            id: Math.random().toString(36).substr(2, 9),
            organizationId: newOrg.id,
            name: adminName,
            email: adminEmail,
            password: password,
            role: 'admin'
        };

        setOrganization(newOrg);
        setUser(newAdmin);

        localStorage.setItem('lantiai_org', JSON.stringify(newOrg));
        localStorage.setItem('lantiai_user', JSON.stringify(newAdmin));

        // Register Organization in Org DB for later login lookup
        const currentOrgs = JSON.parse(localStorage.getItem('lantiai_db_orgs') || '[]');
        currentOrgs.push(newOrg);
        localStorage.setItem('lantiai_db_orgs', JSON.stringify(currentOrgs));

        // Init DB with the first user
        const currentUsers = JSON.parse(localStorage.getItem('lantiai_db_users') || '[]');
        currentUsers.push(newAdmin);
        localStorage.setItem('lantiai_db_users', JSON.stringify(currentUsers));
        setIsLoading(false);
    };

    const signupSolo = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newOrg: Organization = {
            id: `solo-${Math.random().toString(36).substr(2, 9)}`,
            name: `${name}'s Studio`,
            plan: 'pro'
        };

        const soloTeacher: User = {
            id: Math.random().toString(36).substr(2, 9),
            organizationId: newOrg.id,
            name: name,
            email: email,
            password: password,
            role: 'teacher'
        };

        setOrganization(newOrg);
        setUser(soloTeacher);

        localStorage.setItem('lantiai_org', JSON.stringify(newOrg));
        localStorage.setItem('lantiai_user', JSON.stringify(soloTeacher));

        // Registry for future logins - Both Org and User
        const currentOrgs = JSON.parse(localStorage.getItem('lantiai_db_orgs') || '[]');
        currentOrgs.push(newOrg);
        localStorage.setItem('lantiai_db_orgs', JSON.stringify(currentOrgs));

        const currentUsers = JSON.parse(localStorage.getItem('lantiai_db_users') || '[]');
        currentUsers.push(soloTeacher);
        localStorage.setItem('lantiai_db_users', JSON.stringify(currentUsers));
        setIsLoading(false);
    };

    const createUser = async (newUser: Omit<User, 'id'>) => {
        const currentOrg = JSON.parse(localStorage.getItem('lantiai_org') || '{}');
        // Assume verified admin
        await new Promise(resolve => setTimeout(resolve, 500));

        // Enforce organizationId from session
        const userToCreate = { ...newUser, organizationId: currentOrg.id };

        // Auto-generate email/username for students if missing
        let finalUser: User = { ...userToCreate, id: '' }; // Add id temporarily to satisfy User type
        if (newUser.role === 'student' && !newUser.email) {
            const cleanName = newUser.name.toLowerCase().replace(/\s/g, '.');
            const randomSuffix = Math.floor(Math.random() * 1000);
            finalUser.email = `${cleanName}${randomSuffix}@student.lantiai.edu`; // Mock internal email
            finalUser.username = `${cleanName}${randomSuffix}`;
        }

        const user: User = {
            ...finalUser,
            id: Math.random().toString(36).substr(2, 9),
        };

        const currentUsers = JSON.parse(localStorage.getItem('lantiai_db_users') || '[]');
        currentUsers.push(user);
        localStorage.setItem('lantiai_db_users', JSON.stringify(currentUsers));

        return user;
    };

    const getOrganizationUsers = (role?: UserRole): User[] => {
        const currentOrg = JSON.parse(localStorage.getItem('lantiai_org') || '{}');
        const currentUsers = JSON.parse(localStorage.getItem('lantiai_db_users') || '[]');

        const orgUsers = currentUsers.filter((u: User) => u.organizationId === currentOrg.id);

        if (role) {
            return orgUsers.filter((u: User) => u.role === role);
        }
        return orgUsers;
    };

    const updateUser = (userId: string, updates: Partial<User>) => {
        const currentUsers: User[] = JSON.parse(localStorage.getItem('lantiai_db_users') || '[]');
        const updated = currentUsers.map(u => u.id === userId ? { ...u, ...updates } : u);
        localStorage.setItem('lantiai_db_users', JSON.stringify(updated));
    };

    const deleteUser = (userId: string) => {
        const currentUsers: User[] = JSON.parse(localStorage.getItem('lantiai_db_users') || '[]');
        const filtered = currentUsers.filter(u => u.id !== userId);
        localStorage.setItem('lantiai_db_users', JSON.stringify(filtered));
    };

    return (
        <AuthContext.Provider value={{
            user,
            organization,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            signupSolo,
            createOrganization,
            createUser,
            updateUser,
            deleteUser,
            getOrganizationUsers
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
