import type { Metadata } from 'next';

const FAVICON_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/output-onlinepngtools%20(6).png";

export const metadata: Metadata = {
  metadataBase: new URL('https://otterly-prototype.vercel.app'),
  title: {
    default: 'Otterly - Learn to Draw',
    template: '%s | Otterly',
  },
  description: 'Learn to draw and improve your art skills daily with instant AI feedback on Otterly.',
  keywords: [
    'Otterly',
    'Otterly AI',
    'Learn to Draw',
    'AI Drawing Coach',
    'Gamified Drawing Lessons',
  ],
  icons: {
    icon: FAVICON_URL,
    shortcut: FAVICON_URL,
    apple: FAVICON_URL,
  },
  openGraph: {
    title: 'Otterly - Learn to Draw',
    description: 'Learn to draw and improve your art skills daily with instant AI feedback on Otterly.',
    url: 'https://otterly-prototype.vercel.app',
    siteName: 'Otterly',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Otterly - Learn to Draw',
    description: 'Learn to draw and improve your art skills daily with instant AI feedback on Otterly.',
  },
  robots: {
    index: true,
    follow: true,
  },
};