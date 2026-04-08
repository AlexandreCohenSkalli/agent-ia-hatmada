'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur de connexion');
        return;
      }

      // Store token in localStorage AND cookie (for middleware)
      localStorage.setItem('authToken', data.token);
      document.cookie = `authToken=${data.token}; path=/; max-age=2592000`;
      // Redirect to admin users page if admin, otherwise dashboard
      if (data.user && data.user.role === 'admin') {
        window.location.href = '/dashboard/admin/users';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '0.5rem',
    border: '1.5px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    color: '#1e293b',
    background: '#f8fafc',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '0.5rem',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0a0f2e 0%, #0d1f5c 35%, #0a2a4a 65%, #071228 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      {/* Logo fond */}
      <div style={{ position: 'fixed', inset: 0, opacity: 0.08, pointerEvents: 'none', zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/logo.png" alt="HATMADA" style={{ width: '90vw', height: '90vh', objectFit: 'contain' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, background: 'white', borderRadius: '1.25rem', padding: '2.5rem', width: '100%', maxWidth: '440px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
        {/* Logo top */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src="/logo.png" alt="HATMADA" style={{ height: '60px', objectFit: 'contain' }} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', textAlign: 'center', marginBottom: '2rem' }}>Connexion Admin</h1>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <AlertCircle color="#dc2626" size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={labelStyle}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '1rem', background: loading ? '#93c5fd' : 'linear-gradient(to right, #2563eb, #06b6d4)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1.0625rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1.75rem', paddingTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
          Developped by Gavroch.Dev
        </div>
      </div>
    </div>
  );
}
