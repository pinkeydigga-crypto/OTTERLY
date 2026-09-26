"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import PracticeCanvas from "@/components/PracticeCanvas";
import { 
  Download, RotateCcw, ArrowLeft, LayoutDashboard,
  Swords, Scan, Trophy, Compass, Award, User, Settings, Flame, PanelLeft,
  X, Palette, Grid, ShieldAlert, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/components/LoadingScreen";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";

interface ProfileUser {
  id: string;
  full_name: string;
  avatar_url: string;
  streak: number;
  xp_points: number;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  active?: boolean;
}

export default function PracticePage() {
  const isOffline = useOfflineGuard();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Rate limiting states
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
  const mascotImageUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/DRAW%20OTTO.png";

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Fallback
      }
    }
  };

  // Cooldown Timer Interval
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const fetchUserData = useCallback(async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (!user) {
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
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        const p = profile as any;
        const streak = p.streak ?? p.current_streak ?? p.streak_count ?? 0;
        const xp = Number(p.xp_points ?? p.xp ?? 0);

        setCurrentUser({
          id: p.id,
          full_name: p.full_name || p.name || p.username || "Artist",
          avatar_url: p.avatar_url || p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
          streak: Number(streak),
          xp_points: xp,
        });
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      if (!isOffline && typeof window !== "undefined" && navigator.onLine) {
        setIsVerified(false);
      }
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Strict & Instant Rate Limiting Logic
  const handleSaveDrawing = async () => {
    triggerHaptic();
    setRateLimitError(null);

    if (isSaving || cooldown > 0) return;

    const now = Date.now();
    const FIVE_MINUTES_MS = 5 * 60 * 1000;

    // 1. Fetch latest state directly from localStorage
    let storedDownloads: number[] = [];
    try {
      const item = localStorage.getItem("practice_downloads_log");
      if (item) {
        storedDownloads = JSON.parse(item);
      }
    } catch {
      storedDownloads = [];
    }

    // 2. Filter out timestamps older than 5 mins
    const validTimestamps = storedDownloads.filter(
      (timestamp) => now - timestamp < FIVE_MINUTES_MS
    );

    // 3. Strict Check: If already 10 or more in 5 minutes, BLOCK IMMEDIATELY
    if (validTimestamps.length >= 10) {
      const oldestDownload = validTimestamps[0];
      const waitTimeMs = FIVE_MINUTES_MS - (now - oldestDownload);
      const waitSeconds = Math.ceil(waitTimeMs / 1000);
      const mins = Math.floor(waitSeconds / 60);
      const secs = waitSeconds % 60;

      setRateLimitError(
        `Limit Block! Aapne 5 minute me 10 downloads complete kar liye hain. Please ${
          mins > 0 ? `${mins}m ` : ""
        }${secs}s wait karke try karein.`
      );
      
      // Update clean timestamps back to storage
      localStorage.setItem("practice_downloads_log", JSON.stringify(validTimestamps));
      return;
    }

    setIsSaving(true);

    try {
      const canvas = containerRef.current?.querySelector("canvas");

      if (!canvas) {
        alert("Canvas element nahi mila!");
        setIsSaving(false);
        return;
      }

      // Convert Canvas to Blob for smooth Mobile Browsers compatibility
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("Image render karne me error aaya.");
          setIsSaving(false);
          return;
        }

        const fileName = `practice-drawing-${Date.now()}.png`;
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

        // Save current timestamp immediately to LocalStorage BEFORE releasing loading state
        const updatedDownloads = [...validTimestamps, now];
        localStorage.setItem("practice_downloads_log", JSON.stringify(updatedDownloads));

        // 10 second delay add kar rahe hain fast spam protection ke liye
        setCooldown(10);
        setIsSaving(false);
      }, "image/png");

    } catch (error) {
      console.error("Failed to save drawing:", error);
      alert("Drawing save karne me error aaya.");
      setIsSaving(false);
    }
  };

  // Clear Canvas
  const handleClearDrawing = () => {
    triggerHaptic();
    setRateLimitError(null);
    const canvas = containerRef.current?.querySelector("canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const desktopNavItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Practice", path: "/practice", active: true, icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const mobileNavItems: NavItem[] = [
    { name: "Home", path: "/dashboard", icon: LayoutDashboard },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Grid", path: "/grid-maker", icon: Grid },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  // Access Restriction Screen
  if (isVerified === false && !isOffline) {
    return (
      <div className="min-h-screen bg-[#F6FAFF] flex flex-col items-center justify-center p-4 tracking-tight font-sans">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 max-w-md w-full text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Practice Canvas use karne ke liye aapka logged in hona aur email verify hona zaroori hai.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              onClick={triggerHaptic}
              className="block w-full py-3.5 bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs rounded-2xl border-b-2 border-blue-800 transition text-center"
            >
              Log In / Verify Account
            </Link>
            <Link
              href="/dashboard"
              onClick={triggerHaptic}
              className="block w-full py-3 text-slate-500 font-black text-xs hover:bg-slate-50 rounded-2xl transition text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight font-sans pb-24 md:pb-0">

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

        {currentUser && (
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200/80 px-3 py-1 rounded-full text-orange-600 font-extrabold text-xs">
            <Flame className="w-4 h-4 fill-orange-500 stroke-orange-500" />
            <span>{currentUser.streak}</span>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {
              triggerHaptic();
              setIsMobileSidebarOpen(false);
            }}
          />

          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
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
                  onClick={() => {
                    triggerHaptic();
                    setIsMobileSidebarOpen(false);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
                {desktopNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = Boolean(item.active);

                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => {
                        triggerHaptic();
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                        isActive
                          ? "bg-[#2563EB] text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
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

            {currentUser && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Image
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-xl object-cover bg-blue-100"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-[#0F172A] truncate">{currentUser.full_name}</p>
                  <p className="text-xs font-bold text-blue-600">Level {Math.floor(currentUser.xp_points / 100) + 1}</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Image
              src={logoUrl}
              alt="Otterleo Logo"
              width={160}
              height={64}
              className="h-16 sm:h-20 w-auto object-contain"
              priority
            />
          </div>

          <nav className="space-y-1.5">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = Boolean(item.active);

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={triggerHaptic}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                    isActive
                      ? "bg-[#2563EB] text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
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

        {currentUser && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <Image
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover bg-blue-100"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-black text-[#0F172A] truncate">{currentUser.full_name}</p>
              <p className="text-xs font-bold text-blue-600">Level {Math.floor(currentUser.xp_points / 100) + 1}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">

        {/* Dashboard Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={triggerHaptic}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-black text-xs sm:text-sm hover:bg-slate-50 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xs space-y-4">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left flex-1 space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Practice Canvas
              </h1>
              <p className="text-slate-500 font-bold text-xs sm:text-sm max-w-md">
                Draw whatever you like and download your artwork directly.
              </p>
            </div>

            <div className="w-28 sm:w-36 h-auto shrink-0 flex items-center justify-center">
              <img
                src={mascotImageUrl}
                alt="Mascot"
                className="w-full h-auto object-contain drop-shadow-md"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>

        {/* Rate Limit Banner Warning */}
        {rateLimitError && (
          <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 px-4 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-3 shadow-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{rateLimitError}</span>
          </div>
        )}

        {/* Practice Canvas */}
        <div ref={containerRef} className="w-full bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xs overflow-hidden p-2 sm:p-4">
          <PracticeCanvas />
        </div>

        {/* Action Controls Below Canvas */}
        <div className="flex items-center justify-end gap-3 bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-xs">
          <button
            onClick={handleClearDrawing}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:bg-slate-100 border border-slate-200 font-black rounded-2xl text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <button
            onClick={handleSaveDrawing}
            disabled={isSaving || cooldown > 0}
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-blue-600 disabled:bg-slate-300 disabled:border-slate-400 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black rounded-2xl text-xs sm:text-sm border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isSaving
              ? "Saving..."
              : cooldown > 0
              ? `Wait ${cooldown}s`
              : "Download"}
          </button>
        </div>

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-200 shadow-lg">
        <div className="mx-auto flex w-full items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = Boolean(item.active);

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