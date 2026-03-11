'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Mail, Users, BarChart3 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth token
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Mock user from token (in production, decode JWT)
    setUser({
      id: '1',
      name: 'User Name',
      email: 'user@example.com',
    });
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9', fontSize: '1.125rem', color: '#64748b' }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', background: 'linear-gradient(180deg, #1d4ed8 0%, #1e40af 100%)', color: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="HATMADA" style={{ height: '36px', objectFit: 'contain', filter: 'brightness(10)' }} />
          <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>ProspectAI</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '0.9375rem', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <BarChart3 size={20} />
            Aperçu
          </Link>
          <Link href="/prospection" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '0.9375rem' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Mail size={20} />
            Prospection HATMADA
          </Link>
          <Link href="/coaching" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '0.9375rem' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Users size={20} />
            Prospection Coaching
          </Link>
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem', marginTop: '1rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.5rem 0.875rem', borderRadius: '0.5rem', color: '#fca5a5', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
