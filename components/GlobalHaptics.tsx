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
    // Normal buttons aur Nav ke liye pehle wali standard sound (#1)
    const playSound1 = () => {
      try {
        const AudioClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioClass) return;
        const ctx = new AudioClass();
        if (ctx.state === "suspended") ctx.resume();
        if (ctx.state === "closed") return;

        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.08);

        setTimeout(() => { try { ctx.close(); } catch {} }, 100);
      } catch {}
    };

    // Signup selectors (avatar, beginner/skill level options) ke liye sound #11
    const playSound11 = () => {
      try {
        const AudioClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioClass) return;
        const ctx = new AudioClass();
        if (ctx.state === "suspended") ctx.resume();
        if (ctx.state === "closed") return;

        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(450, t + 0.2);

        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t); osc.stop(t + 0.25);

        setTimeout(() => { try { ctx.close(); } catch {} }, 300);
      } catch {}
    };

    const handleGlobalInteractions = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const interactiveElement = target.closest(
        "button, a, [role='button'], input[type='submit'], .cursor-pointer"
      );

      if (!interactiveElement) return;

      triggerSubtleVibration();

      // Check karo ki signup page par selectors (avatar, skill/beginner level cards) par click hua hai ya nahi
      const isSignupPage = window.location.pathname.includes("/signup");
      const isSignupSelector = isSignupPage && (
        interactiveElement.closest(".avatar-option, .skill-card, [data-selector], [class*='avatar'], [class*='level'], [class*='option']")
      );

      if (isSignupSelector) {
        playSound11();
      } else {
        playSound1();
      }
    };

    window.addEventListener("pointerdown", handleGlobalInteractions, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleGlobalInteractions);
    };
  }, []);

  return null;
}