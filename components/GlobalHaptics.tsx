"use client";

import { useEffect } from "react";

const triggerSubtleVibration = () => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(20);
    } catch {}
  }
};

export default function GlobalHaptics() {
  useEffect(() => {
    const playDeepButtonSound = () => {
      try {
        const AudioClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        
        if (!AudioClass) return;

        // Har click par ek fresh standalone context taaki volume overlap ya compress na ho
        const ctx = new AudioClass();
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

        // Solid stable envelope taaki volume hamesha 100% full rahe
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.085);

        // Turant cleanup taaki memory clean rahe
        setTimeout(() => {
          try {
            ctx.close();
          } catch {}
        }, 120);
      } catch {}
    };

    const handleGlobalInteractions = (event: Event) => {
      const target = (event.target as HTMLElement | null)?.closest(
        "button, a, [role='button'], input[type='submit'], nav a, .cursor-pointer"
      );

      if (!target) return;

      triggerSubtleVibration();
      playDeepButtonSound();
    };

    window.addEventListener("pointerdown", handleGlobalInteractions, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleGlobalInteractions);
    };
  }, []);

  return null;
}