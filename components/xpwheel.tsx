"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, Sparkles, Loader2, Trophy, Clock, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface WheelSegment {
  label: string;
  value: number;
  color: string;
  textColor: string;
}

const SEGMENTS: WheelSegment[] = [
  { label: "10", value: 10, color: "#1E40AF", textColor: "#FFFFFF" },
  { label: "30", value: 30, color: "#2563EB", textColor: "#FFFFFF" },
  { label: "50", value: 50, color: "#3B82F6", textColor: "#FFFFFF" },
  { label: "60", value: 60, color: "#60A5FA", textColor: "#1E3A8A" },
  { label: "80", value: 80, color: "#93C5FD", textColor: "#1E3A8A" },
  { label: "100", value: 100, color: "#DBEAFE", textColor: "#1E40AF" },
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

  const playTickSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, audioCtxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtxRef.current.currentTime + 0.03);

      gain.gain.setValueAtTime(0.15, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.03);
    } catch {
      // Audio fallback
    }
  };

  const monitorSpinSound = (endRotation: number, startTime: number, duration: number) => {
    const startRotation = rotationRef.current;

    const checkTick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = 1 - Math.pow(1 - progress, 3);
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

      const { data, error } = await supabase.rpc("spin_daily_xp_wheel", {
        p_user_id: user.id,
      });

      if (error || !data || !data.success) {
        setIsSpinning(false);
        if (data?.message?.toLowerCase().includes("already") || error?.message?.toLowerCase().includes("already")) {
          setHasSpunToday(true);
        }
        setErrorMessage(data?.message || error?.message || "Spin action failed.");
        return;
      }

      const wonXp = Number(data.won_xp);
      const newTotalXp = Number(data.new_total_xp);

      const winningIndex = SEGMENTS.findIndex((seg) => seg.value === wonXp);
      const targetSegmentIndex = winningIndex !== -1 ? winningIndex : 0;

      // 10 extra full rotations so the wheel spins smoothly for 8 seconds
      const extraTurns = 10 * 360;
      const targetAngle = 360 - targetSegmentIndex * segmentAngle - segmentAngle / 2;

      const currentRotation = rotation - (rotation % 360);
      const newRotation = currentRotation + extraTurns + targetAngle;

      // Spin time set to 8 seconds (8000 ms)
      const spinDuration = 8000;
      const startTime = Date.now();

      monitorSpinSound(newRotation, startTime, spinDuration);

      setRotation(newRotation);
      rotationRef.current = newRotation;

      setTimeout(() => {
        setIsSpinning(false);
        setReward(wonXp);

        localStorage.setItem("user_xp_cache", newTotalXp.toString());
        window.dispatchEvent(new CustomEvent("xpUpdated", { detail: newTotalXp }));

        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([40, 60, 120]);
        }

        // Spin reward dikhne ke 3 seconds baad wheel hide hoke refresh status dikhayega
        setTimeout(() => {
          setHasSpunToday(true);
        }, 3000);
      }, spinDuration);
    } catch (err) {
      console.error("Spin error:", err);
      setIsSpinning(false);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  // 1. Loading State
  if (hasSpunToday === null) {
    return (
      <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-xs flex items-center justify-center max-w-md mx-auto min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // 2. Hide Wheel when already spun today
  if (hasSpunToday && !isSpinning) {
    return (
      <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center gap-3 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-slate-900">Daily Spin Completed!</h3>
        <p className="text-xs font-semibold text-slate-500 max-w-xs">
          You have already claimed your daily XP today. Come back tomorrow after midnight for your next spin!
        </p>
      </div>
    );
  }

  // 3. Wheel View (Visible when spin is available)
  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center gap-6 max-w-md mx-auto">
      {/* Title Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-[#0F172A] flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Daily Secured XP Wheel
        </h2>
        <p className="text-xs font-bold text-slate-500">
          Spin once daily to earn between 10 and 100 XP!
        </p>
      </div>

      {/* Wheel Box Container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Top Pointer Arrow */}
        <div className="absolute -top-3 z-30 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-blue-600 drop-shadow-md" />

        {/* Clean Outer Ring */}
        <div className="w-full h-full rounded-full border-4 border-slate-200/80 shadow-xl relative overflow-hidden bg-white p-1">
          
          {/* Rotating Wheel Container */}
          <div
            className="w-full h-full rounded-full relative overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? "transform 8s cubic-bezier(0.15, 0.99, 0.18, 0.99)"
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
                  className="absolute top-0 left-0 w-full h-full flex justify-center items-start pt-3.5 font-black text-xs sm:text-sm drop-shadow-sm select-none"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: "50% 50%",
                    color: seg.textColor
                  }}
                >
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{seg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Spin Button */}
        <button
          onClick={handleSecureSpin}
          disabled={isSpinning}
          className={`absolute z-20 w-20 h-20 rounded-full border-4 border-white text-white font-black text-sm shadow-xl flex flex-col items-center justify-center transition-all border-b-4 ${
            isSpinning
              ? "bg-[#2563EB] opacity-90 cursor-not-allowed border-b-blue-900"
              : "bg-[#2563EB] hover:bg-blue-600 active:scale-95 hover:scale-105 border-b-blue-900"
          }`}
        >
          {isSpinning ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : (
            <span className="text-base tracking-wider">SPIN</span>
          )}
        </button>
      </div>

      {/* Security Error Banner */}
      {errorMessage && (
        <div className="w-full bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-blue-700">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Winner Reward Banner */}
      {reward !== null && (
        <div className="w-full bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-800">Verified & Added!</p>
              <p className="text-sm font-black text-blue-950 flex items-center gap-1">
                +{reward} XP Secured!
                <Star className="w-4 h-4 fill-blue-600 text-blue-600 inline" />
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}