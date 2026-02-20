'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './StudentInquiry.module.css';
import { usePedagogy, useSafety, useLocale } from '@/components/providers';
import { buildPedagogicalPrompt, needsAVReinforcement } from '@/lib/pedagogy/engine';
import { runInputRail } from '@/lib/safety/shield';
import { generateAVAid, type AVAidResult } from '@/lib/av-aids/engine';
import AVPlayer from '@/components/AVPlayer/AVPlayer';
import StudentBlackboardView from './StudentBlackboardView';
import { useLiveSession } from '@/lib/live/context';

interface Message {
    id: string;
    role: 'student' | 'lantiai' | 'system';
    content: string;
    avAid?: AVAidResult;
    safetyBlocked?: boolean;
    safetyRedirect?: string;
    timestamp: Date;
}

export default function StudentInquiry() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '0',
            role: 'lantiai',
            content: "Hello! I'm your Lantiai learning guide. I'm here to help you *discover* answers, not just give them to you. What are you curious about today?",
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { pedagogyContext } = usePedagogy();
    const { safetyConfig } = useSafety();
    const { locale } = useLocale();
    const { activeSessionId } = useLiveSession();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userQuery = input.trim();
        setInput('');

        // Add student message
        const studentMsg: Message = {
            id: Date.now().toString(),
            role: 'student',
            content: userQuery,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, studentMsg]);
        setIsLoading(true);

        // Step 1: Safety Shield - Input Rail
        const safetyResult = runInputRail(userQuery, safetyConfig);

        if (safetyResult.level === 'blocked') {
            const safetyMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'lantiai',
                content: safetyResult.redirectSuggestion || "Let's explore something safer and just as interesting!",
                safetyBlocked: true,
                safetyRedirect: safetyResult.redirectSuggestion,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, safetyMsg]);
            setIsLoading(false);
            return;
        }

        // Step 2: Build pedagogical prompt
        const pedagogicalResponse = buildPedagogicalPrompt(userQuery, pedagogyContext);

        // Step 3: Call AI API
        try {
            const response = await fetch('/api/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userQuery,
                    systemPrompt: pedagogicalResponse.systemPrompt,
                    guidelines: pedagogicalResponse.responseGuidelines,
                }),
            });

            const data = await response.json();
            const aiContent = data.response || "I'm thinking about how to best guide you on this...";

            // Step 4: Generate AV Aid if needed
            let avAid: AVAidResult | undefined;
            if (needsAVReinforcement(pedagogyContext.mode, pedagogyContext.subject)) {
                avAid = await generateAVAid({
                    concept: userQuery,
                    subject: pedagogyContext.subject,
                    gradeLevel: pedagogyContext.gradeLevel,
                    locale,
                    pedagogicalMode: pedagogyContext.mode,
                    avInstructions: pedagogicalResponse.avAidsInstructions,
                });
            }

            const lantiaiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'lantiai',
                content: aiContent,
                avAid,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, lantiaiMsg]);
        } catch {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'lantiai',
                content: "I'm having trouble connecting right now. Let's try again in a moment!",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        }

        setIsLoading(false);
    };

    const modeLabels: Record<string, { label: string; color: string; icon: string }> = {
        socratic: { label: 'Socratic Mode', color: '#6C63FF', icon: '❓' },
        constructivism: { label: 'Constructivist Mode', color: '#00D4AA', icon: '🏗️' },
        direct: { label: 'Direct Instruction', color: '#FFB347', icon: '📖' },
        inquiry: { label: 'Inquiry Mode', color: '#FF6B6B', icon: '🔬' },
        scaffolded: { label: 'Scaffolded Mode', color: '#A78BFA', icon: '🪜' },
        collaborative: { label: 'Collaborative Mode', color: '#34D399', icon: '🤝' },
    };

    const currentMode = modeLabels[pedagogyContext.mode];

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Student Inquiry</h2>
                    <p className={styles.subtitle}>
                        {pedagogyContext.subject} · {pedagogyContext.gradeLevel}
                    </p>
                </div>
                <div
                    className={styles.modeBadge}
                    style={{ borderColor: currentMode.color, color: currentMode.color }}
                >
                    <span>{currentMode.icon}</span>
                    <span>{currentMode.label}</span>
                </div>
            </div>

            {/* Live Blackboard */}
            {activeSessionId && (
                <div className={styles.blackboardContainer}>
                    <StudentBlackboardView />
                </div>
            )}

            {/* Messages */}
            <div className={styles.messages}>
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`${styles.message} ${msg.role === 'student' ? styles.messageStudent : styles.messageLantiai
                            } ${msg.safetyBlocked ? styles.messageSafety : ''}`}
                    >
                        {msg.role === 'lantiai' && (
                            <div className={styles.avatar}>
                                {msg.safetyBlocked ? '🛡️' : 'L'}
                            </div>
                        )}
                        <div className={styles.messageContent}>
                            {msg.safetyBlocked && (
                                <div className={styles.safetyAlert}>
                                    <span>🛡️ Safety Shield Active</span>
                                    <span className={styles.safetyAlertText}>
                                        This question was redirected to a safer learning path.
                                    </span>
                                </div>
                            )}
                            <p className={styles.messageText}>{msg.content}</p>
                            {msg.avAid && (
                                <div className={styles.avAidContainer}>
                                    <AVPlayer avAid={msg.avAid} />
                                </div>
                            )}
                        </div>
                        {msg.role === 'student' && (
                            <div className={`${styles.avatar} ${styles.avatarStudent}`}>
                                👤
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className={`${styles.message} ${styles.messageLantiai}`}>
                        <div className={styles.avatar}>L</div>
                        <div className={styles.messageContent}>
                            <div className={styles.thinkingIndicator}>
                                <div className={styles.thinkingDot}></div>
                                <div className={styles.thinkingDot}></div>
                                <div className={styles.thinkingDot}></div>
                                <span className={styles.thinkingText}>Lantiai is thinking pedagogically...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className={styles.inputForm} onSubmit={handleSubmit}>
                <div className={styles.inputWrapper}>
                    <input
                        id="student-inquiry-input"
                        className={styles.input}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={`Ask anything about ${pedagogyContext.subject}...`}
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className={styles.sendBtn}
                        disabled={!input.trim() || isLoading}
                    >
                        <span>→</span>
                    </button>
                </div>
                <p className={styles.inputHint}>
                    Lantiai guides your thinking, not just gives answers · Safety Shield is active
                </p>
            </form>
        </div>
    );
}
