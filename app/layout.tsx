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

export const metadata: Metadata = {
  title: "Otterly",
  description: "Learn to draw easily",
  verification: {
    google: "WhjTfub1GzTK-czyW1hlcB_kdpaEmzUUkJ2DzooEHXI",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <head>
        <meta name="google-site-verification" content="WhjTfub1GzTK-czyW1hlcB_kdpaEmzUUkJ2DzooEHXI" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <OfflinePopup />
      </body>
    </html>
  );
}