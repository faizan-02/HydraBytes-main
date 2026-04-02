export const metadata = { title: 'Terms of Service — HydraBytes' };

const EFFECTIVE_DATE = 'April 2, 2026';
const EMAIL = 'hydrabytes4@gmail.com';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px', lineHeight: 1.8, color: 'var(--text-primary)' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>Terms of Service</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>Effective date: {EFFECTIVE_DATE}</p>

      <Section title="1. Agreement to Terms">
        <p>By accessing or using HydraBytes ("we", "our", "us") services at hydrabytes.it.com, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our services.</p>
      </Section>

      <Section title="2. Services">
        <p>HydraBytes provides IT services including web development, mobile application development, AI/ML solutions, UI/UX design, and related digital services. All services are provided on a project basis as agreed between HydraBytes and the client.</p>
      </Section>

      <Section title="3. Project Agreements">
        <p>Each project is governed by a separate agreement or invoice detailing the scope of work, deliverables, timeline, and payment terms. Work begins only after a project has been formally accepted and an initial payment (if applicable) has been received.</p>
      </Section>

      <Section title="4. Payments">
        <ul>
          <li>All prices are in USD unless otherwise agreed in writing.</li>
          <li>Invoices are due within the timeframe specified on the invoice.</li>
          <li>We accept payment via Easypaisa, JazzCash, NayaPay, bank transfer, international card payments, and cryptocurrency (USDT).</li>
          <li>Late payments may result in suspension of work until the outstanding balance is settled.</li>
          <li>HydraBytes reserves the right to charge interest on overdue invoices at 1.5% per month.</li>
        </ul>
      </Section>

      <Section title="5. Intellectual Property">
        <p>Upon receipt of full payment, the client receives full ownership of all custom deliverables produced for their project. HydraBytes retains the right to display completed work in its portfolio unless the client requests otherwise in writing.</p>
        <p>Third-party libraries, frameworks, and tools used in the project remain subject to their respective open-source licenses.</p>
      </Section>

      <Section title="6. Confidentiality">
        <p>HydraBytes agrees to keep all client information, business data, and project details confidential and will not disclose them to third parties without explicit written consent, except where required by law.</p>
      </Section>

      <Section title="7. Client Responsibilities">
        <ul>
          <li>Provide accurate project requirements, content, and assets in a timely manner.</li>
          <li>Respond to communications within a reasonable timeframe to avoid project delays.</li>
          <li>Ensure that any content provided does not infringe on third-party rights.</li>
        </ul>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>HydraBytes shall not be liable for any indirect, incidental, special, or consequential damages arising from use of our services. Our total liability shall not exceed the amount paid by the client for the specific service giving rise to the claim.</p>
      </Section>

      <Section title="9. Termination">
        <p>Either party may terminate a project agreement with 14 days written notice. In the event of termination, the client is responsible for payment of all work completed up to the termination date. Deposits and payments for completed milestones are non-refundable.</p>
      </Section>

      <Section title="10. Governing Law">
        <p>These Terms are governed by the laws of Pakistan. Any disputes shall be resolved through good-faith negotiation. If unresolved, disputes will be subject to the jurisdiction of the courts of Pakistan.</p>
      </Section>

      <Section title="11. Changes to Terms">
        <p>We reserve the right to update these Terms at any time. Continued use of our services after changes constitutes acceptance of the revised Terms. We will notify clients of material changes via email.</p>
      </Section>

      <Section title="12. Contact">
        <p>For questions about these Terms, contact us at <a href={`mailto:${EMAIL}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>{EMAIL}</a>.</p>
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
