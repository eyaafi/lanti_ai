'use client';

import { useAuth } from '@/lib/auth/context';
import styles from './DiscordCommunity.module.css';

export default function DiscordCommunity() {
    const { user } = useAuth();

    // Using a default LantiAI placeholder Guild ID and Channel ID for WidgetBot. 
    // In a real scenario, these would be the user's specific server IDs.
    // Server ID: 1234567890 (example)
    // Channel ID: 0987654321 (example)

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>🌐 LantiAI Community</h2>
                    <p className={styles.subtitle}>
                        Join the live conversation on Discord. Connect with peers, ask questions, and collaborate in real-time!
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <a
                        href="https://discord.gg/lantiai-example"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.joinBtn}
                    >
                        <span className={styles.discordIcon}>🎮</span> Join Server
                    </a>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.widgetWrapper}>
                    {/* WidgetBot Embed for Discord Chat */}
                    <iframe
                        src="https://e.widgetbot.io/channels/299881420891881473/299881420891881473"
                        title="Discord Community Chat"
                        className={styles.discordIframe}
                        allowFullScreen
                    ></iframe>
                </div>

                <div className={styles.infoSidebar}>
                    <div className={styles.infoCard}>
                        <h3>Welcome, {user?.name || 'Educator'}! 👋</h3>
                        <p>This is the official LantiAI community space.</p>

                        <div className={styles.ruleSection}>
                            <h4>House Rules</h4>
                            <ul className={styles.ruleList}>
                                <li>✨ Be respectful and supportive.</li>
                                <li>📚 No sharing of direct answers (Pedagogy over Prompting).</li>
                                <li>🛡️ Keep it safe and appropriate for all ages.</li>
                            </ul>
                        </div>

                        <div className={styles.roleInfo}>
                            <h4>Your Role</h4>
                            <div className={styles.roleBadge}>
                                {user?.role === 'teacher' ? '👨‍🏫 Teacher' :
                                    user?.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}
                            </div>
                            <p className={styles.roleDesc}>
                                Your role determines which channels you have access to in the Discord server.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
