import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Otterleo AI Drawing Platform',
    short_name: 'Otterleo',
    description: 'Learn drawing the fun way with AI feedback and gamified challenges.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}