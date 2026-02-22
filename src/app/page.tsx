'use client';

import { LantiaiProviders } from '@/components/providers';
import Dashboard from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage/LandingPage';
import { useAuth } from '@/lib/auth/context';

function MainContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050508',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: 600
      }}>
        <div className="pulse" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>🧠</span>
          <span>Lantiai is coming to life...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <div className="fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Dashboard />
    </div>
  ) : (
    <LandingPage />
  );
}

export default function Home() {
  return (
    <LantiaiProviders>
      <MainContent />
    </LantiaiProviders>
  );
}
