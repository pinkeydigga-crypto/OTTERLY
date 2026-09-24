"use client";

import { useEffect } from "react";
import { triggerSubtleVibration } from "@/lib/haptic";

export default function GlobalHaptics() {
  useEffect(() => {
    const handleGlobalClick = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;

      // Agar click button, link, ya role="button" par hua hai
      if (
        target?.closest("button") ||
        target?.closest("a") ||
        target?.getAttribute("role") === "button"
      ) {
        triggerSubtleVibration();
      }
    };

    // 'pointerdown' mobile touch aur desktop click dono par fast trigger hota hai
    window.addEventListener("pointerdown", handleGlobalClick);

    return () => {
      window.removeEventListener("pointerdown", handleGlobalClick);
    };
  }, []);

  return null;
}