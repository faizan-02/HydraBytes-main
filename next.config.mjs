/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'hydrabytes.it.com' }],
        destination: 'https://www.hydrabytes.it.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
