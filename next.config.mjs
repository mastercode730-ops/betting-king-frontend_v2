/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://jaishree-matka.com');

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
