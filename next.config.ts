import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.supabase.co",
      },
      {
        protocol: "https",
        hostname: "www.w3.org",
      },
    ],
  },
  experimental: {
    // Enable Server Actions details if needed
  },
};

export default nextConfig;
