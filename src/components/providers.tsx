/**
 * LANTIAI - React Context Providers
 * Provides global state for Pedagogical Mode, Safety Config, and Locale
 */

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { PedagogicalMode, PedagogicalContext } from '@/lib/pedagogy/engine';
import type { InputRailConfig } from '@/lib/safety/shield';

// ---- Pedagogical Context ----
interface PedagogyContextType {
    pedagogyContext: PedagogicalContext;
    setPedagogyMode: (mode: PedagogicalMode) => void;
    setGradeLevel: (level: PedagogicalContext['gradeLevel']) => void;
    setSubject: (subject: string) => void;
}

const PedagogyContext = createContext<PedagogyContextType | null>(null);

// ---- Safety Context ----
interface SafetyContextType {
    safetyConfig: InputRailConfig;
    setSafetyConfig: (config: Partial<InputRailConfig>) => void;
}

const SafetyContext = createContext<SafetyContextType | null>(null);

// ---- Locale Context ----
interface LocaleContextType {
    locale: string;
    setLocale: (locale: string) => void;
    direction: 'ltr' | 'rtl';
}

const LocaleContext = createContext<LocaleContextType | null>(null);

import { AuthProvider } from '@/lib/auth/context';
import { LessonProvider } from '@/lib/lessons/context';
import { LiveSessionProvider } from '@/lib/live/context';

// ---- Combined Provider ----
export function LantiaiProviders({ children }: { children: ReactNode }) {
    const [pedagogyContext, setPedagogyContext] = useState<PedagogicalContext>({
        mode: 'socratic',
        gradeLevel: '6',
        subject: 'General',
    });

    const [safetyConfig, setSafetyConfigState] = useState<InputRailConfig>({
        gradeLevel: '6',
        strictMode: false,
    });

    const [locale, setLocaleState] = useState('en-US');

    const setPedagogyMode = (mode: PedagogicalMode) => {
        setPedagogyContext(prev => ({ ...prev, mode }));
    };

    const setGradeLevel = (level: PedagogicalContext['gradeLevel']) => {
        setPedagogyContext(prev => ({ ...prev, gradeLevel: level }));
        setSafetyConfigState(prev => ({
            ...prev,
            gradeLevel: level,
            strictMode: ['K', '1', '2', '3', '4', '5'].includes(level),
        }));
    };

    const setSubject = (subject: string) => {
        setPedagogyContext(prev => ({ ...prev, subject }));
        setSafetyConfigState(prev => ({ ...prev, subject }));
    };

    const setSafetyConfig = (config: Partial<InputRailConfig>) => {
        setSafetyConfigState(prev => ({ ...prev, ...config }));
    };

    const setLocale = (newLocale: string) => {
        setLocaleState(newLocale);
        // Update document direction for RTL support
        const rtlLocales = ['ar-SA', 'he-IL', 'fa-IR'];
        document.documentElement.dir = rtlLocales.includes(newLocale) ? 'rtl' : 'ltr';
        document.documentElement.lang = newLocale.split('-')[0];
    };

    const direction = ['ar-SA', 'he-IL', 'fa-IR'].includes(locale) ? 'rtl' : 'ltr';

    return (
        <AuthProvider>
            <PedagogyContext.Provider value={{ pedagogyContext, setPedagogyMode, setGradeLevel, setSubject }}>
                <SafetyContext.Provider value={{ safetyConfig, setSafetyConfig }}>
                    <LocaleContext.Provider value={{ locale, setLocale, direction }}>
                        <LessonProvider>
                            <LiveSessionProvider>
                                {children}
                            </LiveSessionProvider>
                        </LessonProvider>
                    </LocaleContext.Provider>
                </SafetyContext.Provider>
            </PedagogyContext.Provider>
        </AuthProvider>
    );
}

// ---- Custom Hooks ----
export function usePedagogy() {
    const ctx = useContext(PedagogyContext);
    if (!ctx) throw new Error('usePedagogy must be used within LantiaiProviders');
    return ctx;
}

export function useSafety() {
    const ctx = useContext(SafetyContext);
    if (!ctx) throw new Error('useSafety must be used within LantiaiProviders');
    return ctx;
}

export function useLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used within LantiaiProviders');
    return ctx;
}
