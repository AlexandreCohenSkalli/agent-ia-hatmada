'use client';

import { useState } from 'react';
import { Upload, Eye, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const STATS_KEY = 'hatmada_stats';
const SENT_KEY = 'hatmada_sent_coaching';

function readStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch { return {}; }
}
function addStats(delta: { sent?: number; replied?: number }) {
  const s = readStats();
  const next = { sent: (s.sent || 0) + (delta.sent || 0), replied: (s.replied || 0) + (delta.replied || 0) };
  localStorage.setItem(STATS_KEY, JSON.stringify(next));
}
function saveSentEmail(email: any) {
  try {
    const list = JSON.parse(localStorage.getItem(SENT_KEY) || '[]');
    const exists = list.findIndex((e: any) => e.id === email.id);
    if (exists >= 0) list[exists] = email; else list.unshift(email);
    localStorage.setItem(SENT_KEY, JSON.stringify(list));
  } catch {}
}

interface EmailRecord {
  id: string;
  prospectName: string;
  prospectEmail: string;
  companyName: string;
  fonction: string;
  linkedinUrl?: string;
  siteWeb?: string;
  status: 'pending' | 'sent' | 'replied';
  sentAt?: string;
  emailSubject: string;
  emailBody: string;
}

export default function CoachingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [bulkCount, setBulkCount] = useState('10');
  const [sendingBulk, setSendingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleBulkSend = async () => {
    const count = Math.min(Math.max(1, parseInt(bulkCount) || 1), 100);
    const pending = emails.filter(e => e.status === 'pending').slice(0, count);
    if (pending.length === 0) return;
    setSendingBulk(true);
    setBulkProgress({ done: 0, total: pending.length });
    let done = 0;
    for (const email of pending) {
      try {
        await fetch('/api/emails/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email.prospectEmail,
            subject: email.emailSubject,
            body: email.emailBody,
            fromName: 'Raphaël — Hatmada',
          }),
        });
        done++;
        setBulkProgress({ done, total: pending.length });
        addStats({ sent: 1 });
        const nowIso = new Date().toISOString();
        const nowFr = new Date().toLocaleString('fr-FR');
        const updated = { ...email, status: 'sent' as const, sentAt: nowFr, sentAtIso: nowIso };
        saveSentEmail(updated);
        setEmails(prev => prev.map(e =>
          e.id === email.id ? { ...e, status: 'sent', sentAt: nowFr, sentAtIso: nowIso } : e
        ));
      } catch (err) {
        console.error('Erreur envoi', email.prospectEmail, err);
      }
      await new Promise(r => setTimeout(r, 800));
    }
    setSendingBulk(false);
    setBulkProgress(null);
  };


  const generateEmails = async (emailRecords: EmailRecord[]) => {
    try {
      const prospects = emailRecords.map(e => ({
        name: e.prospectName,
        email: e.prospectEmail,
        company: e.companyName,
        industry: e.fonction || 'Unknown',
        type: 'coaching' as const,
      }));

      const res = await fetch('/api/emails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospects, type: 'coaching' }),
      });

      if (!res.ok) {
        throw new Error('Email generation failed');
      }

      const { emails } = await res.json();
      
      // Update emails with generated content
      const updated = emailRecords.map(record => {
        const generated = emails.find((e: any) => e.prospectEmail === record.prospectEmail);
        if (generated) {
          return {
            ...record,
            emailSubject: generated.emailSubject,
            emailBody: generated.emailBody,
          };
        }
        return record;
      });

      return updated;
    } catch (error) {
      console.error('Error generating emails:', error);
      return emailRecords;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setUploading(true);
    setWarnings([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const warningsList: string[] = [];
        rows.forEach((row, i) => {
          const rowNum = i + 2;
          const emailVal = (row['Email 1'] || row['Email'] || row['email'] || row['EMAIL'] || '').toString().trim();
          const prenom = (row['Prénom'] || row['Prenom'] || row['prénom'] || '').toString().trim();
          const nom = (row['Nom'] || row['NOM'] || '').toString().trim();
          const societe = (row['Société'] || row['Societe'] || row['société'] || row['SOCIÉTÉ'] || '').toString().trim();
          const label = prenom || nom || emailVal || `ligne ${rowNum}`;
          if (!emailVal) {
            warningsList.push(`Ligne ${rowNum} (${label}) — Email manquant, ligne ignorée.`);
          } else if (!emailVal.includes('@') || !emailVal.includes('.')) {
            warningsList.push(`Ligne ${rowNum} — Email invalide "${emailVal}", ligne ignorée.`);
          } else {
            if (!prenom && !nom) warningsList.push(`Ligne ${rowNum} (${emailVal}) — Prénom et Nom manquants, email généré sans nom.`);
            if (!societe) warningsList.push(`Ligne ${rowNum} (${emailVal}) — Société manquante, email généré sans société.`);
          }
        });
        setWarnings(warningsList);

        const parsed: EmailRecord[] = rows
          .filter((row) => {
            const emailVal = row['Email 1'] || row['Email'] || row['email'] || row['EMAIL'] || '';
            return emailVal.toString().includes('@') && emailVal.toString().includes('.');
          })
          .map((row, index) => {
            const prenom = (row['Prénom'] || row['Prenom'] || row['prénom'] || '').toString().trim();
            const nom = (row['Nom'] || row['NOM'] || '').toString().trim();
            const societe = (row['Société'] || row['Societe'] || row['société'] || row['SOCIÉTÉ'] || '').toString().trim();
            const fonction = (row['Fonction'] || row['FONCTION'] || row['fonction'] || '').toString().trim();
            const email = (row['Email 1'] || row['Email'] || row['email'] || '').toString().trim();
            const linkedin = (row['URL LinkedIn'] || row['LinkedIn'] || row['Linkedin'] || '').toString().trim();
            const site = (row['Site Internet'] || row['Site Web'] || row['Website'] || '').toString().trim();
            const fullName = [prenom, nom].filter(Boolean).join(' ') || 'Prospect';

            return {
              id: `row-${index}`,
              prospectName: fullName,
              prospectEmail: email,
              companyName: societe || '—',
              fonction,
              linkedinUrl: linkedin || undefined,
              siteWeb: site || undefined,
              status: 'pending',
              emailSubject: 'Génération en cours...',
              emailBody: 'Génération en cours...',
            } satisfies EmailRecord;
          });

        setEmails(parsed);
        
        // Generate emails via API
        (async () => {
          try {
            const generated = await generateEmails(parsed);
            setEmails(generated);
          } catch (error) {
            console.error('Error generating emails:', error);
            alert('Erreur lors de la génération des emails. Veuillez réessayer.');
          }
        })();
      } catch (err) {
        console.error('Erreur lecture XLSX', err);
        alert("Impossible de lire le fichier. Vérifiez que c'est bien un .xlsx valide.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleSendEmail = async (email: EmailRecord) => {
    setSendingEmail(true);
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.prospectEmail,
          subject: email.emailSubject,
          body: email.emailBody,
          fromName: 'Raphaël — Hatmada',
          emailId: email.id,
        }),
      });
      if (!res.ok) throw new Error('Erreur envoi');
      addStats({ sent: 1 });
      const nowIso = new Date().toISOString();
      const nowFr = new Date().toLocaleString('fr-FR');
      const updated = { ...email, status: 'sent' as const, sentAt: nowFr, sentAtIso: nowIso };
      saveSentEmail(updated);
      setEmails(emails.map(e =>
        e.id === email.id
          ? { ...e, status: 'sent', sentAt: nowFr, sentAtIso: nowIso }
          : e
      ));
    } catch (err) {
      console.error('Erreur envoi email', err);
      alert('Erreur lors de l\'envoi. Vérifiez la configuration SMTP dans .env.local.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleMarkReplied = (emailId: string) => {
    addStats({ replied: 1 });
    setEmails(prev => {
      const next = prev.map(e => e.id === emailId ? { ...e, status: 'replied' as const } : e);
      const replied = next.find(e => e.id === emailId);
      if (replied) saveSentEmail(replied);
      return next;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#fef9c3', color: '#854d0e' };
      case 'sent': return { bg: '#dcfce7', color: '#166534' };
      case 'replied': return { bg: '#dbeafe', color: '#1e40af' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'sent': return 'Envoyé';
      case 'replied': return 'Réponse';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Coaching HATMADA</h1>

      {/* Upload Section */}
      <div style={{ background: 'white', borderRadius: '0.875rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1.5rem', border: '2px dashed #bbf7d0' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Importer une liste XLSX</h2>
        <p style={{ color: '#64748b', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>Colonnes reconnues : <strong>Prénom, Nom, Fonction, Société, Email 1</strong>, URL LinkedIn, Site Internet.</p>

        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.5rem', border: '2px dashed #cbd5e1', borderRadius: '0.5rem', cursor: 'pointer' }}>
          <Upload size={24} color="#94a3b8" />
          <div>
            <p style={{ fontWeight: 600, color: '#374151' }}>{file ? file.name : 'Cliquez pour sélectionner un fichier'}</p>
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>Format: .xlsx</p>
          </div>
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>

        {uploading && (
          <p style={{ marginTop: '1rem', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>Lecture du fichier et génération des emails...</p>
        )}
        {warnings.length > 0 && (
          <div style={{ marginTop: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem' }}>
            <p style={{ fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>⚠️ {warnings.length} avertissement{warnings.length > 1 ? 's' : ''} détecté{warnings.length > 1 ? 's' : ''}</p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {warnings.map((w, i) => (
                <li key={i} style={{ color: '#b91c1c', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Stats bar */}
      {emails.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Total', value: emails.length, color: '#16a34a' },
            { label: 'En attente', value: emails.filter(e => e.status === 'pending').length, color: '#d97706' },
            { label: 'Envoyés', value: emails.filter(e => e.status === 'sent').length, color: '#2563eb' },
            { label: 'Réponses', value: emails.filter(e => e.status === 'replied').length, color: '#7c3aed' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'white', borderRadius: '0.75rem', padding: '0.875rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: '100px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{stat.label}</span>
            </div>
          ))}
          {/* Envoi en masse */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Envoyer les</span>
            <input
              type="number" min={1} max={emails.filter(e => e.status === 'pending').length}
              value={bulkCount}
              onChange={e => setBulkCount(e.target.value)}
              onBlur={e => setBulkCount(String(Math.min(Math.max(1, parseInt(e.target.value) || 1), 100)))}
              style={{ width: '60px', padding: '0.375rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.9375rem', fontWeight: 700, textAlign: 'center' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>premiers</span>
            <button
              onClick={handleBulkSend}
              disabled={sendingBulk || emails.filter(e => e.status === 'pending').length === 0}
              style={{ padding: '0.5rem 1.25rem', background: sendingBulk ? '#94a3b8' : 'linear-gradient(to right, #16a34a, #059669)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: sendingBulk ? 'not-allowed' : 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
            >
              {sendingBulk && bulkProgress ? `${bulkProgress.done}/${bulkProgress.total} envoyés...` : '🚀 Envoyer'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {showPreview && selectedEmail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{selectedEmail.prospectName}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{selectedEmail.fonction && `${selectedEmail.fonction} · `}{selectedEmail.companyName}</p>
              </div>
              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}><X size={20} /></button>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.875rem 1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>À : <strong style={{ color: '#1e293b' }}>{selectedEmail.prospectEmail}</strong></p>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Sujet : <strong style={{ color: '#1e293b' }}>{selectedEmail.emailSubject}</strong></p>
              {selectedEmail.linkedinUrl && (
                <a href={selectedEmail.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: '#2563eb' }}>🔗 LinkedIn</a>
              )}
              {selectedEmail.siteWeb && (
                <a href={selectedEmail.siteWeb} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: '#2563eb' }}>🌐 {selectedEmail.siteWeb}</a>
              )}
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '1rem', whiteSpace: 'pre-wrap', color: '#374151', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              {selectedEmail.emailBody}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { handleSendEmail(selectedEmail); setShowPreview(false); }} disabled={sendingEmail || selectedEmail.status !== 'pending'}
                style={{ flex: 1, padding: '0.875rem', background: selectedEmail.status !== 'pending' ? '#cbd5e1' : 'linear-gradient(to right, #16a34a, #059669)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: selectedEmail.status !== 'pending' ? 'not-allowed' : 'pointer' }}>
                {sendingEmail ? 'Envoi...' : 'Envoyer'}
              </button>
              <button onClick={() => setShowPreview(false)} style={{ flex: 1, padding: '0.875rem', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Email List */}
      {emails.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
            Emails générés — {emails.length} prospect{emails.length > 1 ? 's' : ''}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {emails.map((email) => {
              const s = getStatusColor(email.status);
              return (
                <div key={email.id} style={{ background: 'white', borderRadius: '0.75rem', padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: '#1e293b' }}>{email.prospectName}</p>
                    <p style={{ fontSize: '0.8125rem', color: '#475569' }}>{email.fonction && `${email.fonction} · `}{email.companyName}</p>
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{email.prospectEmail}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '99px', background: s.bg, color: s.color, fontSize: '0.8125rem', fontWeight: 600 }}>{getStatusLabel(email.status)}</span>
                    {email.sentAt && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{email.sentAt}</span>}
                    {email.linkedinUrl && (
                      <a href={email.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>in</a>
                    )}
                    {email.status === 'sent' && (
                      <button onClick={() => handleMarkReplied(email.id)}
                        style={{ padding: '0.375rem 0.75rem', background: '#f3e8ff', color: '#7c3aed', border: '1px solid #d8b4fe', borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                        Répondu ✓
                      </button>
                    )}
                    <button onClick={() => { setSelectedEmail(email); setShowPreview(true); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', background: 'linear-gradient(to right, #16a34a, #059669)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>
                      <Eye size={15} /> Aperçu &amp; Envoyer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {emails.length === 0 && !uploading && (
        <div style={{ background: 'white', borderRadius: '0.875rem', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <AlertCircle size={36} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Importez un fichier XLSX pour générer les emails coaching</p>
        </div>
      )}
    </div>
  );
}
