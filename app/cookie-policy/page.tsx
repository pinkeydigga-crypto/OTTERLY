"use client";

import Link from "next/link";
import { ArrowLeft, Cookie, ShieldCheck, Database, Key } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col font-sans tracking-tight">
      <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-2xl border-2 border-slate-100 shadow-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm hover:bg-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 text-blue-600 font-black text-sm bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
            <Cookie className="w-4 h-4" />
            <span>Cookie Policy</span>
          </div>
        </div>

        {/* Title Section */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-xs space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A]">
            Cookie Policy
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-500">
            Last Updated: September 2026
          </p>
          <p className="text-sm font-semibold text-slate-600 leading-relaxed pt-2">
            This Cookie Policy explains how we use cookies, local storage, and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-xs space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-[#0F172A]">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Cookie className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider">
                1. What Are Cookies?
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-600 leading-relaxed pl-10">
              Cookies and local storage items are small data files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-[#0F172A]">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider">
                2. Essential Cookies We Use
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-600 leading-relaxed pl-10 mb-3">
              We strictly use <strong>Essential (Necessary) Cookies</strong> and LocalStorage to keep your session secure and active. Without these, our application cannot function properly.
            </p>

            <div className="pl-10 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Authentication & Session Tokens (Supabase Auth)
                </h3>
                <p className="text-xs font-semibold text-slate-600">
                  <strong>Purpose:</strong> Used to keep you securely logged in as you navigate between pages without requiring you to re-enter your credentials every time.
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  <strong>Type:</strong> Strictly Necessary / Essential
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  User Preferences (LocalStorage)
                </h3>
                <p className="text-xs font-semibold text-slate-600">
                  <strong>Purpose:</strong> Stores basic non-sensitive state like user profile caches to deliver faster page load times and reduced bandwidth usage.
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  <strong>Type:</strong> Functional / Performance
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-[#0F172A]">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider">
                3. Third-Party & Advertising Cookies
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-600 leading-relaxed pl-10">
              We <strong>DO NOT</strong> use third-party tracking cookies, cross-site trackers, or advertising cookies to sell your data to any third party. Your authentication session remains entirely private and encrypted.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-[#0F172A]">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider">
                4. How Can You Control Cookies?
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-600 leading-relaxed pl-10">
              You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. However, if you choose to reject essential cookies, you may not be able to log in or use full features of our service.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}