import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/dashboard/', '/payment/'],
    },
    sitemap: 'https://www.hydrabytes.tech/sitemap.xml',
  };
}
