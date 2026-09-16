"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  ArrowLeft, LayoutDashboard, Swords, Scan, Trophy, Compass, 
  Award, User, Settings, Flame, PanelLeft, X, Shield, Lock, 
  LogOut, ChevronRight, Zap, Star, Target, Eye, KeyRound, AlertCircle,
  Palette, LucideIcon
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserStats {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  scans_count: number;
  challenges_completed: number;
  xp_points: number;
  total_score: number;
  streak: number;
}

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  active?: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  
  // Direct Password Update Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // User Stats State
  const [userStats, setUserStats] = useState<UserStats>({
    id: "",
    email: "",
    full_name: "Artist",
    avatar_url: "",
    scans_count: 0,
    challenges_completed: 0,
    xp_points: 0,
    total_score: 0,
    streak: 0,
  });

  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Strict Auth Check to prevent unauthorized access
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        localStorage.clear();
        router.replace("/login");
        return;
      }

      // 2. Fetch authenticated user's specific profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        localStorage.clear();
        router.replace("/login");
        return;
      }

      // Fallback: Check user_challenges table if completed count is 0
      let completedChallengesCount = profile?.challenges_completed ?? profile?.completed_challenges ?? profile?.challenges_count ?? 0;

      if (!completedChallengesCount) {
        const { count } = await supabase
          .from("user_challenges")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", user.id)
          .eq("status", "completed");

        if (count !== null && count > 0) {
          completedChallengesCount = count;
        }
      }

      const scans = profile?.scans_count ?? profile?.scans ?? 0;
      const xp = profile?.xp_points ?? profile?.xp ?? 0;
      const streak = profile?.streak ?? profile?.current_streak ?? 0;
      const score = profile?.total_score ?? (scans * 10 + completedChallengesCount * 50 + xp);

      setUserStats({
        id: user.id,
        email: user.email || "",
        full_name: profile?.name || profile?.full_name || "Artist Learner",
        avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
        scans_count: Number(scans),
        challenges_completed: Number(completedChallengesCount),
        xp_points: Number(xp),
        total_score: Number(score),
        streak: Number(streak),
      });

    } catch (err) {
      console.error("Security check or settings fetch failed:", err);
      localStorage.clear();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.replace("/login");
  };

  // DIRECT SUPABASE AUTH PASSWORD UPDATE
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: "" });

    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "Naya password kam se kam 6 characters ka hona chahiye." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "Dono naye password match nahi ho rahe hain." });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordStatus({ type: "error", message: error.message });
      } else {
        setPasswordStatus({ 
          type: "success", 
          message: "Password successfully update ho gaya hai!" 
        });
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setIsPasswordModalOpen(false), 1500);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Kuch error aaya password update karne me.";
      setPasswordStatus({ type: "error", message: errorMessage });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Exact Navigation Items Structure Syncing
  const desktopNavItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", active: true, icon: Settings },
  ];

  const mobileNavItems: NavItem[] = [
    { name: "Home", path: "/dashboard", icon: LayoutDashboard },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Profile", path: "/profile", icon: User },
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
          <img src={logoUrl} alt="Otterleo Logo" className="h-9 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200/80 px-3 py-1 rounded-full text-orange-600 font-extrabold text-xs">
          <Flame className="w-4 h-4 fill-orange-500 stroke-orange-500" />
          <span>{userStats.streak}</span>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <img src={logoUrl} alt="Otterleo Logo" className="h-9 w-auto object-contain" />
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1.5">
                {desktopNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.active || pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                        isActive 
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

            {/* Mobile Sidebar Bottom Profile Card */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <img
                src={userStats.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
                alt="User Avatar"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-blue-50"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-[#0F172A] truncate">{userStats.full_name || "Artist"}</p>
                <p className="text-[10px] font-bold text-slate-400">{userStats.xp_points} XP</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          <img src={logoUrl} alt="Otterleo Logo" className="h-12 w-auto object-contain" />
          <nav className="space-y-1.5">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.active || pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                    isActive 
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

        {/* Desktop Bottom Profile Card */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          <img
            src={userStats.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
            alt="User Avatar"
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-blue-50"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-[#0F172A] truncate">{userStats.full_name || "Artist"}</p>
            <p className="text-[10px] font-bold text-slate-400">{userStats.xp_points} XP</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">

        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-black text-xs sm:text-sm hover:bg-slate-50 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Dashboard</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Settings</h1>
        </div>

        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center bg-white rounded-[2.5rem] border-2 border-slate-100 p-8">
            <div className="font-black text-blue-600 animate-pulse">Loading settings...</div>
          </div>
        ) : (
          <>
            {/* User Profile Header */}
            <div className="bg-white rounded-[2.5rem] p-5 sm:p-6 border-2 border-slate-100 shadow-xs flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <img
                src={userStats.avatar_url}
                alt={userStats.full_name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-200 bg-blue-50 shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <h2 className="text-xl font-black text-slate-900 truncate">{userStats.full_name}</h2>
                <p className="text-xs font-extrabold text-slate-400">{userStats.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-black text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                    <Flame className="w-3.5 h-3.5 fill-orange-500 stroke-none" /> {userStats.streak} Day Streak
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    <Star className="w-3.5 h-3.5 fill-blue-600 stroke-none" /> Artist Level
                  </span>
                </div>
              </div>
            </div>

            {/* PROGRESS & STATS GRID */}
            <div className="space-y-3">
              <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Overall Progress & Stats</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-xs space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Eye className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Scans</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">{userStats.scans_count}</p>
                </div>

                <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-xs space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
                    <Swords className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Challenges</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">{userStats.challenges_completed}</p>
                </div>

                <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-xs space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4 fill-amber-500" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total XP</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">{userStats.xp_points} XP</p>
                </div>

                <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-xs space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Score</p>
                  <p className="text-xl sm:text-2xl font-black text-[#2563EB]">{userStats.total_score}</p>
                </div>
              </div>
            </div>

            {/* ACCOUNT SECURITY & LOGOUT */}
            <div className="space-y-3">
              <h3 className="font-black text-slate-900 text-base sm:text-lg">Account & Security</h3>

              <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-2 sm:p-4 divide-y divide-slate-100">

                {/* CHANGE PASSWORD BUTTON */}
                <button
                  onClick={() => {
                    setPasswordStatus({ type: null, message: "" });
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-all rounded-2xl cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-900">Security & Password</p>
                      <p className="text-xs font-bold text-slate-400">Update account password</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                {/* RED PILL LOGOUT BUTTON */}
                <div className="p-4 flex justify-center">
                  <button
                    onClick={handleLogout}
                    className="w-full sm:w-auto px-10 py-3.5 bg-[#E50914] hover:bg-red-700 text-white rounded-full font-black text-sm tracking-wider uppercase border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 stroke-[3]" />
                    <span>LOGOUT ACCOUNT</span>
                  </button>
                </div>

              </div>
            </div>

            {/* FOOTER */}
            <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <p className="text-xs font-bold text-slate-400">
                © {new Date().getFullYear()} Otterleo Art App. All rights reserved.
              </p>

              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-blue-600 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Privacy Policy</span>
              </button>
            </footer>
          </>
        )}
      </main>

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 shadow-2xl relative border-2 border-slate-100 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-lg text-slate-900">Set New Password</h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordStatus.message && (
              <div
                className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-black ${
                  passwordStatus.type === "error"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-green-50 text-green-600 border border-green-200"
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordStatus.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 text-sm font-bold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 text-sm font-bold focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-black text-xs rounded-2xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 py-3 bg-[#2563eb] text-white font-black text-xs rounded-2xl hover:bg-blue-600 disabled:opacity-50"
                >
                  {isUpdatingPassword ? "Updating..." : "Save Password"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* PRIVACY POLICY MODAL */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 shadow-2xl relative border-2 border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-lg text-slate-900">Privacy Policy</h3>
              </div>
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-slate-600 font-bold leading-relaxed pr-1">
              <p>Your privacy is important to us. This Privacy Policy explains how our application collects, uses, and safeguards your personal information and drawing submissions.</p>
              <h4 className="font-black text-slate-900 text-sm">1. Data We Collect</h4>
              <p>We collect profile information and drawing scan submissions to calculate your XP, streaks, total scores, and leaderboard standings.</p>
              <h4 className="font-black text-slate-900 text-sm">2. How We Use Data</h4>
              <p>Your data is solely used to deliver personalized drawing feedback and maintain leaderboard rankings.</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="w-full py-3 bg-[#2563eb] text-white font-black text-sm rounded-2xl hover:bg-blue-600"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-2 flex justify-around items-center z-40 shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-xs font-black ${
                isActive ? "text-[#2563EB]" : "text-slate-400"
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