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
