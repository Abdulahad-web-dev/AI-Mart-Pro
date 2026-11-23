import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  async rewrites(){ return [{ source:'/backend/:path*',destination:`${process.env.API_REWRITE_TARGET||'http://localhost:4000'}/:path*` }] }
};
export default nextConfig;
