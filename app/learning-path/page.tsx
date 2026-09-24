"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, Compass, Construction, Sparkles, LayoutDashboard,
  Swords, Scan, Trophy, Award, User, Settings, Flame, PanelLeft,
  X, Palette, Grid, ShieldAlert
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

export default function LearningPathPage() {
  const isOffline = useOfflineGuard();

  const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";

  // Haptic feedback for touch interactions
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Fallback for unsupported devices
      }
    }
  };

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

      // Email Verification Guard
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

  const desktopNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", active: true, icon: Compass },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const mobileNavItems = [
    { name: "Home", path: "/dashboard", icon: LayoutDashboard },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Grid", path: "/grid-maker", icon: Grid },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  // Access Restriction Screen (Logged out or Unverified Email)
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
              Learning Path access karne ke liye aapka logged in hona aur email verify hona zaroori hai.
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
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] md:min-h-screen">
        
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 sm:p-10 border-2 border-slate-100 shadow-xs text-center space-y-6 relative overflow-hidden my-auto">
          
          {/* Background decorative blur */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-20 h-20 bg-blue-50 border-2 border-blue-100 rounded-3xl flex items-center justify-center mx-auto text-[#2563EB] shadow-xs relative">
            <Compass className="w-10 h-10 animate-spin-slow stroke-[2.2]" />
            <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 p-1.5 rounded-xl border-2 border-white shadow-xs">
              <Construction className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Coming Soon
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Learning Path is Cooking!
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed max-w-xs mx-auto">
              We are building a structured roadmap to take your drawing skills from absolute zero to master level. Stay tuned!
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Link
              href="/dashboard"
              onClick={triggerHaptic}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs sm:text-sm border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

        </div>

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-200 shadow-lg">
        <div className="mx-auto flex w-full items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = "active" in item && item.active === true;

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