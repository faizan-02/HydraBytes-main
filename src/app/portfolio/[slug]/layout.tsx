import type { Metadata } from 'next';
import { projects } from '../projects';

const SITE = 'https://www.hydrabytes.tech';

// Search snippets cut off around 160 characters, so end on a whole word before that
function snippet(text: string, max = 158) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}...`;
}

// Pre-build every case study so each one ships as static HTML
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

// Each case study gets its own title, description, canonical URL and share image
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: 'Project not found | HydraBytes' };

  const title = `${project.title} | HydraBytes Case Study`;
  const description = snippet(project.desc);
  const url = `${SITE}/portfolio/${project.slug}`;
  const image = project.gallery[0] ?? project.image;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      images: [{ url: `${SITE}${encodeURI(image)}`, alt: project.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE}${encodeURI(image)}`],
    },
  };
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
