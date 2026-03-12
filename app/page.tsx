'use client';

import { useRouter } from 'next/navigation';
import { Zap, BarChart3, Users, Mail } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleDemoAccess = () => {
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('authToken', 'demo-token');
    document.cookie = 'demoMode=true; path=/; max-age=86400';
    document.cookie = 'authToken=demo-token; path=/; max-age=86400';
    window.location.href = '/dashboard';
  };

  const handleAdminLogin = () => {
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0a0f2e 0%, #0d1f5c 35%, #0a2a4a 65%, #071228 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Logo Background */}
      <div style={{ position: 'fixed', inset: 0, opacity: 0.12, pointerEvents: 'none', zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/logo.png" alt="HATMADA" style={{ width: '90vw', height: '90vh', objectFit: 'contain' }} />
      </div>

      {/* Glow effects */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        {/* Login Card */}
        <section style={{ width: '100%', maxWidth: '480px', marginBottom: '3rem' }}>
          <div className="login-card" style={{ width: '100%' }}>
            <h2>Connexion</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <button onClick={handleAdminLogin} className="btn-primary">Admin Login</button>
              <button onClick={handleDemoAccess} className="btn-secondary">Mode Démo</button>
            </div>
            <p>Aucun email ne sera envoyé</p>
          </div>
        </section>

        {/* Features grid */}
        <section style={{ width: '100%', maxWidth: '700px' }}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 160px)', gap: '1.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <div className="feature-card-small">
                <div className="feature-icon icon-blue"><Zap size={28} /></div>
                <h3>IA Générative</h3>
                <p>Claude génère des emails</p>
              </div>
              <div className="feature-card-small">
                <div className="feature-icon icon-green"><BarChart3 size={28} /></div>
                <h3>Suivi Complet</h3>
                <p>Analytics en temps réel</p>
              </div>
              <div className="feature-card-small">
                <div className="feature-icon icon-purple"><Users size={28} /></div>
                <h3>Gestion Client</h3>
                <p>Admin gère les accès</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 160px)', gap: '1.5rem', justifyContent: 'center' }}>
              <div className="feature-card-small">
                <div className="feature-icon icon-blue"><Mail size={28} /></div>
                <h3>HATMADA</h3>
                <p>Prospection B2B</p>
              </div>
              <div className="feature-card-small">
                <div className="feature-icon icon-purple"><Users size={28} /></div>
                <h3>Coaching HATMADA</h3>
                <p>Formation commerciale</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 2rem', background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>© 2026 HATMADA — Tous droits réservés</p>
      </footer>
    </div>
  );
}

