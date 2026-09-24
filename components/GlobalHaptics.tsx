"use client";

import { useEffect, useRef } from "react";

// Minimal 20ms haptic vibration for mobile devices
const triggerSubtleVibration = () => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(20);
    } catch {
      // Ignore vibration restrictions
    }
  }
};

export default function GlobalHaptics() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isTouchRef = useRef<boolean>(false);

  useEffect(() => {
    // Single persistent AudioContext initialize
    const initAudioContext = () => {
      if (!audioCtxRef.current && typeof window !== "undefined") {
        const AudioClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioClass) {
          audioCtxRef.current = new AudioClass();
        }
      }

      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    };

    // Warm, Soft, Sweet 30ms Bubble Pop Sound
    const playWarmSweetPopSound = () => {
      initAudioContext();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      try {
        const now = ctx.currentTime;

        // 1. Warm Triangle Wave (Soft & Sweet, no harsh sine/square noise)
        const osc = ctx.createOscillator();
        osc.type = "triangle";

        // 2. Low-Pass Filter (Chubhne wali sharp frequencies ko cut/mellow karne ke liye)
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, now); // Warm Cutoff

        // 3. Smooth Volume Envelope
        const gain = ctx.createGain();

        // Sweet Pitch Drop (420Hz down to 180Hz)
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

        // Soft Attack & Decay (Non-piercing)
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.005); // Smooth 5ms attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035); // Gentle decay

        // Node Connections: Oscillator -> Low Pass Filter -> Gain Envelope -> Speakers
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.035); // ~35ms exact sweet duration
      } catch {
        // Suppress audio restriction errors
      }
    };

    const handleInteraction = (event: Event) => {
      if (event.type === "touchstart") {
        isTouchRef.current = true;
      } else if (event.type === "click" && isTouchRef.current) {
        isTouchRef.current = false;
        return; // Prevent double trigger on touch devices
      }

      const target = event.target as HTMLElement | null;

      if (
        target?.closest("button") ||
        target?.closest("a") ||
        target?.closest('input[type="submit"]') ||
        target?.getAttribute("role") === "button"
      ) {
        triggerSubtleVibration();
        playWarmSweetPopSound();
      }
    };

    // Unlock Audio Context on first gesture
    const unlockAudioOnFirstGesture = () => {
      initAudioContext();
      window.removeEventListener("pointerdown", unlockAudioOnFirstGesture);
      window.removeEventListener("keydown", unlockAudioOnFirstGesture);
    };

    window.addEventListener("pointerdown", unlockAudioOnFirstGesture, { once: true });
    window.addEventListener("keydown", unlockAudioOnFirstGesture, { once: true });

    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("click", handleInteraction);

    return () => {
      window.removeEventListener("pointerdown", unlockAudioOnFirstGesture);
      window.removeEventListener("keydown", unlockAudioOnFirstGesture);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("click", handleInteraction);
    };
  }, []);

  return null;
}