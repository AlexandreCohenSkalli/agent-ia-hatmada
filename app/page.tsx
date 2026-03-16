'use client';

import { useRouter } from 'next/navigation';
import { Zap, BarChart3, Users, Mail, LogIn } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleUserLogin = () => {
    router.push('/login-user');
  };

  const handleAdminLogin = () => {
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0a0f2e 0%, #0d1f5c 35%, #0a2a4a 65%, #071228 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Logo Background */}
      <div style={{ position: 'fixed', inset: 0, opacity: 0.08, pointerEvents: 'none', zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/logo.png" alt="HATMADA" style={{ width: '90vw', height: '90vh', objectFit: 'contain' }} />
      </div>

      {/* Glow effects */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1.5rem 1rem', minHeight: '85vh', width: '100%' }}>
        {/* Main Login Section - Centered */}
        <section style={{ width: '100%', maxWidth: '600px', marginBottom: '1.5rem', textAlign: 'center', margin: '0 auto 1.5rem' }}>
          {/* Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '300', letterSpacing: '-1px', color: 'white', marginBottom: '0.75rem', textTransform: 'uppercase', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>HATMADA</h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)' }}>Plateforme d'IA pour la prospection automatisée</p>
          </div>

          {/* Primary Button - User Login */}
          <button 
            onClick={handleUserLogin}
            style={{
              width: '100%',
              padding: '0.9375rem 1.5rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.875rem',
              fontSize: '1.0625rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 30px rgba(37,99,235,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(37,99,235,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(37,99,235,0.3)';
            }}
          >
            <LogIn size={20} />
            Se Connecter
          </button>

          {/* Admin Link */}
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Administrateur ?{' '}
            <button 
              onClick={handleAdminLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                cursor: 'pointer',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                padding: '0',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#93c5fd'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
            >
              Connexion Admin
            </button>
          </p>
        </section>

        {/* Features grid */}
        <section style={{ width: '100%', maxWidth: '950px', margin: '0 auto', paddingBottom: '0' }}>
          {/* Top 3 features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.875rem 0.75rem', textAlign: 'center', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.375rem' }}><Zap size={20} style={{ color: '#60a5fa' }} /></div>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'white', marginBottom: '0.125rem' }}>IA Générative</h3>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Claude génère des emails</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.875rem 0.75rem', textAlign: 'center', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.375rem' }}><BarChart3 size={20} style={{ color: '#34d399' }} /></div>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'white', marginBottom: '0.125rem' }}>Suivi Complet</h3>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Analytics en temps réel</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.875rem 0.75rem', textAlign: 'center', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.375rem' }}><Users size={20} style={{ color: '#a78bfa' }} /></div>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'white', marginBottom: '0.125rem' }}>Gestion Client</h3>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Admin gère les accès</p>
            </div>
          </div>
          {/* Bottom 2 features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', justifyContent: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.875rem 0.75rem', textAlign: 'center', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.375rem' }}><Mail size={20} style={{ color: '#60a5fa' }} /></div>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'white', marginBottom: '0.125rem' }}>HATMADA</h3>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Prospection B2B</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.875rem 0.75rem', textAlign: 'center', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.375rem' }}><Users size={20} style={{ color: '#a78bfa' }} /></div>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'white', marginBottom: '0.125rem' }}>Coaching</h3>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Formation commerciale</p>
            </div>
          </div>
        </section>
      </div>

      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1rem 2rem', background: 'rgba(0,0,0,0.3)', textAlign: 'center', marginTop: '0', width: '100%' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>© 2026 HATMADA — Tous droits réservés</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Developped by Gavroch.Dev</p>
      </footer>
    </div>
  );
}

