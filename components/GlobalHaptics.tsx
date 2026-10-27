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

      // Agar context running nahi hai, toh turant resume karo taaki sound miss na ho
      if (ctx.state !== "running") {
        ctx.resume();
      }

      try {
        const now = ctx.currentTime;

        // 1. Warm Triangle Wave (Soft & Sweet)
        const osc = ctx.createOscillator();
        osc.type = "triangle";

        // 2. Low-Pass Filter (Sharp frequencies cut karne ke liye)
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, now);

        // 3. Smooth Volume Envelope
        const gain = ctx.createGain();

        // Sweet Pitch Drop (420Hz down to 180Hz)
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

        // Soft Attack & Decay
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        // Node Connections
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.035);
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

    // Unlock Audio Context on first gestures and keep it active
    const unlockAudio = () => {
      initAudioContext();
    };

    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("click", handleInteraction);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("click", handleInteraction);
    };
  }, []);

  return null;
}