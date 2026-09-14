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

const LOGO_FAVICON_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png";

export const metadata: Metadata = {
  title: "Otterleo - Learn to Draw",
  description: "Learn to draw with AI-powered feedback and challenges. Improve your drawing skills with personalized guidance from Otto, your AI drawing coach.",
  icons: {
    icon: LOGO_FAVICON_URL,
    shortcut: LOGO_FAVICON_URL,
    apple: LOGO_FAVICON_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href={LOGO_FAVICON_URL} />
        <link rel="apple-touch-icon" href={LOGO_FAVICON_URL} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <OfflinePopup />
      </body>
    </html>
  );
}