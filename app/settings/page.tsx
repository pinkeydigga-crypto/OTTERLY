"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Shield, Lock, LogOut, ChevronRight, KeyRound, AlertCircle, X, CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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

  // Rate Limiting State (Throttling: 20 seconds live countdown)
  const [cooldown, setCooldown] = useState<number>(0);

  // Live Timer Effect for 20-second Throttling
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auth Check (No profile/stats DB query -> High performance & Minimal egress)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            if (typeof window !== "undefined" && navigator.onLine) {
              localStorage.clear();
              router.replace("/login");
            }
            return;
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    router.replace("/login");
  };

  // PASSWORD CHANGE WITH 20-SECOND THROTTLING & MATCH CONFIRMATION
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: "" });

    if (cooldown > 0) {
      setPasswordStatus({ 
        type: "error", 
        message: `Kripya ${cooldown} seconds wait karein dobara change karne ke liye.` 
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "Naya password kam se kam 6 characters ka hona chahiye." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "Naya password aur confirm password match nahi ho rahe hain." });
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
        setCooldown(20);
        setPasswordStatus({ 
          type: "success", 
          message: "Password successfully update ho gaya hai!" 
        });
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setIsPasswordModalOpen(false), 2000);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Password update karne me error aaya.";
      setPasswordStatus({ type: "error", message: errorMessage });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F6FAFF] flex flex-col tracking-tight font-sans">

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full space-y-6 overflow-y-auto">

        {/* Top Header */}
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
          <div className="min-h-[200px] flex items-center justify-center bg-white rounded-[2.5rem] border-2 border-slate-100 p-8">
            <div className="font-black text-blue-600 animate-pulse">Loading settings...</div>
          </div>
        ) : (
          <>
            {/* ACCOUNT SECURITY & LOGOUT */}
            <div className="space-y-3 pt-4">
              <h3 className="font-black text-slate-900 text-base sm:text-lg">Account & Security</h3>

              <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-2 sm:p-4 divide-y divide-slate-100 shadow-sm">

                {/* CHANGE PASSWORD BUTTON */}
                <button
                  onClick={() => {
                    setPasswordStatus({ type: null, message: "" });
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all rounded-2xl cursor-pointer text-left"
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
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
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
                {passwordStatus.type === "error" ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                )}
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
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-black text-xs rounded-2xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword || cooldown > 0}
                  className="flex-1 py-3 bg-[#2563eb] text-white font-black text-xs rounded-2xl hover:bg-blue-600 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingPassword 
                    ? "Updating..." 
                    : cooldown > 0 
                      ? `Wait ${cooldown}s` 
                      : "Save Password"}
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
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-slate-600 font-bold leading-relaxed pr-1">
              <p>Your privacy is important to us. This Privacy Policy explains how our application collects, uses, and safeguards your personal information and drawing submissions.</p>
              <h4 className="font-black text-slate-900 text-sm">1. Data We Collect</h4>
              <p>We collect basic account credentials and drawing scan submissions to calculate your XP, streaks, and account activity.</p>
              <h4 className="font-black text-slate-900 text-sm">2. How We Use Data</h4>
              <p>Your data is solely used to deliver personalized drawing feedback and manage your account features.</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="w-full py-3 bg-[#2563eb] text-white font-black text-sm rounded-2xl hover:bg-blue-600 cursor-pointer"
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