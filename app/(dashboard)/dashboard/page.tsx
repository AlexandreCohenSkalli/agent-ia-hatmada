'use client';

import { useState, useEffect, useRef } from 'react';
import { BarChart3, Mail, CheckCircle, Eye } from 'lucide-react';

const STATS_KEY = 'hatmada_stats';
const SENT_P_KEY = 'hatmada_sent_prospection';
const SENT_C_KEY = 'hatmada_sent_coaching';

export default function DashboardPage() {
  const [sent, setSent] = useState(0);
  const [replied, setReplied] = useState(0);
  const [opened, setOpened] = useState(0);
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'live' | 'polling' | 'off'>('off');
  const sseRef = useRef<EventSource | null>(null);

  const getSentIds = (): string[] => {
    try {
      const p = JSON.parse(localStorage.getItem(SENT_P_KEY) || '[]');
      const c = JSON.parse(localStorage.getItem(SENT_C_KEY) || '[]');
      return [...p, ...c].map((e: any) => e.id).filter(Boolean);
    } catch { return []; }
  };

  const load = () => {
    // Compute all counts directly from the actual lists (single source of truth)
    try {
      const p: any[] = JSON.parse(localStorage.getItem(SENT_P_KEY) || '[]');
      const c: any[] = JSON.parse(localStorage.getItem(SENT_C_KEY) || '[]');
      const all = [...p, ...c];
      const sentCount = all.length;
      const repliedCount = all.filter(e => e.status === 'replied').length;
      setSent(sentCount);
      setReplied(repliedCount);
      // Keep stats key in sync
      const s = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
      localStorage.setItem(STATS_KEY, JSON.stringify({ ...s, sent: sentCount, replied: repliedCount }));
      // Fetch open count
      const ids = all.map(e => e.id).filter(Boolean);
      if (ids.length > 0) {
        fetch(`/api/emails/track/status?ids=${ids.join(',')}`)
          .then(r => r.json())
          .then(data => {
            const count = Object.values(data.status || {}).filter(Boolean).length;
            setOpened(count);
          })
          .catch(() => {});
      } else {
        setOpened(0);
      }
    } catch {}
  };

  /** Called when a new reply is detected (SSE or polling). Syncs localStorage + state. */
  const applyReply = (emailId: string) => {
    let changed = false;
    [SENT_P_KEY, SENT_C_KEY].forEach(key => {
      try {
        const list: any[] = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = list.findIndex((e: any) => e.id === emailId);
        if (idx !== -1 && list[idx].status !== 'replied') {
          list[idx].status = 'replied';
          localStorage.setItem(key, JSON.stringify(list));
          changed = true;
        }
      } catch {}
    });
    // Recount from source of truth instead of incrementing
    if (changed) load();
  };

  /** Poll /api/emails/check-replies every 30 s to detect IMAP-based replies */
  const pollReplies = () => {
    try {
      const p: any[] = JSON.parse(localStorage.getItem(SENT_P_KEY) || '[]');
      const c: any[] = JSON.parse(localStorage.getItem(SENT_C_KEY) || '[]');
      const emailsToCheck = [...p, ...c].filter(e => e.id).map(e => ({ id: e.id, subject: e.emailSubject, prospectEmail: e.prospectEmail, sentAtIso: e.sentAtIso }));
      if (emailsToCheck.length === 0) return;
      fetch('/api/emails/check-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailsToCheck }),
      })
        .then(r => r.json())
        .then(data => {
          const replyStatus: Record<string, any> = data.replyStatus || {};
          emailsToCheck.forEach(e => { if (replyStatus[e.id]) applyReply(e.id); });
          load();
        })
        .catch(() => {});
    } catch {}
  };

  useEffect(() => {
    load();
    window.addEventListener('focus', load);

    // --- Server-Sent Events for real-time push ---
    setLiveStatus('connecting');
    const es = new EventSource('/api/emails/replies-stream');
    sseRef.current = es;

    es.onopen = () => setLiveStatus('live');
    es.onerror = () => setLiveStatus('polling');
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'reply' && data.emailId) {
          applyReply(data.emailId);
        } else if (data.type === 'snapshot') {
          const ids = getSentIds();
          ids.forEach(id => { if (data.replies?.[id]) applyReply(id); });
          load();
        }
      } catch {}
    };

    // --- Polling fallback every 30 s ---
    pollReplies();
    const pollInterval = setInterval(pollReplies, 30_000);

    return () => {
      window.removeEventListener('focus', load);
      es.close();
      clearInterval(pollInterval);
      setLiveStatus('off');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { title: 'Emails Envoyés', value: String(sent), color: '#2563eb', bg: '#dbeafe' },
    { title: 'Campagnes Actives', value: sent > 0 ? '1' : '0', color: '#16a34a', bg: '#dcfce7' },
    { title: 'Réponses Reçues', value: String(replied), color: '#9333ea', bg: '#f3e8ff' },
    { title: 'Emails Ouverts', value: String(opened), color: '#d97706', bg: '#fef3c7' },
  ];
  const icons = [<Mail size={24}/>, <BarChart3 size={24}/>, <CheckCircle size={24}/>, <Eye size={24}/>];

  const liveLabel = liveStatus === 'live' ? '● Live' : liveStatus === 'connecting' ? '○ Connexion...' : liveStatus === 'polling' ? '↻ Polling 30s' : '';
  const liveColor = liveStatus === 'live' ? '#16a34a' : liveStatus === 'connecting' ? '#d97706' : '#6366f1';

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Tableau de Bord</h1>
          {liveStatus !== 'off' && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: liveColor, background: liveStatus === 'live' ? '#dcfce7' : '#fef9c3', padding: '0.25rem 0.625rem', borderRadius: '99px' }}>
              {liveLabel}
            </span>
          )}
        </div>
        <button
          onClick={async () => {
            if (!confirm('Réinitialiser toutes les statistiques et le suivi ?')) return;
            // Clear server reply store entirely
            await fetch('/api/emails/check-replies', { method: 'DELETE' }).catch(() => {});
            // Clear all local lists and stats
            [STATS_KEY, SENT_P_KEY, SENT_C_KEY].forEach(k => localStorage.removeItem(k));
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
