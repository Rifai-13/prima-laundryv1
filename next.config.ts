import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  env: {
    MONGO_URI: process.env.MONGO_URI,
  },
  
};

export default nextConfig;
