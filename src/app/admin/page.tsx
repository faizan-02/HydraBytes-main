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

interface Invoice {
  id: string;
  amount: number;
  status: string;
  dueDate?: string;
  paymentRef?: string;
  paymentMethod?: string;
  createdAt: string;
  user: { name?: string; email: string };
  project?: { title: string };
}

interface InvoiceForm {
  amount: string;
  dueDate: string;
  description: string;
}

const PROJECT_STATUSES = ['pending_verification', 'accepted', 'declined', 'planning', 'in_progress', 'review', 'completed'];
const SUBMISSION_STATUSES = ['new', 'contacted', 'closed'];
const INVOICE_ELIGIBLE_STATUSES = ['accepted', 'in_progress', 'completed'];

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

type Tab = 'submissions' | 'projects' | 'invoices' | 'users';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('submissions');
  const [data, setData] = useState<{ submissions: Submission[]; projects: Project[]; users: User[]; invoices: Invoice[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Invoice form state: keyed by projectId
  const [invoiceForms, setInvoiceForms] = useState<Record<string, InvoiceForm | null>>({});
  const [invoiceSubmitting, setInvoiceSubmitting] = useState<string | null>(null);
  const [invoiceSuccess, setInvoiceSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/auth/signin'); return; }
    if (status === 'authenticated' && (session.user as { role?: string })?.role !== 'admin') { router.replace('/dashboard'); return; }
    if (status === 'authenticated') fetchData();
  }, [status, session]);

  async function fetchData() {
    setLoading(true);
    const res = await fetch('/api/admin');
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  async function updateStatus(type: 'project' | 'submission' | 'invoice', id: string, newStatus: string) {
    setUpdating(id);
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, status: newStatus }),
    });
    await fetchData();
    setUpdating(null);
  }

  function toggleInvoiceForm(projectId: string) {
    setInvoiceForms(prev => ({
      ...prev,
      [projectId]: prev[projectId] ? null : { amount: '', dueDate: '', description: '' },
    }));
    setInvoiceSuccess(prev => prev === projectId ? null : prev);
  }

  async function submitInvoice(project: Project) {
    const form = invoiceForms[project.id];
    if (!form) return;

    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;

    // We need userId — find from data.users by matching project.user.email
    const user = data?.users.find(u => u.email === project.user?.email);
    if (!user) return;

    setInvoiceSubmitting(project.id);
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        userId: user.id,
        amount,
        dueDate: form.dueDate || undefined,
        description: form.description || undefined,
      }),
    });

    setInvoiceSubmitting(null);

    if (res.ok) {
      setInvoiceSuccess(project.id);
      setInvoiceForms(prev => ({ ...prev, [project.id]: null }));
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ color: '#6366f1', fontSize: '18px' }}>Loading admin panel...</div>
      </div>
    );
  }

  if (!data) return null;

  const pendingPayments = data.invoices?.filter(i => i.status === 'under_review').length ?? 0;

  const tabs: { key: Tab; label: string; count: number; alert?: boolean }[] = [
    { key: 'submissions', label: 'Contact Submissions', count: data.submissions.length },
    { key: 'projects', label: 'Projects', count: data.projects.length },
    { key: 'invoices', label: 'Invoices', count: data.invoices?.length ?? 0, alert: pendingPayments > 0 },
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
                position: 'relative' as const,
              }}
            >
              {t.label}
              <span style={{ marginLeft: '8px', background: t.alert ? 'rgba(251,191,36,0.2)' : '#1e293b', color: t.alert ? '#fbbf24' : 'inherit', borderRadius: '10px', padding: '2px 8px', fontSize: '12px', fontWeight: t.alert ? 700 : 400 }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                    {INVOICE_ELIGIBLE_STATUSES.includes(p.status) && p.user && (
                      <button
                        onClick={() => toggleInvoiceForm(p.id)}
                        style={{
                          padding: '6px 14px',
                          background: invoiceForms[p.id] ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
                          border: `1px solid ${invoiceForms[p.id] ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`,
                          color: invoiceForms[p.id] ? '#ef4444' : '#818cf8',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {invoiceForms[p.id] ? 'Cancel' : '+ Add Invoice'}
                      </button>
                    )}
                  </div>
                </div>

                {p.description && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#0f172a', borderRadius: '8px', fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
                    {p.description}
                  </div>
                )}

                {/* Invoice success message */}
                {invoiceSuccess === p.id && (
                  <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', fontSize: '14px', color: '#4ade80' }}>
                    ✓ Invoice created and email sent to {p.user?.email}.
                  </div>
                )}

                {/* Invoice form */}
                {invoiceForms[p.id] && (
                  <div style={{ marginTop: '16px', padding: '20px', background: '#0f172a', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#818cf8' }}>
                      New Invoice for {p.title}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                          Amount (USD) *
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="e.g. 1500"
                          value={invoiceForms[p.id]?.amount ?? ''}
                          onChange={e => setInvoiceForms(prev => ({
                            ...prev,
                            [p.id]: { ...prev[p.id]!, amount: e.target.value },
                          }))}
                          style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                          Due Date (optional)
                        </label>
                        <input
                          type="date"
                          value={invoiceForms[p.id]?.dueDate ?? ''}
                          onChange={e => setInvoiceForms(prev => ({
                            ...prev,
                            [p.id]: { ...prev[p.id]!, dueDate: e.target.value },
                          }))}
                          style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', colorScheme: 'dark' }}
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                          Description (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Initial deposit for development"
                          value={invoiceForms[p.id]?.description ?? ''}
                          onChange={e => setInvoiceForms(prev => ({
                            ...prev,
                            [p.id]: { ...prev[p.id]!, description: e.target.value },
                          }))}
                          style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => submitInvoice(p)}
                      disabled={invoiceSubmitting === p.id || !invoiceForms[p.id]?.amount}
                      style={{
                        marginTop: '16px',
                        padding: '10px 24px',
                        background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: invoiceSubmitting === p.id ? 'not-allowed' : 'pointer',
                        opacity: invoiceSubmitting === p.id ? 0.7 : 1,
                      }}
                    >
                      {invoiceSubmitting === p.id ? 'Creating...' : 'Create Invoice & Send Email'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Invoices Tab */}
        {tab === 'invoices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(!data.invoices || data.invoices.length === 0) && <p style={{ color: '#64748b' }}>No invoices yet.</p>}
            {data.invoices?.map(inv => {
              const methodLabels: Record<string, string> = { easypaisa: 'Easypaisa', jazzcash: 'JazzCash', nayapay: 'NayaPay', bank: 'Bank Transfer' };
              const isUnderReview = inv.status === 'under_review';
              return (
                <div key={inv.id} style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: `1px solid ${isUnderReview ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '16px' }}>{inv.project?.title ?? 'General Invoice'}</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                        {inv.user.name ?? 'Unknown'} · <a href={`mailto:${inv.user.email}`} style={{ color: '#6366f1', textDecoration: 'none' }}>{inv.user.email}</a>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        {new Date(inv.createdAt).toLocaleDateString()}
                        {inv.dueDate && ` · Due ${new Date(inv.dueDate).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: inv.status === 'paid' ? '#4ade80' : '#e2e8f0' }}>
                        ${inv.amount.toLocaleString()}
                      </span>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: inv.status === 'paid' ? 'rgba(74,222,128,0.15)' : isUnderReview ? 'rgba(251,191,36,0.15)' : 'rgba(148,163,184,0.1)', color: inv.status === 'paid' ? '#4ade80' : isUnderReview ? '#fbbf24' : '#94a3b8' }}>
                        {inv.status === 'under_review' ? '⏳ Under Review' : inv.status === 'paid' ? '✓ Paid' : inv.status}
                      </span>
                    </div>
                  </div>

                  {/* Payment reference submitted by client */}
                  {isUnderReview && inv.paymentRef && (
                    <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Payment submitted via {methodLabels[inv.paymentMethod ?? ''] ?? inv.paymentMethod}</div>
                      <div style={{ fontSize: '16px', fontFamily: 'monospace', fontWeight: 700, color: '#fbbf24', marginBottom: '14px' }}>
                        Ref: {inv.paymentRef}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          disabled={updating === inv.id}
                          onClick={() => updateStatus('invoice', inv.id, 'paid')}
                          style={{ padding: '8px 20px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {updating === inv.id ? 'Updating...' : '✓ Mark as Paid'}
                        </button>
                        <button
                          disabled={updating === inv.id}
                          onClick={() => updateStatus('invoice', inv.id, 'pending')}
                          style={{ padding: '8px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {inv.status === 'paid' && inv.paymentRef && (
                    <div style={{ marginTop: '10px', fontSize: '13px', color: '#64748b' }}>
                      Paid via {methodLabels[inv.paymentMethod ?? ''] ?? inv.paymentMethod} · Ref: <span style={{ fontFamily: 'monospace' }}>{inv.paymentRef}</span>
                    </div>
                  )}
                </div>
              );
            })}
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
