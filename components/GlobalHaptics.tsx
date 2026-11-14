"use client";

import { useEffect, useRef } from "react";

export default function GlobalHaptics() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastErrorNodeRef = useRef<Element | null>(null);

  const playTone = (type: number, isError = false) => {
    if (typeof window === "undefined") return;
    try {
      if ("vibrate" in navigator) {
        if (isError) navigator.vibrate(70); // 🚨 Stronger error vibration
        else if (type === 1) navigator.vibrate(45); // 🔘 Stronger button vibration
        else navigator.vibrate(20);
      }

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isError || type === 4) {
        // 🚨 Error Sound (Sawtooth) - Louder & Punchier
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
        gain.gain.setValueAtTime(0.45, now); // 🔊 Increased volume
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      } else if (type === 3) {
        // 🎨 Avatar & Skill Sound (Triangle) - Louder
        osc.type = "triangle";
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.3);
        gain.gain.setValueAtTime(0.35, now); // 🔊 Increased volume
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      } else {
        // 🔘 Button & Nav Sound (Sine - Deep/Punchy) - Louder & Clear
        osc.type = "sine";
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);
        gain.gain.setValueAtTime(0.45, now); // 🔊 Increased volume (from 0.22 to 0.45)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + (isError ? 0.6 : type === 3 ? 0.3 : 0.25));
    } catch (e) {
      console.error("Global audio error:", e);
    }
  };

  useEffect(() => {
    const isErrorAllowedPage = () => {
      if (typeof window === "undefined") return false;
      const path = window.location.pathname;
      return path.startsWith("/scan") || path.startsWith("/signup") || path.startsWith("/login");
    };

    const errorSelector =
      "[data-error], [class*='text-red'], [class*='text-rose'], [class*='bg-red'], [class*='bg-rose'], [class*='border-red'], [class*='border-rose'], [class*='error']";

    const observer = new MutationObserver(() => {
      if (!isErrorAllowedPage()) {
        lastErrorNodeRef.current = null;
        return;
      }

      const errorEl = document.querySelector(errorSelector);
      if (errorEl && errorEl !== lastErrorNodeRef.current) {
        lastErrorNodeRef.current = errorEl;
        playTone(4, true);
      } else if (!errorEl) {
        lastErrorNodeRef.current = null;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const actualButton = target.closest("button, a, input[type='submit'], input[type='button'], [role='button'], [tabindex]");
      if (!actualButton) return;

      const isNav = target.closest("nav, header, aside, .nav-item");
      const isBackOrHome = target.closest("a[href='/'], button[class*='back'], a[class*='back'], [data-back], a[href*='home']");

      const isMainAction = actualButton && (
        (actualButton as HTMLInputElement).type === "submit" || 
        ["continue", "next", "submit", "login", "sign up", "register", "proceed", "scan", "upload"].some(keyword => 
          actualButton.textContent?.toLowerCase().includes(keyword)
        )
      );

      const hasErrorVisible = isErrorAllowedPage() && Boolean(document.querySelector(errorSelector));

      const isAvatarOrSkill = target.closest(
        "[data-avatar], [data-skill], .avatar-option, .skill-option, .avatar-card, .skill-pill, .avatar-select, .skill-select"
      );

      if (isAvatarOrSkill) {
        playTone(3);
      } else if (hasErrorVisible && isMainAction && !isBackOrHome && !isNav) {
        playTone(4, true);
      } else {
        playTone(1);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}