"use client";

import { useState, useEffect, useMemo, ChangeEvent, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";
import LoadingScreen from "@/components/LoadingScreen";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  PanelLeft,
  X,
  LayoutDashboard,
  Swords,
  Scan,
  Trophy,
  Compass,
  Award,
  User,
  Settings,
  AlertTriangle,
  Target,
  ShieldAlert,
  Flame,
  Loader2,
  Star,
  Palette,
  Grid,
} from "lucide-react";

interface AIAnalysisResult {
  isDrawing: boolean;
  score?: number;
  skillLevel?: "Beginner" | "Intermediate" | "Advanced";
  strengths?: string[];
  areasToImprove?: string[];
  actionableImprovements?: string[];
  practiceRecommendation?: string;
  motivationalFeedback?: string;
  message?: string;
  lockActive?: boolean;
  nextAllowedTime?: string;
}

interface Profile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  xp: number;
  last_scanned_at?: string | null;
}

function OneTimeGifMascot({ gifUrl, durationMs = 3000 }: { gifUrl: string; durationMs?: number }) {
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (imgRef.current) {
        const img = imgRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width || 300;
        canvas.height = img.naturalHeight || img.height || 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setFrozenFrame(canvas.toDataURL("image/png"));
          setIsFrozen(true);
        }
      }
    }, durationMs);

    return () => clearTimeout(timer);
  }, [gifUrl, durationMs]);

  if (isFrozen && frozenFrame) {
    return (
      <img
        src={frozenFrame}
        alt="Otto Mascot Frozen"
        className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-contain block align-bottom"
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={gifUrl}
      alt="Otto Mascot GIF"
      crossOrigin="anonymous"
      className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-contain block align-bottom"
    />
  );
}

export default function ScanPage() {
  const router = useRouter();
  const isOffline = useOfflineGuard();

  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [countdown, setCountdown] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const mascotGifUrl =
    "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/WhatsAppVideo2026-09-22at14.44.02online-video-cutter.com-ezgif.com-video-to-gif-converter__1__transparent.gif";
  const logoUrl =
    "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!isOffline && typeof window !== "undefined" && navigator.onLine) {
            router.replace("/login");
          }
        } else {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, name, username, email, avatar_url, xp, last_scanned_at")
            .eq("id", user.id)
            .maybeSingle();

          if (profileData) {
            setProfile(profileData);
            // Page load par ab automatic lock nahi lagayenge taaki user bina scan kiye block na ho.
          } else {
            setProfile({
              id: user.id,
              name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Artist",
              username: user.email?.split("@")[0] || "artist",
              email: user.email || "",
              avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
              xp: 0,
              last_scanned_at: null,
            });
          }
        }
      } catch (err) {
      } finally {
        setAuthLoading(false);
      }
    };

    checkUser();
  }, [router, isOffline]);

  const clearLock = useCallback(() => {
    setCountdown(null);
    setAnalysis((prev) => (prev?.lockActive ? null : prev));
  }, []);

  const calculateCountdown = useCallback(() => {
    const nextAllowedIso = analysis?.nextAllowedTime;
    if (!nextAllowedIso) {
      clearLock();
      return;
    }

    const nextAllowed = new Date(nextAllowedIso);
    const currentTime = new Date();
    const difference = nextAllowed.getTime() - currentTime.getTime();

    if (difference <= 0) {
      clearLock();
    } else {
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / (1000 * 60)) % 60);
      const s = Math.floor((difference / 1000) % 60);
      setCountdown({ hours: h, minutes: m, seconds: s });
    }
  }, [analysis?.nextAllowedTime, clearLock]);

  useEffect(() => {
    if (analysis?.nextAllowedTime) {
      calculateCountdown();
      const timerInterval = setInterval(calculateCountdown, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [analysis?.nextAllowedTime, calculateCountdown]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    triggerHaptic();
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(extension) || !ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMessage("Please upload a valid artwork image format (JPG, PNG, or WEBP).");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("Image size is too large. Please upload an image under 5MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage("Unable to read image file. Please try again.");
      e.target.value = "";
    };

    reader.onloadend = () => {
      const img = new Image();
      img.onerror = () => {
        setErrorMessage("Invalid or corrupted image file.");
        setSelectedImage(null);
        e.target.value = "";
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 700;
        const scaleFactor = MAX_WIDTH / img.width;

        if (scaleFactor < 1) {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleFactor;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setSelectedImage(compressedBase64);
        setAnalysis(null);
        setErrorMessage(null);
      };

      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    triggerHaptic();
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysis(null);

    const { data: { user } } = await supabase.auth.getUser();
    const activeUserId = profile?.id || user?.id;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: selectedImage,
          userId: activeUserId 
        }),
      });

      const data: AIAnalysisResult = await res.json();

      // Agar backend se limit out ka status aaye tabhi lock active karein
      if (res.status === 423 && data.lockActive) {
        const nextMidnight = new Date();
        nextMidnight.setHours(24, 0, 0, 0);

        setErrorMessage(data.message || "Your scan limit is out. Come back tomorrow!");
        setAnalysis({
          isDrawing: true,
          lockActive: true,
          nextAllowedTime: nextMidnight.toISOString(),
        });
        setCountdown({ hours: 23, minutes: 59, seconds: 59 });
        setSelectedImage(null);
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.message || "Otto AI is facing high demand. Please try again in a few minutes.");
        setAnalysis(null);
      } else if (data.isDrawing === false) {
        setErrorMessage(data.message || "Please upload a valid artwork image.");
        setAnalysis(null);
      } else {
        // Successful run ke baad hi result show karein aur lock active karein
        setAnalysis(data);
        const nowIso = new Date().toISOString();
        setProfile((prev) => (prev ? { ...prev, last_scanned_at: nowIso } : prev));
      }
    } catch (err: unknown) {
      setErrorMessage("Unable to connect to Otto AI server. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    triggerHaptic();
    setSelectedImage(null);
    setAnalysis(null);
    setErrorMessage(null);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Idea Generator", path: "/generator", icon: Sparkles },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", active: true, icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const mobileGamifiedNav = [
    {
      path: "/dashboard",
      label: "Home",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/HOME.png",
      sizeClass: "w-[28px] h-[28px]"
    },
    {
      path: "/challenges",
      label: "Challenges",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/SWORD.png",
      sizeClass: "w-[28px] h-[28px]"
    },
    {
      path: "/practice",
      label: "Practice",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/PAINT.png",
      sizeClass: "w-[28px] h-[28px]"
    },
    {
      path: "/scan",
      label: "Scan",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/EYES%20NAV.png",
      sizeClass: "w-[32px] h-[32px]"
    },
    {
      path: "/leaderboard",
      label: "Leaderboard",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Glossy%20Golden%20Crown%20Icon.png",
      sizeClass: "w-[32px] h-[32px]"
    }
  ];

  const userXp = Number(profile?.xp) || 0;
  const rawUserName = profile?.name || profile?.username || "Artist";
  const userName = rawUserName.replace(/<[^>]*>?/gm, "").trim();

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight font-sans pb-28 md:pb-0">
      
      <header className="md:hidden sticky top-0 z-50 bg-white shadow-xs border-b border-slate-200 px-4 py-3 flex items-center justify-between">
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
          <img
            src={logoUrl}
            alt="Otterleo Logo"
            className="h-10 w-auto object-contain"
          />
        </div>
      </header>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {
              triggerHaptic();
              setIsMobileSidebarOpen(false);
            }}
          />
          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <img
                  src={logoUrl}
                  alt="Otterleo Logo"
                  className="h-12 w-auto object-contain"
                />
                <button
                  onClick={() => {
                    triggerHaptic();
                    setIsMobileSidebarOpen(false);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      href={item.path}
                      key={item.name}
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
              <img
                src={profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
                alt="User Avatar"
                className="w-10 h-10 rounded-xl object-cover bg-blue-100"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-black text-[#0F172A] truncate">{userName}</p>
                <p className="text-xs font-bold text-blue-600">Level {Math.floor(userXp / 100) + 1}</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="Otterleo Logo"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  href={item.path}
                  key={item.name}
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
          <img
            src={profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
            alt="User Avatar"
            className="w-10 h-10 rounded-xl object-cover bg-blue-100"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-black text-[#0F172A] truncate">{userName}</p>
            <p className="text-xs font-bold text-blue-600">Level {Math.floor(userXp / 100) + 1}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/dashboard"
            onClick={triggerHaptic}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            Back to Dashboard
          </Link>

          <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full text-blue-600 font-extrabold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Otto AI Drawing Coach</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col items-center justify-between min-h-[440px] relative">
            <div className="text-center z-10 space-y-2">
              <h2 className="text-2xl font-black text-[#0F172A]">
                Otto AI Art Evaluator
              </h2>
              <p className="text-xs font-bold text-slate-500 max-w-xs">
                Upload your hand-drawn sketch, painting, or digital artwork to
                receive structured professional feedback.
              </p>
            </div>

            <div className="flex-1 flex items-end justify-center w-full mt-4 -mb-6 z-20">
              <OneTimeGifMascot gifUrl={mascotGifUrl} durationMs={3000} />
            </div>
          </div>

          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                  Scan & Analyze Artwork
                </h1>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-200">
                  Refreshes Daily
                </span>
              </div>
              <p className="text-sm font-bold text-slate-500">
                Upload a clear image of your drawing to start analysis.
              </p>
            </div>

            <div className="w-full relative">
              {countdown && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 rounded-[2rem] p-8 flex flex-col items-center justify-center space-y-6 border-3 border-amber-300 border-dashed text-center">
                  <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border-2 border-amber-200">
                    <ShieldAlert className="w-10 h-10 stroke-[2]" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="inline-block bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200">
                      Refreshes Daily
                    </span>
                    <p className="text-lg font-black tracking-tight text-amber-950 uppercase">
                      Your scan limit is out. Come back tomorrow!
                    </p>
                    <p className="text-sm font-extrabold text-amber-800 leading-relaxed max-w-xs">
                      Otto AI allows 1 scan per day. Your limit resets everyday at midnight.
                    </p>
                  </div>

                  <div className="bg-amber-100 border-2 border-amber-200 px-6 py-4 rounded-3xl font-extrabold text-slate-900 flex items-center gap-5 text-center shadow-inner">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-amber-600 tabular-nums">
                        {String(countdown.hours).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] text-amber-700 uppercase tracking-widest font-black">
                        Hours
                      </span>
                    </div>
                    <span className="text-3xl font-black text-amber-300 -mt-3">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-amber-600 tabular-nums">
                        {String(countdown.minutes).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] text-amber-700 uppercase tracking-widest font-black">
                        Minutes
                      </span>
                    </div>
                    <span className="text-3xl font-black text-amber-300 -mt-3">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-amber-600 tabular-nums">
                        {String(countdown.seconds).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] text-amber-700 uppercase tracking-widest font-black">
                        Seconds
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!selectedImage ? (
                <label className="w-full border-3 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[260px] border-slate-200 hover:border-blue-500 hover:bg-blue-50/30">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform bg-blue-50 text-blue-600">
                    <Upload className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <p className="text-base font-black text-[#0F172A] text-center">
                    Click or drag artwork here to scan
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    Supports PNG, JPG, JPEG, WEBP (Max 5MB • Drawings ONLY)
                  </p>
                </label>
              ) : (
                <div className="relative w-full h-[260px] bg-slate-900 rounded-[2rem] overflow-hidden border-2 border-slate-100 flex items-center justify-center z-10">
                  <img
                    src={selectedImage}
                    alt="Drawing Preview"
                    className="w-full h-full object-contain"
                  />

                  {isAnalyzing && (
                    <>
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f3ff,0_0_30px_#00f3ff] animate-scan z-10" />
                      <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-cyan-500/20 to-transparent animate-scan z-0" />
                    </>
                  )}

                  {!isAnalyzing && (
                    <button
                      onClick={handleReset}
                      className="absolute top-4 right-4 bg-slate-900/80 text-white p-2.5 rounded-xl hover:bg-slate-900 transition-all backdrop-blur-sm z-20"
                      title="Change image"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="border p-5 rounded-2xl flex items-start gap-3 bg-rose-50 border-rose-200">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-rose-600" />
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-rose-800">
                    Otto AI Notice
                  </p>
                  <p className="text-xs font-extrabold leading-relaxed text-rose-950">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {selectedImage && !analysis && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider border-b-4 border-blue-800 hover:bg-blue-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Otto AI Scanning Artwork...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Run Otto AI Art Audit</span>
                  </>
                )}
              </button>
            )}

            {analysis && analysis.isDrawing === true && !analysis.lockActive && (
              <div className="space-y-5">
                <div className="bg-amber-50 border-2 border-dashed border-amber-200 p-5 rounded-2xl flex items-center justify-between text-amber-950 text-sm font-extrabold gap-3">
                  <div className="flex gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-600" />
                    <div>
                      <span>Next artwork scan available tomorrow:</span>
                      <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                        Resets at Midnight
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex flex-col items-center justify-center text-white font-black">
                      <span className="text-2xl leading-none">
                        {analysis.score}
                      </span>
                      <span className="text-[9px] text-blue-200 font-bold uppercase">
                        / 100
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                        Assessed Skill Level
                      </p>
                      <h4 className="text-lg font-black text-blue-400">
                        {analysis.skillLevel} Artist
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 px-3 py-1.5 rounded-full text-xs font-black">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>Audited</span>
                  </div>
                </div>

                {analysis.motivationalFeedback && (
                  <div className="bg-blue-50/80 border border-blue-200/80 p-4 rounded-2xl flex items-start gap-3 relative">
                    <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-black uppercase text-blue-700 tracking-wider">
                        Otto's Encouragement
                      </p>
                      <p className="text-xs font-extrabold text-slate-800 leading-relaxed mt-0.5 relative z-10">
                        "{analysis.motivationalFeedback}"
                      </p>
                    </div>
                  </div>
                )}

                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div className="bg-emerald-50/80 border border-emerald-200/80 p-5 rounded-2xl space-y-3 shadow-inner">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-sm uppercase tracking-wider">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Key Artistic Strengths</span>
                    </div>
                    <ul className="space-y-2.5 pl-1">
                      {analysis.strengths.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-extrabold text-emerald-950 leading-relaxed">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.areasToImprove && analysis.areasToImprove.length > 0 && (
                  <div className="bg-amber-50/80 border border-amber-200/80 p-5 rounded-2xl space-y-3 shadow-inner">
                    <div className="flex items-center gap-2 text-amber-800 font-black text-sm uppercase tracking-wider">
                      <Target className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>Primary Areas to Refine</span>
                    </div>
                    <ul className="space-y-2.5 pl-1">
                      {analysis.areasToImprove.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-extrabold text-amber-950 leading-relaxed">
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.practiceRecommendation && (
                  <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl flex items-start gap-3 shadow-sm border-l-4">
                    <Flame className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-black uppercase text-purple-700 tracking-wider">
                        Recommended Daily Drill (15 Min)
                      </p>
                      <p className="text-xs font-extrabold text-purple-950 leading-relaxed mt-0.5">
                        {analysis.practiceRecommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:w-[370px] sm:mx-auto z-[399] transition-all duration-300 translate-y-0 opacity-100 pointer-events-none lg:hidden">
        <div className="w-full rounded-full border transition-colors duration-300 pointer-events-auto backdrop-blur-2xl shadow-2xl overflow-hidden bg-[#F0F6FF]/90 border-blue-100/80 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <nav className="w-full max-w-sm mx-auto h-[56px] grid grid-cols-5 items-stretch justify-items-center relative px-2">
            {mobileGamifiedNav.map((item) => {
              const isActive = item.path === "/scan";

              return (
                <Link
                  key={item.label}
                  href={item.path}
                  onClick={triggerHaptic}
                  aria-label={item.label}
                  className="group relative w-full h-full flex flex-col items-center justify-center focus:outline-none select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 pointer-events-auto"
                >
                  <div className={`relative flex flex-col items-center justify-center rounded-full transition-all duration-200 ${
                    isActive ? "bg-sky-100/70 border border-[#03A9F4]/70 shadow-xs w-[52px] h-[38px]" : "w-[40px] h-[40px]"
                  }`}>
                    <div className="relative flex items-center justify-center w-full h-full">
                      <img
                        alt={item.label}
                        className={`${item.sizeClass} object-contain drop-shadow-sm select-none`}
                        src={item.iconUrl}
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}