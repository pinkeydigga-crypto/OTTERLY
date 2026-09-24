"use client";

import { useEffect } from "react";

const triggerSubtleVibration = () => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      // 20ms minimal but clear vibration feel ke liye
      navigator.vibrate(20);
    } catch {
      // Ignore if browser restricts vibration
    }
  }
};

export default function GlobalHaptics() {
  useEffect(() => {
    const handleInteraction = (event: Event) => {
      const target = event.target as HTMLElement | null;

      // Check karein click/touch button, link, ya role="button" par hua hai
      if (
        target?.closest("button") ||
        target?.closest("a") ||
        target?.getAttribute("role") === "button"
      ) {
        triggerSubtleVibration();
      }
    };

    // 'touchstart' for mobile touch response, 'click' for desktop/fallback
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("click", handleInteraction);

    return () => {
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("click", handleInteraction);
    };
  }, []);

  return null;
}