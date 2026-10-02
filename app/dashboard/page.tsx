"use client";

import { useEffect, useState, useCallback, useRef, TouchEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";
import LoadingScreen from "@/components/LoadingScreen";
import XpWheel from "@/components/xpwheel";
import {
  LayoutDashboard,
  Swords,
  Scan,
  Trophy,
  Compass,
  User,
  Settings,
  Star,
  Flame,
  PanelLeft,
  X,
  ChevronRight,
  Palette,
  Grid,
  ArrowRight
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  xp: number;
  streak: number;
  last_login: string | null;
  created_at?: string;
}

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sanitizeString = (str: string) => {
  return str.replace(/<[^>]*>?/gm, "").trim();
};

export default function DashboardPage() {
  const router = useRouter();
  const isOffline = useOfflineGuard();

  const welcomeMascotUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20dahsbaord%20mascot.png";
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRank, setUserRank] = useState<number | string>("-");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Swipe gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const isFetchingRef = useRef(false);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Fallback
      }
    }
  };

  const fetchDashboardData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (!user) {
        if (!isOffline && typeof window !== "undefined" && navigator.onLine) {
          localStorage.clear();
          router.push("/login");
        }
        return;
      }

      if (typeof window !== "undefined") {
        const cachedXp = localStorage.getItem("user_xp_cache");
        if (cachedXp) {
          setProfile((prev) => (prev ? { ...prev, xp: Number(cachedXp) } : prev));
        }
      }

      const { data: profileData, error: profError } = await supabase
        .from("profiles")
        .select("id, name, username, email, avatar_url, xp, streak, last_login, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (profError) {
        console.error("Dashboard profile fetch exception:", profError.message);
      }

      let activeProfile: Profile;

      if (profileData) {
        const todayStr = getLocalDateString();
        const lastLoginRaw = profileData.last_login;
        const lastLoginStr = lastLoginRaw ? lastLoginRaw.split("T")[0] : null;

        if (lastLoginStr !== todayStr) {
          const currentStreak = Number(profileData.streak) || 0;
          const newStreak = currentStreak + 1;

          const { data: updatedProfile } = await supabase
            .from("profiles")
            .update({
              streak: newStreak,
              last_login: todayStr
            })
            .eq("id", user.id)
            .select("id, name, username, email, avatar_url, xp, streak, last_login, created_at")
            .maybeSingle();

          activeProfile = updatedProfile || { ...profileData, streak: newStreak, last_login: todayStr };
        } else {
          activeProfile = profileData;
        }
      } else {
        activeProfile = {
          id: user.id,
          name: sanitizeString(user.user_metadata?.full_name || user.email?.split("@")[0] || "Artist"),
          username: sanitizeString(user.email?.split("@")[0] || "artist"),
          email: user.email || "",
          avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
          xp: 0,
          streak: 1,
          last_login: getLocalDateString(),
          created_at: new Date().toISOString()
        };
      }

      setProfile(activeProfile);

      if (typeof window !== "undefined") {
        localStorage.setItem("user_xp_cache", (activeProfile.xp || 0).toString());
      }

      const userXpVal = Number(activeProfile.xp) || 0;

      const { count: higherXpCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gt("xp", userXpVal);

      let sameXpTieCount = 0;
      if (activeProfile.created_at) {
        const { count: tieCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("xp", userXpVal)
          .lt("created_at", activeProfile.created_at);

        sameXpTieCount = tieCount || 0;
      } else {
        const { count: tieCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("xp", userXpVal)
          .lt("id", activeProfile.id);

        sameXpTieCount = tieCount || 0;
      }

      const exactRank = (higherXpCount || 0) + sameXpTieCount + 1;
      setUserRank(`#${exactRank}`);

    } catch (err) {
      console.error("Dashboard processing error:", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [router, isOffline]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const handleXpUpdated = (e: CustomEvent<number>) => {
      setProfile((prev) => (prev ? { ...prev, xp: e.detail } : prev));
      fetchDashboardData();
    };

    window.addEventListener("xpUpdated", handleXpUpdated as EventListener);
    return () => {
      window.removeEventListener("xpUpdated", handleXpUpdated as EventListener);
    };
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!profile?.id || isOffline) return;

    const channel = supabase
      .channel(`dashboard_realtime_${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${profile.id}`
        },
        (payload) => {
          if (payload.new) {
            setProfile((prev) => (prev ? { ...prev, ...payload.new } : (payload.new as Profile)));
            fetchDashboardData();
          }
        }
      )
      .subscribe();

    const handleVisibilityChange = () => {
      if (!document.hidden && !isOffline) {
        fetchDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [profile?.id, fetchDashboardData, isOffline]);

  if (loading) {
    return <LoadingScreen />;
  }

  const userXp = Number(profile?.xp) || 0;
  const userStreak = Number(profile?.streak) || 0;
  const rawUserName = profile?.name || profile?.username || "Artist";
  const sanitizedName = sanitizeString(rawUserName);
  
  const formattedUserName = `${sanitizedName.charAt(0).toUpperCase()}${sanitizedName.slice(1)}!`;

  const slidesData = [
    {
      isWelcome: true,
      titleLine1: "Welcome back,",
      titleLine2: formattedUserName,
      description: "Ready to improve your drawing today?",
      buttonText: null,
      buttonPath: null,
      mascot: welcomeMascotUrl
    },
    {
      isWelcome: false,
      title: "Take the Challenge",
      description: "Step-by-step drawing challenges & earn XP.",
      buttonText: "Start Challenge",
      buttonPath: "/challenges",
      mascot: welcomeMascotUrl
    }
  ];

  // Touch Swipe Handlers for Mobile Slider
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 40;
    const isSwipeRight = distance < -40;

    if (isSwipeLeft && currentSlide < slidesData.length - 1) {
      triggerHaptic();
      setCurrentSlide((prev) => prev + 1);
    }

    if (isSwipeRight && currentSlide > 0) {
      triggerHaptic();
      setCurrentSlide((prev) => prev - 1);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", active: true, icon: LayoutDashboard },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  const currentSlideData = slidesData[currentSlide];

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight pb-20 md:pb-0 font-sans overflow-x-hidden">
      
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
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200/80 px-3 py-1.5 rounded-full text-orange-600 font-extrabold text-xs">
          <Flame className="w-4 h-4 fill-orange-500 stroke-orange-500" />
          <span>{userStreak}</span>
        </div>
      </header>

      {/* Mobile Sidebar */}
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
                <Image
                  src={logoUrl}
                  alt="Otterleo Logo"
                  width={120}
                  height={48}
                  className="h-10 w-auto object-contain"
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

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Image
                src={profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
                alt="User Avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover bg-blue-100"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-black text-[#0F172A] truncate">{formattedUserName}</p>
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
              className="h-14 sm:h-16 w-auto object-contain"
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

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <Image
            src={profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
            alt="User Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-xl object-cover bg-blue-100"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-black text-[#0F172A] truncate">{formattedUserName}</p>
            <p className="text-xs font-bold text-blue-600">Level {Math.floor(userXp / 100) + 1}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto w-full">
        
        {/* Responsive, Bigger & Touch Swipeable Welcome Card */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative px-6 py-6 sm:px-8 sm:py-8 flex items-center justify-between min-h-[170px] sm:min-h-[190px] bg-[#EBF3FF] rounded-[2.2rem] border border-blue-100/90 shadow-xs overflow-hidden select-none touch-pan-y"
        >
          {/* Text Container - Ensured zero overlap */}
          <div className="z-10 max-w-[60%] sm:max-w-[65%] md:max-w-md flex flex-col justify-center space-y-1.5">

            {currentSlideData.isWelcome ? (
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B192C] tracking-tight leading-tight">
                <div>{currentSlideData.titleLine1}</div>
                <div className="text-[#2563EB] truncate">{currentSlideData.titleLine2}</div>
              </h1>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] tracking-tight leading-tight">
                {currentSlideData.title}
              </h1>
            )}

            <p className="text-xs sm:text-base font-semibold text-slate-600 leading-snug pt-0.5">
              {currentSlideData.description}
            </p>

            {currentSlideData.buttonText && currentSlideData.buttonPath ? (
              <div className="pt-2">
                <Link
                  href={currentSlideData.buttonPath!}
                  onClick={triggerHaptic}
                  className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <span>{currentSlideData.buttonText}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            ) : null}

            {/* Pagination Dots */}
            <div className="flex items-center gap-2 pt-3">
              {slidesData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    triggerHaptic();
                    setCurrentSlide(idx);
                  }}
                  className={`transition-all duration-300 ${
                    currentSlide === idx
                      ? "w-7 h-2.5 rounded-full bg-[#2563EB]"
                      : "w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

          {/* Mascot Image - Optimized positioning & Increased size */}
          <div className="absolute right-1 bottom-0 sm:right-4 md:right-8 z-20 flex items-end shrink-0 pointer-events-none">
            <Image
              src={currentSlideData.mascot}
              alt="Otter Mascot"
              width={170}
              height={170}
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 object-contain block align-bottom select-none drop-shadow-sm"
              priority
            />
          </div>

        </div>

        {/* Scaled & Enlarged Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 pt-1">
          <div className="bg-amber-50/60 p-6 rounded-[2.2rem] border border-amber-200/70 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-white flex items-center justify-center border-b-4 border-amber-600 shrink-0 shadow-sm">
              <Star className="w-10 h-10 fill-white stroke-amber-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total XP</p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A]">{userXp.toLocaleString()} XP</h3>
            </div>
          </div>

          <div className="bg-orange-50/60 p-6 rounded-[2.2rem] border border-orange-200/70 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
            <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center border-b-4 border-orange-700 shrink-0 shadow-sm">
              <Flame className="w-11 h-11 fill-white stroke-orange-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Current Streak</p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A]">{userStreak} Days</h3>
            </div>
          </div>

          <div className="bg-blue-50/60 p-6 rounded-[2.2rem] border border-blue-200/70 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center border-b-4 border-blue-800 shrink-0 shadow-sm">
              <Trophy className="w-10 h-10 fill-white stroke-blue-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Your Rank</p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A]">{userRank}</h3>
            </div>
          </div>
        </div>

        {/* Daily XP Wheel Section */}
        <section className="w-full overflow-hidden min-w-0">
          <XpWheel />
        </section>

        {/* AI Scan Banner Card */}
        <div className="bg-[#2563EB] text-[#2563EB] p-7 sm:p-9 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 max-w-lg z-10 text-white">
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              Scan & Analyze Your Artwork
            </h2>
            <p className="text-sm font-semibold text-blue-100 leading-relaxed">
              Upload your drawing to get instant AI-powered feedback, score, and tips to improve!
            </p>
            <div className="pt-1">
              <Link
                href="/scan"
                onClick={triggerHaptic}
                className="inline-flex items-center gap-1.5 bg-white text-[#2563EB] px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider border-2 border-slate-200 border-b-4 border-b-slate-300 hover:bg-slate-50 active:border-b-2 active:translate-y-[2px] transition-all"
              >
                Start Scanning <ChevronRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>

          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-3xl flex items-center justify-center border-2 border-white/20 shrink-0 z-10">
            <Scan className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          </div>
        </div>

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-200 shadow-lg">
        <div className="mx-auto flex w-full items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {[
            { name: "Home", path: "/dashboard", active: true, icon: LayoutDashboard },
            { name: "Challenges", path: "/challenges", active: false, icon: Swords },
            { name: "Grid", path: "/grid-maker", active: false, icon: Grid },
            { name: "Scan", path: "/scan", active: false, icon: Scan },
            { name: "Leaderboard", path: "/leaderboard", active: false, icon: Trophy },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={triggerHaptic}
                className="group relative flex flex-1 flex-col items-center gap-1 py-1 transition-all"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                      : "bg-transparent text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
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