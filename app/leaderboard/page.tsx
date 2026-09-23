"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Share2, Download, X, Loader2, LayoutDashboard,
  Swords, Scan, Trophy, Compass, Award, User, Settings, Flame, PanelLeft,
  Star, Palette, Grid
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [leaderboardData, setLeaderboardData] = useState<ProfileUser[]>([]);
  const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);

  const mascotImageUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/leaderbaord%20(1).png";
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";

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

  const rank1 = leaderboardData.length > 0 ? leaderboardData[0] : null;
  const rank2 = leaderboardData.length > 1 ? leaderboardData[1] : null;
  const rank3 = leaderboardData.length > 2 ? leaderboardData[2] : null;

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

          const elements = clonedDoc.querySelectorAll("*");
          elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(htmlEl);
            
            if (computedStyle.color && (computedStyle.color.includes("lab") || computedStyle.color.includes("oklab"))) {
              htmlEl.style.color = "#1e3a8a";
            }
            if (computedStyle.backgroundColor && (computedStyle.backgroundColor.includes("lab") || computedStyle.backgroundColor.includes("oklab"))) {
              htmlEl.style.backgroundColor = "#ffffff";
            }
            if (computedStyle.borderColor && (computedStyle.borderColor.includes("lab") || computedStyle.borderColor.includes("oklab"))) {
              htmlEl.style.borderColor = "#cbd5e1";
            }
          });
        },
      });
    } catch (canvasErr) {
      return generateFallbackCanvas();
    }
  };

  const generateFallbackCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!currentUser) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#ffffff";
    ctx.roundRect(0, 0, 720, 960, 40);
    ctx.fill();

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 12;
    ctx.stroke();

    ctx.fillStyle = "#1e3a8a";
    ctx.font = "900 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("My Global Rank", 360, 160);

    ctx.fillStyle = "#1e3a8a";
    ctx.font = "900 80px sans-serif";
    ctx.fillText(`${currentUser.rank || "N/A"}`, 360, 280);

    ctx.fillStyle = "#e0f2fe";
    ctx.roundRect(100, 580, 520, 140, 24);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.font = "900 28px sans-serif";
    ctx.fillText(`XP: ${currentUser.xp_points} XP`, 240, 660);
    ctx.fillText(`Streak: ${currentUser.streak} Days`, 480, 660);

    ctx.fillStyle = "#2563eb";
    ctx.font = "italic bold 24px sans-serif";
    ctx.fillText("Keep drawing, keep growing!", 360, 820);

    return canvas;
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current || isProcessing || isDownloading || isSharing) return;

    setIsProcessing(true);
    setIsDownloading(true);

    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Canvas generation failed");

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${currentUser?.full_name || "User"}_Global_Rank.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading image:", err);
      alert("Image download failed. Please try again.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => {
        setIsProcessing(false);
      }, 1500);
    }
  };

  const handleShareImage = async () => {
    if (!cardRef.current || isProcessing || isSharing || isDownloading) return;

    setIsProcessing(true);
    setIsSharing(true);

    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Canvas generation failed");

      canvas.toBlob(async (blob) => {
        if (!blob) {
          handleDownloadImage();
          return;
        }

        const file = new File([blob], `${currentUser?.full_name || "User"}_Global_Rank.png`, {
          type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My Global Rank",
            text: `Check out my rank on Otterleo! 🎨`,
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
      setTimeout(() => {
        setIsProcessing(false);
      }, 1500);
    }
  };

  const desktopNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", active: true, icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Achievements", path: "/achievements", icon: Award },
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

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight font-sans pb-24 md:pb-0">

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
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
            onClick={() => setIsMobileSidebarOpen(false)}
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
                  onClick={() => setIsMobileSidebarOpen(false)}
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
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-[#0F172A] leading-tight">
              Leaderboard Standings
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-md">
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
          </>
        )}
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
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Target Card for Export - Removed Bottom OTTERLEO Badge */}
            <div
              ref={cardRef}
              className="w-full relative overflow-hidden flex flex-col items-center justify-between p-5 sm:p-6 text-center select-none rounded-xl mb-4"
              style={{
                backgroundColor: "#e0f2fe",
                backgroundImage: `
                  linear-gradient(to right, rgba(147, 197, 253, 0.4) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(147, 197, 253, 0.4) 1px, transparent 1px)
                `,
                backgroundSize: "22px 22px",
                fontFamily: '"Comic Sans MS", "Chalkboard SE", "Caveat", "Architects Daughter", cursive, sans-serif',
              }}
            >
              {/* Inner Torn Paper Container */}
              <div
                className="w-full h-full bg-[#fdfbf7] rounded-sm p-6 sm:p-7 relative flex flex-col items-center justify-between min-h-[460px] border border-amber-100/60"
                style={{
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                  clipPath: "polygon(0% 0.5%, 15% 0%, 30% 0.8%, 45% 0.2%, 60% 0.6%, 75% 0.1%, 90% 0.7%, 100% 0%, 99.5% 15%, 100% 30%, 99.2% 45%, 100% 60%, 99.6% 75%, 100% 90%, 99.4% 100%, 85% 99.5%, 70% 100%, 55% 99.2%, 40% 100%, 25% 99.6%, 10% 100%, 0% 99.3%, 0.5% 85%, 0% 70%, 0.8% 55%, 0.2% 40%, 0.6% 25%, 0.1% 10%)"
                }}
              >
                {/* Blue Washi Tape (Top Left) */}
                <div
                  className="absolute -top-3 -left-4 w-20 h-7 -rotate-25 shadow-xs z-20 opacity-90 pointer-events-none"
                  style={{
                    backgroundColor: "#60a5fa",
                    clipPath: "polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)"
                  }}
                />

                {/* Top Otterleo Logo */}
                <div className="pt-2 z-10 flex flex-col items-center">
                  <img
                    src={logoUrl}
                    alt="Otterleo"
                    className="h-10 sm:h-12 w-auto object-contain mb-1"
                    crossOrigin="anonymous"
                  />
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "#1e3a8a" }}>
                    My Global Rank
                  </h2>
                </div>

                {/* Crown + Rank Number */}
                <div className="relative my-auto py-2 flex flex-col items-center justify-center w-full z-10">
                  {/* Crown */}
                  <div className="mb-1">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                      <circle cx="2" cy="4" r="1" fill="#f59e0b" />
                      <circle cx="12" cy="4" r="1" fill="#f59e0b" />
                      <circle cx="22" cy="4" r="1" fill="#f59e0b" />
                    </svg>
                  </div>

                  {/* Rank with Action Lines */}
                  <div className="relative flex items-center justify-center">
                    {/* Left Action Lines */}
                    <div className="absolute -left-9 flex flex-col items-center gap-1.5 opacity-80" style={{ color: "#1e3a8a" }}>
                      <span className="w-3.5 h-1 bg-[#1e3a8a] rounded-full rotate-25"></span>
                      <span className="w-4 h-1 bg-[#1e3a8a] rounded-full"></span>
                      <span className="w-3.5 h-1 bg-[#1e3a8a] rounded-full -rotate-25"></span>
                    </div>

                    {/* Big Rank Number */}
                    <span className="text-7xl sm:text-8xl font-black leading-none tracking-tight" style={{ color: "#1e3a8a" }}>
                      {currentUser?.rank || "5"}
                    </span>

                    {/* Right Action Lines */}
                    <div className="absolute -right-9 flex flex-col items-center gap-1.5 opacity-80" style={{ color: "#1e3a8a" }}>
                      <span className="w-3.5 h-1 bg-[#1e3a8a] rounded-full -rotate-25"></span>
                      <span className="w-4 h-1 bg-[#1e3a8a] rounded-full"></span>
                      <span className="w-3.5 h-1 bg-[#1e3a8a] rounded-full rotate-25"></span>
                    </div>
                  </div>

                  {/* Underline Stroke */}
                  <div className="w-28 h-2 rounded-full mt-2 -rotate-1 opacity-90" style={{ backgroundColor: "#93c5fd" }} />
                </div>

                {/* XP & Streak Box */}
                <div
                  className="w-full rounded-2xl py-3.5 px-4 flex items-center justify-around my-2 z-10"
                  style={{ backgroundColor: "#e0f2fe", opacity: 0.9 }}
                >
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 fill-[#1e3a8a] text-[#1e3a8a]" />
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">XP</p>
                      <p className="text-sm sm:text-base font-black text-slate-900">{currentUser?.xp_points || 0} XP</p>
                    </div>
                  </div>

                  <div className="h-8 w-0.5 bg-blue-200/80" />

                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 fill-[#1e3a8a] text-[#1e3a8a]" />
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Streak</p>
                      <p className="text-sm sm:text-base font-black text-slate-900">{currentUser?.streak || 0} Days</p>
                    </div>
                  </div>
                </div>

                {/* Footer Quote & Doodles */}
                <div className="w-full pt-2 flex flex-col items-center justify-center relative z-10">
                  <p className="text-xs sm:text-sm font-black italic tracking-wide" style={{ color: "#2563eb" }}>
                    Keep drawing, keep growing!
                  </p>

                  {/* Underline for quote */}
                  <div className="w-24 h-1 rounded-full mt-1 -rotate-2" style={{ backgroundColor: "#93c5fd" }} />

                  {/* Bottom Right Heart & Pencil Doodle */}
                  <div className="absolute right-0 bottom-0 flex items-center gap-1.5" style={{ color: "#2563eb" }}>
                    <span className="text-xs font-black">♡</span>
                    <div className="w-3.5 h-3.5 border-2 border-[#2563eb] rotate-45 rounded-xs flex items-center justify-center">
                      <div className="w-1 h-1 bg-[#2563eb]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleShareImage}
                disabled={isProcessing || isSharing || isDownloading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#2563eb] hover:bg-blue-600 text-white rounded-2xl font-black text-xs border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>Share Image</span>
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isProcessing || isDownloading || isSharing}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-xs border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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