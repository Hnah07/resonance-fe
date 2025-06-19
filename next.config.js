import pwa from "next-pwa";

const withPWA = pwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_HOST,
        port: "",
        pathname: "/storage/events/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_HOST,
        port: "",
        pathname: "/events/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_HOST,
        port: "",
        pathname: "/storage/checkin-photos/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_HOST,
        port: "",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "resonance-app-cf7lh.ondigitalocean.app",
        port: "",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/proxy-image/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/proxy-image/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=*, interest-cohort=()",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
