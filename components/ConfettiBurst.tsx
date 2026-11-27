"use client";

import React, { useEffect, useRef } from "react";

interface ConfettiBurstProps {
  trigger: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  tiltAngle: number;
  vTilt: number;
  shape: "rect" | "ribbon";
  opacity: number;
}

const CONFETTI_COLORS = [
  "#2563EB",
  "#38BDF8",
  "#F59E0B",
  "#EF4444",
  "#10B981",
  "#A855F7",
  "#EC4899",
];

export default function ConfettiBurst({ trigger, onComplete }: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const countPerSide = 48;

    // Left party popper (bottom-left shooting up & right)
    for (let i = 0; i < countPerSide; i++) {
      const speed = 7 + Math.random() * 8;
      const angle = (-Math.PI / 2) + (Math.random() * 0.75 - 0.1);
      particles.push({
        x: 12,
        y: height * (0.62 + Math.random() * 0.22),
        vx: Math.cos(angle) * speed + Math.random() * 3.5,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        tiltAngle: Math.random() * Math.PI,
        vTilt: 0.08 + Math.random() * 0.1,
        shape: i % 3 === 0 ? "ribbon" : "rect",
        opacity: 1,
      });
    }

    // Right party popper (bottom-right shooting up & left)
    for (let i = 0; i < countPerSide; i++) {
      const speed = 7 + Math.random() * 8;
      const angle = (-Math.PI / 2) - (Math.random() * 0.75 - 0.1);
      particles.push({
        x: width - 12,
        y: height * (0.62 + Math.random() * 0.22),
        vx: Math.cos(angle) * speed - Math.random() * 3.5,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[(i + 2) % CONFETTI_COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        tiltAngle: Math.random() * Math.PI,
        vTilt: 0.08 + Math.random() * 0.1,
        shape: i % 3 === 0 ? "ribbon" : "rect",
        opacity: 1,
      });
    }

    // Play happy party sound TWICE (~0.9s each, with short gap)
    const playSingleHappyBurst = async (startOffsetSec: number) => {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof window.AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) return;

        if (!audioCtxRef.current || (audioCtxRef.current.state as string) === "closed") {
          audioCtxRef.current = new AudioCtx();
        }
        const actx = audioCtxRef.current;
        if ((actx.state as string) === "closed") return;
        if (actx.state === "suspended") {
          await actx.resume().catch(() => {});
        }
        if ((actx.state as string) === "closed") return;

        const baseTime = actx.currentTime + startOffsetSec;
        const chordNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

        chordNotes.forEach((freq, idx) => {
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.type = "triangle";

          const t0 = baseTime + idx * 0.07;
          const dur = 0.55;

          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.001, t0);
          gain.gain.linearRampToValueAtTime(0.14, t0 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);

          osc.connect(gain);
          gain.connect(actx.destination);

          osc.start(t0);
          osc.stop(t0 + dur);
        });
      } catch {}
    };

    void playSingleHappyBurst(0);
    void playSingleHappyBurst(1.05);

    let rafId = 0;
    const startTime = performance.now();
    const totalDurationMs = 2300;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDurationMs, 1);

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.24; // gravity
        p.vx *= 0.985; // air drag
        p.rotation += p.vRot;
        p.tiltAngle += p.vTilt;

        if (progress > 0.65) {
          p.opacity = Math.max(0, 1 - (progress - 0.65) / 0.35);
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const scaleY = Math.cos(p.tiltAngle);
        ctx.scale(1, scaleY === 0 ? 0.1 : scaleY);

        ctx.fillStyle = p.color;
        if (p.shape === "ribbon") {
          ctx.fillRect(-p.size * 0.7, -p.size * 0.22, p.size * 1.4, p.size * 0.44);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        }

        ctx.restore();
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        onComplete?.();
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, width, height);
    };
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[10010] pointer-events-none select-none"
      aria-hidden="true"
    />
  );
}