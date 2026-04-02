'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FolderOpen, FileText, MessageSquare, LogOut, Clock, CheckCircle, AlertCircle, Loader, ShieldCheck } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  service: string;
  status: string;
  budget?: string;
  description?: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  dueDate?: string;
  createdAt: string;
  paymentRef?: string;
  paymentMethod?: string;
  projectId?: string;
  project?: { title: string };
}

const CALENDLY = 'https://calendly.com/faizanjawad02/30min';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending_verification: { label: 'Pending Review',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', icon: <Clock size={13} /> },
  accepted:             { label: 'Accepted',         color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: <ShieldCheck size={13} /> },
  declined:             { label: 'Declined',         color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: <AlertCircle size={13} /> },
  in_progress:          { label: 'In Progress',      color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', icon: <Loader size={13} /> },
  planning:             { label: 'Planning',         color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',icon: <Clock size={13} /> },
  review:               { label: 'In Review',        color: '#fb923c', bg: 'rgba(251,146,60,0.1)', icon: <AlertCircle size={13} /> },
  completed:            { label: 'Completed',        color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: <CheckCircle size={13} /> },
};

const TIMELINE = ['pending_verification', 'accepted', 'in_progress', 'completed'];
const timelineLabels: Record<string, string> = {
  pending_verification: 'Submitted',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/dashboard')
        .then(r => r.json())
        .then(data => {
          setProjects(data.projects || []);
          setInvoices(data.invoices || []);
          setLoading(false);
        });
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!session) return null;

  const initials = session.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() ?? 'U';
  const activeProjects = projects.filter(p => !['completed'].includes(p.status)).length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const pendingInvoices = invoices.filter(i => i.status === 'pending').length;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Welcome back, {session.user?.name?.split(' ')[0]}!</h1>
            <p style={{ color: 'var(--muted, #9ca3af)', fontSize: '14px', margin: '2px 0 0' }}>{session.user?.email}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Active Projects',    value: activeProjects,    icon: <FolderOpen size={20} />,    color: '#6366f1' },
          { label: 'Completed Projects', value: completedProjects, icon: <CheckCircle size={20} />,   color: '#4ade80' },
          { label: 'Pending Invoices',   value: pendingInvoices,   icon: <FileText size={20} />,      color: '#fbbf24' },
          { label: 'Support Tickets',    value: 0,                 icon: <MessageSquare size={20} />, color: '#38bdf8' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted, #9ca3af)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FolderOpen size={18} color="#6366f1" /> My Projects
          </h2>
          <a href="/contact" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none' }}>+ Start New Project</a>
        </div>

        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <FolderOpen size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: '12px' }} />
            <p style={{ color: 'var(--muted, #9ca3af)', margin: '0 0 16px' }}>No projects yet. Submit a request to get started.</p>
            <a href="/contact" className="btn btn-primary" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>
              Submit a Project Request →
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map(project => {
              const s = statusConfig[project.status] ?? statusConfig.planning;
              const pendingInvoice = invoices.find(i => i.projectId === project.id && i.status === 'pending');
              const underReviewInvoice = invoices.find(i => i.projectId === project.id && i.status === 'under_review');
              return (
                <div key={project.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{project.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--muted, #9ca3af)', marginTop: '2px' }}>
                        {project.service} {project.budget && `· ${project.budget}`}
                      </div>
                      {project.description && (
                        <div style={{ fontSize: '13px', color: 'var(--muted, #9ca3af)', marginTop: '6px', fontStyle: 'italic', maxWidth: '500px' }}>
                          &ldquo;{project.description.substring(0, 100)}{project.description.length > 100 ? '...' : ''}&rdquo;
                        </div>
                      )}
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '999px', background: s.bg, color: s.color, fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {s.icon} {s.label}
                    </span>
                  </div>

                  {/* Status Timeline */}
                  {project.status !== 'declined' && (
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '0' }}>
                      {TIMELINE.map((step, i) => {
                        const currentIdx = TIMELINE.indexOf(project.status);
                        const isDone = i <= currentIdx;
                        const isCurrent = i === currentIdx;
                        return (
                          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < TIMELINE.length - 1 ? 1 : 'none' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isDone ? '#6366f1' : 'rgba(255,255,255,0.1)', border: isCurrent ? '2px solid #06b6d4' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                {isDone && '✓'}
                              </div>
                              <span style={{ fontSize: '10px', color: isDone ? '#a5b4fc' : '#475569', whiteSpace: 'nowrap' }}>{timelineLabels[step]}</span>
                            </div>
                            {i < TIMELINE.length - 1 && (
                              <div style={{ flex: 1, height: '2px', background: i < currentIdx ? '#6366f1' : 'rgba(255,255,255,0.08)', margin: '0 4px', marginBottom: '16px' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {project.status === 'pending_verification' && (
                    <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '8px', fontSize: '13px', color: '#fbbf24' }}>
                      ⏳ Your project is under review. We&apos;ll notify you by email once it&apos;s accepted. For urgent queries:{' '}
                      <a href="https://wa.me/923239999000" target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80', fontWeight: 600 }}>WhatsApp us →</a>
                    </div>
                  )}

                  {project.status === 'accepted' && (
                    <div style={{ marginTop: '12px', padding: '16px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#4ade80' }}>🎉 Your project has been accepted! Our team will reach out within 24 hours. Want to connect sooner?</p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg,#6366f1,#06b6d4)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                          📅 Book a Free Consultation
                        </a>
                        <a href="https://wa.me/923239999000" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#25d366', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                          💬 WhatsApp Us
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Payment prompt for completed projects with pending invoice */}
                  {project.status === 'completed' && pendingInvoice && (
                    <div style={{ marginTop: '16px', padding: '20px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                        <div>
                          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#a5b4fc' }}>🎉 Project Complete — Payment Required</p>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted, #9ca3af)' }}>
                            Amount due: <strong style={{ color: '#f0f0f5' }}>${pendingInvoice.amount.toLocaleString()}</strong>
                            {pendingInvoice.dueDate && ` · Due ${new Date(pendingInvoice.dueDate).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <a href={`/payment/local/${pendingInvoice.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
                          📱 Pay via Local Transfer
                        </a>
                        <a href={`/payment/local/${pendingInvoice.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'rgba(38,161,123,0.15)', border: '1px solid rgba(38,161,123,0.3)', color: '#26a17b', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
                          ₮ Pay via Crypto (USDT)
                        </a>
                      </div>
                    </div>
                  )}

                  {project.status === 'completed' && underReviewInvoice && (
                    <div style={{ marginTop: '16px', padding: '14px 16px', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '10px', fontSize: '13px', color: '#38bdf8' }}>
                      ⏳ Payment submitted and under review · Ref: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{underReviewInvoice.paymentRef}</span>
                    </div>
                  )}

                  {project.status === 'completed' && invoices.some(i => i.projectId === project.id && i.status === 'paid') && (
                    <div style={{ marginTop: '16px', padding: '14px 16px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '10px', fontSize: '13px', color: '#4ade80' }}>
                      ✓ Payment received — thank you! We hope to work with you again.
                    </div>
                  )}

                  {project.status === 'declined' && (
                    <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', fontSize: '13px', color: '#ef4444' }}>
                      ❌ This project was not accepted. You can{' '}
                      <a href="/contact" style={{ color: '#6366f1', fontWeight: 600 }}>submit a new request</a>{' '}
                      or{' '}
                      <a href="https://wa.me/923239999000" target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80', fontWeight: 600 }}>WhatsApp us</a>{' '}
                      to discuss further.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px' }}>
            <FileText size={18} color="#6366f1" /> Invoices
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invoices.map(inv => (
              <div key={inv.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{inv.project?.title ?? 'Invoice'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted, #9ca3af)', marginTop: '2px' }}>
                      {new Date(inv.createdAt).toLocaleDateString()}
                      {inv.dueDate && ` · Due ${new Date(inv.dueDate).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '16px' }}>${inv.amount.toLocaleString()}</span>
                    <span style={{
                      padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
                      background: inv.status === 'paid' ? 'rgba(74,222,128,0.1)' : inv.status === 'under_review' ? 'rgba(56,189,248,0.1)' : 'rgba(251,191,36,0.1)',
                      color: inv.status === 'paid' ? '#4ade80' : inv.status === 'under_review' ? '#38bdf8' : '#fbbf24',
                    }}>
                      {inv.status === 'under_review' ? 'Under Review' : inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </div>
                </div>
                {inv.status === 'pending' && (
                  <div style={{ marginTop: '12px' }}>
                    <a href={`/payment/local/${inv.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                      💳 Pay Now
                    </a>
                  </div>
                )}
                {inv.status === 'under_review' && inv.paymentRef && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '8px', fontSize: '13px', color: '#38bdf8' }}>
                    ⏳ Payment under review · Ref: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.paymentRef}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp CTA */}
      <div style={{ marginTop: '24px', padding: '24px', background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.15)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600 }}>Need help or have questions?</h3>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted, #9ca3af)' }}>Our team is available Mon–Sat, 8AM–8PM PST</p>
        </div>
        <a href="https://wa.me/923239999000" target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#25d366', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chat on WhatsApp
        </a>
      </div>

    </div>
  );
}
