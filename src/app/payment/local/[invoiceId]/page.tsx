'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, AlertCircle } from 'lucide-react';

// ─── INTERNATIONAL PAYMENT METHODS ───────────────────────────────────────────
const INTERNATIONAL_METHODS = [
  {
    id: 'payoneer',
    name: 'Payoneer',
    icon: '🅿',
    color: '#ff4800',
    bg: 'rgba(255,72,0,0.08)',
    border: 'rgba(255,72,0,0.25)',
    fields: [
      { label: 'Payoneer Email', value: 'hydrabytes4@gmail.com' },
    ],
    instructions: 'Send payment via Payoneer to the email above ("Pay to Email" in your Payoneer account). Enter your Payoneer transaction ID below after sending.',
  },
  {
    id: 'usdt_trc20',
    name: 'USDT (TRC20)',
    icon: '₮',
    color: '#26a17b',
    bg: 'rgba(38,161,123,0.08)',
    border: 'rgba(38,161,123,0.25)',
    fields: [
      { label: 'Network', value: 'TRON (TRC20)' },
      { label: 'Wallet Address', value: 'TMwcAY6Qi23Crsm4YEuVpS2BKTmWaMNMgr' },
    ],
    instructions: 'Send USDT on the TRC20 (TRON) network only. Do NOT send on ERC20 or BEP20 — funds will be lost. After sending, enter the transaction hash below.',
  },
];
// ─── LOCAL PAYMENT METHODS ────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'easypaisa',
    name: 'Easypaisa',
    icon: '📱',
    logo: '/logos/easypaisa.png',
    color: '#00b04a',
    bg: 'rgba(0,176,74,0.08)',
    border: 'rgba(0,176,74,0.25)',
    fields: [
      { label: 'Account Number', value: '0323-9999000' },
      { label: 'Account Name',   value: 'Faizan Jawad Ahmed' },
    ],
    instructions: 'Send to the Easypaisa number above and enter your 11-digit transaction ID below.',
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    icon: '💜',
    logo: '/logos/jazzcash.png',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.25)',
    fields: [
      { label: 'Mobile Account', value: '0323-9999000' },
      { label: 'Account Name',   value: 'Faizan Jawad Ahmed' },
    ],
    instructions: 'Send via JazzCash mobile account and enter the transaction ID below.',
  },
  {
    id: 'nayapay',
    name: 'NayaPay',
    icon: '🟡',
    logo: '/logos/nayapay.png',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    fields: [
      { label: 'NayaPay ID / Phone', value: '0323-9999000' },
      { label: 'Account Name',       value: 'Faizan Jawad Ahmed' },
    ],
    instructions: 'Send via NayaPay and paste the reference number below.',
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: '🏦',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.25)',
    fields: [
      { label: 'Bank Name',    value: 'Meezan' },
      { label: 'Account No.', value: '032901018835102' },
      { label: 'IBAN',        value: 'PK47MEZN0003290108835102' },
      { label: 'Account Name', value: 'Faizan Jawad Ahmed' },
    ],
    instructions: 'Transfer the exact amount and use your name as the payment reference. Enter the transaction / transfer ID below.',
  },
];
// ──────────────────────────────────────────────────────────────────────────────

export default function LocalPaymentPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = use(params);
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const selectedMethod = [...INTERNATIONAL_METHODS, ...PAYMENT_METHODS].find(m => m.id === selected);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!selected || !transactionRef.trim()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch('/api/payment/local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, method: selected, transactionRef }),
    });

    setSubmitting(false);
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json();
      setError(data.error ?? 'Something went wrong. Please try again.');
    }
  };

  if (done) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={40} color="#4ade80" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px' }}>Payment Submitted!</h1>
          <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
            Your transaction reference has been received. Our team will verify the payment within a few hours and update your invoice status.
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn btn-primary" style={{ padding: '12px 28px' }}>
            Go to Dashboard →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', padding: '60px 20px', maxWidth: '640px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>Pay Invoice</h1>
        <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '15px', marginBottom: '32px' }}>
          Select your preferred payment method, send the amount, then submit your transaction reference below.
        </p>

        {/* International Methods */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary, #9ca3af)', marginBottom: '10px' }}>International</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {INTERNATIONAL_METHODS.map(method => (
              <button
                key={method.id}
                onClick={() => setSelected(method.id)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1.5px solid ${selected === method.id ? method.border : 'rgba(255,255,255,0.08)'}`,
                  background: selected === method.id ? method.bg : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '22px', fontWeight: 700, color: '#26a17b' }}>{method.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '14px', color: selected === method.id ? method.color : 'var(--text-primary, #f0f0f5)' }}>
                  {method.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Local Methods */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary, #9ca3af)', marginBottom: '10px' }}>Pakistan (Local)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => setSelected(method.id)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: `1.5px solid ${selected === method.id ? method.border : 'rgba(255,255,255,0.08)'}`,
                background: selected === method.id ? method.bg : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {method.logo
                ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '8px', padding: '4px 8px', height: '36px', boxSizing: 'border-box' }}>
                    <img src={method.logo} alt={method.name} style={{ height: '26px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                  </span>
                : <span style={{ fontSize: '24px' }}>{method.icon}</span>
              }
              <span style={{ fontWeight: 600, fontSize: '14px', color: selected === method.id ? method.color : 'var(--text-primary, #f0f0f5)' }}>
                {method.name}
              </span>
            </button>
          ))}
          </div>
        </div>

        {/* Account Details */}
        <AnimatePresence mode="wait">
          {selectedMethod && (
            <motion.div
              key={selectedMethod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ background: selectedMethod.bg, border: `1px solid ${selectedMethod.border}`, borderRadius: '16px', padding: '24px', marginBottom: '24px' }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: selectedMethod.color, marginBottom: '16px' }}>
                {selectedMethod.name} Account Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {selectedMethod.fields.map(field => (
                  <div key={field.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px 14px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary, #9ca3af)', marginBottom: '2px' }}>{field.label}</div>
                      <div style={{ fontWeight: 600, fontSize: '14px', fontFamily: 'monospace' }}>{field.value}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(field.value, field.label)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === field.label ? selectedMethod.color : 'var(--text-secondary, #9ca3af)', padding: '4px', borderRadius: '4px' }}
                    >
                      {copied === field.label ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary, #9ca3af)', margin: 0, lineHeight: 1.6 }}>
                💡 {selectedMethod.instructions}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction Reference Input */}
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
              Transaction Reference / ID *
            </label>
            <input
              type="text"
              placeholder="e.g. TXN123456789"
              value={transactionRef}
              onChange={e => setTransactionRef(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'inherit', fontSize: '15px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }}
            />

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !transactionRef.trim()}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', opacity: (!transactionRef.trim() || submitting) ? 0.5 : 1, cursor: (!transactionRef.trim() || submitting) ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? 'Submitting...' : '✅ Submit Payment Reference'}
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #9ca3af)', textAlign: 'center', marginTop: '12px' }}>
              Our team will verify your payment within a few hours and confirm via email.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
