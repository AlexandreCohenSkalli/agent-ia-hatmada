'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';

const SENT_KEY = 'hatmada_sent_coaching';
const STATS_KEY = 'hatmada_stats';

interface SentEmail {
  id: string;
  prospectName: string;
  prospectEmail: string;
  companyName: string;
  fonction: string;
  emailSubject: string;
  emailBody: string;
  status: 'sent' | 'replied';
  sentAt?: string;
  sentAtIso?: string;
  linkedinUrl?: string;
}

export default function SuiviCoachingPage() {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [openStatus, setOpenStatus] = useState<Record<string, { openedAt: string; count: number } | null>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'sent' | 'replied'>('all');
  const [selected, setSelected] = useState<SentEmail | null>(null);
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'live' | 'polling' | 'off'>('off');
  const [lastReplyAt, setLastReplyAt] = useState<string | null>(null);
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});

  const loadData = useCallback(() => {
    try {
      const list = JSON.parse(localStorage.getItem(SENT_KEY) || '[]');
      setEmails(list);
      if (list.length > 0) {
        const ids = list.map((e: SentEmail) => e.id).join(',');
        fetch(`/api/emails/track/status?ids=${ids}`)
          .then(r => r.json())
          .then(data => setOpenStatus(data.status || {}))
          .catch(() => {});
      } else {
        setOpenStatus({});
      }
    } catch {}
  }, []);

  /** Auto-mark an email as replied (from SSE or poll) and sync localStorage + stats */
  const applyReply = useCallback((emailId: string, repliedAt?: string, replyBody?: string) => {
    // Always update body if provided (new parse may be better)
    if (replyBody) setReplyBodies(prev => ({ ...prev, [emailId]: replyBody }));
    setEmails(prev => {
      const existing = prev.find(e => e.id === emailId);
      if (!existing || existing.status === 'replied') return prev;
      const next = prev.map(e => e.id === emailId ? { ...e, status: 'replied' as const } : e);
      localStorage.setItem(SENT_KEY, JSON.stringify(next));
      try {
        const s = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
        localStorage.setItem(STATS_KEY, JSON.stringify({ ...s, replied: (s.replied || 0) + 1 }));
      } catch {}
      setLastReplyAt(repliedAt || new Date().toISOString());
      return next;
    });
    setSelected(prev => prev?.id === emailId ? { ...prev, status: 'replied' } : prev);
  }, []);

  /** Poll /api/emails/check-replies every 30 s */
  const pollReplies = useCallback(() => {
    try {
      const list: SentEmail[] = JSON.parse(localStorage.getItem(SENT_KEY) || '[]');
      const emailsToCheck = list.filter(e => e.id).map(e => ({ id: e.id, subject: e.emailSubject, prospectEmail: e.prospectEmail, sentAtIso: e.sentAtIso }));
      if (emailsToCheck.length === 0) return;
      fetch('/api/emails/check-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailsToCheck }),
      })
        .then(r => r.json())
        .then(data => {
          const replyStatus: Record<string, any> = data.replyStatus || {};
          emailsToCheck.forEach(e => { if (replyStatus[e.id]) applyReply(e.id, replyStatus[e.id].repliedAt, replyStatus[e.id].replyBody); });
        })
        .catch(() => {});
    } catch {}
  }, [applyReply]);

  useEffect(() => {
    loadData();

    // --- Server-Sent Events – real-time reply push ---
    setLiveStatus('connecting');
    const es = new EventSource('/api/emails/replies-stream');

    es.onopen = () => setLiveStatus('live');
    es.onerror = () => setLiveStatus('polling');
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'reply' && data.emailId) {
          applyReply(data.emailId, data.repliedAt, data.replyBody);
        } else if (data.type === 'snapshot') {
          Object.entries(data.replies || {}).forEach(([id, info]: [string, any]) => {
            applyReply(id, info.repliedAt, info.replyBody);
          });
        }
      } catch {}
    };

    // --- Polling fallback every 30 s ---
    pollReplies();
    const pollInterval = setInterval(pollReplies, 30_000);

    return () => {
      es.close();
      clearInterval(pollInterval);
      setLiveStatus('off');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkReplied = (emailId: string) => {
    applyReply(emailId);
  };

  const filtered = emails.filter(e => {
    const matchSearch = search === '' ||
      e.prospectName.toLowerCase().includes(search.toLowerCase()) ||
      e.companyName.toLowerCase().includes(search.toLowerCase()) ||
      e.prospectEmail.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || e.status === filter;
    return matchSearch && matchFilter;
  });

  const statusStyle = (status: string) =>
    status === 'replied'
      ? { bg: '#f3e8ff', color: '#7c3aed' }
      : { bg: '#dcfce7', color: '#166534' };

  const statusLabel = (status: string) =>
    status === 'replied' ? 'Réponse reçue' : 'Envoyé';

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Suivi — Coaching HATMADA</h1>
          {liveStatus !== 'off' && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: liveStatus === 'live' ? '#16a34a' : liveStatus === 'connecting' ? '#d97706' : '#6366f1', background: liveStatus === 'live' ? '#dcfce7' : '#fef9c3', padding: '0.25rem 0.625rem', borderRadius: '99px' }}>
              {liveStatus === 'live' ? '● Live' : liveStatus === 'connecting' ? '○ Connexion...' : '↻ Polling 30s'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => { loadData(); pollReplies(); }}
            style={{ padding: '0.5rem 1rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
            ↻ Actualiser
          </button>
          <button onClick={() => {
            if (!confirm('Réinitialiser tout le suivi Coaching ? Cette action est irréversible.')) return;
            const ids = (JSON.parse(localStorage.getItem(SENT_KEY) || '[]') as SentEmail[]).map(e => e.id);
            if (ids.length > 0) fetch(`/api/emails/check-replies?ids=${ids.join(',')}`, { method: 'DELETE' }).catch(() => {});
            localStorage.removeItem(SENT_KEY);
            setEmails([]);
            setOpenStatus({});
            setLastReplyAt(null);
            setReplyBodies({});
          }}
            style={{ padding: '0.5rem 1rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
            Réinitialiser le suivi
          </button>
        </div>
      </div>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{emails.length} email{emails.length > 1 ? 's' : ''} envoyé{emails.length > 1 ? 's' : ''} au total</p>

      {/* Notification nouvelle réponse */}
      {lastReplyAt && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.625rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <span style={{ color: '#15803d', fontWeight: 600, fontSize: '0.9375rem' }}>🎉 Nouvelle réponse reçue ! Mise à jour automatique effectuée.</span>
          <button onClick={() => setLastReplyAt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.875rem' }}>✕</button>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher par nom, société, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.9375rem', background: 'white', boxSizing: 'border-box' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={14} />
            </button>
          )}
        </div>
        {(['all', 'sent', 'replied'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '0.5rem 1.125rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', border: filter === f ? 'none' : '1px solid #e2e8f0', background: filter === f ? 'linear-gradient(to right, #16a34a, #059669)' : 'white', color: filter === f ? 'white' : '#475569' }}>
            {f === 'all' ? `Tous (${emails.length})` : f === 'sent' ? `Envoyés (${emails.length})` : `Réponses (${emails.filter(e => e.status === 'replied').length})`}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '0.875rem', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', color: '#94a3b8' }}>
          {emails.length === 0 ? "Aucun email envoyé pour l'instant." : 'Aucun résultat pour cette recherche.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {filtered.map(email => {
            const s = statusStyle(email.status);
            return (
              <div key={email.id} style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: '#1e293b' }}>{email.prospectName}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#475569' }}>{email.fonction && `${email.fonction} · `}{email.companyName}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{email.prospectEmail}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  {email.status === 'replied' && (
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '99px', background: '#dcfce7', color: '#166534', fontSize: '0.8125rem', fontWeight: 600 }}>Envoyé</span>
                  )}
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '99px', background: s.bg, color: s.color, fontSize: '0.8125rem', fontWeight: 600 }}>{statusLabel(email.status)}</span>
                  {openStatus[email.id] && (
                    <span title={`Ouvert ${openStatus[email.id]!.count} fois · ${new Date(openStatus[email.id]!.openedAt).toLocaleString('fr-FR')}`}
                      style={{ padding: '0.25rem 0.625rem', borderRadius: '99px', background: '#fef9c3', color: '#a16207', fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'default' }}>
                      👁 Ouvert{openStatus[email.id]!.count > 1 ? ` (${openStatus[email.id]!.count}×)` : ''}
                    </span>
                  )}
                  {email.sentAt && <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{email.sentAt}</span>}
                  {email.status === 'sent' && (
                    <button onClick={() => handleMarkReplied(email.id)}
                      style={{ padding: '0.375rem 0.75rem', background: '#f3e8ff', color: '#7c3aed', border: '1px solid #d8b4fe', borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Répondu ✓
                    </button>
                  )}
                  <button onClick={() => setSelected(email)}
                    style={{ padding: '0.375rem 0.875rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Voir l'email
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>{selected.prospectName}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{selected.fonction && `${selected.fonction} · `}{selected.companyName}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.875rem 1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>À : <strong style={{ color: '#1e293b' }}>{selected.prospectEmail}</strong></p>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Sujet : <strong style={{ color: '#1e293b' }}>{selected.emailSubject}</strong></p>
              {selected.sentAt && <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Envoyé le {selected.sentAt}</p>}
            </div>
            <p style={{ fontWeight: 700, color: '#374151', marginBottom: '0.5rem', fontSize: '0.875rem' }}>📤 Email envoyé</p>
            <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '1rem', whiteSpace: 'pre-wrap', color: '#374151', fontSize: '0.9375rem', lineHeight: 1.6, border: '1px solid #e2e8f0', marginBottom: replyBodies[selected.id] ? '1.25rem' : 0 }}>
              {selected.emailBody}
            </div>
            {replyBodies[selected.id] && (
              <>
                <p style={{ fontWeight: 700, color: '#7c3aed', marginBottom: '0.5rem', fontSize: '0.875rem', marginTop: '0' }}>💬 Réponse reçue</p>
                <div style={{ background: '#faf5ff', borderRadius: '0.5rem', padding: '1rem', whiteSpace: 'pre-wrap', color: '#374151', fontSize: '0.9375rem', lineHeight: 1.6, border: '1px solid #d8b4fe' }}>
                  {replyBodies[selected.id]}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
