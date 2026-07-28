import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage public buckets (avatars, venues).
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
