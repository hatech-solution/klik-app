import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep effects single-run in local dev to avoid duplicate client API calls.
  reactStrictMode: false,
  allowedDevOrigins: [
    "localhost",
    "*.localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
