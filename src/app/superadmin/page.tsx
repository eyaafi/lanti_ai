import SuperAdminDashboard from '@/components/SuperAdminDashboard/SuperAdminDashboard';
import { AuthProvider } from '@/lib/auth/context';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Super Admin | LantiAI',
    description: 'Ecosystem-wide management and approval dashboard for LantiAI.',
};

export default function SuperAdminPage() {
    return (
        <AuthProvider>
            <main style={{ minHeight: '100vh', background: 'var(--bg-default)', paddingTop: '80px' }}>
                <SuperAdminDashboard />
            </main>
        </AuthProvider>
    );
}
