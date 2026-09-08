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

const FAVICON_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Screenshot_8-9-2026_214834_chatgpt_imgupscaler.ai_Beta_2K%20(1).png";

export const metadata: Metadata = {
  title: "Otterly",
  description: "Learn to draw easily",
  icons: {
    icon: FAVICON_URL,
    shortcut: FAVICON_URL,
    apple: FAVICON_URL,
  },
  verification: {
    google: "WhjTfub1GzTK-czyW1hlcB_kdpaEmzUUkJ2DzooEHXI",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <head>
        <meta name="google-site-verification" content="WhjTfub1GzTK-czyW1hlcB_kdpaEmzUUkJ2DzooEHXI" />
        <link rel="icon" href={FAVICON_URL} />
        <link rel="apple-touch-icon" href={FAVICON_URL} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <OfflinePopup />
      </body>
    </html>
  );
}