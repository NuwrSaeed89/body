import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { publicEnv } from "./src/lib/env";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.7"],
  env: {
    NEXT_PUBLIC_APP_URL: publicEnv.appUrl,
    NEXT_PUBLIC_APP_ENV: publicEnv.appEnv,
    NEXT_PUBLIC_USE_MOCK_DATA: String(publicEnv.useMockData),
  },
  images: {
    // Prefer modern formats for LCP/bandwidth (Core Web Vitals).
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
