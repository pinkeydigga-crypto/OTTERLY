"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const AUDIO_SRC = "/audio.mp3";

const MUSIC_ROUTES = [
  "/dashboard",
  "/scan",
  "/tools",
  "/leaderboard",
  "/challenges",
  "/practice",
];

// Bahut halka background level — zaroorat ke hisaab se adjust kar lena
const LOW_VOLUME = 0.015;

declare global {
  interface Window {
    __OTTERLEO_CHALLENGE_FLOW_ACTIVE__?: boolean;
  }
}

export default function MinimalBgMusicPlayer() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isChallengeFlowActive, setIsChallengeFlowActive] = useState<boolean>(
    () =>
      typeof window !== "undefined"
        ? Boolean(window.__OTTERLEO_CHALLENGE_FLOW_ACTIVE__)
        : false
  );

  const isTargetRoute = MUSIC_ROUTES.some((route) =>
    pathname?.startsWith(route)
  );

  // Agar /challenges route se bahar chale gaye toh challenge flow flag reset kar do
  useEffect(() => {
    if (!pathname?.startsWith("/challenges")) {
      window.__OTTERLEO_CHALLENGE_FLOW_ACTIVE__ = false;
      setIsChallengeFlowActive(false);
    }
  }, [pathname]);

  // Challenges page se activeView ('hub' vs 'challenge-flow') ka signal suno
  useEffect(() => {
    const handleChallengeFlowChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ active?: boolean }>;
      const active = Boolean(customEvent.detail?.active);
      window.__OTTERLEO_CHALLENGE_FLOW_ACTIVE__ = active;
      setIsChallengeFlowActive(active);
    };

    window.addEventListener(
      "challengeFlowChange",
      handleChallengeFlowChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "challengeFlowChange",
        handleChallengeFlowChange as EventListener
      );
    };
  }, []);

  const shouldPlayBgMusic = isTargetRoute && !isChallengeFlowActive;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = LOW_VOLUME;
    audio.loop = true;

    if (!shouldPlayBgMusic) {
      audio.pause();
    }
  }, [shouldPlayBgMusic]);

  useEffect(() => {
    const applyVolumeAndPlay = () => {
      const audio = audioRef.current;
      if (!audio || !shouldPlayBgMusic) return;

      audio.volume = LOW_VOLUME;
      audio.loop = true;

      if (audio.paused) {
        audio.play().catch(() => {});
      }
    };

    window.addEventListener("pointerdown", applyVolumeAndPlay, {
      passive: true,
    });
    window.addEventListener("keydown", applyVolumeAndPlay, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointerdown", applyVolumeAndPlay);
      window.removeEventListener("keydown", applyVolumeAndPlay);
    };
  }, [shouldPlayBgMusic]);

  return (
    <audio
      ref={audioRef}
      src={AUDIO_SRC}
      loop
      preload="auto"
      playsInline
      style={{ display: "none" }}
    />
  );
}