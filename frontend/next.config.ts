import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
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
