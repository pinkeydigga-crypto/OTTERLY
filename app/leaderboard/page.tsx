"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Share2, X, LayoutDashboard,
  Swords, Scan, Trophy, Compass, User, Settings, Flame, PanelLeft,
  Star, Palette, Grid, ShieldAlert, RefreshCw, Globe
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
  rank?: number;
  created_at?: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const isOffline = useOfflineGuard();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [leaderboardData, setLeaderboardData] = useState<ProfileUser[]>([]);
  const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const mascotImageUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/leaderbaord%20(1).png";
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Safe fallback
      }
    }
  };

  const fetchLeaderboardAndUser = useCallback(async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setLoading(true);
    }

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

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, name, username, avatar_url, streak, xp, created_at");

      if (error) {
        console.error("Leaderboard fetch error details:", error.message || error);
        setLeaderboardData([]);
        setLoading(false);
        return;
      }

      let mappedProfiles: ProfileUser[] = (profiles || []).map((p: any) => {
        const userStreak = p.streak ?? 0;
        const totalXP = Number(p.xp ?? 0);

        return {
          id: p.id,
          full_name: p.name || p.username || "Artist",
          avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
          streak: Number(userStreak),
          xp_points: totalXP,
          created_at: p.created_at,
        };
      });

      mappedProfiles.sort((a, b) => {
        const xpDiff = b.xp_points - a.xp_points;
        if (xpDiff !== 0) return xpDiff;

        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeA - timeB;
      });

      const rankedProfiles = mappedProfiles.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

      setLeaderboardData(rankedProfiles);

      const userInList = rankedProfiles.find((u) => u.id === user.id);
      if (userInList) {
        setCurrentUser(userInList);
      } else {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("id, name, username, avatar_url, streak, xp, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (userProfile) {
          const p = userProfile as any;
          const myStreak = p.streak ?? 0;
          const myXP = Number(p.xp ?? 0);
          setCurrentUser({
            id: p.id,
            rank: 0,
            full_name: p.name || p.username || "You",
            avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
            streak: Number(myStreak),
            xp_points: myXP,
            created_at: p.created_at
          });
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching leaderboard:", err);
      if (!isOffline && typeof window !== "undefined" && navigator.onLine) {
        setIsVerified(false);
      }
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  useEffect(() => {
    fetchLeaderboardAndUser();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLeaderboardAndUser(true);
      }
    }, 3600000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLeaderboardAndUser(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchLeaderboardAndUser]);

  const rank1 = leaderboardData.length > 0 ? leaderboardData[0] : null;
  const rank2 = leaderboardData.length > 1 ? leaderboardData[1] : null;
  const rank3 = leaderboardData.length > 2 ? leaderboardData[2] : null;

  const desktopNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", active: true, icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const mobileNavItems = [
    { name: "Home", path: "/dashboard", icon: LayoutDashboard },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Grid", path: "/grid-maker", icon: Grid },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", active: true, icon: Trophy },
  ];

  if (loading) {
    return <LoadingScreen />;
  }

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
              Leaderboard dekhne ke liye aapka logged in hona aur email verify hona zaroori hai.
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
      
      {/* Font imports for Rounded Fredoka style */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700;800&family=Caveat:wght@700&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');
        .font-badge {
          font-family: 'Fredoka', 'Nunito', system-ui, -apple-system, sans-serif !important;
        }
        .font-handwritten {
          font-family: 'Caveat', cursive, sans-serif !important;
        }
      `}</style>

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
      <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-5xl mx-auto w-full min-w-0 space-y-5 overflow-y-auto">

        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            onClick={triggerHaptic}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-black text-xs sm:text-sm hover:bg-slate-50 transition-all shadow-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100/80 px-3 py-2 rounded-xl">
              <RefreshCw className="w-3.5 h-3.5" />
              Refreshes every hour
            </span>

            {currentUser && (
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsShareModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-blue-600 text-white rounded-2xl font-black text-xs sm:text-sm border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Rank Card</span>
              </button>
            )}
          </div>
        </div>

        {/* Mascot Banner Section */}
        <div className="bg-white px-5 sm:px-8 pt-4 pb-0 rounded-[2rem] border-2 border-slate-100 shadow-xs flex flex-row items-end justify-center gap-4 sm:gap-6 text-left relative overflow-hidden min-h-[120px] sm:min-h-[140px]">
          <div className="w-32 sm:w-44 md:w-48 shrink-0 flex items-end justify-center -mb-1">
            <img
              src={mascotImageUrl}
              alt="Mascot"
              className="w-full h-auto object-contain drop-shadow-md block -mb-0.5"
              crossOrigin="anonymous"
            />
          </div>

          <div className="space-y-1 flex-1 pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-[#0F172A] leading-tight">
                Leaderboard Standings
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-md">
              Compete with fellow learners and climb the global rankings! (Refreshes every hour)
            </p>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboardData.length > 0 ? (
          <div className="pt-4 pb-1 grid grid-cols-3 gap-2 sm:gap-4 md:gap-5 items-end w-full max-w-xl mx-auto">
            
            {/* RANK 2 */}
            <div className="flex flex-col items-center">
              {rank2 ? (
                <>
                  <img
                    src={rank2.avatar_url}
                    alt={rank2.full_name}
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-cover mb-1.5 shadow-2xs"
                    crossOrigin="anonymous"
                  />
                  <h3 className="font-extrabold text-slate-800 text-[11px] sm:text-xs truncate max-w-[90px] sm:max-w-[120px] text-center">
                    {rank2.full_name}
                  </h3>
                  <div className="w-full bg-gradient-to-b from-[#e2e8f0]/80 via-[#f1f5f9]/40 to-transparent rounded-t-2xl pt-3 pb-2 px-1 mt-1 text-center flex flex-col items-center min-h-[75px] sm:min-h-[90px] justify-start">
                    <span className="text-xs sm:text-base font-black text-[#475569] block">
                      {rank2.xp_points.toLocaleString()}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      pts
                    </span>
                  </div>
                </>
              ) : <div className="h-24" />}
            </div>

            {/* RANK 1 */}
            <div className="flex flex-col items-center">
              {rank1 ? (
                <>
                  <img
                    src={rank1.avatar_url}
                    alt={rank1.full_name}
                    className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl object-cover mb-1.5 shadow-xs"
                    crossOrigin="anonymous"
                  />
                  <h3 className="font-black text-slate-900 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[130px] text-center">
                    {rank1.full_name}
                  </h3>
                  <div className="w-full bg-gradient-to-b from-[#fef3c7] via-[#fffbeb]/50 to-transparent rounded-t-2xl pt-3.5 pb-2 px-1 mt-1 text-center flex flex-col items-center min-h-[95px] sm:min-h-[115px] justify-start">
                    <span className="text-sm sm:text-lg font-black text-[#d97706] block">
                      {rank1.xp_points.toLocaleString()}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-500/80 uppercase tracking-wide">
                      pts
                    </span>
                  </div>
                </>
              ) : <div className="h-32" />}
            </div>

            {/* RANK 3 */}
            <div className="flex flex-col items-center">
              {rank3 ? (
                <>
                  <img
                    src={rank3.avatar_url}
                    alt={rank3.full_name}
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-cover mb-1.5 shadow-2xs"
                    crossOrigin="anonymous"
                  />
                  <h3 className="font-extrabold text-slate-800 text-[11px] sm:text-xs truncate max-w-[90px] sm:max-w-[120px] text-center">
                    {rank3.full_name}
                  </h3>
                  <div className="w-full bg-gradient-to-b from-[#ffedd5]/80 via-[#fff7ed]/40 to-transparent rounded-t-2xl pt-3 pb-2 px-1 mt-1 text-center flex flex-col items-center min-h-[60px] sm:min-h-[75px] justify-start">
                    <span className="text-xs sm:text-base font-black text-[#c2410c] block">
                      {rank3.xp_points.toLocaleString()}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-orange-400 uppercase tracking-wide">
                      pts
                    </span>
                  </div>
                </>
              ) : <div className="h-20" />}
            </div>

          </div>
        ) : null}

        {/* Leaderboard Table List */}
        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-black text-slate-900 text-base">Top Rankings</h3>
            <span className="text-[11px] font-bold text-slate-400">Refreshes every hour</span>
          </div>

          {leaderboardData.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-bold text-sm">
              No active users found.
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboardData.map((user) => {
                const isSelf = currentUser && user.id === currentUser.id;
                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                      isSelf
                        ? "bg-blue-50/80 border-2 border-blue-200 shadow-2xs"
                        : "bg-[#f8fafc] border border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs font-black w-6 shrink-0 text-center ${isSelf ? "text-[#2563eb]" : "text-slate-400"}`}>
                        #{user.rank}
                      </span>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                          crossOrigin="anonymous"
                        />
                        <span className={`font-black text-xs sm:text-sm truncate ${isSelf ? "text-[#2563eb]" : "text-slate-800"}`}>
                          {user.full_name} {isSelf && <span className="text-[10px] font-bold">(You)</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className={`font-black text-xs sm:text-sm ${isSelf ? "text-[#2563eb]" : "text-slate-800"}`}>
                        {user.xp_points} XP
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                        {user.streak} <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-orange-500 stroke-none" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-200 shadow-lg">
        <div className="mx-auto flex w-full items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {mobileNavItems.map((item) => {
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

      {/* Share Card Modal */}
      {isShareModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[420px] p-4 sm:p-6 shadow-2xl relative border-2 border-slate-100 my-auto">
            <button
              onClick={() => {
                triggerHaptic();
                setIsShareModalOpen(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Target Card Container with Fredoka Font Applied */}
            <div
              ref={cardRef}
              className="w-full relative overflow-hidden flex flex-col justify-between p-6 sm:p-7 select-none rounded-[2rem] mb-4 font-badge border border-slate-100 bg-white shadow-md aspect-square min-h-[380px]"
            >
              {/* Very Light & Subtle Diagonal Blue Gradient Stripes Overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                <div 
                  className="absolute -top-[10%] -right-[10%] w-[130%] h-[130%]"
                  style={{
                    background: `
                      linear-gradient(
                        135deg,
                        transparent 0%,
                        transparent 35%,
                        rgba(239, 246, 255, 0.4) 35%,
                        rgba(239, 246, 255, 0.4) 48%,
                        rgba(219, 234, 254, 0.45) 48%,
                        rgba(219, 234, 254, 0.45) 62%,
                        rgba(191, 219, 254, 0.5) 62%,
                        rgba(191, 219, 254, 0.5) 78%,
                        rgba(147, 197, 253, 0.55) 78%,
                        rgba(147, 197, 253, 0.55) 100%
                      )
                    `
                  }}
                />
              </div>

              {/* Header: Logo Left */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <img
                    src={logoUrl}
                    alt="Otterleo"
                    className="h-10 sm:h-11 w-auto object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>

              {/* Center Main Rank Content */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1">
                <h2 className="text-sm sm:text-base font-extrabold text-[#334155] mb-1 tracking-tight">
                  Global Rank
                </h2>

                {/* Big Rank Number surrounded by Leaves */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 my-0.5">
                  {/* Left Laurel Leaf */}
                  <svg className="w-10 h-20 sm:w-11 sm:h-22 text-[#93c5fd]" viewBox="0 0 50 100" fill="currentColor">
                    <path d="M 38 92 C 20 75 14 42 32 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 32 10 C 29 4 33 2 34 8 C 35 12 33 13 32 10 Z" />
                    <path d="M 28 20 C 20 15 22 8 28 14 C 30 17 29 20 28 20 Z" />
                    <path d="M 33 22 C 38 15 42 18 36 24 C 34 25 32 24 33 22 Z" />
                    <path d="M 23 35 C 13 31 15 22 23 28 C 25 31 24 34 23 35 Z" />
                    <path d="M 30 38 C 38 30 42 34 35 41 C 32 42 30 40 30 38 Z" />
                    <path d="M 21 52 C 10 49 11 39 20 45 C 23 48 22 51 21 52 Z" />
                    <path d="M 28 55 C 37 48 41 52 33 58 C 30 59 28 57 28 55 Z" />
                    <path d="M 22 70 C 11 68 12 58 21 63 C 24 66 23 69 22 70 Z" />
                    <path d="M 29 72 C 38 66 41 71 34 76 C 31 77 29 74 29 72 Z" />
                  </svg>

                  {/* Rank Digit */}
                  <span className="font-handwritten text-7xl sm:text-8xl font-black leading-none text-[#1e3a8a] tracking-tight">
                    {currentUser?.rank || "2"}
                  </span>

                  {/* Right Laurel Leaf (Mirrored) */}
                  <svg className="w-10 h-20 sm:w-11 sm:h-22 text-[#93c5fd] transform scale-x-[-1]" viewBox="0 0 50 100" fill="currentColor">
                    <path d="M 38 92 C 20 75 14 42 32 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 32 10 C 29 4 33 2 34 8 C 35 12 33 13 32 10 Z" />
                    <path d="M 28 20 C 20 15 22 8 28 14 C 30 17 29 20 28 20 Z" />
                    <path d="M 33 22 C 38 15 42 18 36 24 C 34 25 32 24 33 22 Z" />
                    <path d="M 23 35 C 13 31 15 22 23 28 C 25 31 24 34 23 35 Z" />
                    <path d="M 30 38 C 38 30 42 34 35 41 C 32 42 30 40 30 38 Z" />
                    <path d="M 21 52 C 10 49 11 39 20 45 C 23 48 22 51 21 52 Z" />
                    <path d="M 28 55 C 37 48 41 52 33 58 C 30 59 28 57 28 55 Z" />
                    <path d="M 22 70 C 11 68 12 58 21 63 C 24 66 23 69 22 70 Z" />
                    <path d="M 29 72 C 38 66 41 71 34 76 C 31 77 29 74 29 72 Z" />
                  </svg>
                </div>

                {/* Badge Pill with Image Font & Style */}
                <div className="mt-1 px-5 py-1 bg-[#fef3c7] rounded-full border border-[#fde68a]">
                  <span className="text-xs sm:text-sm font-extrabold text-[#78350f] tracking-tight uppercase">
                    {currentUser?.rank && currentUser.rank <= 3 ? "LEGENDARY" : "RISING STAR"}
                  </span>
                </div>

                {/* Subtext */}
                <p className="text-xs font-bold text-[#64748b] mt-2 tracking-tight">
                  You're in the top {currentUser?.rank || "2"}!
                </p>
              </div>

              {/* Stats Bar Container */}
              <div className="relative z-10 w-full bg-[#f0f6ff]/90 border border-blue-100/80 rounded-2xl p-3 flex items-center justify-around my-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100/60 flex items-center justify-center">
                    <Star className="w-3.5 h-3.5 fill-[#1e3a8a] text-[#1e3a8a]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-extrabold uppercase text-slate-400 leading-none mb-0.5 tracking-tight">XP</p>
                    <p className="text-xs font-extrabold text-slate-900 tracking-tight">{currentUser?.xp_points || 0} XP</p>
                  </div>
                </div>

                <div className="h-5 w-px bg-blue-200/60" />

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100/60 flex items-center justify-center">
                    <Flame className="w-3.5 h-3.5 fill-[#1e3a8a] text-[#1e3a8a]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-extrabold uppercase text-slate-400 leading-none mb-0.5 tracking-tight">STREAK</p>
                    <p className="text-xs font-extrabold text-slate-900 tracking-tight">{currentUser?.streak || 0} Days</p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="relative z-10 w-full flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser?.avatar_url}
                    alt={currentUser?.full_name}
                    className="w-6 h-6 rounded-full object-cover border border-blue-300 shadow-2xs"
                    crossOrigin="anonymous"
                  />
                  <span className="text-xs font-bold text-[#1e3a8a] tracking-tight">
                    @{currentUser?.full_name?.toLowerCase().replace(/\s+/g, '') || "user"}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-[#3b82f6] tracking-tight">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Top 2% Worldwide</span>
                </div>
              </div>

            </div>

            {/* Modal Bottom Subtext */}
            <div className="text-center pt-1 pb-2 space-y-1">
              <p className="text-xs font-bold text-slate-600">
                You can take a screenshot to share with friends!
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                Downloading feature is currently unavailable
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}