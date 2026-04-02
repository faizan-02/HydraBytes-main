'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', maxWidth: '480px' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
        >
          <CheckCircle size={40} color="#4ade80" />
        </motion.div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>
          Thank you for your payment. Your invoice has been marked as paid and our team has been notified.
        </p>
        <Link href="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px' }}>
          Go to Dashboard →
        </Link>
      </motion.div>
    </div>
  );
}
