import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude react-pdf from server-side rendering
      config.externals = config.externals || [];
      config.externals.push('react-pdf');
    }
    return config;
  },
};

export default nextConfig;
