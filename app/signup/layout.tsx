import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Free Drawing Account",
  description:
    "Sign up on Otterleo for free to practice sketching, unlock avatars, earn XP, build daily streaks, and get AI drawing feedback.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}