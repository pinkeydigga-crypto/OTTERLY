"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";
import LoadingScreen from "@/components/LoadingScreen";
import {
  LayoutDashboard,
  Swords,
  Scan,
  Trophy,
  Compass,
  User,
  Settings,
  Palette,
  Grid,
  Sparkles,
  PanelLeft,
  ChevronRight,
  MoreHorizontal,
  X
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  xp: number;
  streak: number;
}

const sanitizeString = (str: string) => {
  return str.replace(/<[^>]*>?/gm, "").trim();
};

export default function ToolsPage() {
  const router = useRouter();
  const isOffline = useOfflineGuard();

  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const fetchUserData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (!user) {
        if (!isOffline && typeof window !== "undefined" && navigator.onLine) {
          router.replace("/login");
        }
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name, username, email, avatar_url, xp, streak")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }
    } catch (err) {
      console.error("Tools profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [router, isOffline]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return <LoadingScreen />;
  }

  const rawUserName = profile?.name || profile?.username || "Artist";
  const sanitizedName = sanitizeString(rawUserName);
  const formattedUserName = `${sanitizedName.charAt(0).toUpperCase()}${sanitizedName.slice(1)}!`;
  const userXp = Number(profile?.xp) || 0;

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tools", path: "/tools", active: true, icon: Sparkles },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  const mobileGamifiedNav = [
    {
      path: "/dashboard",
      label: "Home",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/HOME.png",
      sizeClass: "w-[26px] h-[26px]"
    },
    {
      path: "/challenges",
      label: "Challenges",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/SWORD.png",
      sizeClass: "w-[26px] h-[26px]"
    },
    {
      path: "/practice",
      label: "Practice",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/PAINT.png",
      sizeClass: "w-[26px] h-[26px]"
    },
    {
      path: "/scan",
      label: "Scan",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/EYES%20NAV.png",
      sizeClass: "w-[30px] h-[30px]"
    },
    {
      path: "/leaderboard",
      label: "Leaderboard",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Glossy%20Golden%20Crown%20Icon.png",
      sizeClass: "w-[30px] h-[30px]"
    },
    {
      path: "/tools",
      label: "Tools",
      isCustomIcon: true,
      sizeClass: "w-[26px] h-[26px]"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight pb-24 md:pb-0 font-sans overflow-x-hidden relative">
      
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
                  const isCurrent = item.path === "/tools";
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => {
                        triggerHaptic();
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                        isCurrent
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
              const isCurrent = item.path === "/tools";
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={triggerHaptic}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                    isCurrent
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

      <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto w-full pb-16">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] tracking-tight">Artist Tools & Account</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">Powerful utilities and account management settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          <div className="bg-[#F0F6FF] border-2 border-blue-200/80 text-slate-900 p-6 sm:p-8 rounded-[2.5rem] shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none z-30">
              <div className="absolute transform rotate-45 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest py-1 right-[-35px] top-[22px] w-[120px] text-center shadow-md">
                NEW
              </div>
            </div>

            <div className="space-y-4 z-10">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200 text-blue-600">
                <Grid className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">Grid Maker</h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                  Overlay precise grid lines onto your reference photos to master proportions and make accurate drawings effortlessly!
                </p>
              </div>
            </div>

            <div className="pt-6 z-10">
              <Link
                href="/grid-maker"
                onClick={triggerHaptic}
                className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white px-5 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-b-4 border-blue-800 hover:bg-blue-700 active:border-b-0 active:translate-y-1 transition-all shadow-md"
              >
                Open Grid Maker <ChevronRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>

          <div className="bg-[#F0F6FF] border-2 border-blue-200/80 text-slate-900 p-6 sm:p-8 rounded-[2.5rem] shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none z-30">
              <div className="absolute transform rotate-45 bg-[#2563EB] text-white text-[10px] font-black uppercase tracking-widest py-1 right-[-35px] top-[22px] w-[120px] text-center shadow-md">
                NEW
              </div>
            </div>

            <div className="space-y-4 z-10">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200 text-blue-600">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">Idea Generator</h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                  Never run out of inspiration! Generate creative drawing prompts and unique concepts instantly for your next artwork.
                </p>
              </div>
            </div>

            <div className="pt-6 z-10">
              <Link
                href="/generator"
                onClick={triggerHaptic}
                className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white px-5 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-b-4 border-blue-800 hover:bg-blue-700 active:border-b-0 active:translate-y-1 transition-all shadow-md"
              >
                Open Generator <ChevronRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>

          <div className="bg-[#F0F6FF] border-2 border-blue-200/80 text-slate-900 p-6 sm:p-8 rounded-[2.5rem] shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4 z-10">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200 text-blue-600">
                <User className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">Profile</h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                  View your personal achievements, level progress, saved artworks, and streak details.
                </p>
              </div>
            </div>

            <div className="pt-6 z-10">
              <Link
                href="/profile"
                onClick={triggerHaptic}
                className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white px-5 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-b-4 border-blue-800 hover:bg-blue-700 active:border-b-0 active:translate-y-1 transition-all shadow-md"
              >
                View Profile <ChevronRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>

          <div className="bg-[#F0F6FF] border-2 border-blue-200/80 text-slate-900 p-6 sm:p-8 rounded-[2.5rem] shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4 z-10">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200 text-blue-600">
                <Settings className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">Settings</h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                  Manage your account preferences, notification sounds, and security configurations.
                </p>
              </div>
            </div>

            <div className="pt-6 z-10">
              <Link
                href="/settings"
                onClick={triggerHaptic}
                className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white px-5 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider border-b-4 border-blue-800 hover:bg-blue-700 active:border-b-0 active:translate-y-1 transition-all shadow-md"
              >
                Open Settings <ChevronRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>

        </div>
      </main>

      {!isMobileSidebarOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:w-[410px] sm:mx-auto z-[399] transition-all duration-300 translate-y-0 opacity-100 pointer-events-none lg:hidden">
          <div className="w-full rounded-full border transition-colors duration-300 pointer-events-auto backdrop-blur-2xl shadow-2xl overflow-hidden bg-[#F0F6FF]/95 border-blue-100/80 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <nav className="w-full max-w-md mx-auto h-[56px] grid grid-cols-6 items-stretch justify-items-center relative px-2">
              {mobileGamifiedNav.map((item) => {
                const isActive = item.path === "/tools";

                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    onClick={triggerHaptic}
                    aria-label={item.label}
                    className="group relative w-full h-full flex flex-col items-center justify-center focus:outline-none select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 pointer-events-auto"
                  >
                    <div className={`relative flex flex-col items-center justify-center rounded-full transition-all duration-200 ${
                      isActive ? "bg-sky-100/70 border border-[#03A9F4]/70 shadow-xs w-[48px] h-[36px]" : "w-[38px] h-[38px]"
                    }`}>
                      <div className="relative flex items-center justify-center w-full h-full">
                        {item.isCustomIcon ? (
                          <MoreHorizontal className="w-6 h-6 text-slate-700 drop-shadow-sm select-none" />
                        ) : (
                          <img
                            alt={item.label}
                            className={`${item.sizeClass} object-contain drop-shadow-sm select-none`}
                            src={item.iconUrl}
                            crossOrigin="anonymous"
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

    </div>
  );
}