import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create Free Drawing Account",
  description:
    "Sign up on Otterleo for free to practice sketching, unlock avatars, earn XP, build daily streaks, and get AI drawing feedback.",
};

export default function SignupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}