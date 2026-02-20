'use client';

import { useState } from 'react';
import styles from './AVPlayer.module.css';
import type { AVAidResult } from '@/lib/av-aids/engine';

interface AVPlayerProps {
    avAid: AVAidResult;
}

export default function AVPlayer({ avAid }: AVPlayerProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showNarration, setShowNarration] = useState(false);

    const steps = avAid.animationSteps || [];

    const handlePlay = () => {
        if (steps.length === 0) return;
        setIsPlaying(true);
        setActiveStep(0);

        // Auto-advance through steps
        steps.forEach((step, index) => {
            const delay = steps.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
            setTimeout(() => {
                setActiveStep(index);
                if (index === steps.length - 1) {
                    setTimeout(() => setIsPlaying(false), step.duration);
                }
            }, delay);
        });
    };

    const typeIcons: Record<string, string> = {
        video: '🎬',
        animation: '✨',
        audio: '🎵',
        illustration: '🖼️',
        diagram: '📊',
    };

    return (
        <div className={styles.player}>
            <div className={styles.playerHeader}>
                <div className={styles.playerType}>
                    <span>{typeIcons[avAid.type]}</span>
                    <span className={styles.playerTypeLabel}>
                        {avAid.type.charAt(0).toUpperCase() + avAid.type.slice(1)} Aid
                    </span>
                </div>
                <div className={styles.playerTitle}>{avAid.title}</div>
            </div>

            {/* Animation/Diagram Steps */}
            {steps.length > 0 && (
                <div className={styles.stepsContainer}>
                    {/* Step visualization */}
                    <div className={styles.stepDisplay}>
                        <div className={styles.stepContent}>
                            <div className={styles.stepNumber}>
                                Step {steps[activeStep]?.id || 1} of {steps.length}
                            </div>
                            <div className={styles.stepLabel}>
                                {steps[activeStep]?.label || 'Introduction'}
                            </div>
                            <div className={styles.stepDescription}>
                                {steps[activeStep]?.description || avAid.description}
                            </div>
                        </div>

                        {/* Visual placeholder (in production: rendered SVG/Canvas) */}
                        <div className={styles.visualArea}>
                            <div className={styles.visualPlaceholder}>
                                <span className={styles.visualIcon}>
                                    {activeStep === 0 ? '🌱' :
                                        activeStep === steps.length - 1 ? '✅' : '⚡'}
                                </span>
                                <div className={styles.visualLabel}>
                                    {steps[activeStep]?.label}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step progress dots */}
                    <div className={styles.stepDots}>
                        {steps.map((step, i) => (
                            <button
                                key={step.id}
                                className={`${styles.stepDot} ${i === activeStep ? styles.stepDotActive : ''} ${i < activeStep ? styles.stepDotDone : ''}`}
                                onClick={() => { setActiveStep(i); setIsPlaying(false); }}
                                title={step.label}
                            />
                        ))}
                    </div>

                    {/* Controls */}
                    <div className={styles.controls}>
                        <button
                            className={styles.controlBtn}
                            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                            disabled={activeStep === 0 || isPlaying}
                        >
                            ◀
                        </button>
                        <button
                            className={`${styles.playBtn} ${isPlaying ? styles.playBtnActive : ''}`}
                            onClick={handlePlay}
                            disabled={isPlaying}
                        >
                            {isPlaying ? '⏸ Playing...' : '▶ Play Animation'}
                        </button>
                        <button
                            className={styles.controlBtn}
                            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                            disabled={activeStep === steps.length - 1 || isPlaying}
                        >
                            ▶
                        </button>
                    </div>
                </div>
            )}

            {/* Illustration / Video placeholder */}
            {steps.length === 0 && (
                <div className={styles.mediaPlaceholder}>
                    <span className={styles.mediaIcon}>{typeIcons[avAid.type]}</span>
                    <p className={styles.mediaDescription}>{avAid.description}</p>
                    <div className={styles.mediaActions}>
                        <button className={`btn btn-primary ${styles.generateBtn}`}>
                            Generate {avAid.type}
                        </button>
                    </div>
                </div>
            )}

            {/* Narration Toggle */}
            <div className={styles.narrationSection}>
                <button
                    className={styles.narrationToggle}
                    onClick={() => setShowNarration(!showNarration)}
                >
                    <span>🎙️</span>
                    <span>Narration Script</span>
                    <span className={styles.toggleChevron}>{showNarration ? '▲' : '▼'}</span>
                </button>
                {showNarration && (
                    <div className={styles.narrationContent}>
                        <pre className={styles.narrationText}>{avAid.narrationScript}</pre>
                    </div>
                )}
            </div>

            {/* Cultural Context */}
            <div className={styles.culturalBadge}>
                <span>🌍</span>
                <span className={styles.culturalText}>
                    {avAid.culturalContext.split('\n')[0]}
                </span>
            </div>
        </div>
    );
}
