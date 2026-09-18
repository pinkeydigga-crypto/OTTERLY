import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import OfflinePopup from "@/components/offlinepopup";
import { Analytics } from "@vercel/analytics/next";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const FAVICON_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/output-onlinepngtools%20(6).png";
const SITE_URL = "https://www.otterleo.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Otterleo - Learn to Draw with AI Feedback & Challenges",
  description: "Learn to draw with AI-powered feedback, gamified daily challenges, and instant sketch analysis. Master drawing step-by-step with Otto, your AI drawing coach.",
  keywords: [
    "Otterleo",
    "Otterleo AI",
    "otterleo.in",
    "Learn Drawing ",
    " Drawing classes",
    " Drawing Practice",
    "Learn Drawing with AI",
    " Sketching Feedback",
    "Learn drawing the fun way"
  ],
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: FAVICON_URL, sizes: '48x48', type: 'image/png' },
      { url: FAVICON_URL, sizes: '96x96', type: 'image/png' },
      { url: FAVICON_URL, sizes: '192x192', type: 'image/png' },
      { url: FAVICON_URL, sizes: '512x512', type: 'image/png' },
    ],
    shortcut: [FAVICON_URL],
    apple: [
      { url: FAVICON_URL, sizes: '180x180', type: 'image/png' }
    ],
  },
  openGraph: {
    title: "Otterleo - Learn to Draw ",
    description: "Improve your drawing skills daily with instant AI feedback and gamified challenges.",
    url: SITE_URL,
    siteName: "Otterleo AI",
    images: [
      {
        url: FAVICON_URL,
        width: 1200,
        height: 630,
        alt: "Otterleo AI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Otterleo - Learn to Draw with AI",
    description: "Improve your drawing skills daily in fun way through interactive challenges, step-by-step tutorials, and gamified online courses that make practice enjoyable and creative..",
    images: [FAVICON_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "Otterleo",
        "description": "Learn drawing the fun way .",
        "inLanguage": "en-US"
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "Otterleo AI",
        "url": SITE_URL,
        "logo": FAVICON_URL,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#application`,
        "name": "Otterleo AI",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        }
      }
    ]
  };

  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href={FAVICON_URL} sizes="48x48" type="image/png" />
        <link rel="icon" href={FAVICON_URL} sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href={FAVICON_URL} />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <OfflinePopup />
        <Analytics />
      </body>
    </html>
  );
}