'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    updateDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export type UserRole = 'superadmin' | 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
    id: string; // Firebase Auth UID
    organizationId: string;
    name: string;
    email: string;
    username?: string;
    role: UserRole;
    isApproved?: boolean;

    // Role specific fields
    subjects?: string[];
    pedagogicalMode?: string;
    gradeLevel?: string;
    parentId?: string;
    childrenIds?: string[];
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
    logout: () => Promise<void>;
    signupSolo: (name: string, email: string, password: string) => Promise<void>;

    // Admin Actions
    createOrganization: (orgName: string, adminName: string, adminEmail: string, password: string) => Promise<void>;
    createUser: (currUser: Omit<User, 'id'>) => Promise<User | null>;
    updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    getOrganizationUsers: (role?: UserRole) => Promise<User[]>;

    // Super Admin Actions
    getGlobalUsers: (role?: UserRole) => Promise<User[]>;
    getAllOrganizations: () => Promise<Organization[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Listen to Firebase Auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Fetch user profile from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        setUser(userData);

                        // Fetch organization details
                        if (userData.organizationId) {
                            const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
                            if (orgDoc.exists()) {
                                setOrganization({ id: orgDoc.id, ...orgDoc.data() } as Organization);
                            }
                        }
                    } else {
                        console.error("User profile document not found in Firestore.");
                        setUser(null);
                        setOrganization(null);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUser(null);
                setOrganization(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        try {
            // Note: Firebase requires real emails. The previous mock allowed custom usernames/ids.
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error: any) {
            console.error("Login failed:", error);
            setIsLoading(false);
            return { success: false, error: error.message || 'Login failed.' };
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await signOut(auth);
            setUser(null);
            setOrganization(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
        setIsLoading(false);
    };

    const createOrganization = async (orgName: string, adminName: string, adminEmail: string, password: string) => {
        setIsLoading(true);
        try {
            // Create in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, password);
            const firebaseUser = userCredential.user;

            await updateProfile(firebaseUser, { displayName: adminName });

            // Create Organization in Firestore
            const orgRef = doc(collection(db, 'organizations'));
            const newOrg: Omit<Organization, 'id'> = {
                name: orgName,
                plan: 'enterprise'
            };
            await setDoc(orgRef, newOrg);

            // Create User Document in Firestore
            const newUser: User = {
                id: firebaseUser.uid,
                organizationId: orgRef.id,
                name: adminName,
                email: adminEmail,
                role: 'admin'
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

            // Local state will update via onAuthStateChanged listener
        } catch (error: any) {
            console.error("Failed to create organization:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signupSolo = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            await updateProfile(firebaseUser, { displayName: name });

            const orgRef = doc(collection(db, 'organizations'));
            const newOrg: Omit<Organization, 'id'> = {
                name: `${name}'s Studio`,
                plan: 'pro'
            };
            await setDoc(orgRef, newOrg);

            const soloTeacher: User = {
                id: firebaseUser.uid,
                organizationId: orgRef.id,
                name: name,
                email: email,
                role: 'teacher'
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), soloTeacher);

        } catch (error: any) {
            console.error("Solo signup failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const createUser = async (newUser: Omit<User, 'id'>): Promise<User | null> => {
        if (!organization) throw new Error("Must be logged in to an organization");

        try {
            // WARNING: In a real app, creating a user while logged in will sign out the current admin!
            // This should ideally be handled via a Firebase Admin SDK backend Cloud Function.
            // For now, we will mock the Auth portion and just create the Firestore document if 
            // no Firebase Admin backend is hooked up for this specifically on the client.
            // A true implementation requires calling an API route we will build shortly.

            console.warn("Client-side createUser is restricted. Use the Admin API route for production.");

            const newDocRef = doc(collection(db, 'users'));
            const userObj: User = {
                ...newUser,
                id: newDocRef.id, // Using Firestore ID as a mock UID if auth bypass is used
                organizationId: organization.id
            };

            await setDoc(newDocRef, userObj);
            return userObj;

        } catch (error) {
            console.error("Create user failed:", error);
            return null;
        }
    };

    const getOrganizationUsers = async (role?: UserRole): Promise<User[]> => {
        if (!organization) return [];

        try {
            let q = query(collection(db, 'users'), where("organizationId", "==", organization.id));
            if (role) {
                q = query(q, where("role", "==", role));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data() as User);
        } catch (error) {
            console.error("Failed to fetch organization users:", error);
            return [];
        }
    };

    const getGlobalUsers = async (role?: UserRole): Promise<User[]> => {
        if (!user || user.role !== 'superadmin') return [];

        try {
            let q = query(collection(db, 'users'));
            if (role) {
                q = query(q, where("role", "==", role));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data() as User);
        } catch (error) {
            console.error("Failed to fetch global users:", error);
            return [];
        }
    };

    const getAllOrganizations = async (): Promise<Organization[]> => {
        if (!user || user.role !== 'superadmin') return [];

        try {
            const snapshot = await getDocs(collection(db, 'organizations'));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
        } catch (error) {
            console.error("Failed to fetch all organizations:", error);
            return [];
        }
    };

    const updateUser = async (userId: string, updates: Partial<User>) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, updates);
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    const deleteUser = async (userId: string) => {
        try {
            // Again, deleting from Auth requires Admin SDK API route. Delete from Firestore only here.
            await deleteDoc(doc(db, 'users', userId));
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
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
            getOrganizationUsers,
            getGlobalUsers,
            getAllOrganizations
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
