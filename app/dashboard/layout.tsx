'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Mail, Users, BarChart3, Settings } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

function AnimatedSphere({ size = 48 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let angle = 0;
    const W = canvas.width = size;
    const H = canvas.height = size;
    const cx = W / 2, cy = H / 2;
    const R = size * 0.42;
    const colors = ['#3b82f6','#60a5fa','#06b6d4','#34d399','#818cf8','#a78bfa','#38bdf8','#93c5fd'];
    const N = 180;
    const dots = Array.from({ length: N }, (_, i) => {
      const phi = Math.acos(-1 + (2 * i) / N);
      const theta = Math.sqrt(N * Math.PI) * phi;
      return { phi, theta, color: colors[i % colors.length], size: 0.6 + Math.random() * 0.8 };
    });
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const projected = dots.map(d => {
        const x = Math.sin(d.phi) * Math.cos(d.theta + angle);
        const y = Math.cos(d.phi);
        const z = Math.sin(d.phi) * Math.sin(d.theta + angle);
        const depth = (z + 1) / 2;
        return { sx: cx + x * R, sy: cy + y * R * 0.92, depth, color: d.color, size: d.size };
      }).sort((a, b) => a.depth - b.depth);
      projected.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.size * (0.4 + p.depth * 0.9), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.15 + p.depth * 0.75;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      angle += 0.005;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [size]);
  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: 'block', pointerEvents: 'none', flexShrink: 0 }}
    />
  );
}

interface PendingUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check auth token
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Decode JWT to get user info
    try {
      const decoded: any = jwtDecode(token);
      setUser({
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });
      setIsAdmin(decoded.role === 'admin');
    } catch (err) {
      console.error('Error decoding token:', err);
      setUser({
        id: '1',
        email: 'user@example.com',
      });
    }

    setLoading(false);

    // Load pending users
    loadPendingUsers(token);
  }, [router]);

  const loadPendingUsers = async (token: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const pending = (data.users || []).filter((u: any) => !u.approved);
        setPendingUsers(pending);
      }
    } catch (err) {
      console.error('Error loading pending users:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%)', fontSize: '1.125rem', color: '#64748b', fontFamily: '"Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontWeight: '300' }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fafbfc', fontFamily: '"Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'linear-gradient(135deg, #0a3d7a 0%, #1a5fa0 50%, #0d4a99 100%)', color: 'white', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', flexShrink: 0, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0.5rem 0' }}>
          <AnimatedSphere size={48} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', color: 'white', textTransform: 'uppercase' }}>AI PROSPECT</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 300, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.6)' }}>By Gavroch.Dev</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1rem', borderRadius: '0.625rem', color: 'rgba(255,255,255,0.95)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: '400', letterSpacing: '0.2px', transition: 'all 0.2s ease-out' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
            <BarChart3 size={20} />
            <span>Aperçu</span>
          </Link>
          <Link href="/dashboard/prospection" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1rem', borderRadius: '0.625rem', color: 'rgba(255,255,255,0.95)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: '400', letterSpacing: '0.2px', transition: 'all 0.2s ease-out' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
            <Mail size={20} />
            <span>Prospection HATMADA</span>
          </Link>
          <Link href="/dashboard/prospection/suivi" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem 0.5rem 3.25rem', borderRadius: '0.5rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: '300', letterSpacing: '0.15px', transition: 'all 0.2s ease-out' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
            }}>
            <span style={{ fontSize: '0.75rem' }}>↳</span> Suivi &amp; Réponses
          </Link>
          <Link href="/dashboard/coaching" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1rem', borderRadius: '0.625rem', color: 'rgba(255,255,255,0.95)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: '400', letterSpacing: '0.2px', transition: 'all 0.2s ease-out' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
            <Users size={20} />
            <span>Coaching HATMADA</span>
          </Link>
          <Link href="/dashboard/coaching/suivi" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem 0.5rem 3.25rem', borderRadius: '0.5rem', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: '300', letterSpacing: '0.15px', transition: 'all 0.2s ease-out' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
            }}>
            <span style={{ fontSize: '0.75rem' }}>↳</span> Suivi &amp; Réponses
          </Link>

          {/* Settings Section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
            <Link href="/dashboard/settings/email" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1rem', borderRadius: '0.625rem', color: 'rgba(255,255,255,0.95)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: '400', letterSpacing: '0.2px', transition: 'all 0.2s ease-out' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}>
              <Settings size={20} />
              <span>Paramètres Email</span>
            </Link>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
              <Link href="/dashboard/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1rem', borderRadius: '0.625rem', color: '#fef08a', textDecoration: 'none', fontSize: '0.9375rem', background: 'rgba(254, 240, 138, 0.12)', fontWeight: '500', letterSpacing: '0.2px', transition: 'all 0.2s ease-out' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(254, 240, 138, 0.22)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(254, 240, 138, 0.12)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}>
                <Users size={20} />
                Administration
              </Link>
            </div>
          )}
        </nav>

        {/* Pending Users Section */}
        {isAdmin && pendingUsers.length > 0 && (
          <div style={{ background: 'rgba(254, 240, 138, 0.08)', borderLeft: '2px solid #fef08a', padding: '1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.7rem', fontWeight: '600', color: '#fef08a', textTransform: 'uppercase', marginBottom: '0.875rem', letterSpacing: '0.8px' }}>En attente d'accès ({pendingUsers.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {pendingUsers.map(u => (
                <div key={u.id} style={{ background: 'rgba(255,255,255,0.08)', padding: '0.625rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>
                  <p style={{ fontWeight: '500', color: 'white', marginBottom: '0.25rem', letterSpacing: '0.2px' }}>{u.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                </div>
              ))}
            </div>
            <Link href="/dashboard/admin/users" style={{ display: 'block', marginTop: '0.875rem', padding: '0.5rem 0.625rem', background: 'rgba(254, 240, 138, 0.15)', color: '#fef08a', textDecoration: 'none', textAlign: 'center', borderRadius: '0.375rem', fontSize: '0.7rem', fontWeight: '600', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(254, 240, 138, 0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(254, 240, 138, 0.15)')}>
              Gérer
            </Link>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '300', letterSpacing: '0.15px' }}>{user?.email}</p>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', width: '100%', padding: '0.625rem 1rem', borderRadius: '0.5rem', color: '#fca5a5', background: 'rgba(252, 165, 165, 0.12)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '400', letterSpacing: '0.2px', transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(252, 165, 165, 0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(252, 165, 165, 0.12)')}>
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.875rem', marginTop: '1.25rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontWeight: '300', letterSpacing: '0.3px' }}>
          Developped by Gavroch.Dev
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%)' }}>
        {children}
      </main>
    </div>
  );
}
