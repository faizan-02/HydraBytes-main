import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.hydrabytes.it.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '',            priority: 1.0, freq: 'weekly'  },
    { path: '/services',  priority: 0.9, freq: 'monthly' },
    { path: '/portfolio', priority: 0.8, freq: 'monthly' },
    { path: '/about',     priority: 0.8, freq: 'monthly' },
    { path: '/pricing',   priority: 0.8, freq: 'monthly' },
    { path: '/blog',      priority: 0.7, freq: 'weekly'  },
    { path: '/contact',   priority: 0.7, freq: 'monthly' },
    { path: '/legal/privacy', priority: 0.3, freq: 'yearly' },
    { path: '/legal/terms',   priority: 0.3, freq: 'yearly' },
    { path: '/legal/refund',  priority: 0.3, freq: 'yearly' },
  ];

  return routes.map(({ path, priority, freq }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));
}
