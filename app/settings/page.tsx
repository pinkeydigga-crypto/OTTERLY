"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Trophy, Flame, Shield, Lock, 
  LogOut, ChevronRight, Zap, Star, Target, KeyRound, AlertCircle, X
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

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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

  // Rate Limiting State (Throttling: Exactly 1 attempt per 10 minutes)
  const [lastPasswordChangeTime, setLastPasswordChangeTime] = useState<number | null>(null);

  useEffect(() => {
    // Persistent rate-limit check via localStorage
    const savedTime = localStorage.getItem("last_password_change_time");
    if (savedTime) {
      setLastPasswordChangeTime(Number(savedTime));
    }
  }, []);

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

  // DIRECT SUPABASE AUTH PASSWORD UPDATE WITH 10-MINUTE THROTTLING RATE LIMITING
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: "" });

    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const now = Date.now();

    if (lastPasswordChangeTime && now - lastPasswordChangeTime < TEN_MINUTES_MS) {
      const remainingMs = TEN_MINUTES_MS - (now - lastPasswordChangeTime);
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

      setPasswordStatus({ 
        type: "error", 
        message: `Aap 10 minute me sirf 1 baar password change kar sakte hain. Kripya ${remainingMinutes} minute baad dobara try karein.` 
      });
      return;
    }

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
        const currentTime = Date.now();
        setLastPasswordChangeTime(currentTime);
        localStorage.setItem("last_password_change_time", currentTime.toString());

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

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F6FAFF] flex flex-col tracking-tight font-sans">

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">

        {/* Top Header - Sirf Dashboard Button */}
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

            {/* OVERALL PROGRESS & STATS (Only XP & Score) */}
            <div className="space-y-3">
              <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Overall Progress & Stats</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
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

    </div>
  );
}