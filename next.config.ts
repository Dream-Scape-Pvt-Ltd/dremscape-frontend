import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return process.env.NODE_ENV === "production" ? [{source:"/:path*",headers:[{key:"Strict-Transport-Security",value:"max-age=31536000"}]}] : [];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "*.onrender.com",
        pathname: "/media/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/images/:path*.svg",
        destination: "/svg/:path*.svg",
      },
    ];
  },
};


export default nextConfig;
