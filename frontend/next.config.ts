import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/books/**',
      },
      {
        protocol: 'https',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/books/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('react-pdf');
    }
    return config;
  },
  
  // ✅ Turbopack config
  turbopack: {
    resolveAlias: {
      // Example alias to speed up resolution
      '@components': './src/components',
    },
  },
};

export default nextConfig;
