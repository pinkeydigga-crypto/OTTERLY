"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Loader2, LayoutDashboard,
  Swords, Scan, Trophy, Compass, Award, User, Settings, PanelLeft, X, ChevronRight,
  Sparkles, Check, ShieldAlert, Palette, FastForward, Grid, Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { updateActivityStreak } from "@/lib/streak";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";
import PracticeCanvas from "@/components/PracticeCanvas";
import { playCelebrationSound } from "@/lib/sound";

// Typewriter Text Effect Component with Safe Cleanup
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
  difficulty: "intermediate";
  xp: number;
  previewImage: string;
  steps: TutorialStep[];
}

const EYE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Materials Ready",
    instruction: "",
    tips: ["Use a light HB pencil for sketching", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "take pencil and paper"
  },
  {
    step: 2,
    title: "Step 2: Basic Eye Outline",
    instruction: "Lightly sketch the almond shape of the eye, including the tear duct and defining the upper eyelid fold.",
    tips: ["Keep lines light", "Check symmetry"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Screenshot_10-9-2026_14463_chatgpt.com.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Iris & Pupil Details",
    instruction: "Draw the inner circle for the iris and the central pupil. Begin adding basic shading and mark the highlight.",
    tips: ["Center the pupil", "Define the light source"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Screenshot_10-9-2026_144627_chatgpt.com.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Eyelashes & Depth",
    instruction: "Apply rich shading to the iris and add detailed, natural eyelashes along both the upper and lower lids.",
    tips: ["Vary lash thickness", "Deepen the shadows"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Screenshot_10-9-2026_144810_chatgpt.com.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Practice Drawing Canvas",
    instruction: "Awesome work! Practice drawing your eye outline directly on the interactive canvas below.",
    tips: ["Focus on smooth curve lines", "Use line thickness settings"],
    imageUrl: ""
  }
];

const LOCAL_CHALLENGES: LocalChallenge[] = [
  {
    id: "eye-drawing-1min",
    title: "Challenge: The Realistic Eye",
    description: "Time to step up! Render a hyper-realistic eye and secure your spot on the leaderboard.",
    difficulty: "intermediate",
    xp: 60,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Screenshot_10-9-2026_144810_chatgpt.com.jpeg",
    steps: EYE_STEPS
  }
];

export default function ChallengesPage() {
  const router = useRouter();
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

  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
  const mascotImageUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Otterly%20Take%20the%20Challenge%20(1)%20(2)%20(1).png";

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Safe fallback
      }
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPageData = useCallback(async () => {
    const cachedXp = localStorage.getItem("user_xp_cache");
    if (cachedXp) {
      setUserXp(Number(cachedXp));
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

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, username, avatar_url, xp")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.xp !== null && profile.xp !== undefined) {
          const dbXp = profile.xp;
          setUserXp(dbXp);
          localStorage.setItem("user_xp_cache", dbXp.toString());
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
        localStorage.setItem("user_xp_cache", customEvent.detail.toString());
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isOffline) {
        fetchPageData();
      }
    };

    window.addEventListener('xpUpdated', handleXpEvent);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', () => {
      if (!isOffline) fetchPageData();
    });

    return () => {
      window.removeEventListener('xpUpdated', handleXpEvent);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', () => fetchPageData());
    };
  }, [fetchPageData, isOffline]);

  const handleReviewChallenge = async () => {
    triggerHaptic();
    
    // Celebration sound without delay cut
    playCelebrationSound();

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

  const handleCompleteChallenge = async (challenge: LocalChallenge) => {
    triggerHaptic();
    if (claimingId === challenge.id) return;

    if (completedChallenges.includes(challenge.id)) {
      await handleReviewChallenge();
      return;
    }

    setClaimingId(challenge.id);
    const previousXp = userXp;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (!user || !user.email_confirmed_at) {
        if (!isOffline) {
          alert("Please verify your account to complete challenges!");
        } else {
          alert("Aap offline hain. Kripya internet connect karne ke baad try karein.");
        }
        setClaimingId(null);
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
        alert("Server network slow hai! Kripya 5 second baad dobara try karein.");
        return;
      }

      // Play sound immediately to ensure full duration playback
      playCelebrationSound();

      const updatedXp = Number(newTotalXp);

      const updatedStreak = await updateActivityStreak(user.id);
      if (updatedStreak !== null) {
        window.dispatchEvent(new CustomEvent('streakUpdated', { detail: updatedStreak }));
      }

      setUserXp(updatedXp);
      localStorage.setItem("user_xp_cache", updatedXp.toString());
      setCompletedChallenges((prev) => Array.from(new Set([...prev, challenge.id])));
      window.dispatchEvent(new CustomEvent('xpUpdated', { detail: updatedXp }));

      setActiveView('hub');
    } catch (err: any) {
      setUserXp(previousXp);
      console.error("Error completing challenge:", err);
      alert("Error saving challenge completion: " + (err.message || "Unknown error"));
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6FAFF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isVerified === false && !isOffline) {
    return (
      <div className="min-h-screen bg-[#F6FAFF] flex flex-col items-center justify-center p-4 tracking-tight font-sans">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 max-w-md w-full text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Kripya challenges complete karne aur XP earn karne ke liye apni email id verify karein.
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

  const currentChallenge = LOCAL_CHALLENGES.find(c => c.id === activeChallengeId) || LOCAL_CHALLENGES[0];
  const activeStepList = currentChallenge.steps;
  const isCurrentDone = completedChallenges.includes(currentChallenge.id);
  const activeTabChallenge = LOCAL_CHALLENGES[0];

  const isLastStep = currentStep === activeStepList.length - 1;

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", active: true, icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight font-sans pb-20 md:pb-0">
      
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
            className="h-12 w-auto object-contain"
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
                  className="h-12 w-auto object-contain"
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
              className="h-16 w-auto object-contain"
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
            {/* Top Banner Header with Mascot */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-2xs flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1 pr-3">
                <h1 className="text-2xl font-black text-[#0F172A]">Challenges</h1>
                <p className="text-xs font-bold text-slate-500 max-w-xs">
                  Complete step-by-step challenges, earn XP and level up your skills!
                </p>
              </div>
              <Image
                src={mascotImageUrl}
                alt="Mascot"
                width={128}
                height={128}
                className="w-32 sm:w-36 h-auto object-contain shrink-0"
              />
            </div>

            {/* Challenge Card */}
            <div className="bg-white rounded-[2rem] p-5 border border-slate-200/80 shadow-2xs space-y-4">
              
              {/* Completed Badge */}
              {completedChallenges.includes(activeTabChallenge.id) && (
                <div className="flex justify-end w-full">
                  <span className="text-[11px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                </div>
              )}

              {/* Preview Image Frame */}
              <div className="w-full h-32 sm:h-36 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-2 relative">
                <Image
                  src={activeTabChallenge.previewImage}
                  alt={activeTabChallenge.title}
                  fill
                  className="object-contain p-2 hover:scale-105 transition-all duration-300"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h2 className="font-black text-slate-900 text-lg">{activeTabChallenge.title}</h2>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    {activeTabChallenge.description}
                  </p>
                </div>

                {/* CHALLENGE XP REWARD BADGE */}
                <div className="flex items-center gap-3 text-xs font-black">
                  <span className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                    <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    +{activeTabChallenge.xp} XP
                  </span>

                  <span className="px-2.5 py-1 rounded-lg text-[11px] uppercase bg-blue-50 text-blue-600 border border-blue-100">
                    Pro
                  </span>
                </div>

                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveChallengeId(activeTabChallenge.id);
                    setActiveView('challenge-flow');
                    setCurrentStep(0);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs border-b-2 transition-all cursor-pointer ${
                    completedChallenges.includes(activeTabChallenge.id)
                      ? "bg-slate-800 hover:bg-slate-900 text-white border-slate-950"
                      : "bg-[#2563EB] hover:bg-blue-600 text-white border-blue-800"
                  }`}
                >
                  <span>{completedChallenges.includes(activeTabChallenge.id) ? 'Review Challenge' : 'Accept Challenge 🚀'}</span>
                  {!completedChallenges.includes(activeTabChallenge.id) && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
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
              <div className="w-full h-48 sm:h-56 bg-slate-900/5 border border-slate-200/80 rounded-2xl flex items-center justify-center p-2 overflow-hidden shadow-inner relative">
                {mounted && activeStepList[currentStep].imageUrl && (
                  <Image
                    src={activeStepList[currentStep].imageUrl!}
                    alt="Tutorial step reference"
                    fill
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
                  <button
                    onClick={() => {
                      triggerHaptic();
                      setActiveView('hub');
                    }}
                    className="px-4 py-2 rounded-xl font-black text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Skip</span>
                  </button>

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
                      onClick={() => handleCompleteChallenge(currentChallenge)}
                      disabled={claimingId === currentChallenge.id}
                      className="px-5 py-2 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-70 cursor-pointer"
                    >
                      {claimingId === currentChallenge.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Finish & Claim +{currentChallenge.xp} XP</span>
                        </>
                      )}
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