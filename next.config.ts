import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL;

    return [{ source: "/api/:path*", destination: `${api}/:path*` }];
  },
};

export default nextConfig;
