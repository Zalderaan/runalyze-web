import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true, // Reload when coming back online
  disable: process.env.NODE_ENV === "development", // Optional: disable in dev
})

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zcshkomjuqcfeepimxwq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withSerwist(nextConfig);

