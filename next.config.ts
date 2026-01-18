import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack for better MediaPipe compatibility
  webpack: (config, { isServer }) => {
    // Handle MediaPipe and other packages that use WASM
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  // Transpile MediaPipe packages
  transpilePackages: ["@mediapipe/pose"],
  // Add empty turbopack config to silence the warning
  // We're using webpack explicitly for MediaPipe compatibility
  turbopack: {},
};

export default nextConfig;
