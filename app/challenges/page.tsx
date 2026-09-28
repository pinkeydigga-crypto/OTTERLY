"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, CheckCircle2, Loader2, LayoutDashboard,
  Swords, Scan, Trophy, Compass, User, Settings, PanelLeft, X, ChevronRight,
  Sparkles, Check, ShieldAlert, Palette, Grid, Zap, RefreshCw, Star
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { updateActivityStreak } from "@/lib/streak";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";
import PracticeCanvas from "@/components/PracticeCanvas";
import { playCelebrationSound } from "@/lib/sound";

// Typewriter Text Effect Component
function TypewriterText({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className="font-mono text-slate-800 tracking-wide inline-block">
      {displayedText}
      <span className="animate-pulse text-blue-600 font-bold ml-0.5">|</span>
    </span>
  );
}

interface TutorialStep {
  step: number;
  title: string;
  instruction: string;
  tips: string[];
  imageUrl?: string;
  typewriterText?: string;
}

interface LocalChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xp: number;
  previewImage: string;
  steps: TutorialStep[];
}

const EYE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Materials Ready",
    instruction: "",
    tips: ["Use a light HB pencil for sketching", "Keep a good eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Grab your pencil and paper!"
  },
  {
    step: 2,
    title: "Step 2: Basic Eye Outline & Crease",
    instruction: "Draw an almond shape outline for the eye. Add the tear duct curve on the left and a gentle lid fold above.",
    tips: ["Keep your strokes very light and smooth", "Focus on clean symmetrical curves"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Iris, Pupil & Highlight Circle",
    instruction: "Draw a large circular iris with a dark pupil inside. Keep a crisp white circle reserved for the bright reflection highlight.",
    tips: ["Shade radial lines outward from the pupil", "Do not draw over the highlight circle"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Upper Eyelashes & Eyelid Depth",
    instruction: "Add long, curved eyelashes along the top lash line. Shade softly along the upper eyelid fold to create natural depth.",
    tips: ["Sweep lashes outwards in natural curves", "Thicken the top eyelash border slightly"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Lower Lashes & Final Shading Details",
    instruction: "Add shorter bottom eyelashes. Softly shade the tear duct area and rim to complete a realistic 3D look.",
    tips: ["Keep bottom lashes sparse and lighter", "Blend edge shadows for a soft realistic realistic touch"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye4.jpeg"
  },
  {
    step: 6,
    title: "Step 6: Interactive Practice Canvas",
    instruction: "Awesome progress! Now practice drawing your realistic eye directly on the interactive canvas below.",
    tips: ["Focus on smooth strokes", "Adjust brush size for finer details"],
    imageUrl: ""
  }
];

const LIP_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Ready Your Tools",
    instruction: "",
    tips: ["Keep your pencil sharp", "Use a blending stump for soft transitions"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to shade lips!"
  },
  {
    step: 2,
    title: "Step 2: Outline & Cupid's Bow",
    instruction: "Sketch the outer lip boundary, center line, and V-shaped Cupid's bow gently.",
    tips: ["Keep lines soft to blend easily later", "Ensure lip proportions are balanced"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Base Shading & Volume",
    instruction: "Apply soft base graphite shading across both lips to establish a round, 3D structure.",
    tips: ["Darken near the center lip fold", "Blend using tissue or a stump"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Vertical Texturing",
    instruction: "Add light curved vertical creases following the lip contours to simulate natural skin texture.",
    tips: ["Curve the lines slightly instead of straight lines", "Maintain a gentle touch"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: High Contrast & Gloss Highlight",
    instruction: "Darken corners and center opening. Use a precise eraser to pull crisp white highlights on the lower lip.",
    tips: ["High contrast creates a glossy sheen", "Now test your skills on the canvas"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips%204.jpeg"
  }
];

const LOCAL_CHALLENGES: LocalChallenge[] = [
  {
    id: "eye-drawing-1min",
    title: "Challenge: The Realistic Eye",
    description: "Master iris details, pupil depth, eyelid folds, and realistic eyelashes step by step.",
    difficulty: "intermediate",
    xp: 60,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye4.jpeg",
    steps: EYE_STEPS
  },
  {
    id: "lip-drawing-challenge",
    title: "Challenge: The Realistic Lip",
    description: "Learn lip contours, vertical crease texturing, soft volume shading, and glossy highlights.",
    difficulty: "intermediate",
    xp: 80,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips%204.jpeg",
    steps: LIP_STEPS
  }
];

export default function ChallengesPage() {
  const isOffline = useOfflineGuard();

  const [userXp, setUserXp] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar_url: string } | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const [activeView, setActiveView] = useState<'hub' | 'challenge-flow'>('hub');
  const [activeChallengeId, setActiveChallengeId] = useState<string>("eye-drawing-1min");
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Modal State for Claiming XP
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);

  // Difficulty State
  const [selectedDifficulty, setSelectedDifficulty] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [showLevelModal, setShowLevelModal] = useState<boolean>(false);

  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
  // Updated mascot for Level question & Header banner
  const ottoMascotUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Otterly%20Take%20the%20Challenge%20(1)%20(2)%20(1).png";

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Fallback
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedLevel = localStorage.getItem("user_drawing_level") as "beginner" | "intermediate" | "advanced" | null;
      if (savedLevel) {
        setSelectedDifficulty(savedLevel);
      } else {
        setShowLevelModal(true);
      }
    }
  }, []);

  const handleSelectLevel = (level: "beginner" | "intermediate" | "advanced") => {
    triggerHaptic();
    setSelectedDifficulty(level);
    if (typeof window !== "undefined") {
      localStorage.setItem("user_drawing_level", level);
    }
    setShowLevelModal(false);
  };

  // Egress Optimized Fetch Data
  const fetchPageData = useCallback(async () => {
    if (typeof window !== "undefined") {
      const cachedXp = localStorage.getItem("user_xp_cache");
      if (cachedXp) {
        setUserXp(Number(cachedXp));
      }
    }

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (authError || !user) {
        if (!isOffline && typeof window !== "undefined" && navigator.onLine) {
          setIsVerified(false);
        }
        setLoading(false);
        return;
      }

      if (!user.email_confirmed_at) {
        setIsVerified(false);
        setLoading(false);
        return;
      }

      setIsVerified(true);

      // Egress optimization: fetch only needed columns
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, username, avatar_url, xp")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.xp !== null && profile.xp !== undefined) {
          const dbXp = profile.xp;
          setUserXp(dbXp);
          if (typeof window !== "undefined") {
            localStorage.setItem("user_xp_cache", dbXp.toString());
          }
        }
        setUserProfile({
          name: (profile.name || profile.username || "Artist").replace(/<[^>]*>?/gm, "").trim(),
          avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
        });
      } else {
        setUserProfile({
          name: user.email?.split("@")[0] || "Artist",
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
        });
      }

      // Egress optimization: fetch only challenge_id
      const { data: completed } = await supabase
        .from("user_completed_challenges")
        .select("challenge_id")
        .eq("user_id", user.id);

      if (completed) {
        setCompletedChallenges(completed.map((c) => c.challenge_id));
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  useEffect(() => {
    fetchPageData();

    const handleXpEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (typeof customEvent.detail === 'number') {
        setUserXp(customEvent.detail);
        if (typeof window !== "undefined") {
          localStorage.setItem("user_xp_cache", customEvent.detail.toString());
        }
      }
    };

    window.addEventListener('xpUpdated', handleXpEvent);
    return () => window.removeEventListener('xpUpdated', handleXpEvent);
  }, [fetchPageData]);

  const handleReviewChallenge = async () => {
    triggerHaptic();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (user) {
        const updatedStreak = await updateActivityStreak(user.id);
        if (updatedStreak !== null) {
          window.dispatchEvent(new CustomEvent('streakUpdated', { detail: updatedStreak }));
        }
      }
    } catch (err) {
      console.error("Error updating streak on review:", err);
    } finally {
      setActiveView('hub');
    }
  };

  const handleOpenClaimModal = () => {
    triggerHaptic();
    playCelebrationSound(); // Play audio when claim form opens
    setShowClaimModal(true);
  };

  const handleConfirmClaimXP = async (challenge: LocalChallenge) => {
    triggerHaptic();
    if (claimingId === challenge.id) return;

    setClaimingId(challenge.id);
    const previousXp = userXp;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (!user || !user.email_confirmed_at) {
        if (!isOffline) {
          alert("Please verify your account to complete challenges!");
        } else {
          alert("You are offline. Please connect to the internet.");
        }
        setClaimingId(null);
        setShowClaimModal(false);
        setActiveView('hub');
        return;
      }

      const { data: newTotalXp, error: rpcError } = await supabase.rpc('complete_challenge_and_add_xp', {
        p_challenge_id: challenge.id,
        p_xp_to_add: challenge.xp
      });

      if (rpcError) {
        setUserXp(previousXp);
        console.error("RPC Error:", rpcError);
        alert("Server response slow. Please try again in a moment.");
        return;
      }

      const updatedXp = Number(newTotalXp);

      const updatedStreak = await updateActivityStreak(user.id);
      if (updatedStreak !== null) {
        window.dispatchEvent(new CustomEvent('streakUpdated', { detail: updatedStreak }));
      }

      setUserXp(updatedXp);
      if (typeof window !== "undefined") {
        localStorage.setItem("user_xp_cache", updatedXp.toString());
      }
      setCompletedChallenges((prev) => Array.from(new Set([...prev, challenge.id])));
      window.dispatchEvent(new CustomEvent('xpUpdated', { detail: updatedXp }));

      setShowClaimModal(false);
      setActiveView('hub');
    } catch (err: any) {
      setUserXp(previousXp);
      console.error("Error completing challenge:", err);
      alert("Error saving challenge completion: " + (err.message || "Unknown error"));
    } finally {
      setClaimingId(null);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isVerified === false && !isOffline) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 tracking-tight font-sans">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 max-w-md w-full text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Please verify your email address to complete challenges and earn XP.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              className="block w-full py-3.5 bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs rounded-2xl border-b-2 border-blue-800 transition text-center"
            >
              Log In / Verify Account
            </Link>
            <Link
              href="/dashboard"
              className="block w-full py-3 text-slate-500 font-black text-xs hover:bg-slate-50 rounded-2xl transition text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredChallenges = LOCAL_CHALLENGES.filter(
    c => selectedDifficulty ? c.difficulty === selectedDifficulty : true
  );

  const currentChallenge = LOCAL_CHALLENGES.find(c => c.id === activeChallengeId) || LOCAL_CHALLENGES[0];
  const activeStepList = currentChallenge.steps;
  const isCurrentDone = completedChallenges.includes(currentChallenge.id);
  const isLastStep = currentStep === activeStepList.length - 1;

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", active: true, icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row tracking-tight font-sans pb-20 md:pb-0 relative">
      
      {/* CLAIM XP MODAL (REAL XP DATA) */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Star Icon */}
            <div className="pt-2">
              <div className="w-20 h-20 bg-amber-400/20 rounded-3xl flex items-center justify-center mx-auto relative">
                <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-md shadow-amber-400/50">
                  <Star className="w-10 h-10 fill-white text-white" />
                </div>
              </div>
            </div>

            {/* Dynamic Real XP */}
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                + {currentChallenge.xp} XP
              </h2>
            </div>

            {/* Claim Action Button */}
            <button
              onClick={() => handleConfirmClaimXP(currentChallenge)}
              disabled={claimingId === currentChallenge.id}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-base rounded-full shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {claimingId === currentChallenge.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Star className="w-5 h-5 fill-white text-white" />
                  <span>Claim XP</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ONBOARDING LEVEL MODAL (WITH MASCOT) */}
      {showLevelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <p className="text-[11px] font-black uppercase tracking-wider text-blue-600">
              QUESTION 1 OF 1
            </p>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              What is your current skill level?
            </h2>

            <div className="flex items-center gap-3 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
              <div className="w-14 h-14 relative shrink-0">
                <Image
                  src={ottoMascotUrl}
                  alt="Otto Mascot"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-slate-600 leading-snug">
                Challenges will be customized specifically for your level!
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">YOUR LEVEL</p>
              
              <div className="flex flex-wrap gap-2.5">
                {[
                  { level: "beginner", label: "Beginner" },
                  { level: "intermediate", label: "Intermediate" },
                  { level: "advanced", label: "Advanced" },
                ].map((item) => (
                  <button
                    key={item.level}
                    onClick={() => handleSelectLevel(item.level as any)}
                    className="px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700 font-bold text-sm transition-all shadow-2xs hover:shadow-md active:scale-95 cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerHaptic();
              setIsMobileSidebarOpen(true);
            }}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          
          <Image
            src={logoUrl}
            alt="Otterleo Logo"
            width={120}
            height={48}
            style={{ width: 'auto', height: 'auto' }}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Image
                  src={logoUrl}
                  alt="Otterleo Logo"
                  width={120}
                  height={48}
                  style={{ width: 'auto', height: 'auto' }}
                  className="h-10 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => {
                        triggerHaptic();
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                        item.active
                          ? "bg-[#2563EB] text-white border-b-4 border-blue-800"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Image
                src={userProfile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
                alt="User Avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover bg-blue-100"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-black text-[#0F172A] truncate">{userProfile?.name || "Artist"}</p>
                <p className="text-xs font-bold text-blue-600">Level {Math.floor(userXp / 100) + 1}</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Image
              src={logoUrl}
              alt="Otterleo Logo"
              width={160}
              height={64}
              style={{ width: 'auto', height: 'auto' }}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={triggerHaptic}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                    item.active
                      ? "bg-[#2563EB] text-white border-b-4 border-blue-800"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <Image
            src={userProfile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
            alt="User Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-xl object-cover bg-blue-100"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-black text-[#0F172A] truncate">{userProfile?.name || "Artist"}</p>
            <p className="text-xs font-bold text-blue-600">Level {Math.floor(userXp / 100) + 1}</p>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-4 overflow-y-auto">
        
        {/* Top Desktop Navigation Header */}
        <div className="hidden md:flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={triggerHaptic}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-xs hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {activeView === 'hub' ? (
          <>
            {/* Top Banner Header with Updated Mascot */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-2xs flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1 pr-3">
                <h1 className="text-2xl font-black text-[#0F172A]">Challenges</h1>
                <p className="text-xs font-bold text-slate-500 max-w-xs leading-relaxed">
                  Complete step-by-step challenges, earn XP, and level up your drawing skills!
                </p>
              </div>
              <Image
                src={ottoMascotUrl}
                alt="Mascot"
                width={128}
                height={128}
                style={{ width: 'auto', height: 'auto' }}
                className="w-24 sm:w-28 h-auto object-contain shrink-0"
              />
            </div>

            {/* ACTIVE LEVEL DISPLAY + RESET LEVEL BUTTON */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 pl-2">Selected Level:</span>
                {selectedDifficulty && (
                  <span className="px-3 py-1 rounded-full text-xs font-black capitalize bg-slate-900 text-white shadow-xs">
                    {selectedDifficulty}
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowLevelModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Change Level</span>
              </button>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
              {filteredChallenges.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 text-center space-y-2">
                  <p className="text-sm font-black text-slate-700">No challenges available for this level yet.</p>
                  <p className="text-xs font-bold text-slate-400">Try changing your level to explore more challenges!</p>
                </div>
              ) : (
                filteredChallenges.map((challenge) => {
                  const isDone = completedChallenges.includes(challenge.id);
                  return (
                    <div
                      key={challenge.id}
                      className="bg-white rounded-[2rem] p-5 border border-slate-200/80 shadow-2xs space-y-4"
                    >
                      {/* Completed Badge */}
                      {isDone && (
                        <div className="flex justify-end w-full">
                          <span className="text-[11px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        </div>
                      )}

                      {/* Clean Image Frame */}
                      <div className="w-full h-36 sm:h-44 flex items-center justify-center relative">
                        <Image
                          src={challenge.previewImage}
                          alt={challenge.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain hover:scale-105 transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h2 className="font-black text-slate-900 text-lg">{challenge.title}</h2>
                          <p className="text-xs font-bold text-slate-500 mt-1">
                            {challenge.description}
                          </p>
                        </div>

                        {/* CHALLENGE XP REWARD BADGE */}
                        <div className="flex items-center gap-3 text-xs font-black">
                          <span className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            +{challenge.xp} XP
                          </span>

                          <span className="px-2.5 py-1 rounded-lg text-[11px] uppercase border bg-slate-50 text-slate-600 border-slate-200">
                            {challenge.difficulty}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            triggerHaptic();
                            setActiveChallengeId(challenge.id);
                            setActiveView('challenge-flow');
                            setCurrentStep(0);
                          }}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs border-b-2 transition-all cursor-pointer ${
                            isDone
                              ? "bg-slate-800 hover:bg-slate-900 text-white border-slate-950"
                              : "bg-[#2563EB] hover:bg-blue-600 text-white border-blue-800"
                          }`}
                        >
                          <span>{isDone ? 'Review Challenge' : 'Accept Challenge 🚀'}</span>
                          {!isDone && <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* STEP-BY-STEP TUTORIAL VIEW */
          <div className="bg-white rounded-[2rem] p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-[11px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-xl">
                Step {currentStep + 1} of {activeStepList.length}
              </span>
              <button
                onClick={() => {
                  triggerHaptic();
                  setActiveView('hub');
                }}
                className="text-xs font-black text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                Exit Mission
              </button>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">{activeStepList[currentStep].title}</h3>
              {activeStepList[currentStep].instruction && (
                <p className="text-xs font-bold text-slate-500 mt-0.5 leading-relaxed">
                  {activeStepList[currentStep].instruction}
                </p>
              )}
            </div>

            {/* Step Content Rendering */}
            {isLastStep ? (
              <div className="space-y-3">
                <div className="text-center bg-indigo-50 border border-indigo-200 py-2 px-3 rounded-xl">
                  <p className="text-xs font-black text-indigo-700 uppercase tracking-wide flex items-center justify-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    You can also practice it on digital canvas
                  </p>
                </div>
                <PracticeCanvas />
              </div>
            ) : activeStepList[currentStep].typewriterText ? (
              <div className="w-full flex flex-col sm:flex-row-reverse items-center justify-center gap-3 sm:gap-5 py-2 px-1">
                
                {/* Mascot Image */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 flex items-center justify-center relative">
                  {activeStepList[currentStep].imageUrl && (
                    <Image
                      src={activeStepList[currentStep].imageUrl!}
                      alt="Otto Mascot"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                      unoptimized
                    />
                  )}
                </div>

                {/* Speech Bubble */}
                <div className="relative bg-blue-50/80 border border-blue-200 rounded-2xl px-5 py-3 shadow-2xs max-w-xs text-center sm:text-left">
                  <div className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-l-[10px] border-l-blue-200 border-b-8 border-b-transparent">
                    <div className="absolute right-[1px] -top-[7px] w-0 h-0 border-t-[7px] border-t-transparent border-l-[9px] border-l-blue-50 border-b-[7px] border-b-transparent" />
                  </div>

                  <div className="block sm:hidden absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-b-[10px] border-b-blue-200 border-r-8 border-r-transparent">
                    <div className="absolute -left-[7px] top-[1px] w-0 h-0 border-l-[7px] border-l-transparent border-b-[9px] border-b-blue-50 border-r-[7px] border-r-transparent" />
                  </div>

                  <p className="text-sm font-extrabold text-blue-950">
                    <TypewriterText text={activeStepList[currentStep].typewriterText || ""} speed={50} />
                  </p>
                </div>

              </div>
            ) : (
              <div className="w-full h-48 sm:h-56 flex items-center justify-center relative overflow-hidden">
                {activeStepList[currentStep].imageUrl && (
                  <Image
                    src={activeStepList[currentStep].imageUrl!}
                    alt="Tutorial step reference"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain scale-100 transition-transform duration-300"
                  />
                )}
              </div>
            )}

            {/* Tips Section */}
            {currentStep !== 0 && activeStepList[currentStep].tips?.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200/60 p-3 rounded-2xl space-y-1.5">
                <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Pro Tips:
                </h4>
                <ul className="space-y-1">
                  {activeStepList[currentStep].tips.map((tip, idx) => (
                    <li key={idx} className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  triggerHaptic();
                  setCurrentStep(prev => Math.max(0, prev - 1));
                }}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-xl font-black text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition cursor-pointer"
              >
                Previous
              </button>

              {!isLastStep ? (
                <button
                  onClick={() => {
                    triggerHaptic();
                    setCurrentStep(prev => Math.min(activeStepList.length - 1, prev + 1));
                  }}
                  className="px-5 py-2 rounded-xl font-black text-xs bg-[#2563EB] text-white hover:bg-blue-600 border-b-2 border-blue-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {isCurrentDone ? (
                    <button
                      onClick={handleReviewChallenge}
                      className="px-5 py-2 rounded-xl font-black text-xs bg-slate-800 hover:bg-slate-900 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Return to Hub</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenClaimModal}
                      className="px-5 py-2 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Finish & Claim +{currentChallenge.xp} XP</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-200 shadow-lg">
        <div className="mx-auto flex w-full items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {[
            { name: "Home", path: "/dashboard", icon: LayoutDashboard },
            { name: "Challenges", path: "/challenges", active: true, icon: Swords },
            { name: "Grid", path: "/grid-maker", icon: Grid },
            { name: "Scan", path: "/scan", icon: Scan },
            { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={triggerHaptic}
                className="group relative flex flex-1 flex-col items-center gap-0.5 py-1 transition-all"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/30"
                      : "text-slate-400 group-hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={`text-[10px] font-bold leading-tight transition-colors ${
                    isActive ? "text-[#2563EB]" : "text-slate-400"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}