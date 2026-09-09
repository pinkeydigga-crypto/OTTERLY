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

const FAVICON_URL =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Screenshot_9-9-2026_20260_chatgpt.com-styled%20(1).png";

const OG_IMAGE_URL =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO%20LANDING%20PAGE.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://otterly-prototype.vercel.app"),
  title: "Otterly - Learn to Draw the Fun Way | Harjas Digga",
  description:
    "Learn to draw with Otterly by Harjas Digga. Get instant AI feedback, complete drawing challenges, earn XP, and improve your art daily with Otto.",
  keywords: [
    "Otterly",
    "learn to draw",
    "drawing",
    "Harjas Digga",
    "AI drawing coach",
    "Otto",
    "drawing app",
    "drawing challenges",
    "learn drawing online"
  ],
  authors: [{ name: "Harjas Digga" }],
  creator: "Harjas Digga",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: FAVICON_URL,
    shortcut: FAVICON_URL,
    apple: FAVICON_URL,
  },
  verification: {
    google: "WhjTfub1GzTK-czyW1hlcB_kdpaEmzUUkJ2DzooEHXI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Otterly - Learn to Draw the Fun Way | Harjas Digga",
    description: "Learn to draw and improve your art skills daily with AI feedback on Otterly.",
    url: "https://otterly-prototype.vercel.app",
    siteName: "Otterly",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Otterly - Learn to Draw with Otto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Otterly - Learn to Draw the Fun Way | Harjas Digga",
    description: "Learn to draw and improve your art skills daily with AI feedback on Otterly.",
    images: [OG_IMAGE_URL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <OfflinePopup />
        {children}
      </body>
    </html>
  );
}