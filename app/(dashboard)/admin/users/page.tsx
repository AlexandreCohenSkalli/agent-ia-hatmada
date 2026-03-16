'use client';

import { useState, useEffect } from 'react';
import { Check, X, Trash2, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  approved: boolean;
  createdAt: string;
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
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Gestion des utilisateurs</h1>

      {/* Pending Users */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-orange-600">
          En attente d'approbation ({pendingUsers.length})
        </h2>
        {pendingUsers.length === 0 ? (
          <p className="text-gray-500">Aucune demande en attente</p>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-4"
              >
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    <Check size={18} />
                    Approuver
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    <X size={18} />
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Users */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-green-600">
          Utilisateurs approuvés ({approvedUsers.length})
        </h2>
        {approvedUsers.length === 0 ? (
          <p className="text-gray-500">Aucun utilisateur approuvé</p>
        ) : (
          <div className="space-y-3">
            {approvedUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={() => handleReject(user.id)}
                  className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  <Trash2 size={18} />
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
