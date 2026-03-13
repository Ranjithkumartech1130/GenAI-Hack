import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
        pathname: "/**",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      { source: "/sign-in", destination: "/auth/sign-in", permanent: false },
      { source: "/sign-up", destination: "/auth/sign-up", permanent: false },
      { source: "/interview", destination: "/root/interview", permanent: false },
    ];
  },
};

export default nextConfig;
