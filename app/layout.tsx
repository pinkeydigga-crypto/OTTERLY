import type { Metadata } from 'next';
import './globals.css';

const FAVICON_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/output-onlinepngtools%20(6).png";

export const metadata: Metadata = {
  metadataBase: new URL('https://Otterleo.in'),
  title: {
    default: 'Otterleo - Learn to Draw',
    template: '%s | Otterleo',
  },
  description: 'Learn to draw and improve your art skills daily with instant AI feedback on Otterleo.',
  keywords: [
    'Otterleo',
    'Otterleo AI',
    'Learn to Draw',
    'AI Drawing Coach',
    'Gamified Drawing Lessons',
  ],
  icons: {
    icon: FAVICON_URL,
    shortcut: FAVICON_URL,
    apple: FAVICON_URL,
  },
  verification: {
    google: 'WhjTfub1GzTK-czyW1hlcB_kdpaEmzUUkJ2DzooEHXI',
  },
  openGraph: {
    title: 'Otterleo - Learn to Draw',
    description: 'Learn to draw and improve your art skills daily with instant AI feedback on Otterleo.',
    url: 'https://otterleo.in',
    siteName: 'Otterleo',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Otterleo - Learn to Draw',
    description: 'Learn to draw and improve your art skills daily with instant AI feedback on Otterleo.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}