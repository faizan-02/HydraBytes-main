export const metadata = { title: 'Privacy Policy — HydraBytes' };

const EFFECTIVE_DATE = 'April 2, 2026';
const EMAIL = 'hydrabytes4@gmail.com';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px', lineHeight: 1.8, color: 'var(--text-primary)' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>Effective date: {EFFECTIVE_DATE}</p>

      <Section title="1. Information We Collect">
        <p>We collect information you provide directly to us, including:</p>
        <ul>
          <li><strong>Account information:</strong> name, email address, and password when you register.</li>
          <li><strong>Project information:</strong> details about your project, budget, service requirements, and messages.</li>
          <li><strong>Payment information:</strong> transaction references submitted for payment verification. We do not store card numbers or full banking credentials.</li>
          <li><strong>Communications:</strong> emails and messages you send to us.</li>
        </ul>
        <p>When you sign in with Google or GitHub, we receive your name and email address from those services.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul>
          <li>To create and manage your account</li>
          <li>To process and manage your project requests</li>
          <li>To send invoices, project updates, and service-related communications</li>
          <li>To send our newsletter (only if you subscribed)</li>
          <li>To improve our services and website</li>
        </ul>
        <p>We do not sell, rent, or trade your personal information to third parties.</p>
      </Section>

      <Section title="3. Third-Party Services">
        <p>We use the following third-party services that may process your data:</p>
        <ul>
          <li><strong>Vercel</strong> — website hosting</li>
          <li><strong>Neon</strong> — database storage</li>
          <li><strong>Resend</strong> — transactional email delivery</li>
          <li><strong>Google / GitHub OAuth</strong> — optional sign-in</li>
          <li><strong>Paddle</strong> — international payment processing (if applicable)</li>
        </ul>
        <p>Each of these services has its own privacy policy governing their data practices.</p>
      </Section>

      <Section title="4. Cookies">
        <p>We use session cookies solely for authentication purposes (to keep you signed in). We do not use tracking cookies or advertising cookies. You can disable cookies in your browser settings, but this will prevent you from signing in.</p>
      </Section>

      <Section title="5. Data Security">
        <p>We implement industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and secure token-based authentication. However, no method of transmission over the internet is 100% secure.</p>
      </Section>

      <Section title="6. Data Retention">
        <p>We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us.</p>
      </Section>

      <Section title="7. Your Rights">
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate personal data</li>
          <li>Request deletion of your personal data</li>
          <li>Unsubscribe from marketing emails at any time</li>
        </ul>
        <p>To exercise these rights, contact us at <a href={`mailto:${EMAIL}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>{EMAIL}</a>.</p>
      </Section>

      <Section title="8. Children's Privacy">
        <p>Our services are not directed to individuals under 16 years of age. We do not knowingly collect personal information from children.</p>
      </Section>

      <Section title="9. Changes to This Policy">
        <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or a notice on our website. Continued use of our services after changes constitutes acceptance.</p>
      </Section>

      <Section title="10. Contact">
        <p>For privacy-related questions or requests, contact us at <a href={`mailto:${EMAIL}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>{EMAIL}</a>.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '36px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>{title}</h2>
      <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>{children}</div>
    </section>
  );
}
