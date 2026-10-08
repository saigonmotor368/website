import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  async redirects() {
    return [
      {
        source: "/bao-gia/create",
        destination: "/quanly/quotes/create",
        permanent: true,
      },
      {
        source: "/bao-gia/leads",
        destination: "/quanly/leads",
        permanent: true,
      },
      {
        source: "/bao-gia",
        destination: "/quanly/quotes",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.saigonmotor.vn",
          },
        ],
        destination: "https://saigonmotor.vn/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
