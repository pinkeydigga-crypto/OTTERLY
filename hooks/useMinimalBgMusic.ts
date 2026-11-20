"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { minimalBgMusic } from "@/lib/minimalBgMusic";

const MUSIC_ROUTES = [
  "/dashboard",
  "/scan",
  "/challenges",
  "/practice",
  "/tools",
  "/leaderboard",
];

export function useMinimalBgMusic() {
  const pathname = usePathname();
  const [muted, setMuted] = useState(false);

  const isTargetRoute = MUSIC_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    const onFirstInteraction = () => {
      minimalBgMusic.unlock();
    };

    window.addEventListener("pointerdown", onFirstInteraction, { once: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  useEffect(() => {
    minimalBgMusic.setEnabled(Boolean(isTargetRoute));
    return () => {
      minimalBgMusic.setEnabled(false);
    };
  }, [isTargetRoute]);

  const toggleMusicMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      minimalBgMusic.setMuted(next);
      return next;
    });
  }, []);

  return { muted, toggleMusicMute, isTargetRoute };
}