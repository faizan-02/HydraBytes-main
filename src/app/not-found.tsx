import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          fontSize: '96px', fontWeight: 800, lineHeight: 1,
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
        }}>
          404
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '15px', lineHeight: 1.6, margin: '0 0 32px' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              display: 'inline-block', padding: '12px 28px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              color: '#fff', textDecoration: 'none', borderRadius: '10px',
              fontWeight: 600, fontSize: '15px',
            }}
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            style={{
              display: 'inline-block', padding: '12px 28px',
              border: '1.5px solid rgba(255,255,255,0.12)',
              color: 'var(--text-primary, #f0f0f5)', textDecoration: 'none',
              borderRadius: '10px', fontWeight: 600, fontSize: '15px',
            }}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
