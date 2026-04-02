export const metadata = { title: 'Refund Policy — HydraBytes' };

const EFFECTIVE_DATE = 'April 2, 2026';
const EMAIL = 'hydrabytes4@gmail.com';

export default function RefundPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px', lineHeight: 1.8, color: 'var(--text-primary)' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>Refund Policy</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>Effective date: {EFFECTIVE_DATE}</p>

      <Section title="Overview">
        <p>HydraBytes provides custom IT services. Because our work involves significant time and resources dedicated specifically to each client, our refund policy reflects the nature of custom service delivery.</p>
      </Section>

      <Section title="1. Before Work Begins">
        <p>If you cancel your project <strong>before any work has started</strong>, you are entitled to a full refund of any deposit paid, minus any payment processing fees charged by the payment provider.</p>
        <p>To request a pre-work cancellation, contact us within <strong>48 hours</strong> of payment at <a href={`mailto:${EMAIL}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>{EMAIL}</a>.</p>
      </Section>

      <Section title="2. After Work Has Begun">
        <p>Once work has commenced on your project:</p>
        <ul>
          <li>Payments for <strong>completed milestones</strong> are non-refundable.</li>
          <li>If you cancel mid-project, you are responsible for payment of all work completed to the date of cancellation.</li>
          <li>Any unused portion of a pre-paid amount beyond work completed will be refunded.</li>
        </ul>
      </Section>

      <Section title="3. Milestone-Based Projects">
        <p>For projects structured around milestones:</p>
        <ul>
          <li>Each milestone payment covers the deliverables for that milestone only.</li>
          <li>Refunds for a milestone are only considered if HydraBytes fails to deliver the agreed deliverables for that milestone within the agreed timeframe.</li>
          <li>Disputes must be raised within <strong>7 days</strong> of milestone delivery.</li>
        </ul>
      </Section>

      <Section title="4. Dissatisfaction with Deliverables">
        <p>We are committed to client satisfaction. If you are not satisfied with a deliverable:</p>
        <ul>
          <li>We will first work with you to revise the deliverable within the agreed scope at no extra cost.</li>
          <li>If after reasonable revisions the deliverable still does not meet the agreed specifications, we will assess a partial or full refund on a case-by-case basis.</li>
          <li>Dissatisfaction based on scope changes or preferences not specified in the original agreement does not qualify for a refund.</li>
        </ul>
      </Section>

      <Section title="5. Subscription or Retainer Services">
        <p>For monthly retainer or maintenance plans:</p>
        <ul>
          <li>You may cancel at any time with 14 days written notice.</li>
          <li>No refunds are issued for the current billing period.</li>
          <li>Cancellation takes effect at the end of the current billing period.</li>
        </ul>
      </Section>

      <Section title="6. How to Request a Refund">
        <p>To request a refund, email us at <a href={`mailto:${EMAIL}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>{EMAIL}</a> with:</p>
        <ul>
          <li>Your name and account email</li>
          <li>Invoice number or project name</li>
          <li>Reason for refund request</li>
        </ul>
        <p>We will respond within <strong>3 business days</strong>. Approved refunds are processed within 5–10 business days via the original payment method.</p>
      </Section>

      <Section title="7. Contact">
        <p>Questions about our refund policy? Contact us at <a href={`mailto:${EMAIL}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>{EMAIL}</a>.</p>
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
