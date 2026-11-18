import type { NextConfig } from "next";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

const nextConfig: NextConfig = {
  // Component/data caching with `use cache` + tags; admin edits revalidate tags.
  cacheComponents: true,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Only this account's assets when configured.
        pathname: cloudName ? `/${cloudName}/**` : "/**",
      },
    ],
  },

  async redirects() {
    return [
      // The old gallery lived at /creatives — keep links and SEO working.
      { source: "/creatives", destination: "/studio", permanent: true },
      { source: "/creatives/:path*", destination: "/studio", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
