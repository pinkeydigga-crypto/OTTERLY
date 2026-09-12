"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  UserCheck,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "1. Security & Overview", icon: ShieldCheck },
    { id: "data-collection", title: "2. Data We Collect", icon: Database },
    { id: "data-usage", title: "3. How We Use Data", icon: Eye },
    { id: "user-rights", title: "4. Your Rights & Control", icon: UserCheck },
    { id: "deletion", title: "5. Account & Data Deletion", icon: Trash2 },
    { id: "contact", title: "6. Contact Us", icon: Mail },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF] text-[#0F172A] font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-black text-slate-600 hover:text-blue-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </Link>

        {/* SECURED BADGE */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-emerald-700 font-extrabold text-xs shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Encrypted & Secured</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
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

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Quick Navigation */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm space-y-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider px-3 mb-2">
                Table of Contents
              </p>
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isSelected = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{sec.title}</span>
                    </div>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Detailed Content Cards */}
          <div className="lg:col-span-3 space-y-8">
            {/* Section 1: Overview */}
            <section
              id="overview"
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4"
            >
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
                    <h4 className="text-xs font-black text-emerald-900 uppercase">Protected Records</h4>
                    <p className="text-xs font-bold text-emerald-700">Strict Database Security Active</p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-blue-900 uppercase">Zero Data Monetization</h4>
                    <p className="text-xs font-bold text-blue-700">We never sell your data to third parties</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Data We Collect */}
            <section
              id="data-collection"
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4"
            >
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
                <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                  <span>
                    <strong className="text-[#0F172A]">Scanner Data:</strong> Uploaded image inputs processed securely through temporary AI processing pipelines.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 3: Data Usage */}
            <section
              id="data-usage"
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 text-blue-600">
                <Eye className="w-7 h-7" />
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                  3. How We Use Your Data
                </h2>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Your information is used strictly for the operational purposes listed below:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="text-xs font-black text-[#0F172A]">Personalized Experience</h4>
                  <p className="text-xs font-bold text-slate-500">
                    Tracking Level status, XP progression, and daily streaks to present your interactive dashboard.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="text-xs font-black text-[#0F172A]">Public Leaderboard</h4>
                  <p className="text-xs font-bold text-slate-500">
                    Displaying public usernames and avatar selections across global rankings.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: User Rights */}
            <section
              id="user-rights"
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 text-blue-600">
                <UserCheck className="w-7 h-7" />
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                  4. Your Rights & Data Control
                </h2>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                You maintain complete ownership of your personal profile data:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm font-bold text-slate-600 space-y-2">
                <li>Update profile details (Name, Username, Avatar) anytime within your account profile page.</li>
                <li>Review all recorded activity data in real-time.</li>
                <li>Initiate a permanent account deletion directly from the Profile Settings menu.</li>
              </ul>
            </section>

            {/* Section 5: Account Deletion */}
            <section
              id="deletion"
              className="bg-red-50/60 rounded-[2.5rem] p-6 sm:p-8 border-2 border-red-200 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600">
                <Trash2 className="w-7 h-7" />
                <h2 className="text-xl sm:text-2xl font-black text-red-950">
                  5. Permanent Account & Data Deletion
                </h2>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-red-900 leading-relaxed">
                If you wish to terminate your account, access the <strong>"Danger Zone"</strong> in Profile Settings and select <strong>"DELETE MY ACCOUNT"</strong>.
              </p>
              <div className="p-4 bg-white rounded-2xl border border-red-200 text-xs font-bold text-slate-600 space-y-1">
                <strong className="text-red-600 font-black">Deletion Guarantee:</strong>
                <p>
                  Upon confirmation, all database records including profile details, XP history, streak milestones, and auth sessions are permanently erased.
                </p>
              </div>
            </section>

            {/* Section 6: Contact Us */}
            <section
              id="contact"
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 text-blue-600">
                <Mail className="w-7 h-7" />
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                  6. Contact Us
                </h2>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                If you have any questions, privacy concerns, or security inquiries, please reach out directly:
              </p>
              
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
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs font-bold text-slate-400">
        <p>© 2026 Otterleo App. All Rights Reserved. Fully Secured.</p>
      </footer>
    </div>
  );
}