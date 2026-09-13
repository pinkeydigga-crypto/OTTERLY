// app/privacy/page.tsx
import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  UserCheck,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-static";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F6FAFF] text-[#0F172A] font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-black text-slate-600 hover:text-blue-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* SECURED BADGE */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-emerald-700 font-extrabold text-xs shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted & Secured</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Title Banner */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-black text-xs uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Official Privacy Policy
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
            Your Privacy & Security First
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-500 max-w-2xl mx-auto leading-relaxed">
            We prioritize the privacy and security of your personal data. Read below to learn how we collect, process, and safeguard your information.
          </p>
          <p className="text-xs font-bold text-slate-400">
            Last Updated: September 2026 • Version 2.5 (Secured)
          </p>
        </div>

        {/* Sections List */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <ShieldCheck className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                1. Security & Commitment Overview
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              Your trust is our highest priority. We maintain absolute transparency regarding how we collect, store, and protect your data under strict security standards.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-black text-emerald-900 uppercase">Protected Records</h3>
                  <p className="text-xs font-bold text-emerald-700">Strict Database Security Active</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-black text-blue-900 uppercase">Zero Data Monetization</h3>
                  <p className="text-xs font-bold text-blue-700">We never sell your data to third parties</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Database className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                2. Data We Collect
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              To provide smooth application functionality, we collect minimal user details:
            </p>
            <ul className="space-y-3 text-xs sm:text-sm font-bold text-slate-600">
              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  <strong className="text-[#0F172A]">Account Information:</strong> Full Name, Username, and Email Address for authentication.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  <strong className="text-[#0F172A]">Progress & Activity:</strong> XP points, Streaks, Challenges activity, and Leaderboard performance.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Eye className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                3. How We Use Your Data
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              Your information is used strictly for operational purposes like tracking Level status, XP progression, daily streaks, and displaying global leaderboards.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <UserCheck className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                4. Your Rights & Data Control
              </h2>
            </div>
            <ul className="list-disc list-inside text-xs sm:text-sm font-bold text-slate-600 space-y-2">
              <li>Update profile details (Name, Username, Avatar) anytime.</li>
              <li>Review all recorded activity data in real-time.</li>
              <li>Initiate permanent account deletion directly from Profile Settings.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-red-50/60 rounded-[2.5rem] p-6 sm:p-8 border-2 border-red-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-red-950">
                5. Permanent Account & Data Deletion
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-red-900 leading-relaxed">
              Access the <strong>"Danger Zone"</strong> in Profile Settings and select <strong>"DELETE MY ACCOUNT"</strong> to erase all profile details, XP history, and auth sessions permanently.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Mail className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                6. Contact Us
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-slate-400 uppercase">Support Email</p>
                  <a href="mailto:pinkeydigga026@gmail.com" className="text-xs sm:text-sm font-black text-blue-600 truncate block hover:underline">
                    pinkeydigga026@gmail.com
                  </a>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">Contact Number</p>
                  <a href="tel:9991257182" className="text-xs sm:text-sm font-black text-slate-800 hover:text-blue-600">
                    +91 9991257182
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs font-bold text-slate-400">
        <p>© 2026 Otterleo App. All Rights Reserved. Fully Secured.</p>
      </footer>
    </div>
  );
}