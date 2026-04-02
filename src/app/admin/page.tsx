'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Submission {
  id: string;
  name: string;
  email: string;
  service: string;
  budget: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  service: string;
  status: string;
  budget?: string;
  description?: string;
  createdAt: string;
  user?: { name?: string; email: string };
}

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  createdAt: string;
}

const PROJECT_STATUSES = ['pending_verification', 'accepted', 'declined', 'planning', 'in_progress', 'review', 'completed'];
const SUBMISSION_STATUSES = ['new', 'contacted', 'closed'];

const statusColors: Record<string, string> = {
  pending_verification: '#fbbf24',
  accepted: '#4ade80',
  declined: '#ef4444',
  in_progress: '#38bdf8',
  planning: '#a78bfa',
  review: '#fb923c',
  completed: '#4ade80',
  new: '#fbbf24',
  contacted: '#38bdf8',
  closed: '#94a3b8',
};

type Tab = 'submissions' | 'projects' | 'users';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('submissions');
  const [data, setData] = useState<{ submissions: Submission[]; projects: Project[]; users: User[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/auth/signin'); return; }
    if (status === 'authenticated' && session.user?.role !== 'admin') { router.replace('/dashboard'); return; }
    if (status === 'authenticated') fetchData();
  }, [status, session]);

  async function fetchData() {
    setLoading(true);
    const res = await fetch('/api/admin');
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  async function updateStatus(type: 'project' | 'submission', id: string, newStatus: string) {
    setUpdating(id);
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, status: newStatus }),
    });
    await fetchData();
    setUpdating(null);
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ color: '#6366f1', fontSize: '18px' }}>Loading admin panel...</div>
      </div>
    );
  }

  if (!data) return null;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'submissions', label: 'Contact Submissions', count: data.submissions.length },
    { key: 'projects', label: 'Projects', count: data.projects.length },
    { key: 'users', label: 'Users', count: data.users.length },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
            Admin Panel
          </h1>
          <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: '14px' }}>
            Manage all submissions, projects, and users
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Submissions', value: data.submissions.length, color: '#6366f1' },
            { label: 'Active Projects', value: data.projects.filter(p => !['declined', 'completed'].includes(p.status)).length, color: '#4ade80' },
            { label: 'Pending Review', value: data.projects.filter(p => p.status === 'pending_verification').length, color: '#fbbf24' },
            { label: 'Registered Users', value: data.users.length, color: '#38bdf8' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: `1px solid ${stat.color}22` }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                borderBottom: tab === t.key ? '2px solid #6366f1' : '2px solid transparent',
                color: tab === t.key ? '#6366f1' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: tab === t.key ? 600 : 400,
                marginBottom: '-1px',
              }}
            >
              {t.label}
              <span style={{ marginLeft: '8px', background: '#1e293b', borderRadius: '10px', padding: '2px 8px', fontSize: '12px' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Submissions Tab */}
        {tab === 'submissions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.submissions.length === 0 && <p style={{ color: '#64748b' }}>No submissions yet.</p>}
            {data.submissions.map(s => (
              <div key={s.id} style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{s.name}</div>
                    <a href={`mailto:${s.email}`} style={{ color: '#6366f1', fontSize: '14px', textDecoration: 'none' }}>{s.email}</a>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{s.service}</span>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{s.budget}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: `${statusColors[s.status]}22`, color: statusColors[s.status] ?? '#94a3b8' }}>
                      {s.status}
                    </span>
                    <select
                      value={s.status}
                      disabled={updating === s.id}
                      onChange={e => updateStatus('submission', s.id, e.target.value)}
                      style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}
                    >
                      {SUBMISSION_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '12px', padding: '12px', background: '#0f172a', borderRadius: '8px', fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {s.message}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects Tab */}
        {tab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.projects.length === 0 && <p style={{ color: '#64748b' }}>No projects yet.</p>}
            {data.projects.map(p => (
              <div key={p.id} style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{p.title}</div>
                    {p.user && (
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                        {p.user.name ?? 'Unknown'} · <a href={`mailto:${p.user.email}`} style={{ color: '#6366f1', textDecoration: 'none' }}>{p.user.email}</a>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{p.service}</span>
                      {p.budget && <span style={{ fontSize: '13px', color: '#94a3b8' }}>{p.budget}</span>}
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: `${statusColors[p.status]}22`, color: statusColors[p.status] ?? '#94a3b8' }}>
                      {p.status.replace('_', ' ')}
                    </span>
                    <select
                      value={p.status}
                      disabled={updating === p.id}
                      onChange={e => updateStatus('project', p.id, e.target.value)}
                      style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}
                    >
                      {PROJECT_STATUSES.map(st => <option key={st} value={st}>{st.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
                {p.description && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#0f172a', borderRadius: '8px', fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
                    {p.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.users.length === 0 && <p style={{ color: '#64748b' }}>No users yet.</p>}
            {data.users.map(u => (
              <div key={u.id} style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>{u.name ?? 'No name'}</div>
                  <a href={`mailto:${u.email}`} style={{ color: '#6366f1', fontSize: '14px', textDecoration: 'none' }}>{u.email}</a>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                  background: u.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'rgba(148,163,184,0.1)',
                  color: u.role === 'admin' ? '#818cf8' : '#94a3b8',
                }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
