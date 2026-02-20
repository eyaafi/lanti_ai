'use client';

import { useState } from 'react';
import styles from './CreationSandbox.module.css';
import { useLocale } from '@/components/providers';

type CreationTool = 'movie' | 'comic' | 'audio' | 'poster';

interface CreationProject {
    id: string;
    title: string;
    type: CreationTool;
    description: string;
    thumbnail: string;
    status: 'draft' | 'complete';
}

const SAMPLE_PROJECTS: CreationProject[] = [
    { id: '1', title: 'The Roman Empire', type: 'movie', description: 'A student film about Julius Caesar', thumbnail: '🏛️', status: 'draft' },
    { id: '2', title: 'Water Cycle Adventure', type: 'comic', description: 'Comic strip following a water droplet', thumbnail: '💧', status: 'complete' },
    { id: '3', title: 'My Science Podcast', type: 'audio', description: 'Episode 1: Why is the sky blue?', thumbnail: '🎙️', status: 'draft' },
];

// Semantic safety rules for the creation sandbox
const BLOCKED_COMBINATIONS = [
    { elements: ['celebrity', 'face'], reason: 'Creating realistic depictions of real people is not allowed.' },
    { elements: ['classmate', 'deepfake'], reason: 'Manipulating images of real people is not allowed.' },
    { elements: ['weapon', 'instructions'], reason: 'Content involving weapon instructions is not allowed.' },
    { elements: ['violence', 'realistic'], reason: 'Realistic violent content is not allowed.' },
];

function checkSemanticSafety(description: string): { safe: boolean; reason?: string } {
    const lowerDesc = description.toLowerCase();
    for (const rule of BLOCKED_COMBINATIONS) {
        if (rule.elements.every(el => lowerDesc.includes(el))) {
            return { safe: false, reason: rule.reason };
        }
    }
    return { safe: true };
}

export default function CreationSandbox() {
    const [activeTool, setActiveTool] = useState<CreationTool>('movie');
    const [projects] = useState<CreationProject[]>(SAMPLE_PROJECTS);
    const [newProject, setNewProject] = useState({ title: '', description: '' });
    const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const { locale } = useLocale();

    const tools: { id: CreationTool; label: string; icon: string; description: string; color: string }[] = [
        { id: 'movie', label: 'Movie Maker', icon: '🎬', description: 'Create short educational films', color: '#6C63FF' },
        { id: 'comic', label: 'Comic Studio', icon: '💬', description: 'Draw comic strips & stories', color: '#00D4AA' },
        { id: 'audio', label: 'Audio Lab', icon: '🎙️', description: 'Record podcasts & narrations', color: '#FFB347' },
        { id: 'poster', label: 'Poster Designer', icon: '🖼️', description: 'Design infographics & posters', color: '#FF6B6B' },
    ];

    const handleDescriptionChange = (value: string) => {
        setNewProject(prev => ({ ...prev, description: value }));
        const safety = checkSemanticSafety(value);
        setSafetyWarning(safety.safe ? null : safety.reason || 'This content is not allowed.');
    };

    const handleCreate = async () => {
        if (!newProject.title || !newProject.description || safetyWarning) return;
        setIsCreating(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsCreating(false);
        setNewProject({ title: '', description: '' });
    };

    const activeTool_ = tools.find(t => t.id === activeTool)!;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Creation Sandbox</h2>
                    <p className={styles.subtitle}>Safe creative tools · Semantic safety active · {locale}</p>
                </div>
                <div className={styles.safetyIndicator}>
                    <span className={styles.safetyDot}></span>
                    <span>Safe Semantics Engine Active</span>
                </div>
            </div>

            <div className={styles.layout}>
                {/* Tool Selector */}
                <div className={styles.toolSelector}>
                    <div className={styles.toolSelectorTitle}>🎨 Creation Tools</div>
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            className={`${styles.toolBtn} ${activeTool === tool.id ? styles.toolBtnActive : ''}`}
                            onClick={() => setActiveTool(tool.id)}
                            style={activeTool === tool.id ? { borderColor: tool.color } : {}}
                        >
                            <span className={styles.toolIcon}>{tool.icon}</span>
                            <div>
                                <div className={styles.toolLabel}>{tool.label}</div>
                                <div className={styles.toolDesc}>{tool.description}</div>
                            </div>
                        </button>
                    ))}

                    {/* Safety Rules Summary */}
                    <div className={styles.safetyRules}>
                        <div className={styles.safetyRulesTitle}>🛡️ Creative Safety Rules</div>
                        <ul className={styles.safetyRulesList}>
                            <li>No realistic depictions of real people</li>
                            <li>No deepfakes or face manipulation</li>
                            <li>No violent or harmful content</li>
                            <li>No weapon instructions</li>
                            <li>Cultural sensitivity required</li>
                        </ul>
                    </div>
                </div>

                {/* Main Canvas */}
                <div className={styles.canvas}>
                    {/* New Project Form */}
                    <div className={`glass-card ${styles.newProjectCard}`}>
                        <div className={styles.newProjectHeader}>
                            <span style={{ color: activeTool_.color }}>{activeTool_.icon}</span>
                            <h3 className={styles.newProjectTitle}>New {activeTool_.label} Project</h3>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Project Title</label>
                            <input
                                className={styles.formInput}
                                type="text"
                                placeholder={`e.g., My ${activeTool_.label} about...`}
                                value={newProject.title}
                                onChange={e => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Describe your project</label>
                            <textarea
                                className={`${styles.formTextarea} ${safetyWarning ? styles.formTextareaBlocked : ''}`}
                                placeholder="What is your project about? Who are the characters? What happens?"
                                value={newProject.description}
                                onChange={e => handleDescriptionChange(e.target.value)}
                                rows={4}
                            />
                            {safetyWarning && (
                                <div className={styles.safetyWarning}>
                                    <span>🛡️</span>
                                    <span>{safetyWarning}</span>
                                </div>
                            )}
                            {!safetyWarning && newProject.description && (
                                <div className={styles.safetyOk}>
                                    <span>✅</span>
                                    <span>Content looks safe and creative!</span>
                                </div>
                            )}
                        </div>

                        {/* Tool-specific options */}
                        <div className={styles.toolOptions}>
                            {activeTool === 'movie' && (
                                <div className={styles.optionGrid}>
                                    <div className={styles.option}>
                                        <span>🎭</span>
                                        <span>Character Style</span>
                                        <select className={styles.optionSelect}>
                                            <option>Animated</option>
                                            <option>Cartoon</option>
                                            <option>Illustrated</option>
                                        </select>
                                    </div>
                                    <div className={styles.option}>
                                        <span>⏱️</span>
                                        <span>Duration</span>
                                        <select className={styles.optionSelect}>
                                            <option>30 seconds</option>
                                            <option>1 minute</option>
                                            <option>2 minutes</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            {activeTool === 'comic' && (
                                <div className={styles.optionGrid}>
                                    <div className={styles.option}>
                                        <span>📐</span>
                                        <span>Layout</span>
                                        <select className={styles.optionSelect}>
                                            <option>3 panels</option>
                                            <option>6 panels</option>
                                            <option>9 panels</option>
                                        </select>
                                    </div>
                                    <div className={styles.option}>
                                        <span>🎨</span>
                                        <span>Art Style</span>
                                        <select className={styles.optionSelect}>
                                            <option>Manga</option>
                                            <option>Western Comic</option>
                                            <option>Watercolor</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            {activeTool === 'audio' && (
                                <div className={styles.optionGrid}>
                                    <div className={styles.option}>
                                        <span>🎵</span>
                                        <span>Background Music</span>
                                        <select className={styles.optionSelect}>
                                            <option>None</option>
                                            <option>Calm</option>
                                            <option>Upbeat</option>
                                            <option>Dramatic</option>
                                        </select>
                                    </div>
                                    <div className={styles.option}>
                                        <span>🗣️</span>
                                        <span>Voice Style</span>
                                        <select className={styles.optionSelect}>
                                            <option>Natural</option>
                                            <option>Storyteller</option>
                                            <option>News Anchor</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleCreate}
                            disabled={!newProject.title || !newProject.description || !!safetyWarning || isCreating}
                            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                        >
                            {isCreating ? '⏳ Creating...' : `✨ Create ${activeTool_.label}`}
                        </button>
                    </div>

                    {/* Existing Projects */}
                    <div className={styles.projectsSection}>
                        <h3 className={styles.projectsSectionTitle}>My Projects</h3>
                        <div className={styles.projectsGrid}>
                            {projects.map(project => (
                                <div key={project.id} className={`glass-card ${styles.projectCard}`}>
                                    <div className={styles.projectThumbnail}>{project.thumbnail}</div>
                                    <div className={styles.projectInfo}>
                                        <div className={styles.projectTitle}>{project.title}</div>
                                        <div className={styles.projectDesc}>{project.description}</div>
                                        <div className={styles.projectMeta}>
                                            <span className={`badge ${project.status === 'complete' ? 'badge-green' : 'badge-primary'}`}>
                                                {project.status}
                                            </span>
                                            <span className={styles.projectType}>
                                                {tools.find(t => t.id === project.type)?.icon} {tools.find(t => t.id === project.type)?.label}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 12px', flexShrink: 0 }}>
                                        Open
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
