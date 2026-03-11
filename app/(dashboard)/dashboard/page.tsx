'use client';

import { BarChart3, Mail, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { title: 'Emails Envoyés', value: '0', color: '#2563eb', bg: '#dbeafe' },
    { title: 'Campagnes Actives', value: '0', color: '#16a34a', bg: '#dcfce7' },
    { title: 'Réponses Reçues', value: '0', color: '#9333ea', bg: '#f3e8ff' },
    { title: 'En Attente', value: '0', color: '#ea580c', bg: '#ffedd5' },
  ];
  const icons = [<Mail size={24}/>, <BarChart3 size={24}/>, <CheckCircle size={24}/>, <Clock size={24}/>];

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '2rem' }}>Tableau de Bord</h1>

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
            Prospection Coaching
          </a>
        </div>
      </div>
    </div>
  );
}
