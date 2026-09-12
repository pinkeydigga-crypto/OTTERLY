"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/components/LoadingScreen";
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
  ChevronRight
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

interface Challenge {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  image_url: string;
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
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayChallenge, setTodayChallenge] = useState<Challenge | null>(null);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | string>("-");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
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

      // 2. Safe Fetch Profile Data
      const { data: profileData, error: profError } = await supabase
        .from("profiles")
        .select("id, name, username, email, avatar_url, xp, streak, last_login")
        .eq("id", user.id)
        .single();

      if (profError) {
        console.error("Dashboard profile fetch exception occurred.");
      }

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
            .single();

          setProfile(updatedProfile || { ...profileData, streak: newStreak, last_login: todayStr });
        } else {
          setProfile(profileData);
        }
      }

      // 3. Fetch Today's Challenge Safely
      const { data: challengeData } = await supabase
        .from("challenges")
        .select("id, title, description, xp_reward, image_url")
        .limit(1)
        .maybeSingle();

      if (challengeData) {
        setTodayChallenge(challengeData);

        const { data: userChall } = await supabase
          .from("user_completed_challenges")
          .select("id")
          .eq("user_id", user.id)
          .eq("challenge_id", challengeData.id)
          .maybeSingle();

        if (userChall) {
          setIsChallengeCompleted(true);
        }
      }

      // 4. Secure & Dynamic Achievements Retrieval
      const { data: userAchData, error: achError } = await supabase
        .from("user_completed_achievements")
        .select("id, achievement_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!achError && userAchData && userAchData.length > 0) {
        const { data: allAchievements } = await supabase
          .from("achievements")
          .select("id, title, xp_reward");

        const formatted = userAchData.map((item) => {
          const achKey = String(item.achievement_id || "").toLowerCase().trim();
          
          const detail = allAchievements?.find((a) => {
            const dbId = String(a.id || "").toLowerCase().trim();
            const dbTitleKey = String(a.title || "").toLowerCase().replace(/\s+/g, "_").trim();
            return dbId === achKey || dbTitleKey === achKey;
          });

          return {
            id: item.id,
            title: detail?.title || item.achievement_id.replace(/_/g, " ").toUpperCase(),
            xp_reward: detail?.xp_reward !== undefined ? detail.xp_reward : 50,
          };
        });

        setRecentAchievements(formatted);
      } else {
        setRecentAchievements([]);
      }

      // 5. Sanitized Leaderboard Retrieval
      const { data: profiles, error: leadError } = await supabase
        .from("profiles")
        .select("id, name, username, xp, streak, avatar_url");

      if (!leadError && profiles) {
        let mapped = profiles.map((p: any) => {
          const totalXP = Number(p.xp ?? 0);
          const userStreak = Number(p.streak ?? 0);
          const rawName = p.name || p.username || "Artist";
          const cleanName = rawName.replace(/<[^>]*>?/gm, "").trim();

          return {
            id: p.id,
            name: cleanName,
            xp: totalXP,
            streak: userStreak,
            avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.id}`,
          };
        });

        mapped.sort((a, b) => {
          if (b.xp !== a.xp) {
            return b.xp - a.xp;
          }
          return b.streak - a.streak;
        });

        setLeaderboard(mapped.slice(0, 3));

        const rankIndex = mapped.findIndex((u) => u.id === user.id);
        if (rankIndex !== -1) {
          setUserRank(`#${rankIndex + 1}`);
        } else {
          setUserRank("-");
        }
      }

    } catch (err) {
      console.error("Dashboard error occurred while processing request.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!profile?.id) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = () => {
      try {
        if (channel) supabase.removeChannel(channel);

        channel = supabase
          .channel(`dashboard_realtime_${profile.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${profile.id}`,
            },
            () => {
              fetchDashboardData();
            }
          )
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "user_completed_achievements",
              filter: `user_id=eq.${profile.id}`,
            },
            () => {
              fetchDashboardData();
            }
          )
          .subscribe();
      } catch (e) {
        console.error("Subscription sync failure.");
      }
    };

    setupRealtime();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (channel) supabase.removeChannel(channel);
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
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight pb-20 md:pb-0 font-sans">
      
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
          
          <img
            src={logoUrl}
            alt="Otterleo Logo"
            className="h-14 w-auto object-contain max-h-16"
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
                <img
                  src={logoUrl}
                  alt="Otterleo Logo"
                  className="h-14 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
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

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <img
                src={profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
                alt="User Avatar"
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
            <img
              src={logoUrl}
              alt="Otterleo Logo"
              className="h-16 sm:h-20 w-auto object-contain"
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
          <img
            src={profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
            alt="User Avatar"
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
            <img
              src={mascotUrl}
              alt="Otter Mascot"
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex justify-around items-center z-40 shadow-lg">
        {[
          { name: "Home", path: "/dashboard", active: true, icon: LayoutDashboard },
          { name: "Scan", path: "/scan", icon: Scan },
          { name: "Challenges", path: "/challenges", icon: Swords },
          { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
          { name: "Profile", path: "/profile", icon: User },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-black ${
                item.active ? "text-[#2563EB]" : "text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}