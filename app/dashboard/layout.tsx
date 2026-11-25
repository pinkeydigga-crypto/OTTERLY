import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artist Dashboard & XP Progress",
  description:
    "View your XP, daily streak, leaderboard rank, practice canvas, grid maker, and drawing challenges on Otterleo.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}