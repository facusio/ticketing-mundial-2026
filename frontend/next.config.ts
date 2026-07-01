import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["*.trycloudflare.com"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
