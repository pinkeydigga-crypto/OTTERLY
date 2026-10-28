"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const triggerSubtleVibration = () => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(20);
    } catch {}
  }
};

export default function GlobalHaptics() {
  const pathname = usePathname();

  useEffect(() => {
    // Sirf signup page par chalega
    if (pathname !== "/signup") return;

    // 1. Light/Crisp Click Sound (Avatar & Skill Level selection ke liye)
    const playLightSelectSound = () => {
      try {
        const AudioClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        
        if (!AudioClass) return;
        const ctx = new AudioClass();
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.045);

        setTimeout(() => { try { ctx.close(); } catch {} }, 100);
      } catch {}
    };

    // 2. Heavy / Deep Chikoo-Style Sound (Next, Back & Create Account buttons ke liye)
    const playHeavyButtonSound = () => {
      try {
        const AudioClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        
        if (!AudioClass) return;
        const ctx = new AudioClass();
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Deep, heavy punchy sound for main action buttons
        osc.type = "sine";
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.08);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.085);

        setTimeout(() => { try { ctx.close(); } catch {} }, 120);
      } catch {}
    };

    const handleSignupInteractions = (event: Event) => {
      const target = (event.target as HTMLElement | null)?.closest(
        "button, a, input[type='submit']"
      ) as HTMLElement | null;

      if (!target) return;

      // Check karo ki click kis element par hua hai
      const isAvatarButton = target.closest(".grid-cols-4"); // Avatar selection grid
      const isSkillLevelButton = target.closest(".space-y-2\\.5") || target.innerText?.includes("Beginner") || target.innerText?.includes("Intermediate") || target.innerText?.includes("Advanced");

      if (isAvatarButton || isSkillLevelButton) {
        // Avatar ya skill level par light select sound
        triggerSubtleVibration();
        playLightSelectSound();
      } else {
        // Next, Back, Create Account ya baaki buttons par heavy sound
        triggerSubtleVibration();
        playHeavyButtonSound();
      }
    };

    window.addEventListener("click", handleSignupInteractions, { passive: true });

    return () => {
      window.removeEventListener("click", handleSignupInteractions);
    };
  }, [pathname]);

  return null;
}