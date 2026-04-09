'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, Trash2, ArrowLeft, Eye, EyeOff, Save, AlertTriangle, Phone, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/lib/ThemeContext';

type Tab = 'account' | 'security' | 'danger';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === 'dark';
  const [tab, setTab] = useState<Tab>('account');

  // Name
  const [name, setName] = useState('');
  const [displayedName, setDisplayedName] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Contact info
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMsg, setContactMsg] = useState<{ text: string; ok: boolean } | null>(null);

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

  const isOAuth = !(session.user as { hasPassword?: boolean })?.hasPassword;
  const currentName = displayedName ?? session.user?.name ?? '';
  const initials = currentName ? currentName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const cardBg      = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder  = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0';
  const tabsBg      = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const inputBg     = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const inputBorderDefault = isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1';
  const inputColor  = 'var(--text-primary)';
  const labelColor  = 'var(--text-secondary)';
  const readonlyBg  = isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9';
  const dangerCardBg = isDark ? 'rgba(239,68,68,0.04)' : '#fff5f5';
  const dangerCardBorder = isDark ? '1px solid rgba(239,68,68,0.2)' : '1px solid #fecaca';
  const oauthNoteBg  = isDark ? 'rgba(99,102,241,0.06)' : '#f0f0ff';
  const oauthNoteBorder = isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid #c7d2fe';
  // ─────────────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: `1.5px solid ${inputBorderDefault}`,
    background: inputBg,
    color: inputColor,
    fontSize: '14px', outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true); setNameMsg(null);
    const res = await fetch('/api/user/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_name', name }),
    });
    const data = await res.json();
    setNameLoading(false);
    if (res.ok) { setNameMsg({ text: 'Name updated successfully.', ok: true }); setDisplayedName(name.trim()); setName(''); await update({ name: name.trim() }); }
    else { setNameMsg({ text: data.error, ok: false }); }
  }

  async function handleContactSave(e: React.FormEvent) {
    e.preventDefault();
    setContactLoading(true); setContactMsg(null);
    const res = await fetch('/api/user/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_profile', phone, company }),
    });
    const data = await res.json();
    setContactLoading(false);
    if (res.ok) { setContactMsg({ text: 'Contact info updated successfully.', ok: true }); setPhone(''); setCompany(''); }
    else { setContactMsg({ text: data.error, ok: false }); }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPassLoading(true); setPassMsg(null);
    const res = await fetch('/api/user/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_password', currentPassword, newPassword }),
    });
    const data = await res.json();
    setPassLoading(false);
    if (res.ok) { setPassMsg({ text: 'Password updated successfully.', ok: true }); setCurrentPassword(''); setNewPassword(''); }
    else { setPassMsg({ text: data.error, ok: false }); }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') return;
    setDeleteLoading(true); setDeleteMsg(null);
    const res = await fetch('/api/user/settings', { method: 'DELETE' });
    if (res.ok) { await signOut({ callbackUrl: '/' }); }
    else { const data = await res.json(); setDeleteMsg(data.error); setDeleteLoading(false); }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'account',  label: 'Account',     icon: <User size={15} /> },
    { id: 'security', label: 'Security',    icon: <Lock size={15} /> },
    { id: 'danger',   label: 'Danger Zone', icon: <Trash2 size={15} /> },
  ];

  const saveBtn = (disabled: boolean, label: string, loadingLabel: string, isLoading: boolean, icon: React.ReactNode) => (
    <button type="submit" disabled={disabled}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, transition: 'opacity 0.2s' }}>
      {icon} {isLoading ? loadingLabel : label}
    </button>
  );

  const fieldLabel = (text: string) => (
    <label style={{ fontSize: '13px', fontWeight: 500, color: labelColor, display: 'block', marginBottom: '6px' }}>{text}</label>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', maxWidth: '680px', margin: '0 auto' }}>
      {/* Back link */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </div>

      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Account Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '2px 0 0' }}>{session.user?.email}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', background: tabsBg, borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.15s',
              background: tab === t.id ? (t.id === 'danger' ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)') : 'transparent',
              color: tab === t.id ? (t.id === 'danger' ? '#ef4444' : '#6366f1') : 'var(--text-secondary)',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Account Tab ── */}
        {tab === 'account' && (<>
          {/* Display Name */}
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '16px', padding: '24px', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <User size={16} color="#6366f1" /> Display Name
            </h2>
            <form onSubmit={handleNameSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                {fieldLabel('Current name')}
                <div style={{ ...inputStyle, background: readonlyBg, color: 'var(--text-secondary)', cursor: 'default' }}>
                  {displayedName ?? session.user?.name ?? '—'}
                </div>
              </div>
              <div>
                {fieldLabel('New name')}
                <input style={inputStyle} value={name} onChange={e => setName(e.target.value)}
                  placeholder="Enter new display name" maxLength={100}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = inputBorderDefault)} />
              </div>
              {nameMsg && <p style={{ fontSize: '13px', color: nameMsg.ok ? '#16a34a' : '#ef4444', margin: 0 }}>{nameMsg.text}</p>}
              {saveBtn(nameLoading || !name.trim(), 'Save Name', 'Saving…', nameLoading, <Save size={14} />)}
            </form>
          </div>

          {/* Contact Information */}
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '16px', padding: '24px', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Phone size={16} color="#6366f1" /> Contact Information
            </h2>
            <form onSubmit={handleContactSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                {fieldLabel('Phone number')}
                <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000" maxLength={20}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = inputBorderDefault)} />
              </div>
              <div>
                {fieldLabel('Company / Organization')}
                <input style={inputStyle} value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="Acme Corp, Freelancer, etc." maxLength={100}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = inputBorderDefault)} />
              </div>
              {contactMsg && <p style={{ fontSize: '13px', color: contactMsg.ok ? '#16a34a' : '#ef4444', margin: 0 }}>{contactMsg.text}</p>}
              {saveBtn(contactLoading || (!phone.trim() && !company.trim()), 'Save Contact Info', 'Saving…', contactLoading, <Building2 size={14} />)}
            </form>
          </div>
        </>)}

        {/* ── Security Tab ── */}
        {tab === 'security' && (
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '16px', padding: '24px', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Lock size={16} color="#6366f1" /> Change Password
            </h2>
            {isOAuth ? (
              <div style={{ padding: '14px 16px', background: oauthNoteBg, border: oauthNoteBorder, borderRadius: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                You signed in with Google or GitHub. Password management is handled by your social login provider.
              </div>
            ) : (
              <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  {fieldLabel('Current password')}
                  <div style={{ position: 'relative' }}>
                    <input type={showCurrent ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '42px' }}
                      value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      onFocus={e => (e.target.style.borderColor = '#6366f1')}
                      onBlur={e => (e.target.style.borderColor = inputBorderDefault)} />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}>
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  {fieldLabel('New password')}
                  <div style={{ position: 'relative' }}>
                    <input type={showNew ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '42px' }}
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      onFocus={e => (e.target.style.borderColor = '#6366f1')}
                      onBlur={e => (e.target.style.borderColor = inputBorderDefault)} />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}>
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {passMsg && <p style={{ fontSize: '13px', color: passMsg.ok ? '#16a34a' : '#ef4444', margin: 0 }}>{passMsg.text}</p>}
                {saveBtn(passLoading || !currentPassword || !newPassword, 'Update Password', 'Updating…', passLoading, <Save size={14} />)}
              </form>
            )}
          </div>
        )}

        {/* ── Danger Zone Tab ── */}
        {tab === 'danger' && (
          <div style={{ background: dangerCardBg, border: dangerCardBorder, borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
              <AlertTriangle size={16} /> Delete Account
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.6 }}>
              This will permanently delete your account, all projects, and invoices. This action <strong style={{ color: 'var(--text-primary)' }}>cannot be undone</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                {fieldLabel('')}
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Type <strong style={{ color: '#dc2626' }}>DELETE</strong> to confirm
                </label>
                <input
                  style={{ ...inputStyle, borderColor: deleteConfirm === 'DELETE' ? '#dc2626' : inputBorderDefault }}
                  value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  onFocus={e => (e.target.style.borderColor = '#dc2626')}
                  onBlur={e => (e.target.style.borderColor = deleteConfirm === 'DELETE' ? '#dc2626' : inputBorderDefault)} />
              </div>
              {deleteMsg && <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{deleteMsg}</p>}
              <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', background: deleteConfirm === 'DELETE' ? '#dc2626' : (isDark ? 'rgba(239,68,68,0.1)' : '#fee2e2'), color: deleteConfirm === 'DELETE' ? '#fff' : '#dc2626', border: `1px solid ${deleteConfirm === 'DELETE' ? '#dc2626' : '#fca5a5'}`, borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: deleteConfirm !== 'DELETE' || deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteConfirm !== 'DELETE' || deleteLoading ? 0.6 : 1, transition: 'all 0.2s' }}>
                <Trash2 size={14} /> {deleteLoading ? 'Deleting…' : 'Delete My Account'}
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
