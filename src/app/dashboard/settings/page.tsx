'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, Trash2, ArrowLeft, Eye, EyeOff, Save, AlertTriangle, Phone, Building2, Mail, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/lib/ThemeContext';

type Tab = 'account' | 'security' | 'danger';

interface ProfileData {
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === 'dark';
  const [tab, setTab] = useState<Tab>('account');

  // Profile data (fetched from API)
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Edit profile (name + phone + company)
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Email change
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [emailOtpPending, setEmailOtpPending] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');

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

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/user/settings')
      .then(r => r.json())
      .then((data: ProfileData) => {
        setProfileData(data);
        setEditName(data.name ?? '');
        setEditPhone(data.phone ?? '');
        setEditCompany(data.company ?? '');
      })
      .finally(() => setProfileLoading(false));
  }, [status]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!session) { router.push('/auth/signin'); return null; }

  const isOAuth = !(session.user as { hasPassword?: boolean })?.hasPassword;
  const displayName = profileData?.name ?? session.user?.name ?? '';
  const initials = displayName ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const cardBg      = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder  = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0';
  const tabsBg      = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const inputBg     = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
  const inputBorderDefault = isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1';
  const inputColor  = 'var(--text-primary)';
  const labelColor  = 'var(--text-secondary)';
  const readonlyBg  = isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9';
  const readonlyBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0';
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

  async function handleInfoSave(e: React.FormEvent) {
    e.preventDefault();
    setInfoLoading(true); setInfoMsg(null);
    const res = await fetch('/api/user/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_info', name: editName, phone: editPhone, company: editCompany }),
    });
    const data = await res.json();
    setInfoLoading(false);
    if (res.ok) {
      setInfoMsg({ text: 'Profile updated successfully.', ok: true });
      setProfileData(prev => prev ? { ...prev, name: editName || prev.name, phone: editPhone || prev.phone, company: editCompany || prev.company } : prev);
      if (data.updatedName) await update({ name: data.updatedName });
    } else {
      setInfoMsg({ text: data.error, ok: false });
    }
  }

  async function handleEmailSave(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true); setEmailMsg(null);
    const res = await fetch('/api/user/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_email', newEmail, currentPassword: emailPassword }),
    });
    const data = await res.json();
    setEmailLoading(false);
    if (res.ok && data.pending) {
      setEmailOtpPending(true);
      setEmailMsg({ text: `A 6-digit verification code was sent to ${newEmail}`, ok: true });
    } else {
      setEmailMsg({ text: data.error, ok: false });
    }
  }

  async function handleEmailOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true); setEmailMsg(null);
    const res = await fetch('/api/user/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_email_change', otp: emailOtp }),
    });
    const data = await res.json();
    setEmailLoading(false);
    if (res.ok) {
      setEmailMsg({ text: 'Email changed successfully. Signing you out…', ok: true });
      setTimeout(() => signOut({ callbackUrl: '/auth/signin' }), 500);
    } else {
      setEmailOtp('');
      setEmailMsg({ text: data.error, ok: false });
    }
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

  const overviewRow = (icon: React.ReactNode, label: string, value: string | null | undefined, placeholder = 'Not provided') => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
      <div style={{ marginTop: '1px', color: value ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1'), flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '14px', color: value ? 'var(--text-primary)' : (isDark ? 'rgba(255,255,255,0.25)' : '#9ca3af'), fontStyle: value ? 'normal' : 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || placeholder}
        </div>
      </div>
    </div>
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

          {/* Profile Overview */}
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '16px', padding: '24px', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <User size={16} color="#6366f1" /> Profile Overview
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>Your current account information</p>

            {profileLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <div style={{ width: 24, height: 24, border: '2px solid rgba(99,102,241,0.2)', borderTop: '2px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <div style={{ background: readonlyBg, border: readonlyBorder, borderRadius: '12px', padding: '4px 16px', overflow: 'hidden' }}>
                {overviewRow(<User size={15} />, 'Display Name', profileData?.name)}
                {overviewRow(<Mail size={15} />, 'Email Address', profileData?.email ?? session.user?.email)}
                {overviewRow(<Phone size={15} />, 'Phone Number', profileData?.phone)}
                <div style={{ borderBottom: 'none' }}>
                  {overviewRow(<Building2 size={15} />, 'Company / Organization', profileData?.company)}
                </div>
              </div>
            )}
          </div>

          {/* Edit Profile */}
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '16px', padding: '24px', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Pencil size={16} color="#6366f1" /> Edit Profile
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>Update your name, phone, and company details</p>
            <form onSubmit={handleInfoSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                {fieldLabel('Display name')}
                <input style={inputStyle} value={editName} onChange={e => setEditName(e.target.value)}
                  placeholder="Your full name" maxLength={100}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = inputBorderDefault)} />
              </div>
              <div>
                {fieldLabel('Phone number')}
                <input style={inputStyle} type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                  placeholder="+1 555 000 0000" maxLength={20}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = inputBorderDefault)} />
              </div>
              <div>
                {fieldLabel('Company / Organization')}
                <input style={inputStyle} value={editCompany} onChange={e => setEditCompany(e.target.value)}
                  placeholder="Acme Corp, Freelancer, etc." maxLength={100}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = inputBorderDefault)} />
              </div>
              {infoMsg && <p style={{ fontSize: '13px', color: infoMsg.ok ? '#16a34a' : '#ef4444', margin: 0 }}>{infoMsg.text}</p>}
              {saveBtn(infoLoading, 'Save Changes', 'Saving…', infoLoading, <Save size={14} />)}
            </form>
          </div>

          {/* Email Change — credentials users only */}
          {!isOAuth && (
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '16px', padding: '24px', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Mail size={16} color="#6366f1" /> Change Email Address
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
                {emailOtpPending ? `Enter the 6-digit code sent to ${newEmail}` : 'A verification code will be sent to your new email address'}
              </p>

              {!emailOtpPending ? (
                <form onSubmit={handleEmailSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    {fieldLabel('New email address')}
                    <input style={inputStyle} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                      placeholder="new@example.com"
                      onFocus={e => (e.target.style.borderColor = '#6366f1')}
                      onBlur={e => (e.target.style.borderColor = inputBorderDefault)} />
                  </div>
                  <div>
                    {fieldLabel('Current password (to confirm)')}
                    <div style={{ position: 'relative' }}>
                      <input type={showEmailPassword ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: '42px' }}
                        value={emailPassword} onChange={e => setEmailPassword(e.target.value)}
                        placeholder="Enter your current password"
                        onFocus={e => (e.target.style.borderColor = '#6366f1')}
                        onBlur={e => (e.target.style.borderColor = inputBorderDefault)} />
                      <button type="button" onClick={() => setShowEmailPassword(!showEmailPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}>
                        {showEmailPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  {emailMsg && <p style={{ fontSize: '13px', color: emailMsg.ok ? '#16a34a' : '#ef4444', margin: 0 }}>{emailMsg.text}</p>}
                  {saveBtn(emailLoading || !newEmail.trim() || !emailPassword, 'Send Verification Code', 'Sending…', emailLoading, <Mail size={14} />)}
                </form>
              ) : (
                <form onSubmit={handleEmailOtpVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    {fieldLabel('Verification code')}
                    <input style={{ ...inputStyle, letterSpacing: '6px', fontSize: '20px', fontWeight: 700, textAlign: 'center' }}
                      value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000" maxLength={6} inputMode="numeric"
                      onFocus={e => (e.target.style.borderColor = '#6366f1')}
                      onBlur={e => (e.target.style.borderColor = inputBorderDefault)} />
                  </div>
                  {emailMsg && <p style={{ fontSize: '13px', color: emailMsg.ok ? '#16a34a' : '#ef4444', margin: 0 }}>{emailMsg.text}</p>}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {saveBtn(emailLoading || emailOtp.length !== 6, 'Confirm Email Change', 'Verifying…', emailLoading, <Mail size={14} />)}
                    <button type="button" onClick={() => { setEmailOtpPending(false); setEmailOtp(''); setEmailMsg(null); }}
                      style={{ padding: '10px 16px', background: 'transparent', border: `1.5px solid ${inputBorderDefault}`, borderRadius: '10px', fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
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
