"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/components/LoadingScreen";
import XpWheel from "@/components/xpwheel";
import {
  LayoutDashboard,
  Swords,
  Scan,
  Trophy,
  Compass,
  Award,
  User,
  Settings,
  Star,
  Flame,
  PanelLeft,
  X,
  ChevronRight,
  Palette,
  Grid
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
}

interface Achievement {
  id: string;
  title: string;
  xp_reward: number;
}

interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  streak: number;
  avatar_url: string;
}

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DashboardPage() {
  const router = useRouter();
  const mascotUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20dahsbaord%20mascot.png";
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | string>("-");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Lock to avoid infinite re-fetching loops
  const isFetchingRef = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 1. Strict Auth Verification Check
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        if (typeof window !== "undefined") {
          localStorage.clear();
        }
        router.push("/login");
        return;
      }

      // 2. Safe & Optimized Profile Fetching
      const { data: profileData, error: profError } = await supabase
        .from("profiles")
        .select("id, name, username, email, avatar_url, xp, streak, last_login")
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
            .select("id, name, username, email, avatar_url, xp, streak, last_login")
            .maybeSingle();

          activeProfile = updatedProfile || { ...profileData, streak: newStreak, last_login: todayStr };
        } else {
          activeProfile = profileData;
        }
      } else {
        // Fallback object
        activeProfile = {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Artist",
          username: user.email?.split("@")[0] || "artist",
          email: user.email || "",
          avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
          xp: 0,
          streak: 1,
          last_login: getLocalDateString()
        };
      }

      setProfile(activeProfile);

      // 3. Dynamic Achievements (Optimized Single Foreign Join Query)
      const { data: userAchData, error: achError } = await supabase
        .from("user_completed_achievements")
        .select("id, achievement_id, achievements(id, title, xp_reward)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!achError && userAchData) {
        const formatted = userAchData.map((item: any) => ({
          id: item.id,
          title: item.achievements?.title || String(item.achievement_id || "").replace(/_/g, " ").toUpperCase(),
          xp_reward: item.achievements?.xp_reward ?? 50
        }));
        setRecentAchievements(formatted);
      } else {
        setRecentAchievements([]);
      }

      // 4. Heavily Optimized Leaderboard (DB level Limit 10 & Sorting to control Egress)
      const { data: topProfiles, error: leadError } = await supabase
        .from("profiles")
        .select("id, name, username, xp, streak, avatar_url")
        .order("xp", { ascending: false })
        .order("streak", { ascending: false })
        .limit(10);

      if (!leadError && topProfiles) {
        const mapped: LeaderboardUser[] = topProfiles.map((p) => ({
          id: p.id,
          name: (p.name || p.username || "Artist").replace(/<[^>]*>?/gm, "").trim(),
          xp: Number(p.xp ?? 0),
          streak: Number(p.streak ?? 0),
          avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.id}`
        }));

        setLeaderboard(mapped.slice(0, 3));

        const rankIndex = mapped.findIndex((u) => u.id === user.id);
        if (rankIndex !== -1) {
          setUserRank(`#${rankIndex + 1}`);
        } else {
          // Fetch exact rank count if outside top 10
          const { count } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .gt("xp", activeProfile.xp || 0);

          setUserRank(count !== null ? `#${count + 1}` : "-");
        }
      }

    } catch (err) {
      console.error("Dashboard processing error:", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time Event Listener for XpWheel update
  useEffect(() => {
    const handleXpUpdated = (e: CustomEvent<number>) => {
      setProfile((prev) => (prev ? { ...prev, xp: e.detail } : prev));
    };

    window.addEventListener("xpUpdated", handleXpUpdated as EventListener);
    return () => {
      window.removeEventListener("xpUpdated", handleXpUpdated as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!profile?.id) return;

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
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [profile?.id, fetchDashboardData]);

  if (loading) {
    return <LoadingScreen />;
  }

  const userXp = Number(profile?.xp) || 0;
  const userStreak = Number(profile?.streak) || 0;
  const rawUserName = profile?.name || profile?.username || "Artist";
  const userName = rawUserName.replace(/<[^>]*>?/gm, "").trim();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", active: true, icon: LayoutDashboard },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight pb-20 md:pb-0 font-sans overflow-x-hidden">
      
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

        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200/80 px-3 py-1 rounded-full text-orange-600 font-extrabold text-xs">
          <Flame className="w-4 h-4 fill-orange-500 stroke-orange-500" />
          <span>{userStreak}</span>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
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

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Image
                src={profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
                alt="User Avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover bg-blue-100"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-black text-[#0F172A] truncate">{userName}</p>
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
              className="h-16 sm:h-20 w-auto object-contain"
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
            <p className="text-sm font-black text-[#0F172A] truncate">{userName}</p>
            <p className="text-xs font-bold text-blue-600">Level {Math.floor(userXp / 100) + 1}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto w-full">
        
        {/* Welcome Section */}
        <div className="relative pt-6 pb-0 px-4 sm:px-6 flex items-end justify-between min-h-[140px] bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden">
          <div className="z-10 pb-6 max-w-xs sm:max-w-md">
            <h1 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              Welcome back, {userName}!
            </h1>
            <p className="text-sm font-bold text-slate-500 mt-1">
              Ready to improve your drawing today?
            </p>
          </div>

          <div className="z-20 flex items-end shrink-0 -mb-1">
            <Image
              src={mascotUrl}
              alt="Otter Mascot"
              width={144}
              height={144}
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain block align-bottom"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 sm:pt-0">
          <div className="bg-amber-50/50 p-5 rounded-[2rem] border border-amber-200/60 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-white flex items-center justify-center border-b-4 border-amber-600 shrink-0">
              <Star className="w-9 h-9 fill-white stroke-amber-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total XP</p>
              <h3 className="text-2xl font-black text-[#0F172A]">{userXp.toLocaleString()} XP</h3>
            </div>
          </div>

          <div className="bg-orange-50/50 p-5 rounded-[2rem] border border-orange-200/60 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center border-b-4 border-orange-700 shrink-0">
              <Flame className="w-10 h-10 fill-white stroke-orange-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Current Streak</p>
              <h3 className="text-2xl font-black text-[#0F172A]">{userStreak} Days</h3>
            </div>
          </div>

          <div className="bg-blue-50/50 p-5 rounded-[2rem] border border-blue-200/60 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center border-b-4 border-blue-800 shrink-0">
              <Trophy className="w-9 h-9 fill-white stroke-blue-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Your Rank</p>
              <h3 className="text-2xl font-black text-[#0F172A]">{userRank}</h3>
            </div>
          </div>
        </div>

        {/* Daily XP Wheel Section */}
        <section className="w-full overflow-hidden min-w-0">
          <XpWheel />
        </section>

        {/* AI Scan Card */}
        <div className="bg-[#2563EB] text-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 max-w-lg z-10">
            <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              AI Drawing Assistant
            </span>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              Scan & Analyze Your Artwork
            </h2>
            <p className="text-sm font-black text-blue-100">
              Upload your drawing to get instant AI-powered feedback, score, and tips to improve!
            </p>
            <div>
              <Link
                href="/scan"
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

        {/* Recent Achievements */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-[#0F172A]">Recent Achievements</h3>
            <Link href="/achievements" className="text-xs font-black text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {recentAchievements.length === 0 ? (
            <p className="text-xs font-black text-slate-400 py-4 text-center">
              No achievements unlocked yet. Scan your drawings and complete activities to unlock badges!
            </p>
          ) : (
            <div className="space-y-3">
              {recentAchievements.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-[#0F172A]">{item.title}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600">+{item.xp_reward} XP</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-200 shadow-lg">
        <div className="mx-auto flex w-full items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {[
            { name: "Home", path: "/dashboard", active: true, icon: LayoutDashboard },
            { name: "Challenges", path: "/challenges", icon: Swords },
            { name: "Grid", path: "/grid-maker", icon: Grid },
            { name: "Scan", path: "/scan", icon: Scan },
            { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
          ].map((item) => {
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

    </div>
  );
}