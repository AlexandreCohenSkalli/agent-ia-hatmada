'use client';

import { useState, useEffect } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  approved: boolean;
  createdAt: string;
  _count?: { emails: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('Non authentifié. Allez d\'abord vous connecter en tant qu\'admin.');
      setLoading(false);
      return;
    }
    setToken(authToken);
    loadUsers(authToken);
  }, []);

  const loadUsers = async (authToken: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) throw new Error('Erreur de chargement');

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, approved: true }),
      });

      if (!res.ok) throw new Error('Erreur');

      // Update local state
      setUsers(users.map(u =>
        u.id === userId ? { ...u, approved: true } : u
      ));
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Erreur');

      // Update local state
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingUsers = users.filter(u => !u.approved);
  const approvedUsers = users.filter(u => u.approved);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', gap: '2rem', padding: '2rem', background: '#f8fafc' }}>
      {/* Left Panel - Pending Users */}
      <div style={{
        width: '320px',
        background: 'white',
        borderRadius: '1rem',
        border: '2px solid #fbbf24',
        padding: '1.5rem',
        height: 'fit-content',
        position: 'sticky',
        top: '2rem',
        boxShadow: '0 4px 20px rgba(251,191,36,0.15)'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: '#92400e',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            background: '#fbbf24',
            borderRadius: '50%',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: '700'
          }}>
            {pendingUsers.length}
          </span>
          En attente d'accès
        </h3>

        {pendingUsers.length === 0 ? (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            ✓ Aucune demande en attente
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem', maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
            {pendingUsers.map(user => (
              <div
                key={user.id}
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fcd34d',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  fontSize: '0.875rem'
                }}
              >
                <p style={{ fontWeight: '700', color: '#92400e', marginBottom: '0.25rem' }}>
                  {user.name}
                </p>
                <p style={{ color: '#b45309', fontSize: '0.75rem', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
                  {user.email}
                </p>
                <p style={{ color: '#a16207', fontSize: '0.7rem', marginBottom: '0.75rem' }}>
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleApprove(user.id)}
                    style={{
                      flex: 1,
                      background: '#10b981',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                  >
                    ✓ Approuver
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    style={{
                      flex: 1,
                      background: '#ef4444',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                  >
                    ✕ Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Main Content */}
      <div style={{ flex: 1, maxWidth: '1200px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1e293b' }}>Gestion des utilisateurs</h1>

        {/* Approved Users */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: '#dcfce7',
              borderRadius: '50%',
              color: '#16a34a',
              fontWeight: '700'
            }}>
              {approvedUsers.length}
            </span>
            Utilisateurs approuvés
          </h2>
          {approvedUsers.length === 0 ? (
            <div style={{
              padding: '2rem',
              background: 'white',
              borderRadius: '0.75rem',
              textAlign: 'center',
              color: '#6b7280',
              border: '1px solid #e5e7eb'
            }}>
              Aucun utilisateur approuvé
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {approvedUsers.map(user => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'white',
                    border: '1px solid #86efac',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>{user.name}</p>
                    <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>{user.email}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb', lineHeight: 1 }}>{user._count?.emails ?? 0}</p>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>emails envoyés</p>
                    </div>
                  <button
                    onClick={() => handleReject(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#6b7280',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
