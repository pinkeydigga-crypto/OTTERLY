/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Vercel build time image processing error bypass karega
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'otsiwrtnkzhrztlpcdjx.supabase.co',
      },
    ],
  },
};

export default nextConfig;