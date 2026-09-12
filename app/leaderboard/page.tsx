"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Share2, Download, X, Loader2, LayoutDashboard,
  Swords, Scan, Trophy, Compass, Award, User, Settings, Flame, PanelLeft
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
      // 🔒 Security Check: Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Database se saare profiles aur unki total XP fetch kar rahe hain
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

      // Highest XP first sort ho rahi hai (XP same ho to Streak dekhega)
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

    // Har 1 min me automatic background refresh hota rahega taaki real-time badhti hui XP update ho jaye
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
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight font-sans pb-20 md:pb-0">

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
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">

        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all shadow-sm"
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
        <div className="bg-white pt-6 pb-0 px-4 sm:px-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex items-end justify-between min-h-[160px] relative overflow-hidden">
          <div className="z-20 flex items-end shrink-0 -mb-1">
            <img
              src={mascotImageUrl}
              alt="Mascot"
              className="w-28 sm:w-36 h-auto object-contain block align-bottom -ml-1 drop-shadow-md"
            />
          </div>

          <div className="space-y-1.5 max-w-lg z-10 pb-6 text-right">
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
              <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
                {/* RANK 2 */}
                {rank2 ? (
                  <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-4 text-center relative flex flex-col items-center shadow-xs">
                    <div className="absolute -top-3 w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-black text-xs text-slate-700">
                      #2
                    </div>
                    <img
                      src={rank2.avatar_url}
                      alt={rank2.full_name}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-slate-100 my-2"
                    />
                    <h3 className="font-black text-slate-800 text-xs md:text-sm truncate max-w-full">
                      {rank2.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-[#2563eb]">
                        {rank2.xp_points} XP
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100">
                        {rank2.streak} <Flame className="w-3 h-3 fill-orange-500 stroke-none" />
                      </span>
                    </div>
                  </div>
                ) : <div />}

                {/* RANK 1 */}
                {rank1 ? (
                  <div className="bg-amber-50/80 border-2 border-amber-200 rounded-[2.5rem] p-5 text-center relative flex flex-col items-center shadow-xs -mt-4">
                    <div className="absolute -top-3.5 w-8 h-8 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center font-black text-xs text-white shadow-xs">
                      #1
                    </div>
                    <img
                      src={rank1.avatar_url}
                      alt={rank1.full_name}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-amber-200 my-2"
                    />
                    <h3 className="font-black text-slate-900 text-sm md:text-base truncate max-w-full">
                      {rank1.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-black text-amber-600">
                        {rank1.xp_points} XP
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-xs font-black text-orange-500 bg-amber-100/60 px-1.5 py-0.5 rounded-md border border-amber-200">
                        {rank1.streak} <Flame className="w-3.5 h-3.5 fill-orange-500 stroke-none" />
                      </span>
                    </div>
                  </div>
                ) : <div />}

                {/* RANK 3 */}
                {rank3 ? (
                  <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-4 text-center relative flex flex-col items-center shadow-xs">
                    <div className="absolute -top-3 w-7 h-7 rounded-full bg-orange-200 border-2 border-white flex items-center justify-center font-black text-xs text-orange-800">
                      #3
                    </div>
                    <img
                      src={rank3.avatar_url}
                      alt={rank3.full_name}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border-2 border-slate-100 my-2"
                    />
                    <h3 className="font-black text-slate-800 text-xs md:text-sm truncate max-w-full">
                      {rank3.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-[#2563eb]">
                        {rank3.xp_points} XP
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100">
                        {rank3.streak} <Flame className="w-3 h-3 fill-orange-500 stroke-none" />
                      </span>
                    </div>
                  </div>
                ) : <div />}
              </div>
            ) : null}

            {/* Leaderboard Table List */}
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-4 sm:p-6 shadow-sm">
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
                        <div className="flex items-center gap-4">
                          <span className={`text-xs font-black w-5 text-center ${isSelf ? "text-[#2563eb]" : "text-slate-400"}`}>
                            #{user.rank}
                          </span>
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                            />
                            <span className={`font-black text-sm ${isSelf ? "text-[#2563eb]" : "text-slate-800"}`}>
                              {user.full_name} {isSelf && <span className="text-xs font-bold">(You)</span>}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
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

      {/* Share Card Modal */}
      {isShareModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[2.5rem] max-w-sm w-full p-6 shadow-2xl relative border-2 border-slate-100">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Card Preview Container */}
            <div
              ref={cardRef}
              className="bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] rounded-[2rem] p-6 text-white text-center shadow-lg relative overflow-hidden mb-6 mt-2 border-4 border-blue-300"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
                <span className="text-xs font-black tracking-widest text-blue-100 uppercase">LEADERBOARD RANK</span>
                <span className="text-xs font-black bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                  Otterleo
                </span>
              </div>

              <div className="relative inline-block mb-3">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-md"
                  crossOrigin="anonymous"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                  #{currentUser.rank || "N/A"}
                </span>
              </div>

              <h2 className="font-black text-lg text-white">{currentUser.full_name}</h2>

              <div className="mt-4 bg-white/10 rounded-2xl p-3.5 backdrop-blur-md border border-white/20 flex items-center justify-around">
                <div className="text-center">
                  <p className="text-[10px] text-blue-100 font-black uppercase">Total XP</p>
                  <p className="text-base font-black text-white">{currentUser.xp_points} XP</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-[10px] text-blue-100 font-black uppercase">Streak</p>
                  <p className="text-base font-black text-amber-300 inline-flex items-center gap-1">
                    {currentUser.streak} <Flame className="w-4 h-4 fill-amber-300 stroke-none" />
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons: Share & Download */}
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