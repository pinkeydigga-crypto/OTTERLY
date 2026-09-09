"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  ArrowLeft, PanelLeft, X, LayoutDashboard,
  Swords, Scan, Trophy, Compass, Award, User, Settings,
  Flame, Star, Target, Image as ImageIcon, BarChart3, CheckCircle2, Lock, Loader2, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  requiredChallenges?: number;
  requiredScans?: number;
  requiredStreak?: number;
  icon: any;
  badgeBg: string;
  iconColor: string;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "3_day_streak",
    title: "3 Day Streak",
    description: "Maintain a 3 day streak",
    xp: 30,
    requiredStreak: 3,
    icon: Flame,
    badgeBg: "bg-orange-50 border-orange-100",
    iconColor: "text-orange-500",
  },
  {
    id: "quick_learner",
    title: "Quick Learner",
    description: "Complete 3 challenges",
    xp: 50,
    requiredChallenges: 3,
    icon: Star,
    badgeBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-500",
  },
  {
    id: "challenge_master",
    title: "Challenge Master",
    description: "Complete 10 challenges",
    xp: 100,
    requiredChallenges: 10,
    icon: Target,
    badgeBg: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-500",
  },
  {
    id: "detail_detective",
    title: "Detail Detective",
    description: "Get AI feedback on 20 drawings",
    xp: 75,
    requiredScans: 20,
    icon: ImageIcon,
    badgeBg: "bg-purple-50 border-purple-100",
    iconColor: "text-purple-500",
  },
  {
    id: "streak_legend",
    title: "Streak Legend",
    description: "Maintain a 7 day streak",
    xp: 100,
    requiredStreak: 7,
    icon: Trophy,
    badgeBg: "bg-sky-50 border-sky-100",
    iconColor: "text-sky-500",
  },
];

export default function AchievementsPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Initial state zero to prevent SSR/Hydration mismatch
  const [userXp, setUserXp] = useState<number>(0);

  const [scansCount, setScansCount] = useState<number>(0);
  const [challengesCount, setChallengesCount] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>([]);
  
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otterly%20logo%20(1).png";
  const mascotImageUrl = "https://cdn.corenexis.com/f/7D52w5tSzT5.png";

  // Load cached XP after mount on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("user_xp_cache");
      if (cached) {
        setUserXp(Number(cached));
      }
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (!user) return;

      // 1. Fetch via RPC
      const { data: rpcStats } = await supabase.rpc('get_user_activity_counts', {
        p_user_id: user.id
      });

      // 2. Direct Query explicitly on SCANS table
      const [
        { count: directScansTableCount },
        { count: directSketchesTableCount },
        { count: challengesData },
        { data: profile }
      ] = await Promise.all([
        supabase.from("scans").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("sketches").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("user_completed_challenges").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      ]);

      // Calculate total scans prioritizing scans table
      const totalScansDetected = Math.max(
        directScansTableCount || 0,
        rpcStats?.scans_count || 0,
        directSketchesTableCount || 0,
        profile?.scans_count || 0
      );

      const totalChallenges = Math.max(
        rpcStats?.challenges_count || 0,
        challengesData || 0,
        profile?.completed_challenges_count || 0
      );

      const totalStreak = Math.max(
        rpcStats?.streak_count || 0,
        profile?.streak_count || 0,
        profile?.current_streak || 0
      );

      const liveXp = profile?.xp ?? 0;

      setUserXp(liveXp);
      localStorage.setItem("user_xp_cache", liveXp.toString());

      setScansCount(totalScansDetected);
      setChallengesCount(totalChallenges);
      setStreakCount(totalStreak);

      // Fetch claimed list
      const { data: claimed } = await supabase
        .from("user_completed_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      if (claimed) {
        setClaimedAchievements(claimed.map((a) => a.achievement_id));
      }
    } catch (err) {
      console.error("Error fetching achievement stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchUserData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUserData();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchUserData);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchUserData);
    };
  }, [fetchUserData]);

  const checkIsEligible = (ach: Achievement) => {
    if (ach.requiredScans !== undefined && scansCount >= ach.requiredScans) return true;
    if (ach.requiredChallenges !== undefined && challengesCount >= ach.requiredChallenges) return true;
    if (ach.requiredStreak !== undefined && streakCount >= ach.requiredStreak) return true;
    return false;
  };

  const handleClaimAchievement = async (achievement: Achievement) => {
    if (!checkIsEligible(achievement) || claimedAchievements.includes(achievement.id)) return;

    setClaimingId(achievement.id);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: updatedXp } = await supabase.rpc('increment_user_xp', {
        user_id_param: user.id,
        xp_to_add: achievement.xp
      });

      const newTotalXp = Number(updatedXp !== null && updatedXp !== undefined ? updatedXp : (userXp + achievement.xp));

      await supabase.from("user_completed_achievements").upsert(
        { user_id: user.id, achievement_id: achievement.id },
        { onConflict: 'user_id,achievement_id' }
      );

      setUserXp(newTotalXp);
      localStorage.setItem("user_xp_cache", newTotalXp.toString());
      setClaimedAchievements((prev) => Array.from(new Set([...prev, achievement.id])));
    } catch (err: any) {
      console.error("Claim Exception:", err);
    } finally {
      setClaimingId(null);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Achievements", path: "/achievements", active: true, icon: Award },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const totalAchievements = ALL_ACHIEVEMENTS.length;
  const unlockedCount = claimedAchievements.length;
  const progressPercentage = Math.round((unlockedCount / totalAchievements) * 100);

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight font-sans pb-20 md:pb-0">
      
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          
          <img src={logoUrl} alt="Otterly Logo" className="h-14 w-auto object-contain max-h-16" />
        </div>

        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-full text-amber-600 font-black text-xs">
          <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
          <span>{userXp} XP</span>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <img src={logoUrl} alt="Otterly Logo" className="h-14 w-auto object-contain" />
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
            <img src={logoUrl} alt="Otterly Logo" className="h-16 sm:h-20 w-auto object-contain" />
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
      <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto">
        
        {/* Top Header Navigation & XP */}
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            Back to Dashboard
          </Link>
          
          <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-4 py-1.5 rounded-full text-amber-600 font-black text-xs">
            <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
            <span>{userXp} XP</span>
          </div>
        </div>

        {/* Hero Mascot Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-row items-center justify-between relative overflow-hidden">
          <div className="space-y-2 z-10 max-w-sm sm:max-w-md">
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A]">Achievements</h1>
            <p className="text-sm font-bold text-slate-500">
              Your hard work deserves recognition! Complete tasks to claim rewards.
            </p>
          </div>

          <div className="w-36 sm:w-48 h-auto shrink-0 z-10 -mr-2">
            <img 
              src={mascotImageUrl} 
              alt="Otterly Mascot" 
              className="w-full h-auto object-contain block"
            />
          </div>
        </div>

        {/* Dynamic Progress Card */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <BarChart3 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#0F172A]">Achievement Progress</h2>
            </div>
          </div>

          <p className="text-sm font-extrabold text-slate-600">
            <span className="text-blue-600 font-black text-base">{unlockedCount}</span> / {totalAchievements} Achievements Unlocked
          </p>

          <div className="flex items-center gap-4">
            <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="bg-[#2563EB] h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-black text-slate-500 shrink-0">{progressPercentage}%</span>
          </div>
        </div>

        {/* Achievements Cards Grid */}
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-[#0F172A]">Recent Achievements</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {ALL_ACHIEVEMENTS.map((item) => {
              const IconComponent = item.icon;
              const isClaimed = claimedAchievements.includes(item.id);
              const isEligible = checkIsEligible(item);
              const isClaimingThis = claimingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white p-6 rounded-[2rem] border-2 shadow-sm flex flex-col items-center text-center space-y-3 relative transition-all ${
                    isClaimed
                      ? "border-emerald-200 bg-emerald-50/20"
                      : isEligible
                      ? "border-amber-200 bg-amber-50/10"
                      : "border-slate-100 opacity-60 bg-slate-50/50"
                  }`}
                >
                  <div className="absolute top-4 right-4">
                    {isClaimed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : isEligible ? (
                      <Star className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div className={`w-20 h-20 rounded-3xl ${isEligible || isClaimed ? item.badgeBg : "bg-slate-100 border-slate-200"} border-2 flex items-center justify-center transform rotate-45 my-2 shadow-sm`}>
                    <div className="transform -rotate-45">
                      <IconComponent className={`w-9 h-9 ${isEligible || isClaimed ? item.iconColor : "text-slate-400"} stroke-[2.2]`} />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <h3 className="text-base font-black text-[#0F172A]">{item.title}</h3>
                    <p className="text-xs font-bold text-slate-400 max-w-[180px] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-1 flex items-center gap-1.5 text-amber-500 font-black text-xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>+{item.xp} XP</span>
                  </div>

                  <div className="w-full pt-2">
                    {isClaimed ? (
                      <span className="w-full py-2 rounded-xl text-xs font-black text-emerald-600 bg-emerald-100/60 inline-flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Claimed
                      </span>
                    ) : isEligible ? (
                      <button
                        onClick={() => handleClaimAchievement(item)}
                        disabled={isClaimingThis}
                        className="w-full py-2.5 rounded-xl font-black text-xs bg-[#2563EB] hover:bg-blue-600 text-white border-b-2 border-blue-800 transition flex items-center justify-center gap-1 shadow-xs disabled:opacity-70"
                      >
                        {isClaimingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Claim {item.xp} XP</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2 rounded-xl font-extrabold text-[11px] bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex justify-around items-center z-40 shadow-lg">
        {[
          { name: "Home", path: "/dashboard", icon: LayoutDashboard },
          { name: "Scan", path: "/scan", icon: Scan },
          { name: "Challenges", path: "/challenges", icon: Swords },
          { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
          { name: "Achievements", path: "/achievements", active: true, icon: Award },
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
    </div>
  );
}