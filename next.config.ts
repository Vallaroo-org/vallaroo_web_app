import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dihxruochfwayuwqhkiw.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'oygtbslhjtjygghreevd.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'vallaroo-storage.store',
      },
    ],
  },
};

export default nextConfig;
