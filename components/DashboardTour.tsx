"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowRight } from "lucide-react";

export interface TourStep {
  targetId: string;
  title: string;
  subtitle: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "nav-tour-home",
    title: "Home",
    subtitle: "Track XP, streaks & daily progress.",
  },
  {
    targetId: "nav-tour-challenges",
    title: "Challenges",
    subtitle: "Guided drawing drills to earn XP.",
  },
  {
    targetId: "nav-tour-otto-chat",
    title: "Otto Chat",
    subtitle: "Quick art tips & guidance from Otto.",
  },
  {
    targetId: "nav-tour-scan",
    title: "Scan",
    subtitle: "Instant AI feedback on your sketches.",
  },
  {
    targetId: "nav-tour-leaderboard",
    title: "Leaderboard",
    subtitle: "Compare XP & climb the rankings.",
  },
  {
    targetId: "nav-tour-tools",
    title: "Tools",
    subtitle: "Canvas, grid maker & prompt ideas.",
  },
];

interface DashboardTourProps {
  isOpen: boolean;
  onFinish: () => void;
}

export default function DashboardTour({ isOpen, onFinish }: DashboardTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = TOUR_STEPS[stepIndex];
  const isLastStep = stepIndex === TOUR_STEPS.length - 1;

  const updatePosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const el = document.getElementById(currentStep.targetId);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, stepIndex, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [isOpen]);

  if (!isOpen || !currentStep) return null;

  const hasTarget = targetRect && targetRect.width > 0 && targetRect.height > 0;
  const centerX = hasTarget
    ? targetRect.left + targetRect.width / 2
    : typeof window !== "undefined"
    ? window.innerWidth / 2
    : 200;

  const arrowLeft =
    typeof window !== "undefined"
      ? Math.min(Math.max(centerX, 28), window.innerWidth - 28)
      : centerX;

  const cardBottomPx = hasTarget
    ? Math.max(window.innerHeight - targetRect.top + 18, 88)
    : 94;

  const ringSize = 38;
  const ringLeft = centerX - ringSize / 2;
  const ringTop = hasTarget
    ? targetRect.top + targetRect.height / 2 - ringSize / 2
    : 0;

  const handleNext = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
    if (isLastStep) {
      onFinish();
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
    onFinish();
  };

  const blockClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] select-none pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation guide"
    >
      {/* Full-screen blur & click lock */}
      <div
        onClick={blockClick}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md pointer-events-auto"
      />

      {/* Compact spotlight circle above the active nav icon */}
      {hasTarget && (
        <div
          style={{
            position: "fixed",
            left: `${ringLeft}px`,
            top: `${ringTop}px`,
            width: `${ringSize}px`,
            height: `${ringSize}px`,
          }}
          className="rounded-full border-2 border-[#2563EB] bg-blue-500/15 shadow-[0_0_12px_rgba(37,99,235,0.5)] pointer-events-none transition-all duration-200 z-[10003]"
        />
      )}

      {/* Tooltip Card + Downward Arrow */}
      <div
        style={{ bottom: `${cardBottomPx}px` }}
        className="fixed left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[340px] z-[10004] pointer-events-auto transition-all duration-200"
      >
        <div className="bg-white rounded-3xl p-5 border-[3px] border-[#2563EB] shadow-2xl relative">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#2563EB] mb-1.5">
            <span>Quick Tour</span>
            <span className="text-slate-400">
              {stepIndex + 1} / {TOUR_STEPS.length}
            </span>
          </div>

          <h3 className="text-lg font-black text-[#0F172A] leading-snug">
            {currentStep.title}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 leading-relaxed">
            {currentStep.subtitle}
          </p>

          <button
            type="button"
            onClick={handleNext}
            className="mt-4 w-full py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 border-b-4 border-blue-800 active:border-b-0 active:translate-y-0.5 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md"
          >
            <span>{isLastStep ? "Got it!" : "Next"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="mt-2.5 text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer px-3 py-0.5"
            >
              Skip
            </button>
          </div>
        </div>

        {hasTarget && (
          <div
            style={{ left: `${arrowLeft - 11}px` }}
            className="fixed flex flex-col items-center pointer-events-none transition-all duration-200"
          >
            <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[11px] border-t-[#2563EB]" />
          </div>
        )}
      </div>
    </div>
  );
}