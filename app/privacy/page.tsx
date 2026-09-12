"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  UserCheck,
  KeyRound,
  FileText,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "1. Security & Overview", icon: ShieldCheck },
    { id: "data-collection", title: "2. Data We Collect", icon: Database },
    { id: "data-usage", title: "3. How We Use Data", icon: Eye },
    { id: "encryption", title: "4. Encryption & Protection", icon: Lock },
    { id: "user-rights", title: "5. Your Rights & Control", icon: UserCheck },
    { id: "deletion", title: "6. Account & Data Deletion", icon: Trash2 },
    { id: "contact", title: "7. Contact Security Team", icon: Mail },
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
          <span>256-Bit SSL Encrypted & Secured</span>
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
            Hum aapke data ki privacy aur security ko top priority dete hain. Niche janeyin ki hum aapke information ko kaise safe, secure aur encrypted rakhte hain.
          </p>
          <p className="text-xs font-bold text-slate-400">
            Last Updated: September 2026 • Version 2.4 (Enterprise Secured)
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
                Welcome to our platform. Aapka bharosa hamari sabse badi priority hai. Hum bilkul transparent hain ki hum kaun sa data collect karte hain aur usko kis tarah se strict security standards ke tehat store karte hain.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-emerald-900 uppercase">100% Encrypted</h4>
                    <p className="text-xs font-bold text-emerald-700">Database level Row Security Active</p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-blue-900 uppercase">Zero Data Sale</h4>
                    <p className="text-xs font-bold text-blue-700">Hum aapka data third-party ko kabhi bechte nahi</p>
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
                  2. Data We Collect (Hum Kya Collect Karte Hain)
                </h2>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Platform ki services ko smoothly chalane ke liye hum basic information collect karte hain:
              </p>
              <ul className="space-y-3 text-xs sm:text-sm font-bold text-slate-600">
                <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                  <span>
                    <strong className="text-[#0F172A]">Account Credentials:</strong> Aapka Naam, Username, aur Email Address authentication ke liye.
                  </span>
                </li>
                <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                  <span>
                    <strong className="text-[#0F172A]">Progress & Stats:</strong> XP points, Streaks, Challenges activity, aur Leaderboard ranking data.
                  </span>
                </li>
                <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                  <span>
                    <strong className="text-[#0F172A]">Image Scans & AI Input:</strong> Agar aap AI Scanner use karte hain, toh uploaded image secure AI servers par transient processing ke liye use hoti hai.
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
                  3. How We Use Your Data (Hum Data Ka Kya Karte Hain)
                </h2>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Aapke dwara diya gaya data sirf niche diye gaye kaam ke liye upayog me laya jata hai:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="text-xs font-black text-[#0F172A]">Personalized Experience</h4>
                  <p className="text-xs font-bold text-slate-500">
                    Aapki Level, XP points aur Streak track karke gamified dashboard serve karne ke liye.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="text-xs font-black text-[#0F172A]">Leaderboard Generation</h4>
                  <p className="text-xs font-bold text-slate-500">
                    Leaderboard par aapka public username aur avatar show karne ke liye.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Encryption & Protection */}
            <section
              id="encryption"
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 text-emerald-600">
                <Lock className="w-7 h-7" />
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                  4. Enterprise Security Standards (Encrypted Environment)
                </h2>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Hamari security architecture high-end protocols par based hai:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-emerald-400 uppercase">
                      Supabase Row Level Security (RLS)
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300">
                    Aapke personal data ko koi doosra authenticated user access nahi kar sakta. Har record DB level par strictly policy-protected hai.
                  </p>
                </div>
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-black text-blue-400 uppercase">
                      TLS 1.3 & AES-256 Encryption
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300">
                    Network requests transport layer par end-to-end HTTPS/TLS encrypted hoti hain, jisse man-in-the-middle attacks impossible hain.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: User Rights */}
            <section
              id="user-rights"
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 text-blue-600">
                <UserCheck className="w-7 h-7" />
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                  5. Your Rights & Data Control
                </h2>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Aap apne data ke poore malik hain. Aapke paas ye sabhi rights hain:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm font-bold text-slate-600 space-y-2">
                <li>Apna Profile Info (Name, Username, Avatar) kisi bhi time change kar sakte hain.</li>
                <li>Apna sara logged-in data dashboard se real-time review kar sakte hain.</li>
                <li>Apna account directly Profile Settings se permanent delete kar sakte hain.</li>
              </ul>
            </section>

            {/* Section 6: Deletion */}
            <section
              id="deletion"
              className="bg-red-50/60 rounded-[2.5rem] p-6 sm:p-8 border-2 border-red-200 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600">
                <Trash2 className="w-7 h-7" />
                <h2 className="text-xl sm:text-2xl font-black text-red-950">
                  6. Permanent Account & Data Deletion
                </h2>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-red-900 leading-relaxed">
                Agar aap platform chhodna chahte hain, toh aap Profile page me <strong>"Danger Zone"</strong> me jaakar <strong>"DELETE MY ACCOUNT"</strong> button par click kar sakte hain.
              </p>
              <div className="p-4 bg-white rounded-2xl border border-red-200 text-xs font-bold text-slate-600 space-y-1">
                <strong className="text-red-600 font-black">Strict Deletion Guarantee:</strong>
                <p>
                  Delete Confirm hone ke saath hi Supabase database se aapka profile record, XP, streak history aur authentication session instantly wipe out kar diya jata hai.
                </p>
              </div>
            </section>

            {/* Section 7: Contact */}
            <section
              id="contact"
              className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 text-blue-600">
                <Mail className="w-7 h-7" />
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                  7. Contact Our Security Officer
                </h2>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Agar aapke paas privacy, data security, ya vulnerability reporting ke regarding koi sawal hai, toh hamari security team se directly contact karein:
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">Official Security Email</p>
                  <p className="text-sm font-black text-blue-600">security@otterleo.com</p>
                </div>
                <a
                  href="mailto:security@otterleo.com"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all"
                >
                  Contact Us
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs font-bold text-slate-400">
        <p>© 2026 Otterleo App. All Rights Reserved. End-to-End Secured.</p>
      </footer>
    </div>
  );
}