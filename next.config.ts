import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  /* config options here */
  reactStrictMode: true,
  env: {
    MONGO_URI: process.env.MONGO_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
   // Redirect HTTP ke HTTPS
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  trailingSlash: true,
  
};

export default nextConfig;
