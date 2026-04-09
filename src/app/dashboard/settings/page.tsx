'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, Trash2, ArrowLeft, Eye, EyeOff, Save, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type Tab = 'account' | 'security' | 'danger';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('account');

  // Name
  const [name, setName] = useState('');
  const [displayedName, setDisplayedName] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!session) { router.push('/auth/signin'); return null; }

  const isOAuth = !(session.user as { role?: string; id?: string } & typeof session.user & { hasPassword?: boolean })?.hasPassword;
  const currentName = displayedName ?? session.user?.name ?? '';
  const initials = currentName ? currentName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true);
    setNameMsg(null);
    const res = await fetch('/api/user/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_name', name }),
    });
    const data = await res.json();
    setNameLoading(false);
    if (res.ok) {
      setNameMsg({ text: 'Name updated successfully.', ok: true });
      setDisplayedName(name.trim());
      setName('');
      await update({ name: name.trim() });
    } else {
      setNameMsg({ text: data.error, ok: false });
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg(null);
    const res = await fetch('/api/user/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_password', currentPassword, newPassword }),
    });
    const data = await res.json();
    setPassLoading(false);
    if (res.ok) {
      setPassMsg({ text: 'Password updated successfully.', ok: true });
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setPassMsg({ text: data.error, ok: false });
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') return;
    setDeleteLoading(true);
    setDeleteMsg(null);
    const res = await fetch('/api/user/settings', { method: 'DELETE' });
    if (res.ok) {
      await signOut({ callbackUrl: '/' });
    } else {
      const data = await res.json();
      setDeleteMsg(data.error);
      setDeleteLoading(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Account', icon: <User size={15} /> },
    { id: 'security', label: 'Security', icon: <Lock size={15} /> },
    { id: 'danger', label: 'Danger Zone', icon: <Trash2 size={15} /> },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-primary, #f0f0f5)', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary, #9ca3af)', fontSize: '14px', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Account Settings</h1>
          <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '14px', margin: '2px 0 0' }}>{session.user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.15s',
              background: tab === t.id ? (t.id === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)') : 'transparent',
              color: tab === t.id ? (t.id === 'danger' ? '#ef4444' : '#818cf8') : 'var(--text-secondary, #9ca3af)',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

        {/* ── Account Tab ── */}
        {tab === 'account' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="#6366f1" /> Display Name
            </h2>
            <form onSubmit={handleNameSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary, #9ca3af)', display: 'block', marginBottom: '6px' }}>
                  Current name
                </label>
                <div style={{ ...inputStyle, color: 'var(--text-secondary, #9ca3af)', cursor: 'default' }}>
                  {displayedName ?? session.user?.name ?? '—'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary, #9ca3af)', display: 'block', marginBottom: '6px' }}>
                  New name
                </label>
                <input style={inputStyle} value={name} onChange={e => setName(e.target.value)}
                  placeholder="Enter new display name" maxLength={100}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </div>
              {nameMsg && (
                <p style={{ fontSize: '13px', color: nameMsg.ok ? '#4ade80' : '#ef4444', margin: 0 }}>{nameMsg.text}</p>
              )}
              <button type="submit" disabled={nameLoading || !name.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: nameLoading || !name.trim() ? 'not-allowed' : 'pointer', opacity: nameLoading || !name.trim() ? 0.6 : 1 }}>
                <Save size={14} /> {nameLoading ? 'Saving...' : 'Save Name'}
              </button>
            </form>
          </div>
        )}

        {/* ── Security Tab ── */}
        {tab === 'security' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#6366f1" /> Change Password
            </h2>

            {isOAuth ? (
              <div style={{ padding: '16px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', fontSize: '14px', color: 'var(--text-secondary, #9ca3af)' }}>
                You signed in with Google or GitHub. Password management is handled by your social login provider.
              </div>
            ) : (
              <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary, #9ca3af)', display: 'block', marginBottom: '6px' }}>Current password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showCurrent ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '40px' }}
                      value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      onFocus={e => (e.target.style.borderColor = '#6366f1')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary, #9ca3af)', display: 'flex' }}>
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary, #9ca3af)', display: 'block', marginBottom: '6px' }}>New password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showNew ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '40px' }}
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      onFocus={e => (e.target.style.borderColor = '#6366f1')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary, #9ca3af)', display: 'flex' }}>
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {passMsg && (
                  <p style={{ fontSize: '13px', color: passMsg.ok ? '#4ade80' : '#ef4444', margin: 0 }}>{passMsg.text}</p>
                )}
                <button type="submit" disabled={passLoading || !currentPassword || !newPassword}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: passLoading || !currentPassword || !newPassword ? 'not-allowed' : 'pointer', opacity: passLoading || !currentPassword || !newPassword ? 0.6 : 1 }}>
                  <Save size={14} /> {passLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Danger Zone Tab ── */}
        {tab === 'danger' && (
          <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
              <AlertTriangle size={16} /> Delete Account
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #9ca3af)', margin: '0 0 20px', lineHeight: 1.6 }}>
              This will permanently delete your account, all projects, and invoices. This action <strong style={{ color: '#f0f0f5' }}>cannot be undone</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary, #9ca3af)', display: 'block', marginBottom: '6px' }}>
                  Type <strong style={{ color: '#ef4444' }}>DELETE</strong> to confirm
                </label>
                <input style={{ ...inputStyle, borderColor: deleteConfirm === 'DELETE' ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                  value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  onFocus={e => (e.target.style.borderColor = '#ef4444')}
                  onBlur={e => (e.target.style.borderColor = deleteConfirm === 'DELETE' ? '#ef4444' : 'rgba(255,255,255,0.1)')} />
              </div>
              {deleteMsg && <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{deleteMsg}</p>}
              <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', background: deleteConfirm === 'DELETE' ? '#ef4444' : 'rgba(239,68,68,0.1)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: deleteConfirm !== 'DELETE' || deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteConfirm !== 'DELETE' || deleteLoading ? 0.6 : 1, transition: 'all 0.2s' }}>
                <Trash2 size={14} /> {deleteLoading ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
