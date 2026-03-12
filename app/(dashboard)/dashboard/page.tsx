'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Mail, CheckCircle, Eye } from 'lucide-react';

const STATS_KEY = 'hatmada_stats';

export default function DashboardPage() {
  const [sent, setSent] = useState(0);
  const [replied, setReplied] = useState(0);
  const [opened, setOpened] = useState(0);

  useEffect(() => {
    const load = () => {
      try {
        const s = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        setSent(s.sent || 0);
        setReplied(s.replied || 0);
      } catch {}
      // Fetch open count from tracking API
      try {
        const p = JSON.parse(localStorage.getItem('hatmada_sent_prospection') || '[]');
        const c = JSON.parse(localStorage.getItem('hatmada_sent_coaching') || '[]');
        const ids = [...p, ...c].map((e: any) => e.id).filter(Boolean);
        if (ids.length > 0) {
          fetch(`/api/emails/track/status?ids=${ids.join(',')}`)
            .then(r => r.json())
            .then(data => {
              const count = Object.values(data.status || {}).filter(Boolean).length;
              setOpened(count);
            })
            .catch(() => {});
        }
      } catch {}
    };
    load();
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);

  const stats = [
    { title: 'Emails Envoyés', value: String(sent), color: '#2563eb', bg: '#dbeafe' },
    { title: 'Campagnes Actives', value: sent > 0 ? '1' : '0', color: '#16a34a', bg: '#dcfce7' },
    { title: 'Réponses Reçues', value: String(replied), color: '#9333ea', bg: '#f3e8ff' },
    { title: 'Emails Ouverts', value: String(opened), color: '#d97706', bg: '#fef3c7' },
  ];
  const icons = [<Mail size={24}/>, <BarChart3 size={24}/>, <CheckCircle size={24}/>, <Eye size={24}/>];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Tableau de Bord</h1>
        <button
          onClick={() => {
            if (!confirm('Réinitialiser toutes les statistiques ?')) return;
            localStorage.removeItem(STATS_KEY);
            setSent(0);
            setReplied(0);
            setOpened(0);
          }}
          style={{ padding: '0.5rem 1rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
        >
          Réinitialiser les stats
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: '0.875rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>{stat.title}</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{stat.value}</p>
            </div>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              {icons[idx]}
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Card */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)', border: '1px solid #bfdbfe', borderRadius: '0.875rem', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '1rem' }}>Bienvenue sur ProspectAI 👋</h2>
        <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
          Commencez par créer une nouvelle campagne de prospection ou de coaching.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/prospection" style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(to right, #2563eb, #06b6d4)', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem' }}>
            Prospection HATMADA
          </a>
          <a href="/coaching" style={{ padding: '0.75rem 1.5rem', background: 'white', color: '#2563eb', border: '1.5px solid #2563eb', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem' }}>
            Coaching HATMADA
          </a>
        </div>
      </div>
    </div>
  );
}
