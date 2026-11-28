"use client";

import { useEffect, useState, useCallback, useRef, TouchEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";
import LoadingScreen from "@/components/LoadingScreen";
import XpWheel from "@/components/xpwheel";
import DashboardTour from "@/components/DashboardTour";
import ConfettiBurst from "@/components/ConfettiBurst";
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
  ChevronRight,
  Palette,
  ArrowRight,
  Sparkles,
  X,
  Grid,
  Lightbulb,
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  xp: number;
  streak: number;
  last_login: string | null;
  created_at?: string;
}

const CHAT_NAV_ICON_URL =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/chatnav.png";

const PRACTICE_CARD_IMAGE_URL =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/DRAW%20OTTO.png";

const DASHBOARD_CACHE_KEY = "otterleo_dashboard_cache_v1";
const DASHBOARD_CACHE_TTL_MS = 90 * 1000;
const NAV_TOUR_STORAGE_KEY = "otterleo_nav_tour_done_v1";
const STREAK_POPUP_DATE_KEY = "streak_popup_shown_date";

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

  const welcomeMascotUrl =
    "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20dahsbaord%20mascot.png";
  const logoUrl =
    "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRank, setUserRank] = useState<number | string>("-");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [showNavTour, setShowNavTour] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isFetchingRef = useRef(false);
  const queuedForceRefreshRef = useRef(false);
  const profileRef = useRef<Profile | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const playCelebrationSound = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || (audioCtxRef.current.state as string) === "closed") {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;

      if ((ctx.state as string) === "closed") return;
      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => {});
      }
      if ((ctx.state as string) === "closed") return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];

      notes.forEach((freq, idx) => {
        if ((ctx.state as string) === "closed") return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        const startTime = now + idx * 0.14;
        const noteDuration = 1.3;

        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0008, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (showStreakPopup) {
      const timer = setTimeout(() => {
        playCelebrationSound();
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [showStreakPopup, playCelebrationSound]);

  const computeExactRank = useCallback(async (targetProfile: Profile): Promise<number | null> => {
    const userXpVal = Number(targetProfile.xp) || 0;
    if (userXpVal <= 0) return null;

    const { data, error } = await supabase.rpc("get_user_rank", {
      p_user_id: targetProfile.id,
    });

    if (error) {
      console.error("Exact rank RPC error:", error.message);
      return null;
    }

    return typeof data === "number" ? data : null;
  }, []);

  const refreshRankImmediately = useCallback(
    async (baseProfile: Profile) => {
      const exactRank = await computeExactRank(baseProfile);
      const rankLabel = exactRank ? `#${exactRank}` : "-";
      setUserRank(rankLabel);

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            DASHBOARD_CACHE_KEY,
            JSON.stringify({
              userId: baseProfile.id,
              cachedAt: Date.now(),
              profile: baseProfile,
              rankLabel,
            })
          );
        } catch {}
      }
    },
    [computeExactRank]
  );

  // Day 1: only tour (no Day 1 popup). Day 2+: popup once per day; no tour.
  const applyOnboardingOrStreakState = useCallback((activeProfile: Profile, todayStr: string) => {
    if (typeof window === "undefined") return;

    const streakVal = Number(activeProfile.streak) || 1;
    const tourDone = localStorage.getItem(NAV_TOUR_STORAGE_KEY) === "true";

    if (streakVal <= 1) {
      setShowStreakPopup(false);
      setShowNavTour(!tourDone);
    } else {
      setShowNavTour(false);
      const shownToday = localStorage.getItem(STREAK_POPUP_DATE_KEY) === todayStr;
      if (!shownToday) {
        localStorage.setItem(STREAK_POPUP_DATE_KEY, todayStr);
        setShowStreakPopup(true);
      } else {
        setShowStreakPopup(false);
      }
    }
  }, []);

  const fetchDashboardData = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh && typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
        } catch {}
      }

      if (isFetchingRef.current) {
        if (forceRefresh) {
          queuedForceRefreshRef.current = true;
        }
        return;
      }
      isFetchingRef.current = true;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user || (await supabase.auth.getUser()).data.user;

        if (!user) {
          if (!isOffline && typeof window !== "undefined" && navigator.onLine) {
            localStorage.clear();
            router.replace("/login");
          }
          return;
        }

        const todayStr = getLocalDateString();

        if (typeof window !== "undefined") {
          const cachedXp = localStorage.getItem("user_xp_cache");
          const cachedName = localStorage.getItem("user_name_cache");

          if (cachedXp || cachedName) {
            setProfile((prev) =>
              prev
                ? {
                    ...prev,
                    ...(cachedXp ? { xp: Number(cachedXp) } : {}),
                    ...(cachedName ? { name: cachedName } : {}),
                  }
                : prev
            );
          }

          if (!forceRefresh) {
            try {
              const rawCache = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
              if (rawCache) {
                const parsed = JSON.parse(rawCache) as {
                  userId: string;
                  cachedAt: number;
                  profile: Profile;
                  rankLabel: string;
                };

                const isFresh =
                  parsed.userId === user.id &&
                  Date.now() - parsed.cachedAt < DASHBOARD_CACHE_TTL_MS &&
                  parsed.profile?.last_login?.split("T")[0] === todayStr;

                if (isFresh && parsed.profile) {
                  setProfile(parsed.profile);
                  setUserRank(parsed.rankLabel || "-");
                  applyOnboardingOrStreakState(parsed.profile, todayStr);
                  setLoading(false);
                  return;
                }
              }
            } catch {}
          }
        }

        const { data: profileData, error: profError } = await supabase
          .from("profiles")
          .select("id, name, email, avatar_url, xp, streak, last_login, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (profError) {
          console.error("Dashboard profile fetch exception:", profError.message);
        }

        if (!profileData) {
          if (!isOffline && typeof window !== "undefined" && navigator.onLine) {
            localStorage.removeItem("user");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("user_xp_cache");
            localStorage.removeItem("user_name_cache");
            sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
            router.replace("/signup");
          }
          return;
        }

        let activeProfile: Profile = profileData;
        const lastLoginRaw = profileData.last_login;
        const lastLoginStr = lastLoginRaw ? lastLoginRaw.split("T")[0] : null;
        const createdAtLocalStr = profileData.created_at
          ? getLocalDateString(new Date(profileData.created_at))
          : null;
        const isCreatedToday = createdAtLocalStr === todayStr;

        if (lastLoginStr !== todayStr) {
          if (isCreatedToday || !lastLoginStr) {
            const { data: updatedProfile } = await supabase
              .from("profiles")
              .update({
                streak: profileData.streak || 1,
                last_login: todayStr,
              })
              .eq("id", user.id)
              .select("id, name, email, avatar_url, xp, streak, last_login, created_at")
              .maybeSingle();

            activeProfile = updatedProfile || {
              ...profileData,
              streak: profileData.streak || 1,
              last_login: todayStr,
            };
          } else {
            const newStreak = (Number(profileData.streak) || 1) + 1;

            const { data: updatedProfile } = await supabase
              .from("profiles")
              .update({
                streak: newStreak,
                last_login: todayStr,
              })
              .eq("id", user.id)
              .select("id, name, email, avatar_url, xp, streak, last_login, created_at")
              .maybeSingle();

            activeProfile = updatedProfile || {
              ...profileData,
              streak: newStreak,
              last_login: todayStr,
            };
          }
        }

        setProfile(activeProfile);
        applyOnboardingOrStreakState(activeProfile, todayStr);

        if (typeof window !== "undefined") {
          localStorage.setItem("user_xp_cache", (activeProfile.xp || 0).toString());
          if (activeProfile.name) {
            localStorage.setItem("user_name_cache", activeProfile.name);
          }
        }

        const exactRank = await computeExactRank(activeProfile);
        const rankLabel = exactRank ? `#${exactRank}` : "-";
        setUserRank(rankLabel);

        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              DASHBOARD_CACHE_KEY,
              JSON.stringify({
                userId: user.id,
                cachedAt: Date.now(),
                profile: activeProfile,
                rankLabel,
              })
            );
          } catch {}
        }
      } catch (err: unknown) {
        console.error("Dashboard processing error:", err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;

        if (queuedForceRefreshRef.current) {
          queuedForceRefreshRef.current = false;
          void fetchDashboardData(true);
        }
      }
    },
    [router, isOffline, computeExactRank, applyOnboardingOrStreakState]
  );

  // Always refresh fresh profile data when mounting or returning to Dashboard
  useEffect(() => {
    try {
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
    } catch {}
    router.refresh();
    void fetchDashboardData(true);

    const handlePageShow = () => {
      try {
        sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      } catch {}
      router.refresh();
      void fetchDashboardData(true);
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        try {
          sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
        } catch {}
        void fetchDashboardData(true);
      }
    };

    const handleProfileUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ name?: string; avatar_url?: string }>;
      try {
        sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      } catch {}

      if (customEvent.detail?.name) {
        localStorage.setItem("user_name_cache", customEvent.detail.name);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                name: customEvent.detail.name!,
                ...(customEvent.detail?.avatar_url
                  ? { avatar_url: customEvent.detail.avatar_url }
                  : {}),
              }
            : prev
        );
      }
      void fetchDashboardData(true);
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleVisibilityOrFocus);
    window.addEventListener("profileUpdated", handleProfileUpdated);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      window.removeEventListener("profileUpdated", handleProfileUpdated);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [fetchDashboardData, router]);

  useEffect(() => {
    const handleXpUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (typeof customEvent.detail === "number") {
        const nextXp = Number(customEvent.detail);
        let updatedProfileForRank: Profile | null = null;

        setProfile((prev) => {
          const updated = prev ? { ...prev, xp: nextXp } : prev;
          updatedProfileForRank = updated || null;
          if (updated && typeof window !== "undefined") {
            try {
              sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
            } catch {}
          }
          return updated;
        });

        if (typeof window !== "undefined") {
          localStorage.setItem("user_xp_cache", nextXp.toString());
        }

        const targetProfile = updatedProfileForRank || profileRef.current;
        if (targetProfile) {
          void refreshRankImmediately({ ...targetProfile, xp: nextXp });
        } else {
          void fetchDashboardData(true);
        }
      }
    };

    window.addEventListener("xpUpdated", handleXpUpdated);
    return () => {
      window.removeEventListener("xpUpdated", handleXpUpdated);
      if (audioCtxRef.current && (audioCtxRef.current.state as string) !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [refreshRankImmediately, fetchDashboardData]);

  if (loading) {
    return <LoadingScreen />;
  }

  const userXp = Number(profile?.xp) || 0;
  const userStreak = Number(profile?.streak) || 0;
  const rawUserName = profile?.name || profile?.email?.split("@")[0] || "Artist";
  const sanitizedName = sanitizeString(rawUserName);

  const formattedUserName = `${sanitizedName.charAt(0).toUpperCase()}${sanitizedName.slice(1)}!`;
  const welcomeGreetingLine = userStreak <= 1 ? "Welcome artist," : "Welcome back,";

  const slidesData = [
    {
      isWelcome: true,
      titleLine1: welcomeGreetingLine,
      titleLine2: formattedUserName,
      description: "Ready to improve your drawing today?",
      buttonText: null,
      buttonPath: null,
      mascot: welcomeMascotUrl,
    },
    {
      isWelcome: false,
      title: "Take the Challenge",
      description: "Step-by-step drawing challenges & earn XP.",
      buttonText: "Start Challenge",
      buttonPath: "/challenges",
      mascot: welcomeMascotUrl,
    },
  ];

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
    { name: "Tools", path: "/tools", icon: Sparkles },
    { name: "Otto Chat", path: "/otto-chat", customIconUrl: CHAT_NAV_ICON_URL },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const mobileGamifiedNav = [
    {
      tourId: "nav-tour-home",
      path: "/dashboard",
      label: "Home",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/HOME.png",
      sizeClass: "w-[26px] h-[26px]",
    },
    {
      tourId: "nav-tour-challenges",
      path: "/challenges",
      label: "Challenges",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/SWORD.png",
      sizeClass: "w-[26px] h-[26px]",
    },
    {
      tourId: "nav-tour-otto-chat",
      path: "/otto-chat",
      label: "Otto Chat",
      iconUrl: CHAT_NAV_ICON_URL,
      sizeClass: "w-[26px] h-[26px]",
    },
    {
      tourId: "nav-tour-scan",
      path: "/scan",
      label: "Scan",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/EYES%20NAV.png",
      sizeClass: "w-[30px] h-[30px]",
    },
    {
      tourId: "nav-tour-leaderboard",
      path: "/leaderboard",
      label: "Leaderboard",
      iconUrl:
        "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Glossy%20Golden%20Crown%20Icon%20(2)%20(1).png",
      sizeClass: "w-[30px] h-[30px]",
    },
    {
      tourId: "nav-tour-tools",
      path: "/tools",
      label: "Tools",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/settingnav.png",
      sizeClass: "w-[26px] h-[26px]",
    },
  ];

  const currentSlideData = slidesData[currentSlide];

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight pb-24 md:pb-0 font-sans overflow-x-hidden relative">
      {showStreakPopup && userStreak > 1 && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-sm w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            <div className="relative bg-[#0D47A1] pt-6 pb-4 px-6 flex items-center justify-between overflow-hidden shadow-inner">
              <Star className="absolute top-2.5 left-4 w-4 h-4 text-amber-200 fill-amber-200 opacity-90 pointer-events-none animate-pulse" />
              <Star className="absolute bottom-2 left-[18%] w-3.5 h-3.5 text-yellow-300 fill-yellow-300 opacity-80 pointer-events-none" />
              <Star className="absolute top-3 left-[34%] w-3 h-3 text-orange-300 fill-orange-300 opacity-85 pointer-events-none" />
              <Star className="absolute bottom-3 left-[48%] w-4 h-4 text-amber-100 fill-amber-100 opacity-90 pointer-events-none animate-pulse" />
              <Star className="absolute top-2 right-[38%] w-3.5 h-3.5 text-yellow-200 fill-yellow-200 opacity-80 pointer-events-none" />
              <Star className="absolute bottom-2 right-[24%] w-3 h-3 text-amber-300 fill-amber-300 opacity-85 pointer-events-none" />
              <Star className="absolute top-3 right-12 w-4 h-4 text-orange-200 fill-orange-200 opacity-90 pointer-events-none animate-pulse" />
              <Star className="absolute bottom-3 right-3 w-3.5 h-3.5 text-yellow-100 fill-yellow-100 opacity-80 pointer-events-none" />

              <div className="relative z-20 flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/25 px-5 py-3 rounded-2xl text-white shadow-md">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shrink-0">
                  <Flame className="w-6 h-6 fill-white text-white" />
                </div>
                <span className="font-black text-base tracking-wider">DAY {userStreak}</span>
              </div>

              <div className="relative z-20 w-28 h-28 shrink-0 flex items-end justify-center ml-2 mr-0 translate-y-6">
                <Image
                  src={welcomeMascotUrl}
                  alt="Otto Mascot"
                  width={120}
                  height={120}
                  className="w-full h-auto object-contain drop-shadow-md"
                  priority
                />
              </div>
            </div>

            <div className="bg-white pt-8 pb-8 px-6 text-center space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  You&apos;re building a habit!
                </h2>
                <p className="text-xs font-bold text-slate-500">
                  Come back tomorrow to reach Day {userStreak + 1}.
                </p>
              </div>
              <button
                onClick={() => {
                  triggerHaptic();
                  setShowStreakPopup(false);
                }}
                className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Let&apos;s learn</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}

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
      </header>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden flex">
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
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all border border-slate-200"
                  aria-label="Close sidebar"
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
                        item.path === "/dashboard"
                          ? "bg-[#2563EB] text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {item.customIconUrl ? (
                        <img
                          src={item.customIconUrl}
                          alt={item.name}
                          className="w-5 h-5 object-contain shrink-0"
                        />
                      ) : (
                        Icon && <Icon className="w-5 h-5 shrink-0" />
                      )}
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
                    item.path === "/dashboard"
                      ? "bg-[#2563EB] text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.customIconUrl ? (
                    <img
                      src={item.customIconUrl}
                      alt={item.name}
                      className="w-5 h-5 object-contain shrink-0"
                    />
                  ) : (
                    Icon && <Icon className="w-5 h-5 shrink-0" />
                  )}
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

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto w-full">
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative px-6 py-6 sm:px-8 sm:py-8 flex items-center justify-between min-h-[170px] sm:min-h-[190px] bg-[#0D47A1] rounded-[2.2rem] border border-blue-900/40 shadow-inner overflow-hidden select-none touch-pan-y"
        >
          <Star className="top-2.5 left-4 w-4 h-4 text-amber-200 fill-amber-200 opacity-90 pointer-events-none animate-pulse absolute" />
          <Star className="bottom-2 left-[18%] w-3.5 h-3.5 text-yellow-300 fill-yellow-300 opacity-80 pointer-events-none absolute" />
          <Star className="top-3 left-[34%] w-3 h-3 text-orange-300 fill-orange-300 opacity-85 pointer-events-none absolute" />
          <Star className="bottom-3 left-[48%] w-4 h-4 text-amber-100 fill-amber-100 opacity-90 pointer-events-none animate-pulse absolute" />
          <Star className="top-2 right-[38%] w-3.5 h-3.5 text-yellow-200 fill-yellow-200 opacity-80 pointer-events-none absolute" />
          <Star className="bottom-2 right-[24%] w-3 h-3 text-amber-300 fill-amber-300 opacity-85 pointer-events-none absolute" />
          <Star className="top-3 right-12 w-4 h-4 text-orange-200 fill-orange-200 opacity-90 pointer-events-none animate-pulse absolute" />
          <Star className="bottom-3 right-3 w-3.5 h-3.5 text-yellow-100 fill-yellow-100 opacity-80 pointer-events-none absolute" />

          <div className="z-10 max-w-[60%] sm:max-w-[65%] md:max-w-md flex flex-col justify-center space-y-1.5">
            {currentSlideData.isWelcome ? (
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                <div>{currentSlideData.titleLine1}</div>
                <div className="text-amber-200 truncate">{currentSlideData.titleLine2}</div>
              </h1>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {currentSlideData.title}
              </h1>
            )}
            <p className="text-xs sm:text-base font-semibold text-blue-100 leading-snug pt-0.5">
              {currentSlideData.description}
            </p>
            {currentSlideData.buttonText && currentSlideData.buttonPath ? (
              <div className="pt-2">
                <Link
                  href={currentSlideData.buttonPath}
                  onClick={triggerHaptic}
                  className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <span>{currentSlideData.buttonText}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            ) : null}
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
                      ? "w-7 h-2.5 rounded-full bg-white"
                      : "w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white/65"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
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
          <div className="bg-[#FFF4EA] p-6 rounded-3xl border border-orange-300/80 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
            <div className="w-16 h-16 rounded-2xl bg-[#F95A00] text-white flex items-center justify-center border-b-4 border-orange-700 shrink-0 shadow-sm">
              <Flame className="w-10 h-10 fill-white text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Current Streak</p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                {userStreak} {userStreak === 1 ? "Day" : "Days"}
              </h3>
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

        <section className="w-full overflow-hidden min-w-0">
          <XpWheel />
        </section>

        <section className="space-y-4">
          <div className="relative w-full min-h-[120px] sm:min-h-[150px] rounded-[2rem] bg-[#EBF3FF]/80 border border-blue-100/90 overflow-hidden flex items-center justify-center p-3 sm:p-4">
            <img
              src="https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/tools.png"
              alt="Tools"
              className="max-h-28 sm:max-h-36 w-auto max-w-full object-contain -rotate-2 select-none pointer-events-none"
            />
          </div>

          <div className="bg-[#F0F6FF] border-2 border-blue-200/80 text-slate-900 p-6 sm:p-9 rounded-[2.5rem] shadow-md relative overflow-hidden flex flex-row items-center justify-between gap-4">
            <div className="space-y-3 max-w-[62%] sm:max-w-lg z-10">
              <h3 className="text-xl sm:text-3xl font-black leading-tight text-[#0F172A]">
                Practice Drawing Canvas
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                Warm up your strokes, test shading techniques, and sketch freely on the practice canvas every day!
              </p>
              <div className="pt-1">
                <Link
                  href="/practice"
                  onClick={triggerHaptic}
                  className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-b-4 border-blue-800 hover:bg-blue-700 active:border-b-0 active:translate-y-1 transition-all shadow-md"
                >
                  Open Practice <Palette className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-100/80 rounded-3xl shrink-0 z-10 flex items-center justify-center border border-blue-200 overflow-hidden p-1.5">
              <img
                src={PRACTICE_CARD_IMAGE_URL}
                alt="Practice Drawing Canvas"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="bg-[#2563EB] text-white p-6 sm:p-9 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-row items-center justify-between gap-4">
            <div className="space-y-3 max-w-[65%] sm:max-w-lg z-10">
              <h3 className="text-xl sm:text-3xl font-black leading-tight text-white">
                Grid Maker
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-blue-100 leading-relaxed">
                Create custom reference grids to keep your proportions, angles, and symmetry spot-on.
              </p>
              <div className="pt-1">
                <Link
                  href="/grid-maker"
                  onClick={triggerHaptic}
                  className="inline-flex items-center gap-1.5 bg-white text-[#2563EB] px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-slate-200 border-b-4 border-b-slate-300 hover:bg-slate-50 active:border-b-2 active:translate-y-[2px] transition-all"
                >
                  Open Grid Maker <ChevronRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </div>
            </div>
            <div className="w-24 h-24 sm:w-36 sm:h-36 bg-white/10 rounded-3xl flex items-center justify-center border-2 border-white/20 shrink-0 z-10 overflow-hidden">
              <Grid className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
          </div>

          <div className="bg-[#F3E8FF] border-2 border-purple-200/90 text-slate-900 p-6 sm:p-9 rounded-[2.5rem] shadow-md relative overflow-hidden flex flex-row items-center justify-between gap-4">
            <div className="space-y-3 max-w-[65%] sm:max-w-lg z-10">
              <h3 className="text-xl sm:text-3xl font-black leading-tight text-[#1E1B4B]">
                Idea Generator
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-purple-900/75 leading-relaxed">
                Stuck on what to sketch next? Generate fresh drawing prompts and creative ideas in seconds.
              </p>
              <div className="pt-1">
                <Link
                  href="/generator"
                  onClick={triggerHaptic}
                  className="inline-flex items-center gap-1.5 bg-purple-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-b-4 border-purple-800 hover:bg-purple-700 active:border-b-0 active:translate-y-1 transition-all shadow-md"
                >
                  Generate Ideas <ChevronRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </div>
            </div>
            <div className="w-24 h-24 sm:w-36 sm:h-36 bg-purple-200/70 rounded-3xl flex items-center justify-center border-2 border-purple-300/80 shrink-0 z-10 overflow-hidden">
              <Lightbulb className="w-12 h-12 sm:w-16 sm:h-16 text-purple-700" />
            </div>
          </div>
        </section>
      </main>

      {!showStreakPopup && !isMobileSidebarOpen && (
        <div
          className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:w-[410px] sm:mx-auto transition-all duration-300 translate-y-0 opacity-100 pointer-events-none lg:hidden ${
            showNavTour ? "z-[10002]" : "z-[399]"
          }`}
        >
          <div className="w-full rounded-full border transition-colors duration-300 pointer-events-auto backdrop-blur-2xl shadow-2xl overflow-hidden bg-[#F0F6FF]/95 border-blue-100/80 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <nav
              className={`w-full max-w-md mx-auto h-[56px] grid grid-cols-6 items-stretch justify-items-center relative px-2 ${
                showNavTour ? "pointer-events-none" : ""
              }`}
            >
              {mobileGamifiedNav.map((item) => {
                const isActive = item.path === "/dashboard";

                return (
                  <Link
                    key={item.label}
                    id={item.tourId}
                    href={item.path}
                    onClick={triggerHaptic}
                    aria-label={item.label}
                    className="group relative w-full h-full flex flex-col items-center justify-center focus:outline-none select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 pointer-events-auto"
                  >
                    <div
                      className={`relative flex flex-col items-center justify-center rounded-full transition-all duration-200 ${
                        isActive
                          ? "bg-sky-100/70 border border-[#03A9F4]/70 shadow-xs w-[48px] h-[36px]"
                          : "w-[38px] h-[38px]"
                      }`}
                    >
                      <div className="relative flex items-center justify-center w-full h-full">
                        <img
                          alt={item.label}
                          className={`${item.sizeClass} object-contain rounded-lg drop-shadow-sm select-none`}
                          src={item.iconUrl}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <DashboardTour
        isOpen={showNavTour}
        onFinish={() => {
          if (typeof window !== "undefined") {
            localStorage.setItem(NAV_TOUR_STORAGE_KEY, "true");
          }
          setShowNavTour(false);
          if ((Number(profile?.streak) || 1) <= 1) {
            setShowConfetti(true);
          }
        }}
      />

      <ConfettiBurst
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
}