"use client";

import { useState, useEffect, useMemo, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft, Upload, Sparkles, CheckCircle2, RefreshCw, PanelLeft, X, LayoutDashboard,
  Swords, Scan, Trophy, Compass, Award, User, Settings, AlertTriangle, Target, Zap, Star, ShieldAlert, Flame, Loader2
} from "lucide-react";

interface AIAnalysisResult {
  isDrawing: boolean;
  score?: number;
  skillLevel?: "Beginner" | "Intermediate" | "Advanced";
  strengths?: string[];
  areasToImprove?: string[];
  actionableImprovements?: string[];
  practiceRecommendation?: string;
  motivationalFeedback?: string;
  message?: string;
  lockActive?: boolean;
  nextAllowedTime?: string;
}

export default function ScanPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  const mascotImageUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20scan.jpeg";
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png";

  // 🔒 Security Check: Page load hote hi authentication verify karna
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
      } else {
        setAuthLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const clearLock = () => {
    setCountdown(null);
    if (analysis && analysis.lockActive) {
      setAnalysis(null);
    }
  };

  const calculateCountdown = useMemo(() => {
    const nextAllowedIso = analysis?.nextAllowedTime;
    if (!nextAllowedIso) return () => clearLock();

    const nextAllowed = new Date(nextAllowedIso);

    return () => {
      const currentTime = new Date();
      const difference = nextAllowed.getTime() - currentTime.getTime();

      if (difference <= 0) {
        clearLock();
      } else {
        const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const m = Math.floor((difference / (1000 * 60)) % 60);
        const s = Math.floor((difference / 1000) % 60);
        setCountdown({ hours: h, minutes: m, seconds: s });
      }
    };
  }, [analysis]);

  useEffect(() => {
    if (analysis?.nextAllowedTime) {
      calculateCountdown();
      const timerInterval = setInterval(calculateCountdown, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [analysis, calculateCountdown]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (countdown || (analysis && analysis.lockActive)) {
      setErrorMessage("Scan Locked. Please wait until the timer resets. [Strict-24H] Error 3");
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 700;
          const scaleFactor = MAX_WIDTH / img.width;

          if (scaleFactor < 1) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleFactor;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setSelectedImage(compressedBase64);
          setAnalysis(null);
          setErrorMessage(null);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysis(null);

    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: selectedImage }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.status === 503) {
          attempt++;
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
            continue;
          } else {
            setErrorMessage("Otto AI is facing high demand. Please try again after a few seconds. Error 1");
            break;
          }
        }

        const data: AIAnalysisResult = await res.json();

        if (res.status === 423 && data.lockActive) {
          setErrorMessage(
            "Your daily scan limit is active. Please check the countdown timer below. [ERR-S24] Error 2"
          );
          setAnalysis(data);
          setSelectedImage(null);
          success = true;
          return;
        }

        if (!res.ok || !data.isDrawing) {
          setErrorMessage(
            data.message || "Please upload a valid drawing or artwork. Otto AI can only analyze drawings."
          );
          setAnalysis(null);
        } else {
          setAnalysis(data);
        }
        success = true;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
          setErrorMessage("Request took too long to respond. Connection reset. Please try again later. Error 2");
          break;
        } else {
          attempt++;
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
          } else {
            setErrorMessage("Otto AI is facing high demand. Please try again after a few seconds. Error 1");
          }
        }
      } finally {
        if (success || attempt >= maxRetries) {
          setIsAnalyzing(false);
        }
      }
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setErrorMessage(null);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", active: true, icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  // Jab tak Supabase authentication load ho raha hai
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F6FAFF] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#2563eb] font-black text-base">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Verifying access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight font-sans pb-20 md:pb-0">

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5"/>
          </button>

          <img src={logoUrl} alt="Otterleo Logo" className="h-14 w-auto object-contain max-h-16" />
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <img src={logoUrl} alt="Otterleo Logo" className="h-14 w-auto object-contain" />
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      href={item.path}
                      key={item.name}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                        item.active
                          ? "bg-[#2563EB] text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0"/>
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
            <img src={logoUrl} alt="Otterleo Logo" className="h-16 sm:h-20 w-auto object-contain" />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  href={item.path}
                  key={item.name}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                    item.active
                      ? "bg-[#2563EB] text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0"/>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">

        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]"/>
            Back to Dashboard
          </Link>

          <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full text-blue-600 font-extrabold text-xs">
            <Sparkles className="w-4 h-4"/>
            <span>Otto AI Drawing Coach</span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Left Column: Mascot Container */}
          <div className="md:col-span-5 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col items-center justify-between min-h-[440px] relative">
            <div className="text-center z-10 space-y-2">
              <h2 className="text-2xl font-black text-[#0F172A]">Otto AI Art Evaluator</h2>
              <p className="text-xs font-bold text-slate-500 max-w-xs">
                Upload your hand-drawn sketch, painting, or digital artwork to receive structured professional feedback.
              </p>
            </div>

            <div className="flex-1 flex items-end justify-center w-full mt-4 -mb-6 z-20">
              <img src={mascotImageUrl} alt="Otto Mascot" className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-contain block align-bottom" />
            </div>
          </div>

          {/* Right Column: Scan & Evaluation */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A]">Scan & Analyze Artwork</h1>
              <p className="text-sm font-bold text-slate-500">
                Upload a clear image of your drawing to start analysis.
              </p>
            </div>

            {/* Upload Box with Conditional Render for Locked State */}
            <div className="w-full relative">

              {/* LOCK OVERLAY + TIMER UI */}
              {countdown && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 rounded-[2rem] p-8 flex flex-col items-center justify-center space-y-6 border-3 border-amber-300 border-dashed text-center">
                  <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border-2 border-amber-200">
                    <ShieldAlert className="w-10 h-10 stroke-[2]"/>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-lg font-black tracking-tight text-amber-950 uppercase">Daily Scan Limit Active</p>
                    <p className="text-sm font-extrabold text-amber-800 leading-relaxed max-w-xs">
                      Otto AI accepts one artwork scan per 24 hours to encourage proper practice over rapid uploads. [Lock Persistent]
                    </p>
                  </div>

                  {/* Dynamic Countdown Box */}
                  <div className="bg-amber-100 border-2 border-amber-200 px-6 py-4 rounded-3xl font-extrabold text-slate-900 flex items-center gap-5 text-center shadow-inner">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-amber-600 tabular-nums">{String(countdown.hours).padStart(2, '0')}</span>
                      <span className="text-[10px] text-amber-700 uppercase tracking-widest font-black">Hours</span>
                    </div>
                    <span className="text-3xl font-black text-amber-300 -mt-3">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-amber-600 tabular-nums">{String(countdown.minutes).padStart(2, '0')}</span>
                      <span className="text-[10px] text-amber-700 uppercase tracking-widest font-black">Minutes</span>
                    </div>
                    <span className="text-3xl font-black text-amber-300 -mt-3">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-amber-600 tabular-nums">{String(countdown.seconds).padStart(2, '0')}</span>
                      <span className="text-[10px] text-amber-700 uppercase tracking-widest font-black">Seconds</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Label (Conditional display + Disabled Styling) */}
              {!selectedImage ? (
                <label
                  className={`w-full border-3 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[260px]
                  ${countdown
                    ? "bg-amber-50/50 border-amber-200 cursor-not-allowed"
                    : "border-slate-200 hover:border-blue-500 hover:bg-blue-50/30"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={!!countdown}
                  />
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${countdown ? "bg-amber-100 text-amber-500" : "bg-blue-50 text-blue-600"}`}>
                    <Upload className="w-8 h-8 stroke-[2.5]"/>
                  </div>
                  <p className="text-base font-black text-[#0F172A] text-center">
                    {countdown ? "Daily Limit Locked" : "Click or drag artwork here to scan"}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    Supports PNG, JPG, JPEG (Drawings & Sketches ONLY)
                  </p>
                </label>
              ) : (
                <div className="relative w-full h-[260px] bg-slate-900 rounded-[2rem] overflow-hidden border-2 border-slate-100 flex items-center justify-center z-10">
                  <img src={selectedImage} alt="Drawing Preview" className="w-full h-full object-contain" />

                  {/* Laser Scanning Animation (Conditional) */}
                  {isAnalyzing && (
                    <>
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f3ff,0_0_30px_#00f3ff] animate-scan z-10" />
                      <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-cyan-500/20 to-transparent animate-scan z-0" />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-cyan-400 text-xs font-black px-4 py-2 rounded-full border border-cyan-500/40 flex items-center gap-2 z-20 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        Otto AI Analyzing Artwork...
                      </div>
                    </>
                  )}

                  {!isAnalyzing && (
                    <button onClick={handleReset} className="absolute top-4 right-4 bg-slate-900/80 text-white p-2.5 rounded-xl hover:bg-slate-900 transition-all backdrop-blur-sm z-20" title="Change image">
                      <RefreshCw className="w-4 h-4"/>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className={`border p-5 rounded-2xl flex items-start gap-3 ${errorMessage.includes("[Lock-Persistent]") ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200"}`}>
                <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${errorMessage.includes("[Lock-Persistent]") ? "text-amber-600" : "text-rose-600"}`} />
                <div className="space-y-1">
                  <p className={`text-xs font-black uppercase tracking-wider ${errorMessage.includes("[Lock-Persistent]") ? "text-amber-800" : "text-rose-800"}`}>Otto AI System Notice</p>
                  <p className={`text-xs font-extrabold leading-relaxed ${errorMessage.includes("[Lock-Persistent]") ? "text-amber-950" : "text-rose-950"}`}>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Scan Action Button (Conditional Display + Disabled State) */}
            {selectedImage && !analysis && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !!countdown}
                className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider border-b-4 border-blue-800 hover:bg-blue-600 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin"/>
                    <span>Otto AI Scanning Artwork...</span>
                  </>
                ) : countdown ? (
                  <>
                    <ShieldAlert className="w-5 h-5 text-amber-300"/>
                    <span>Scan Disabled (Limit Locked)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5"/>
                    <span>Run Otto AI Art Audit</span>
                  </>
                )}
              </button>
            )}

            {/* Analysis Results Cards */}
            {analysis && analysis.isDrawing === true && !analysis.lockActive && (
              <div className="space-y-5">

                {/* Timer Added to Result Card: Persistent Scan Limit Confirmation */}
                <div className="bg-amber-50 border-2 border-dashed border-amber-200 p-5 rounded-2xl flex items-center justify-between text-amber-950 text-sm font-extrabold gap-3">
                  <div className="flex gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-600"/>
                    <span>Next artwork scan available in:</span>
                  </div>
                  {analysis.nextAllowedTime && (
                    <div className="bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 text-slate-800 font-bold text-sm tabular-nums flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-700"/>
                        {new Date(analysis.nextAllowedTime).toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true}) + " Tomorrow"}
                    </div>
                  )}
                </div>

                {/* Score & Skill Badge */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex flex-col items-center justify-center text-white font-black">
                      <span className="text-2xl leading-none">{analysis.score}</span>
                      <span className="text-[9px] text-blue-200 font-bold uppercase">/ 100</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Assessed Skill Level</p>
                      <h4 className="text-lg font-black text-blue-400">{analysis.skillLevel} Artist</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 px-3 py-1.5 rounded-full text-xs font-black">
                    <Star className="w-4 h-4 fill-amber-400"/>
                    <span>Audited</span>
                  </div>
                </div>

                {/* Promotional Feedback Quote */}
                {analysis.motivationalFeedback && (
                  <div className="bg-blue-50/80 border border-blue-200/80 p-4 rounded-2xl flex items-start gap-3 relative">
                    <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"/>
                    <div>
                      <p className="text-[11px] font-black uppercase text-blue-700 tracking-wider">Otto's Encouragement</p>
                      <p className="text-xs font-extrabold text-slate-800 leading-relaxed mt-0.5 relative z-10">
                        "{analysis.motivationalFeedback}"
                      </p>
                      <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[10px] border-r-blue-100 border-b-[8px] border-b-transparent z-0"/>
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div className="bg-emerald-50/80 border border-emerald-200/80 p-5 rounded-2xl space-y-3 shadow-inner">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-sm uppercase tracking-wider">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0"/>
                      <span>Key Artistic Strengths</span>
                    </div>
                    <ul className="space-y-2.5 pl-1">
                      {analysis.strengths.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-extrabold text-emerald-950 leading-relaxed">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas to Improve */}
                {analysis.areasToImprove && analysis.areasToImprove.length > 0 && (
                  <div className="bg-amber-50/80 border border-amber-200/80 p-5 rounded-2xl space-y-3 shadow-inner">
                    <div className="flex items-center gap-2 text-amber-800 font-black text-sm uppercase tracking-wider">
                      <Target className="w-5 h-5 text-amber-600 shrink-0"/>
                      <span>Primary Areas to Refine</span>
                    </div>
                    <ul className="space-y-2.5 pl-1">
                      {analysis.areasToImprove.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-extrabold text-amber-950 leading-relaxed">
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Practice Recommendation */}
                {analysis.practiceRecommendation && (
                  <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl flex items-start gap-3 shadow-sm border-l-4">
                    <Flame className="w-5 h-5 text-purple-600 shrink-0 mt-0.5"/>
                    <div>
                      <p className="text-[11px] font-black uppercase text-purple-700 tracking-wider">Recommended Daily Drill (15 Min)</p>
                      <p className="text-xs font-extrabold text-purple-950 leading-relaxed mt-0.5">
                        {analysis.practiceRecommendation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Strict Lock Active Action */}
                <button
                  disabled={true}
                  className="w-full bg-slate-100 text-slate-500 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-70 cursor-not-allowed"
                >
                  Daily Scan Limit Reached
                </button>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex justify-around items-center z-40 shadow-lg">
        {[
          { name: "Home", path: "/dashboard", icon: LayoutDashboard },
          { name: "Scan", path: "/scan", active: true, icon: Scan },
          { name: "Challenges", path: "/challenges", icon: Swords },
          { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
          { name: "Profile", path: "/profile", icon: User },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              href={item.path}
              key={item.name}
              className={`flex flex-col font-black gap-1 items-center p-2 rounded-xl text-xs ${item.active ? "text-[#2563EB]" : "text-slate-400"}`}
            >
              <Icon className="w-5 h-5"/>
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}