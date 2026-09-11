"use client";

import Link from "next/link";
import { Compass, ArrowLeft, Construction, Sparkles } from "lucide-react";

export default function LearningPathPage() {
  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col items-center justify-center p-6 tracking-tight font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-8 border border-slate-200/80 shadow-sm text-center space-y-6 relative overflow-hidden">
        
        {/* Background decorative blur */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Icon Badge */}
        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto text-[#2563EB] shadow-inner relative">
          <Compass className="w-8 h-8 animate-spin-slow" />
          <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1 rounded-lg border-2 border-white shadow-xs">
            <Construction className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Coming Soon
          </span>
          <h1 className="text-2xl font-black text-slate-900">Learning Path is Cooking!</h1>
          <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-xs mx-auto">
            We are building a structured roadmap to take your drawing skills from absolute zero to master level. Stay tuned!
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs border-b-2 border-blue-800 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

      </div>
    </div>
  );
}