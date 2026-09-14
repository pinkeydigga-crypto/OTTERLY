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
import html2canvas from "html2canvas";

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

  // SAFE CANVAS GENERATOR WITH CORS & COLOR ERROR PREVENTION
  const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;

    try {
      return await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const images = clonedDoc.getElementsByTagName("img");
          for (let i = 0; i < images.length; i++) {
            images[i].setAttribute("crossorigin", "anonymous");
          }
        },
      });
    } catch (canvasErr) {
      console.warn("html2canvas fallback trigger due to:", canvasErr);
      return generateFallbackCanvas();
    }
  };

  // Pure Native Fallback Canvas Generator
  const generateFallbackCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!currentUser) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fill Card Background
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(0, 0, 720, 960, 40);
    ctx.fill();

    // Border
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 12;
    ctx.stroke();

    // Corner Accents
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(720, 960, 100, 0, Math.PI * 2);
    ctx.fill();

    // Title Block
    ctx.fillStyle = "#1e293b";
    ctx.font = "900 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MY LEADERBOARD RANK", 360, 160);

    // Rank Badge
    ctx.fillStyle = "#2563eb";
    ctx.roundRect(260, 190, 200, 50, 25);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 24px sans-serif";
    ctx.fillText(`Top #${currentUser.rank || "N/A"}`, 360, 224);

    // Name
    ctx.fillStyle = "#0f172a";
    ctx.font = "900 40px sans-serif";
    ctx.fillText(currentUser.full_name, 360, 520);

    // Stats Box
    ctx.fillStyle = "#f0f6ff";
    ctx.roundRect(100, 580, 520, 140, 20);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 28px sans-serif";
    ctx.fillText(`XP: ${currentUser.xp_points} XP`, 240, 660);
    ctx.fillText(`Streak: ${currentUser.streak} Days`, 480, 660);

    // Footer Text
    ctx.fillStyle = "#2563eb";
    ctx.font = "italic bold 24px sans-serif";
    ctx.fillText("Keep drawing, keep growing!", 360, 820);

    return canvas;
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Canvas generation failed");

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${currentUser?.full_name || "User"}_Leaderboard_Rank.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading image:", err);
      alert("Image download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);

    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Canvas generation failed");

      canvas.toBlob(async (blob) => {
        if (!blob) {
          handleDownloadImage();
          return;
        }

        const file = new File([blob], `${currentUser?.full_name || "User"}_Leaderboard_Rank.png`, {
          type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My Leaderboard Rank",
            text: `Check out my rank on Otterleo Leaderboard! 🎨`,
          });
        } else {
          handleDownloadImage();
        }
      }, "image/png");
    } catch (err) {
      console.error("Error sharing image:", err);
      handleDownloadImage();
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight font-sans pb-24 md:pb-0">

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

          <img src={logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
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
                <img src={logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
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
      <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-5xl mx-auto w-full min-w-0 space-y-5 overflow-y-auto">

        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-black text-xs sm:text-sm hover:bg-slate-50 transition-all shadow-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>

          {currentUser && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] hover:bg-blue-600 text-white rounded-2xl font-black text-xs sm:text-sm border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Rank Card</span>
            </button>
          )}
        </div>

        {/* Banner Section */}
        <div className="bg-white py-5 px-5 sm:px-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xs flex flex-col items-center text-center space-y-2 relative overflow-hidden">
          <div className="w-24 sm:w-32 h-auto shrink-0 flex items-center justify-center">
            <img
              src={mascotImageUrl}
              alt="Mascot"
              className="w-full h-auto object-contain drop-shadow-md"
              crossOrigin="anonymous"
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-3xl font-black text-[#0F172A] leading-tight">
              Leaderboard Standings
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-md mx-auto">
              Compete with fellow learners and climb the global rankings!
            </p>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[220px] flex items-center justify-center bg-white rounded-[2.5rem] border-2 border-slate-100 p-8">
            <div className="flex items-center gap-3 text-[#2563eb] font-black text-base">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading rankings...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Podium Section */}
            {leaderboardData.length > 0 ? (
              <div className="pt-2 grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 items-end w-full">
                {/* RANK 2 */}
                {rank2 ? (
                  <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-2.5 sm:p-4 text-center relative flex flex-col items-center shadow-xs">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-black text-[10px] sm:text-xs text-slate-700 mb-1">
                      #2
                    </div>
                    <img
                      src={rank2.avatar_url}
                      alt={rank2.full_name}
                      className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-100 my-1"
                      crossOrigin="anonymous"
                    />
                    <h3 className="font-black text-slate-800 text-[11px] sm:text-sm truncate w-full">
                      {rank2.full_name}
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 mt-1">
                      <span className="text-[10px] sm:text-xs font-black text-[#2563eb]">
                        {rank2.xp_points} XP
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[11px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100">
                        {rank2.streak} <Flame className="w-3 h-3 fill-orange-500 stroke-none" />
                      </span>
                    </div>
                  </div>
                ) : <div />}

                {/* RANK 1 */}
                {rank1 ? (
                  <div className="bg-amber-50/80 border-2 border-amber-200 rounded-[2.2rem] p-3 sm:p-5 text-center relative flex flex-col items-center shadow-xs">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center font-black text-xs text-white shadow-xs mb-1">
                      #1
                    </div>
                    <img
                      src={rank1.avatar_url}
                      alt={rank1.full_name}
                      className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-200 my-1"
                      crossOrigin="anonymous"
                    />
                    <h3 className="font-black text-slate-900 text-xs sm:text-base truncate w-full">
                      {rank1.full_name}
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 mt-1">
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
                  <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-2.5 sm:p-4 text-center relative flex flex-col items-center shadow-xs">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-200 border-2 border-white flex items-center justify-center font-black text-[10px] sm:text-xs text-orange-800 mb-1">
                      #3
                    </div>
                    <img
                      src={rank3.avatar_url}
                      alt={rank3.full_name}
                      className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-100 my-1"
                      crossOrigin="anonymous"
                    />
                    <h3 className="font-black text-slate-800 text-[11px] sm:text-sm truncate w-full">
                      {rank3.full_name}
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 mt-1">
                      <span className="text-[10px] sm:text-xs font-black text-[#2563eb]">
                        {rank3.xp_points} XP
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[11px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100">
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
                        className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                          isSelf
                            ? "bg-blue-50/80 border-2 border-blue-200 shadow-2xs"
                            : "bg-[#f8fafc] border border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-xs font-black w-5 shrink-0 text-center ${isSelf ? "text-[#2563eb]" : "text-slate-400"}`}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[360px] p-4 sm:p-6 shadow-2xl relative border-2 border-slate-100 my-auto">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Target Proportional Card for Download & Share */}
            <div
              ref={cardRef}
              className="w-full bg-white rounded-[2rem] p-5 text-center shadow-lg relative overflow-hidden mb-5 border-4 border-blue-500 flex flex-col items-center"
            >
              {/* Corner Accents */}
              <div className="absolute -top-8 -left-8 w-20 h-20 bg-blue-500 rounded-full pointer-events-none" />
              <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-blue-500 rounded-full pointer-events-none" />

              {/* Logo */}
              <div className="relative z-10 flex flex-col items-center mb-2">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-9 w-auto object-contain mb-1"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Title Section */}
              <div className="relative z-10 space-y-1 mb-3">
                <div className="flex items-center justify-center gap-1">
                  <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <h2 className="text-sm font-black text-[#1e293b] tracking-wide uppercase">
                  MY LEADERBOARD RANK
                </h2>

                <div className="inline-flex items-center gap-1 bg-[#2563eb] text-white font-black text-xs px-3.5 py-1 rounded-full shadow-xs">
                  Top #{currentUser.rank || "N/A"}
                </div>
              </div>

              {/* Avatar Box */}
              <div className="relative z-10 my-1">
                <div className="relative inline-block bg-blue-500 p-1.5 rounded-2xl shadow-md">
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-20 h-20 rounded-xl object-cover bg-white"
                    crossOrigin="anonymous"
                  />
                  <span className="absolute -bottom-2 -right-2 bg-white text-[#2563eb] font-black text-[10px] px-2 py-0.5 rounded-full shadow-md border border-blue-100">
                    #{currentUser.rank || "N/A"}
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <h3 className="relative z-10 font-black text-lg text-[#0f172a] mt-2 mb-3 truncate w-full px-2">
                {currentUser.full_name}
              </h3>

              {/* Stats Container */}
              <div className="relative z-10 w-full bg-[#f0f6ff] rounded-xl p-3 border border-blue-100 flex items-center justify-around mb-3">
                <div className="flex items-center gap-2 text-left">
                  <Star className="w-4 h-4 text-blue-600 fill-blue-600 shrink-0" />
                  <div>
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase">TOTAL XP</p>
                    <p className="text-sm font-black text-[#0f172a]">{currentUser.xp_points} XP</p>
                  </div>
                </div>

                <div className="h-7 w-px bg-blue-200" />

                <div className="flex items-center gap-2 text-left">
                  <Flame className="w-4 h-4 text-blue-600 fill-blue-600 shrink-0" />
                  <div>
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase">STREAK</p>
                    <p className="text-sm font-black text-[#0f172a] flex items-center gap-1">
                      {currentUser.streak} <span className="text-amber-500">🔥</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div className="relative z-10 text-[11px] font-bold text-[#2563eb] italic flex items-center justify-center gap-1">
                <span>Keep drawing, keep growing!</span>
                <Heart className="w-3 h-3 fill-blue-600 stroke-none" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleShareImage}
                disabled={isSharing || isDownloading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#2563eb] hover:bg-blue-600 text-white rounded-2xl font-black text-xs border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-md disabled:opacity-70 cursor-pointer"
              >
                {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>Share Image</span>
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isDownloading || isSharing}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-xs border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all shadow-md disabled:opacity-70 cursor-pointer"
              >
                {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}