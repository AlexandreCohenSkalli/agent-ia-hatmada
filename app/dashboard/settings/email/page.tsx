'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Eye, EyeOff, Zap, Shield, ArrowRight, Loader2 } from 'lucide-react';

const SMTP_PRESETS: Record<string, { host: string; port: number; secure: boolean }> = {
  gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
  outlook: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
  office365: { host: 'smtp.office365.com', port: 587, secure: false },
  yahoo: { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
  custom: { host: '', port: 587, secure: false },
};

const PROVIDER_META: Record<string, { label: string; color: string; bg: string; icon: string; tutorial: { title: string; steps: string[]; link?: { href: string; label: string } } }> = {
  gmail: {
    label: 'Gmail', color: '#EA4335', bg: 'rgba(234,67,53,0.08)', icon: 'G',
    tutorial: {
      title: 'Obtenir votre App Password Gmail',
      steps: [
        'Activez la validation en 2 étapes sur votre compte Google',
        'Allez dans Mon compte Google → Sécurité → Mots de passe des applications',
        'Créez un mot de passe pour "Autre" et nommez-le HATMADA',
        'Copiez le code à 16 caractères et collez-le dans le champ mot de passe',
      ],
      link: { href: 'https://myaccount.google.com/apppasswords', label: 'Générer un App Password →' },
    },
  },
  outlook: {
    label: 'Outlook', color: '#0078D4', bg: 'rgba(0,120,212,0.08)', icon: 'O',
    tutorial: {
      title: 'Configurer Outlook / Hotmail',
      steps: [
        'Sans 2FA activée : entrez simplement votre email et votre mot de passe habituel',
        'Avec 2FA activée : allez sur account.microsoft.com → Sécurité → Options de sécurité avancées',
        'Cherchez "Mots de passe d\'application" et cliquez "Créer un nouveau mot de passe d\'application"',
        'Copiez le mot de passe généré et collez-le dans le champ ci-dessous (votre vrai mot de passe ne fonctionnera pas)',
      ],
      link: { href: 'https://account.microsoft.com/security', label: 'Paramètres de sécurité Microsoft →' },
    },
  },
  office365: {
    label: 'Office 365', color: '#D83B01', bg: 'rgba(216,59,1,0.08)', icon: '365',
    tutorial: {
      title: 'Configurer Office 365',
      steps: [
        'Utilisez votre adresse email professionnelle et mot de passe habituel',
        'Si MFA activé, créez un mot de passe d\'application dans votre portail',
        'Votre admin IT doit activer SMTP Auth dans Microsoft 365',
        'Vérifiez que SMTP Auth est bien activé pour votre compte',
      ],
    },
  },
  yahoo: {
    label: 'Yahoo', color: '#6001D2', bg: 'rgba(96,1,210,0.08)', icon: 'Y',
    tutorial: {
      title: 'Configurer Yahoo Mail',
      steps: [
        'Connectez-vous à Yahoo Mail → Paramètres du compte → Sécurité',
        'Activez "Autoriser les apps moins sécurisées" ou créez un App Password',
        'Allez dans Gérer les mots de passe d\'applications',
        'Générez un mot de passe pour "Autre application"',
      ],
      link: { href: 'https://login.yahoo.com/account/security', label: 'Sécurité Yahoo →' },
    },
  },
  custom: {
    label: 'Autre', color: '#6B7280', bg: 'rgba(107,114,128,0.08)', icon: '···',
    tutorial: {
      title: 'Configuration manuelle SMTP',
      steps: [
        'Récupérez les paramètres SMTP auprès de votre hébergeur email',
        'Le port 587 avec STARTTLS est le plus courant (465 pour SSL direct)',
        'L\'identifiant SMTP est généralement votre adresse email complète',
        'Utilisez votre mot de passe ou un App Password si disponible',
      ],
    },
  },
};

function FloatingInput({
  label, value, onChange, type = 'text', placeholder = '', rightSlot, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; rightSlot?: React.ReactNode; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div style={{ position: 'relative', marginTop: '6px' }}>
      <div style={{
        position: 'relative',
        borderRadius: '14px',
        background: focused ? '#fff' : '#f9fafb',
        border: `1.5px solid ${focused ? '#1d4ed8' : hasValue ? '#d1d5db' : '#e5e7eb'}`,
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: focused ? '0 0 0 3px rgba(29,78,216,0.10)' : 'none',
      }}>
        <label style={{
          position: 'absolute',
          left: '14px',
          top: focused || hasValue ? '8px' : '50%',
          transform: focused || hasValue ? 'translateY(0) scale(0.75)' : 'translateY(-50%) scale(1)',
          transformOrigin: 'left',
          fontSize: '14px',
          color: focused ? '#1d4ed8' : '#9ca3af',
          pointerEvents: 'none',
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          zIndex: 1,
        }}>
          {label}
        </label>
        <input
          type={type}
          value={value}
          placeholder={focused ? placeholder : ''}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            padding: hasValue || focused ? '26px 14px 10px' : '18px 14px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            color: '#111827',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            letterSpacing: '-0.01em',
            paddingRight: rightSlot ? '44px' : '14px',
            boxSizing: 'border-box',
          }}
        />
        {rightSlot && (
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmailSettingsPage() {
  const [form, setForm] = useState({
    host: '', port: 587, secure: false,
    smtpUser: '', smtpPass: '', fromName: '', senderEmail: '',
  });
  const [preset, setPreset] = useState('gmail');
  const [showPassword, setShowPassword] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const res = await fetch('/api/user/smtp-config', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      if (data.config) {
        setHasConfig(true);
        setForm(f => ({ ...f, host: data.config.host, port: data.config.port, secure: data.config.secure, smtpUser: data.config.smtpUser, smtpPass: '', fromName: data.config.fromName || '', senderEmail: data.config.senderEmail }));
        const matched = Object.entries(SMTP_PRESETS).find(([, v]) => v.host === data.config.host);
        setPreset(matched ? matched[0] : 'custom');
      }
    }
  };

  const handlePreset = (key: string) => {
    setPreset(key);
    if (key !== 'custom') setForm(f => ({ ...f, ...SMTP_PRESETS[key] }));
  };

  const handleSave = async () => {
    setSaving(true); setMessage(null);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/user/smtp-config', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { setHasConfig(true); setSaved(true); setTimeout(() => setSaved(false), 2500); }
      else setMessage({ type: 'error', text: data.error + (data.details ? ` — ${data.details}` : '') });
    } catch { setMessage({ type: 'error', text: 'Erreur réseau' }); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    setTesting(true); setMessage(null);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/user/smtp-config/test', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMessage(res.ok ? { type: 'success', text: data.message } : { type: 'error', text: data.error + (data.details ? ` — ${data.details}` : '') });
    } catch { setMessage({ type: 'error', text: 'Erreur réseau' }); }
    finally { setTesting(false); }
  };

  const meta = PROVIDER_META[preset];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)', padding: '40px 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pop { 0% { transform: scale(0.95); opacity: 0; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .provider-btn { transition: all 0.22s cubic-bezier(0.4,0,0.2,1) !important; }
        .provider-btn:hover { transform: translateY(-2px) !important; }
        .cta-btn { transition: all 0.2s cubic-bezier(0.4,0,0.2,1) !important; }
        .cta-btn:hover { transform: translateY(-1px) !important; box-shadow: 0 8px 24px rgba(29,78,216,0.25) !important; }
        .cta-btn:active { transform: scale(0.98) !important; }
      `}</style>

      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px', animation: 'slideUp 0.5s cubic-bezier(0.4,0,0.2,1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(29,78,216,0.3)' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>Configuration Email</h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, letterSpacing: '-0.01em' }}>Connectez votre boîte mail pour envoyer vos campagnes</p>
            </div>
          </div>

          {hasConfig && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', animation: 'fadeIn 0.4s ease' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <span style={{ fontSize: '13.5px', color: '#15803d', fontWeight: '500', letterSpacing: '-0.01em' }}>Email configuré · vos envois utilisent votre compte personnel</span>
            </div>
          )}
        </div>

        {/* Provider picker */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', animation: 'slideUp 0.55s cubic-bezier(0.4,0,0.2,1)' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>Votre fournisseur</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {Object.entries(PROVIDER_META).map(([key, m]) => (
              <button key={key} className="provider-btn" onClick={() => handlePreset(key)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '6px', padding: '14px 8px', borderRadius: '14px',
                background: preset === key ? m.bg : '#f8fafc',
                border: `1.5px solid ${preset === key ? m.color + '40' : '#e2e8f0'}`,
                cursor: 'pointer', boxShadow: preset === key ? `0 4px 14px ${m.color}22` : 'none',
              }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: preset === key ? m.color : '#94a3b8', letterSpacing: '-0.02em', fontFamily: 'monospace' }}>{m.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: '500', color: preset === key ? m.color : '#94a3b8', letterSpacing: '0.01em' }}>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Tutorial */}
          <div style={{ background: `${meta.color}08`, borderRadius: '14px', padding: '16px 18px', border: `1px solid ${meta.color}20`, animation: 'pop 0.3s cubic-bezier(0.4,0,0.2,1)' }} key={preset}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: meta.color, marginBottom: '10px', letterSpacing: '-0.01em' }}>{meta.tutorial.title}</p>
            <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {meta.tutorial.steps.map((step, i) => (
                <li key={i} style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', letterSpacing: '-0.01em' }}>{step}</li>
              ))}
            </ol>
            {meta.tutorial.link && (
              <a href={meta.tutorial.link.href} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '12px', fontSize: '12.5px', fontWeight: '600', color: meta.color, textDecoration: 'none', letterSpacing: '-0.01em' }}>
                {meta.tutorial.link.label}
                <ArrowRight size={12} />
              </a>
            )}
          </div>
        </div>

        {/* SMTP Form */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', animation: 'slideUp 0.6s cubic-bezier(0.4,0,0.2,1)' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '18px' }}>Paramètres SMTP</p>

          <div style={{ marginBottom: '10px' }}>
            <FloatingInput label="Serveur SMTP" value={form.host} onChange={v => setForm(f => ({ ...f, host: v }))} placeholder="smtp.gmail.com" />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <FloatingInput label="Email / Identifiant" value={form.smtpUser} onChange={v => setForm(f => ({ ...f, smtpUser: v, senderEmail: v }))} type="email" placeholder="vous@gmail.com" autoComplete="off" />
          </div>

          {/* Password field with show/hide */}
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <FloatingInput
              label="Mot de passe SMTP"
              value={form.smtpPass}
              onChange={v => setForm(f => ({ ...f, smtpPass: v }))}
              type={showPassword ? 'text' : 'password'}
              placeholder={hasConfig ? 'Laisser vide pour ne pas changer' : 'App Password à 16 caractères'}
              autoComplete="new-password"
              rightSlot={
                <button type="button" onClick={() => setShowPassword(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center', borderRadius: '6px', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#1d4ed8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', paddingLeft: '14px' }}>
              <Shield size={11} color="#94a3b8" />
              <span style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.01em' }}>Stocké de façon sécurisée, jamais affiché en clair</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <FloatingInput label="Nom d'expéditeur" value={form.fromName} onChange={v => setForm(f => ({ ...f, fromName: v }))} placeholder="Alexandre Cohen" />
            <FloatingInput label="Email expéditeur" value={form.senderEmail} onChange={v => setForm(f => ({ ...f, senderEmail: v }))} type="email" placeholder="vous@gmail.com" />
          </div>


        </div>

        {/* Feedback */}
        {message && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px 16px', borderRadius: '14px', marginBottom: '16px',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            animation: 'pop 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {message.type === 'success'
              ? <CheckCircle size={17} color="#22c55e" style={{ marginTop: '1px', flexShrink: 0 }} />
              : <AlertCircle size={17} color="#ef4444" style={{ marginTop: '1px', flexShrink: 0 }} />}
            <span style={{ fontSize: '13.5px', color: message.type === 'success' ? '#15803d' : '#dc2626', letterSpacing: '-0.01em', lineHeight: '1.5' }}>{message.text}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', animation: 'slideUp 0.65s cubic-bezier(0.4,0,0.2,1)' }}>
          <button className="cta-btn" onClick={handleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            flex: 1, padding: '15px 24px', borderRadius: '14px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            background: saved ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
            color: 'white', fontSize: '15px', fontWeight: '600', letterSpacing: '-0.02em',
            boxShadow: '0 4px 14px rgba(29,78,216,0.25)',
            opacity: saving ? 0.75 : 1,
            transition: 'background 0.3s ease',
          }}>
            {saving ? <Loader2 size={17} style={{ animation: 'spin 0.8s linear infinite' }} />
              : saved ? <><CheckCircle size={17} /> Sauvegardé !</>
              : <><Zap size={17} /> Sauvegarder la configuration</>}
          </button>

          {hasConfig && (
            <button className="cta-btn" onClick={handleTest} disabled={testing} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '15px 20px', borderRadius: '14px', border: '1.5px solid #e2e8f0', cursor: testing ? 'not-allowed' : 'pointer',
              background: 'white', color: '#374151', fontSize: '14px', fontWeight: '600', letterSpacing: '-0.01em',
              opacity: testing ? 0.7 : 1,
            }}>
              {testing
                ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
              {testing ? 'Test…' : 'Tester'}
            </button>
          )}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
