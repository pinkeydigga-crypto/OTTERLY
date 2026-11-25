"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Share2, X, LayoutDashboard,
  Swords, Scan, Trophy, Compass, User, Settings, Flame, PanelLeft,
  Palette, Grid, ShieldAlert, Sparkles
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

interface LeaderboardRpcRow {
  id: string;
  name: string | null;
  avatar_url: string | null;
  streak: number | null;
  xp: number | string | null;
  created_at?: string;
}

const PAGE_SIZE = 50;
const AUTO_REFRESH_MS = 5 * 60 * 1000;

const SHARE_TEMPLATE_URL =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/rank1.jpeg";

export default function LeaderboardPage() {
  const isOffline = useOfflineGuard();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [templateImgFailed, setTemplateImgFailed] = useState(false);
  const [showNoXpShareNotice, setShowNoXpShareNotice] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [leaderboardData, setLeaderboardData] = useState<ProfileUser[]>([]);
  const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const mascotImageUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/leaderbaord%20(1).png";
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/logo.png";

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const mapProfileRow = (p: LeaderboardRpcRow, rank: number): ProfileUser => {
    const userStreak = p.streak ?? 0;
    const totalXP = Number(p.xp ?? 0);

    return {
      id: p.id,
      full_name: p.name || "Artist",
      avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
      streak: Number(userStreak),
      xp_points: totalXP,
      created_at: p.created_at,
      rank,
    };
  };

  const sortProfiles = (items: ProfileUser[]) => {
    return [...items].sort((a, b) => {
      const xpDiff = b.xp_points - a.xp_points;
      if (xpDiff !== 0) return xpDiff;

      const streakDiff = (b.streak || 0) - (a.streak || 0);
      if (streakDiff !== 0) return streakDiff;

      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeA !== timeB) return timeA - timeB;

      return a.id.localeCompare(b.id);
    });
  };

  const computeActualRank = async (
    authUserId: string,
    myXp: number
  ): Promise<number> => {
    if (myXp <= 0) return 0;

    const { data, error } = await supabase.rpc("get_user_rank", {
      p_user_id: authUserId,
    });

    if (error) {
      console.error("Actual rank RPC error:", error.message);
      return 0;
    }

    return typeof data === "number" ? data : 0;
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

      const { data: profiles, error } = await supabase.rpc("get_leaderboard", {
        p_limit: PAGE_SIZE,
        p_offset: 0,
      });

      if (error) {
        console.error("Leaderboard fetch error details:", error.message || error);
        setLeaderboardData([]);
        setLoading(false);
        return;
      }

      const rows = (profiles || []) as LeaderboardRpcRow[];
      const activeProfiles = rows.filter((p) => Number(p.xp ?? 0) > 0);
      const rawMapped = activeProfiles.map((p) => mapProfileRow(p, 0));
      const sortedTop = sortProfiles(rawMapped).map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

      setLeaderboardData(sortedTop);
      setHasMore(rows.length === PAGE_SIZE);

      const userInTop50 = sortedTop.find((u) => u.id === user.id);
      if (userInTop50) {
        setCurrentUser(userInTop50);
        setShowNoXpShareNotice(false);
      } else {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, streak, xp, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (userProfile) {
          const p = userProfile as LeaderboardRpcRow;
          const myXP = Number(p.xp ?? 0);

          if (myXP > 0) {
            const actualRank = await computeActualRank(user.id, myXP);
            setCurrentUser({
              ...mapProfileRow(p, actualRank || undefined as unknown as number),
              rank: actualRank || undefined,
              full_name: p.name || "You",
            });
            setShowNoXpShareNotice(false);
          } else {
            setCurrentUser({
              ...mapProfileRow(p, 0),
              full_name: p.name || "You",
              xp_points: 0,
              rank: undefined,
            });
          }
        }
      }
    } catch (err: unknown) {
      console.error("Unexpected error fetching leaderboard:", err);
      if (!isOffline && typeof window !== "undefined" && navigator.onLine) {
        setIsVerified(false);
      }
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  const handleShareRankClick = () => {
    triggerHaptic();
    if (!currentUser || currentUser.xp_points <= 0) {
      setShowNoXpShareNotice(true);
      return;
    }
    setShowNoXpShareNotice(false);
    setTemplateImgFailed(false);
    setIsShareModalOpen(true);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    triggerHaptic();
    setLoadingMore(true);

    try {
      const startIndex = leaderboardData.length;

      const { data: nextProfiles, error } = await supabase.rpc("get_leaderboard", {
        p_limit: PAGE_SIZE,
        p_offset: startIndex,
      });

      if (error) {
        console.error("Load more fetch error:", error.message || error);
        return;
      }

      const rows = (nextProfiles || []) as LeaderboardRpcRow[];
      const nextRows = rows.filter((p) => Number(p.xp ?? 0) > 0);
      if (rows.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setLeaderboardData((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNewRows = nextRows.filter((row) => !existingIds.has(row.id));
        const combined = [
          ...prev,
          ...uniqueNewRows.map((p) => mapProfileRow(p, 0)),
        ];

        return sortProfiles(combined).map((item, idx) => ({
          ...item,
          rank: idx + 1,
        }));
      });
    } catch (err: unknown) {
      console.error("Unexpected load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardAndUser();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLeaderboardAndUser(true);
      }
    }, AUTO_REFRESH_MS);

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

  const isCurrentUserInLoadedList = currentUser
    ? leaderboardData.some((u) => u.id === currentUser.id)
    : false;

  const desktopNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tools", path: "/tools", icon: Sparkles },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", active: true, icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
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
      path: "/otto-chat",
      label: "Otto Chat",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/chatnav.png",
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
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Glossy%20Golden%20Crown%20Icon%20(2)%20(1).png",
      sizeClass: "w-[30px] h-[30px]"
    },
    {
      path: "/tools",
      label: "Tools",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/settingnav.png",
      sizeClass: "w-[26px] h-[26px]",
    },
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

  const modalRank = currentUser?.rank ?? 0;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight font-sans pb-28 md:pb-0">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700;800&family=Caveat:wght@700&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');
        .font-badge {
          font-family: 'Fredoka', 'Nunito', system-ui, -apple-system, sans-serif !important;
        }
        .font-handwritten {
          font-family: 'Caveat', cursive, sans-serif !important;
        }
      `}</style>

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

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden flex">
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
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all border border-slate-200"
                  aria-label="Close sidebar"
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

      <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-5xl mx-auto w-full min-w-0 space-y-5 overflow-y-auto">
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

          {currentUser && (
            <button
              type="button"
              onClick={handleShareRankClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-blue-600 text-white rounded-2xl font-black text-xs sm:text-sm border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Rank Card</span>
            </button>
          )}
        </div>

        {showNoXpShareNotice && (
          <div className="bg-amber-50 border-2 border-amber-200/90 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-2xs">
            <p className="text-xs sm:text-sm font-black text-amber-900">
              Complete challenges to gain XP
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/challenges"
                onClick={triggerHaptic}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition"
              >
                Go to Challenges
              </Link>
              <button
                type="button"
                onClick={() => setShowNoXpShareNotice(false)}
                className="p-1 text-amber-700 hover:text-amber-950 rounded-lg cursor-pointer"
                aria-label="Close notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-white px-5 sm:px-8 pt-4 pb-0 rounded-[2rem] border-2 border-slate-100 shadow-xs flex flex-row items-end justify-center gap-4 sm:gap-6 text-left relative overflow-hidden min-h-[120px] sm:min-h-[140px]">
          <div className="w-32 sm:w-44 md:w-48 shrink-0 flex items-end justify-center -mb-1">
            <img
              src={mascotImageUrl}
              alt="Mascot"
              className="w-full h-auto object-contain drop-shadow-md block -mb-0.5"
            />
          </div>

          <div className="space-y-1 flex-1 pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-[#0F172A] leading-tight">
                Leaderboard Standings
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-md">
              Compete with fellow learners and climb the global rankings!
            </p>
          </div>
        </div>

        {leaderboardData.length > 0 ? (
          <div className="pt-4 pb-1 grid grid-cols-3 gap-2 sm:gap-4 md:gap-5 items-end w-full max-w-xl mx-auto">
            <div className="flex flex-col items-center">
              {rank2 ? (
                <>
                  <img
                    src={rank2.avatar_url}
                    alt={rank2.full_name}
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-cover mb-1.5 shadow-2xl"
                  />
                  <h3 className="font-extrabold text-slate-800 text-[11px] sm:text-xs truncate max-w-[90px] sm:max-w-[120px] text-center mb-1">
                    {rank2.full_name}
                  </h3>
                  <div className="w-full bg-[#e2e8f0] rounded-t-3xl pt-3 pb-3 px-1 mt-1 text-center flex flex-col items-center min-h-[85px] sm:min-h-[105px] justify-between border-t-4 border-white shadow-[inset_0_4px_0_0_rgba(255,255,255,0.6),0_6px_0_0_#94a3b8]">
                    <span className="text-sm sm:text-lg font-black text-[#334155] block">
                      2
                    </span>
                    <div className="bg-slate-700/10 rounded-lg px-1.5 py-0.5">
                      <span className="text-[10px] sm:text-xs font-black text-[#475569] block">
                        {rank2.xp_points.toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                </>
              ) : <div className="h-24" />}
            </div>

            <div className="flex flex-col items-center">
              {rank1 ? (
                <>
                  <img
                    src={rank1.avatar_url}
                    alt={rank1.full_name}
                    className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl object-cover mb-1.5 shadow-2xl"
                  />
                  <h3 className="font-black text-slate-900 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[130px] text-center mb-1">
                    {rank1.full_name}
                  </h3>
                  <div className="w-full bg-[#fbbf24] rounded-t-3xl pt-3.5 pb-3 px-1 mt-1 text-center flex flex-col items-center min-h-[105px] sm:min-h-[130px] justify-between border-t-4 border-yellow-100 shadow-[inset_0_4px_0_0_rgba(255,255,255,0.6),0_6px_0_0_#d97706]">
                    <span className="text-base sm:text-xl font-black text-[#78350f] block">
                      1
                    </span>
                    <div className="bg-amber-900/10 rounded-lg px-1.5 py-0.5">
                      <span className="text-[10px] sm:text-xs font-black text-[#78350f] block">
                        {rank1.xp_points.toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                </>
              ) : <div className="h-32" />}
            </div>

            <div className="flex flex-col items-center">
              {rank3 ? (
                <>
                  <img
                    src={rank3.avatar_url}
                    alt={rank3.full_name}
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-cover mb-1.5 shadow-2xl"
                  />
                  <h3 className="font-extrabold text-slate-800 text-[11px] sm:text-xs truncate max-w-[90px] sm:max-w-[120px] text-center mb-1">
                    {rank3.full_name}
                  </h3>
                  <div className="w-full bg-[#d97706] rounded-t-3xl pt-2.5 pb-3 px-1 mt-1 text-center flex flex-col items-center min-h-[65px] sm:min-h-[85px] justify-between border-t-4 border-amber-300 shadow-[inset_0_4px_0_0_rgba(255,255,255,0.4),0_6px_0_0_#b45309]">
                    <span className="text-sm sm:text-lg font-black text-amber-950 block">
                      3
                    </span>
                    <div className="bg-amber-950/10 rounded-lg px-1.5 py-0.5">
                      <span className="text-[10px] sm:text-xs font-black text-amber-950 block">
                        {rank3.xp_points.toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                </>
              ) : <div className="h-20" />}
            </div>
          </div>
        ) : null}

        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-black text-slate-900 text-base">Top Rankings</h3>
          </div>

          {leaderboardData.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-bold text-sm">
              No active users with XP yet.
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboardData.map((user) => {
                const isSelf = currentUser && user.id === currentUser.id;
                const isOddRank = user.rank !== undefined && user.rank % 2 !== 0;

                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                      isSelf
                        ? "bg-blue-50/80 border-2 border-blue-200 shadow-2xs"
                        : isOddRank
                        ? "bg-blue-100/70 border border-blue-200"
                        : "bg-[#f8fafc] border border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs font-black w-6 shrink-0 text-center ${isSelf ? "text-[#2563eb]" : "text-slate-500"}`}>
                        #{user.rank}
                      </span>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
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

              {hasMore && (
                <div className="pt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-600 disabled:bg-slate-300 text-white font-black text-xs sm:text-sm border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
                  >
                    {loadingMore ? "Loading..." : "... See All Rankings"}
                  </button>
                </div>
              )}

              {currentUser && currentUser.xp_points > 0 && currentUser.rank && !isCurrentUserInLoadedList && (
                <div className="pt-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/80 border-2 border-blue-200 shadow-2xs transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-black w-8 shrink-0 text-center text-[#2563eb]">
                        #{currentUser.rank}
                      </span>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={currentUser.avatar_url}
                          alt={currentUser.full_name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-black text-xs sm:text-sm truncate text-[#2563eb]">
                          {currentUser.full_name} <span className="text-[10px] font-bold">(You)</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="font-black text-xs sm:text-sm text-[#2563eb]">
                        {currentUser.xp_points} XP
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                        {currentUser.streak} <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-orange-500 stroke-none" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {!isMobileSidebarOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:w-[410px] sm:mx-auto z-[399] transition-all duration-300 translate-y-0 opacity-100 pointer-events-none lg:hidden">
          <div className="w-full rounded-full border transition-colors duration-300 pointer-events-auto backdrop-blur-2xl shadow-2xl overflow-hidden bg-[#F0F6FF]/95 border-blue-100/80 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <nav className="w-full max-w-md mx-auto h-[56px] grid grid-cols-6 items-stretch justify-items-center relative px-2">
              {mobileGamifiedNav.map((item) => {
                const isActive = item.path === "/leaderboard";

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

      {isShareModalOpen && currentUser && currentUser.xp_points > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-[2.2rem] w-full max-w-[460px] p-3 sm:p-4 shadow-2xl relative border-2 border-slate-100 my-auto">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setIsShareModalOpen(false);
              }}
              className="absolute -top-3 -right-3 bg-white text-slate-700 hover:text-slate-950 w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 z-30 shadow-lg border-2 border-slate-200 cursor-pointer"
              aria-label="Close rank card"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div
              ref={cardRef}
              className="w-full relative overflow-hidden select-none rounded-[1.6rem] mb-2.5 font-badge border border-amber-300/80 bg-[#f8fbff] shadow-lg aspect-[3/2]"
            >
              {!templateImgFailed && (
                <img
                  src={SHARE_TEMPLATE_URL}
                  alt="Otterleo Rank Template"
                  onError={() => setTemplateImgFailed(true)}
                  className="w-full h-full object-cover block select-none pointer-events-none"
                />
              )}

              <div className="absolute inset-x-0 top-[30%] flex items-center justify-center z-10 pointer-events-none">
                <span className="font-badge text-5xl sm:text-6xl font-black leading-none text-[#1e3a8a] tracking-tight">
                  {modalRank > 0 ? `#${modalRank}` : "TOP"}
                </span>
              </div>

              <div className="absolute inset-x-0 top-[60.5%] flex items-center justify-center px-12 z-10 pointer-events-none">
                <span className="text-white font-black text-xs sm:text-sm tracking-wide truncate max-w-[56%] drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                  {currentUser.full_name}
                </span>
              </div>
            </div>

            <div className="text-center pt-0.5 pb-1 space-y-0.5">
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