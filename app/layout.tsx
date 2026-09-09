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
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Screenshot_8-9-2026_214834_chatgpt_imgupscaler.ai_Beta_2K%20(1).png";

export const metadata: Metadata = {
  metadataBase: new URL("https://otterly-prototype.vercel.app"),
  title: "Otterly - Learn Drawing The Fun Way | AI Drawing Coach",
  description:
    "Get instant AI feedback, complete challenges, earn XP, and improve your drawing skills every day with Otterly.",
  keywords: ["Otterly", "Learn drawing", "AI drawing coach", "Otto", "Drawing challenges"],
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
    title: "Otterly - Learn Drawing The Fun Way",
    description: "Get instant AI feedback and improve your drawing skills daily with Otterly.",
    url: "https://otterly-prototype.vercel.app",
    siteName: "Otterly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Otterly - Learn Drawing The Fun Way",
    description: "Get instant AI feedback and improve your drawing skills daily with Otterly.",
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