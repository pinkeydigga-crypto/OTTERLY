"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Share2, Download, X, Loader2, LayoutDashboard,
  Swords, Scan, Trophy, Compass, Award, User, Settings, Flame, PanelLeft,
  Crown, Star, Heart
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toPng } from "html-to-image";

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

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [leaderboardData, setLeaderboardData] = useState<ProfileUser[]>([]);
  const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);

  const mascotImageUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/leaderbaord%20(1).png";
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png";

  const fetchLeaderboardAndUser = useCallback(async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setLoading(true);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        console.error("Leaderboard fetch error:", error);
        setLeaderboardData([]);
        setLoading(false);
        return;
      }

      let mappedProfiles: ProfileUser[] = (profiles || []).map((p: any) => {
        const userStreak = p.streak ?? p.current_streak ?? p.streak_count ?? p.scans_count ?? p.scans ?? 0;
        const totalXP = Number(p.xp_points ?? p.xp ?? 0);

        return {
          id: p.id,
          full_name: p.full_name || p.name || p.username || "User",
          avatar_url: p.avatar_url || p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
          streak: Number(userStreak),
          xp_points: totalXP,
          created_at: p.created_at,
        };
      });

      mappedProfiles.sort((a, b) => {
        if (b.xp_points !== a.xp_points) {
          return b.xp_points - a.xp_points;
        }
        return b.streak - a.streak;
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
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (userProfile) {
          const p = userProfile as any;
          const myStreak = p.streak ?? p.current_streak ?? p.streak_count ?? 0;
          const myXP = Number(p.xp_points ?? p.xp ?? 0);
          setCurrentUser({
            id: p.id,
            rank: 0,
            full_name: p.full_name || p.name || p.username || "You",
            avatar_url: p.avatar_url || p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
            streak: Number(myStreak),
            xp_points: myXP,
          });
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLeaderboardAndUser();

    const interval = setInterval(() => {
      fetchLeaderboardAndUser(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchLeaderboardAndUser]);

  const rank1 = leaderboardData.find((u) => u.rank === 1);
  const rank2 = leaderboardData.find((u) => u.rank === 2);
  const rank3 = leaderboardData.find((u) => u.rank === 3);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${currentUser?.full_name}_Leaderboard_Rank.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading image:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
      });

      const blobFetch = await fetch(dataUrl);
      const imageBlob = await blobFetch.blob();

      const file = new File([imageBlob], `${currentUser?.full_name}_Leaderboard_Rank.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Leaderboard Rank",
          text: `Check out my rank on the Leaderboard! 🎨`,
        });
      } else {
        alert("Native sharing is not supported on this browser. Use the Download option instead.");
      }
    } catch (err) {
      console.error("Error sharing image:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", active: true, icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight font-sans pb-20 md:pb-0">

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMobileSidebarOpen(false)}
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
          </aside>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
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
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full min-w-0 space-y-6 overflow-y-auto">

        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            Back to Dashboard
          </Link>

          {currentUser && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-blue-600 text-white rounded-2xl font-black text-xs md:text-sm border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Rank Card</span>
            </button>
          )}
        </div>

        {/* Banner Section */}
        <div className="bg-white pt-6 pb-6 px-6 sm:px-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center justify-center shrink-0">
            <img
              src={mascotImageUrl}
              alt="Mascot"
              className="w-28 sm:w-36 h-auto object-contain drop-shadow-md"
            />
          </div>

          <div className="space-y-1.5 text-center sm:text-right">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A]">Leaderboard Standings</h1>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              Compete with fellow learners and climb the global rankings!
            </p>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[250px] flex items-center justify-center bg-white rounded-[2.5rem] border-2 border-slate-100 p-8">
            <div className="flex items-center gap-3 text-[#2563eb] font-black text-base">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading rankings...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Podium Section */}
            {leaderboardData.length > 0 ? (
              <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 items-end w-full">
                {/* RANK 2 */}
                {rank2 ? (
                  <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-3 sm:p-4 text-center relative flex flex-col items-center shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-black text-xs text-slate-700 mb-1">
                      #2
                    </div>
                    <img
                      src={rank2.avatar_url}
                      alt={rank2.full_name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-100 my-1"
                    />
                    <h3 className="font-black text-slate-800 text-xs sm:text-sm truncate w-full">
                      {rank2.full_name}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mt-1">
                      <span className="text-[11px] sm:text-xs font-black text-[#2563eb]">
                        {rank2.xp_points} XP
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100">
                        {rank2.streak} <Flame className="w-3 h-3 fill-orange-500 stroke-none" />
                      </span>
                    </div>
                  </div>
                ) : <div />}

                {/* RANK 1 */}
                {rank1 ? (
                  <div className="bg-amber-50/80 border-2 border-amber-200 rounded-[2.5rem] p-4 sm:p-5 text-center relative flex flex-col items-center shadow-xs">
                    <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center font-black text-xs text-white shadow-xs mb-1">
                      #1
                    </div>
                    <img
                      src={rank1.avatar_url}
                      alt={rank1.full_name}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-200 my-1"
                    />
                    <h3 className="font-black text-slate-900 text-xs sm:text-base truncate w-full">
                      {rank1.full_name}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mt-1">
                      <span className="text-xs sm:text-sm font-black text-amber-600">
                        {rank1.xp_points} XP
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-black text-orange-500 bg-amber-100/60 px-1.5 py-0.5 rounded-md border border-amber-200">
                        {rank1.streak} <Flame className="w-3.5 h-3.5 fill-orange-500 stroke-none" />
                      </span>
                    </div>
                  </div>
                ) : <div />}

                {/* RANK 3 */}
                {rank3 ? (
                  <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-3 sm:p-4 text-center relative flex flex-col items-center shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-orange-200 border-2 border-white flex items-center justify-center font-black text-xs text-orange-800 mb-1">
                      #3
                    </div>
                    <img
                      src={rank3.avatar_url}
                      alt={rank3.full_name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-100 my-1"
                    />
                    <h3 className="font-black text-slate-800 text-xs sm:text-sm truncate w-full">
                      {rank3.full_name}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mt-1">
                      <span className="text-[11px] sm:text-xs font-black text-[#2563eb]">
                        {rank3.xp_points} XP
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100">
                        {rank3.streak} <Flame className="w-3 h-3 fill-orange-500 stroke-none" />
                      </span>
                    </div>
                  </div>
                ) : <div />}
              </div>
            ) : null}

            {/* Leaderboard Table List */}
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-4 sm:p-6 shadow-xs">
              <h3 className="font-black text-slate-900 text-base mb-4 px-2">Top Rankings</h3>

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
                        className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                          isSelf
                            ? "bg-blue-50/80 border-2 border-blue-200 shadow-2xs"
                            : "bg-[#f8fafc] border border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <span className={`text-xs font-black w-5 shrink-0 text-center ${isSelf ? "text-[#2563eb]" : "text-slate-400"}`}>
                            #{user.rank}
                          </span>
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <span className={`font-black text-sm truncate ${isSelf ? "text-[#2563eb]" : "text-slate-800"}`}>
                              {user.full_name} {isSelf && <span className="text-xs font-bold">(You)</span>}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`font-black text-sm ${isSelf ? "text-[#2563eb]" : "text-slate-800"}`}>
                            {user.xp_points} XP
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-xs font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                            {user.streak} <Flame className="w-3.5 h-3.5 fill-orange-500 stroke-none" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex justify-around items-center z-40 shadow-lg">
        {[
          { name: "Home", path: "/dashboard", icon: LayoutDashboard },
          { name: "Scan", path: "/scan", icon: Scan },
          { name: "Challenges", path: "/challenges", icon: Swords },
          { name: "Leaderboard", path: "/leaderboard", active: true, icon: Trophy },
          { name: "Profile", path: "/profile", icon: User },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.path} className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-black ${item.active ? "text-[#2563EB]" : "text-slate-400"}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Share Card Modal (Updated exact design matching image) */}
      {isShareModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[2.5rem] max-w-sm w-full p-6 shadow-2xl relative border-2 border-slate-100">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Target Card for Image Export */}
            <div
              ref={cardRef}
              className="bg-white rounded-[2.5rem] p-6 text-center shadow-lg relative overflow-hidden mb-6 border-4 border-blue-400 flex flex-col items-center"
            >
              {/* Decorative Corner Background Shapes */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-500 rounded-full" />
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500 rounded-full" />

              {/* Header Logo */}
              <div className="relative z-10 flex flex-col items-center mb-3">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-10 w-auto object-contain mb-1"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Title Section */}
              <div className="relative z-10 space-y-1 mb-4">
                <div className="flex items-center justify-center gap-1">
                  <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <h2 className="text-lg font-black text-[#1E293B] tracking-wide uppercase">
                  MY LEADERBOARD RANK
                </h2>

                {/* Rank Badge Pill */}
                <div className="inline-flex items-center gap-1 bg-[#3B82F6] text-white font-black text-xs px-4 py-1.5 rounded-full shadow-xs mt-1">
                  Top #{currentUser.rank || "N/A"}
                </div>
              </div>

              {/* Profile Frame with Rank Badge */}
              <div className="relative z-10 my-2">
                <div className="relative inline-block bg-gradient-to-b from-blue-400 to-blue-600 p-2 rounded-3xl shadow-md">
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-24 h-24 rounded-2xl object-cover bg-white"
                    crossOrigin="anonymous"
                  />
                  <span className="absolute -bottom-2 -right-2 bg-white text-[#2563EB] font-black text-xs px-2.5 py-1 rounded-full shadow-md border border-blue-100">
                    #{currentUser.rank || "N/A"}
                  </span>
                </div>
              </div>

              {/* Username */}
              <h3 className="relative z-10 font-black text-xl text-[#0F172A] mt-2 mb-4">
                {currentUser.full_name}
              </h3>

              {/* Stats Box Container */}
              <div className="relative z-10 w-full bg-[#F0F6FF] rounded-2xl p-4 border border-blue-100 flex items-center justify-around mb-4">
                <div className="flex items-center gap-2 text-left">
                  <Star className="w-5 h-5 text-blue-600 fill-blue-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">TOTAL XP</p>
                    <p className="text-base font-black text-[#0F172A]">{currentUser.xp_points} XP</p>
                  </div>
                </div>

                <div className="h-8 w-px bg-blue-200" />

                <div className="flex items-center gap-2 text-left">
                  <Flame className="w-5 h-5 text-blue-600 fill-blue-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">STREAK</p>
                    <p className="text-base font-black text-[#0F172A] flex items-center gap-1">
                      {currentUser.streak} <span className="text-amber-500">🔥</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Subtitle */}
              <div className="relative z-10 text-xs font-bold text-blue-600 italic flex items-center justify-center gap-1">
                <span>Keep drawing, keep growing!</span>
                <Heart className="w-3.5 h-3.5 fill-blue-600 stroke-none" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleShareImage}
                disabled={isSharing || isDownloading}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-[#2563eb] hover:bg-blue-600 text-white rounded-2xl font-black text-xs sm:text-sm border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-md disabled:opacity-70"
              >
                {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                <span>Share Image</span>
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isDownloading || isSharing}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-xs sm:text-sm border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all shadow-md disabled:opacity-70"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}