import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import OfflinePopup from "@/components/offlinepopup";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const FAVICON_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/output-onlinepngtools%20(6).png";

export const metadata: Metadata = {
  title: "Otterleo - Learn to Draw",
  description: "Learn to draw with AI-powered feedback and challenges. Improve your drawing skills with personalized guidance from Otto, your AI drawing coach.",
  icons: {
    icon: [
      { url: FAVICON_URL, type: 'image/png' },
    ],
    shortcut: FAVICON_URL,
    apple: FAVICON_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "url": "https://www.otterleo.in",
    "logo": FAVICON_URL
  };

  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href={FAVICON_URL} type="image/png" />
        <link rel="apple-touch-icon" href={FAVICON_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <OfflinePopup />
      </body>
    </html>
  );
}