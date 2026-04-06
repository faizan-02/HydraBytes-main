// Server Component — renders a JSON-LD <script> tag for structured data.
// Pass any schema.org object as `data`.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
