/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: 'https://updated-backend-210c.onrender.com/:path*',
      },
    ];
  },
};

export default nextConfig;
