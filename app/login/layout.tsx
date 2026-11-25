import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Log In to Your Drawing Account",
  description:
    "Sign in to Otterleo to continue your drawing challenges, daily streaks, XP progress, and AI sketch feedback.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}