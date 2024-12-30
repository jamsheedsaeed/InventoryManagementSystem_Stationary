import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
