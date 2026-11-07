"use client";

import { useEffect } from "react";

export default function GlobalHaptics() {
  useEffect(() => {
    // Global click listener for audio / haptics across app
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("button, a");
      if (target) {
        if ("vibrate" in navigator) {
          try {
            navigator.vibrate(15);
          } catch {}
        }
        try {
          const audio = new Audio("https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/click.mp3");
          audio.volume = 0.4;
          audio.play().catch(() => {});
        } catch {}
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}