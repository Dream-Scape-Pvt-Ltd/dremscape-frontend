import type { NextConfig } from "next";

// Uploaded images and the site's content photos live in Backblaze B2. The
// backend's /media/<key> route redirects to a signed B2 URL, so the frontend
// only needs to forward those paths to the backend.
const backendOrigin = new URL(
  process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "http://127.0.0.1:8000/api/v1",
).origin;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    const headers = process.env.NODE_ENV === "production"
      ? [...securityHeaders, { key: "Strict-Transport-Security", value: "max-age=31536000" }]
      : securityHeaders;
    return [{ source: "/:path*", headers }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // In development the backend runs on 127.0.0.1, which Next 16 refuses to
    // optimize from by default.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
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
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "*.onrender.com",
        pathname: "/media/**",
      },
      // The API's own origin (self-hosted deployments), where stored image URLs point.
      {
        protocol: backendOrigin.startsWith("https") ? "https" : "http",
        hostname: new URL(backendOrigin).hostname,
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "s3.eu-central-003.backblazeb2.com",
        pathname: "/dreamscape-trek-images/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/images/:path*.svg",
        destination: "/svg/:path*.svg",
      },
      {
        source: "/images/:folder(treks|blog|team|trek-memories)/:file",
        destination: `${backendOrigin}/media/site/:folder/:file`,
      },
      {
        source: "/media/:path*",
        destination: `${backendOrigin}/media/:path*`,
      },
    ];
  },
};


export default nextConfig;
