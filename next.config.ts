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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://otsiwrtnkzhrztlpcdjx.supabase.co; connect-src 'self' https://otsiwrtnkzhrztlpcdjx.supabase.co; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;