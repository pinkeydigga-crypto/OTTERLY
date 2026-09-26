"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, Sparkles, Loader2, Trophy, Clock, ShieldAlert, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface WheelSegment {
  label: string;
  value: number;
  color: string;
  textColor: string;
}

// Gradient Colors: 10 XP (Light) se 100 XP (Dark)
const SEGMENTS: WheelSegment[] = [
  { label: "10", value: 10, color: "#E0F2FE", textColor: "#0369A1" }, // Very Light Blue
  { label: "30", value: 30, color: "#38BDF8", textColor: "#0C4A6E" }, // Light Sky Blue
  { label: "50", value: 50, color: "#0284C7", textColor: "#FFFFFF" }, // Medium Blue
  { label: "60", value: 60, color: "#2563EB", textColor: "#FFFFFF" }, // Bright Blue
  { label: "80", value: 80, color: "#1D4ED8", textColor: "#FFFFFF" }, // Dark Blue
  { label: "100", value: 100, color: "#0F172A", textColor: "#FFFFFF" }, // Darkest Blue/Slate
];

const getTodayLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function XpWheel() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<number | null>(null);
  const [hasSpunToday, setHasSpunToday] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const numSegments = SEGMENTS.length;
  const segmentAngle = 360 / numSegments;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTickSegmentRef = useRef<number>(-1);
  const animationFrameRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);

  useEffect(() => {
    checkSpinStatus();
  }, []);

  const checkSpinStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setHasSpunToday(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("last_xp_wheel_spin")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking status details:", JSON.stringify(error, null, 2));
        setHasSpunToday(false);
        return;
      }

      if (data && data.last_xp_wheel_spin) {
        const todayStr = getTodayLocalDate();
        const dbSpinDate = String(data.last_xp_wheel_spin).split("T")[0];

        if (dbSpinDate === todayStr) {
          setHasSpunToday(true);
        } else {
          setHasSpunToday(false);
        }
      } else {
        setHasSpunToday(false);
      }
    } catch (err) {
      console.error("Error checking spin status exception:", err);
      setHasSpunToday(false);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Realistic Wheel Mechanical Tick Sound
  const playTickSound = () => {
    try {
      initAudioCtx();
      if (!audioCtxRef.current) return;

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1100, audioCtxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtxRef.current.currentTime + 0.035);

      gain.gain.setValueAtTime(0.2, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.035);
    } catch {
      // Audio fallback
    }
  };

  const playWinSound = () => {
    try {
      initAudioCtx();
      if (!audioCtxRef.current) return;

      const now = audioCtxRef.current.currentTime;
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.085);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.088);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio fallback
    }
  };

  const monitorSpinSound = (endRotation: number, startTime: number, duration: number) => {
    const startRotation = rotationRef.current;

    const checkTick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing Curve logic for fast to slow friction sound mapping
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentRot = startRotation + (endRotation - startRotation) * easeProgress;

      const normalizedAngle = (360 - (currentRot % 360) + 270) % 360;
      const currentSegment = Math.floor(normalizedAngle / segmentAngle);

      if (currentSegment !== lastTickSegmentRef.current) {
        lastTickSegmentRef.current = currentSegment;
        playTickSound();

        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(8);
        }
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(checkTick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(checkTick);
  };

  const handleSecureSpin = async () => {
    if (isSpinning || hasSpunToday) return;

    setErrorMessage(null);
    setIsSpinning(true);
    setReward(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        setIsSpinning(false);
        setErrorMessage("Please log in to spin!");
        return;
      }

      // Secure Database RPC Execution
      const { data, error } = await supabase.rpc("spin_daily_xp_wheel", {
        p_user_id: user.id,
      });

      if (error || !data || !data.success) {
        setIsSpinning(false);
        if (
          data?.message?.toLowerCase().includes("already") ||
          error?.message?.toLowerCase().includes("already")
        ) {
          setHasSpunToday(true);
        }
        setErrorMessage(data?.message || error?.message || "Spin action failed.");
        return;
      }

      const wonXp = Number(data.won_xp);
      const newTotalXp = Number(data.new_total_xp);

      const winningIndex = SEGMENTS.findIndex((seg) => seg.value === wonXp);
      const targetSegmentIndex = winningIndex !== -1 ? winningIndex : 0;

      // 12 Full Turns for 8-10 sec spin experience
      const extraTurns = 12 * 360;
      const targetAngle = 360 - targetSegmentIndex * segmentAngle - segmentAngle / 2;

      const currentRotation = rotation - (rotation % 360);
      const newRotation = currentRotation + extraTurns + targetAngle;

      // Spin Duration: 9 Seconds (Realistic Tez se Dhire slowing effect)
      const spinDuration = 9000;
      const startTime = Date.now();

      monitorSpinSound(newRotation, startTime, spinDuration);

      setRotation(newRotation);
      rotationRef.current = newRotation;

      setTimeout(() => {
        setIsSpinning(false);
        setReward(wonXp);
        setHasSpunToday(true);

        playWinSound();

        localStorage.setItem("user_xp_cache", newTotalXp.toString());
        window.dispatchEvent(new CustomEvent("xpUpdated", { detail: newTotalXp }));

        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([40, 60, 120]);
        }

        setTimeout(() => {
          setReward(null);
        }, 3000);
      }, spinDuration);
    } catch (err) {
      console.error("Spin error:", err);
      setIsSpinning(false);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  if (hasSpunToday === null) {
    return (
      <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-xs flex items-center justify-center w-full min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const numLights = 12;
  const lights = Array.from({ length: numLights });

  return (
    <div className="bg-white rounded-[2rem] p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center gap-4 w-full box-border relative overflow-hidden">
      
      {/* Title Header */}
      <div className="text-center space-y-1">
        <h2 className="text-lg sm:text-xl font-black text-[#0F172A] flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Lucky XP Wheel
        </h2>
        <p className="text-xs font-bold text-slate-500">
          {hasSpunToday
            ? "You claimed today's XP reward! Come back tomorrow."
            : "Spin once daily to earn between 10 and 100 XP!"}
        </p>
      </div>

      {/* Wheel Box Container */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-2">
        
        {/* Pointer Arrow */}
        <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-blue-600 drop-shadow-md" />

        {/* Outer Ring with Lights */}
        <div className="w-full h-full rounded-full border-4 border-slate-200/80 shadow-xl relative overflow-hidden bg-slate-900 p-2">
          
          {/* Border Bulbs */}
          {lights.map((_, i) => {
            const angleDeg = i * (360 / numLights);
            const isBlue = i % 2 === 0;
            return (
              <div
                key={i}
                className="absolute w-full h-full top-0 left-0 pointer-events-none flex justify-center items-start pt-0.5"
                style={{
                  transform: `rotate(${angleDeg}deg)`,
                  transformOrigin: "50% 50%",
                }}
              >
                <div
                  className={`w-2 h-2 rounded-full animate-pulse transition-all ${
                    isBlue
                      ? "bg-cyan-400 shadow-[0_0_6px_#38bdf8]"
                      : "bg-white shadow-[0_0_6px_#ffffff]"
                  }`}
                  style={{
                    animationDuration: isBlue ? "0.8s" : "1.2s",
                  }}
                />
              </div>
            );
          })}

          {/* Rotating Wheel Container */}
          <div
            className="w-full h-full rounded-full relative overflow-hidden border-2 border-white/20"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? "transform 9s cubic-bezier(0.12, 0.99, 0.15, 1)"
                : "none",
            }}
          >
            {/* SVG Slices */}
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {SEGMENTS.map((seg, index) => {
                const startAngle = index * segmentAngle;
                const endAngle = (index + 1) * segmentAngle;

                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={seg.color}
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                  />
                );
              })}
            </svg>

            {/* Segment Content */}
            {SEGMENTS.map((seg, index) => {
              const angle = index * segmentAngle + segmentAngle / 2;
              return (
                <div
                  key={index}
                  className="absolute top-0 left-0 w-full h-full flex justify-center items-start pt-3 font-black text-xs drop-shadow-sm select-none"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: "50% 50%",
                    color: seg.textColor,
                  }}
                >
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{seg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spin / Locked Center Button */}
        <button
          onClick={handleSecureSpin}
          disabled={isSpinning || Boolean(hasSpunToday)}
          className={`absolute z-20 w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-white text-white font-black text-xs shadow-xl flex flex-col items-center justify-center transition-all border-b-4 ${
            isSpinning
              ? "bg-blue-600 opacity-90 cursor-not-allowed border-b-blue-900"
              : hasSpunToday
              ? "bg-slate-700 opacity-95 cursor-not-allowed border-b-slate-900 text-slate-300 pointer-events-none"
              : "bg-blue-600 hover:bg-blue-500 active:scale-95 hover:scale-105 border-b-blue-900"
          }`}
        >
          {isSpinning ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : hasSpunToday ? (
            <div className="flex flex-col items-center gap-0.5">
              <Lock className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[9px] tracking-wider uppercase font-black">LOCKED</span>
            </div>
          ) : (
            <span className="text-xs sm:text-sm tracking-wider">SPIN</span>
          )}
        </button>
      </div>

      {/* Security Error Banner */}
      {errorMessage && (
        <div className="w-full bg-blue-50 border border-blue-200 p-2.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-blue-700">
          <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Reward Banner */}
      {reward !== null ? (
        <div className="w-full bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-blue-800">Verified & Added!</p>
              <p className="text-xs font-black text-blue-950 flex items-center gap-1">
                +{reward} XP Secured!
                <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600 inline" />
              </p>
            </div>
          </div>
        </div>
      ) : (
        hasSpunToday && (
          <div className="w-full bg-slate-50 border border-slate-200/80 p-2.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-extrabold text-slate-600">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-[11px]">Daily Spin Completed! Unlocks tomorrow at midnight.</span>
          </div>
        )
      )}
    </div>
  );
}