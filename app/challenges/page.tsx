"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Loader2, LayoutDashboard,
  Swords, Scan, Trophy, Compass, Award, User, Settings, PanelLeft, X, Zap, Timer, ChevronRight,
  Sparkles, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { updateActivityStreak } from "@/lib/streak";

interface TutorialStep {
  step: number;
  title: string;
  instruction: string;
  tips: string[];
  imageUrl: string;
}

interface LocalChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xp: number;
  timeLimit: string;
  previewImage: string;
  steps: TutorialStep[];
}

const CUBE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Front Face Rectangle",
    instruction: "Start by drawing the first front face of the cube as a clean rectangular shape.",
    tips: ["Keep lines straight", "Use light pencil pressure"],
    imageUrl: "https://cdn.corenexis.com/f/J69T9C2Epdj.png"
  },
  {
    step: 2,
    title: "Step 2: Second Offset Rectangle",
    instruction: "Draw a second overlapping rectangle slightly shifted to create the back perspective volume.",
    tips: ["Align placement carefully", "Maintain shape proportions"],
    imageUrl: "https://cdn.corenexis.com/f/RfiyhPQrml9.png"
  },
  {
    step: 3,
    title: "Step 3: Connect Corner Edges",
    instruction: "Connect the corresponding corners of both rectangles with lines to structure the 3D box framework.",
    tips: ["Check parallel alignment", "Make sure all four corners connect properly"],
    imageUrl: "https://cdn.corenexis.com/f/HMfzzecOfLR.png"
  },
  {
    step: 4,
    title: "Step 4: Clean Wireframe Cube",
    instruction: "Review your perspective lines to form a solid, clean transparent wireframe cube outline.",
    tips: ["Darken main structural lines", "Double-check proportions"],
    imageUrl: "https://cdn.corenexis.com/f/JSaqa601U5F.png"
  },
  {
    step: 5,
    title: "Step 5: Shading & Solid Finish",
    instruction: "Complete your 3D cube by adding flat shading or dark gradients to define the side faces.",
    tips: ["Use different tones for contrast", "Keep shading smooth and clean"],
    imageUrl: "https://cdn.corenexis.com/f/19vvmZ50jZt.png"
  }
];

const EYE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Basic Outlines & Guide Lines",
    instruction: "First, lightly draw an almond shape with a pencil, then add a circle inside for the iris and mark guide lines.",
    tips: ["Keep both sides balanced", "Use very light pencil strokes"],
    imageUrl: "https://cdn.corenexis.com/f/6ihYUzokRln.jpeg"
  },
  {
    step: 2,
    title: "Step 2: Eyelid Crease & Structure",
    instruction: "Draw another curved line above to represent the eyelid crease, and erase any unnecessary inner guidelines.",
    tips: ["Match the curve to the upper slope", "Keep transitions smooth"],
    imageUrl: "https://cdn.corenexis.com/f/S57AQudsj3l.png"
  },
  {
    step: 3,
    title: "Step 3: Iris & Pupil Details",
    instruction: "Draw the pupil inside the iris and start adding light shading inside the iris to create depth.",
    tips: ["Make sure the pupil is centered", "Keep your lines light and easy to erase"],
    imageUrl: "https://cdn.corenexis.com/f/Lvq32gZlqCz.png"
  },
  {
    step: 4,
    title: "Step 4: Highlights & Soft Shading",
    instruction: "Shade the surrounding skin softly, and leave a tiny white dot unshaded to show light reflection.",
    tips: ["Leave a small white dot for light", "Blend smoothly for a natural look"],
    imageUrl: "https://cdn.corenexis.com/f/hq7jUBRMjzk.png"
  },
  {
    step: 5,
    title: "Step 5: Final Realistic Eye & Eyelashes",
    instruction: "Complete the drawing by adding long, natural upper and lower eyelashes. Scan your drawing for analysis.",
    tips: ["Check your overall contrast", "Sign your completed artwork"],
    imageUrl: "https://cdn.corenexis.com/f/jGJJCV2Bi2l.png"
  }
];

const PORTRAIT_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: The Base Sphere & Cranial Mass",
    instruction: "Start with a light, organic circle representing the cranium. Keep your initial lines loose and feathery to establish overall volume.",
    tips: ["Keep strokes feather-light", "Establish center axis early"],
    imageUrl: "https://cdn.corenexis.com/f/I29zoTSWeLE.png"
  },
  {
    step: 2,
    title: "Step 2: Slicing the Sides & Establishing Planes",
    instruction: "Slice off the sides of the sphere to create the temporal/side planes where the cranium meets the jaw and cheekbone structure.",
    tips: ["Measure proportions carefully", "Keep side planes balanced"],
    imageUrl: "https://cdn.corenexis.com/f/uQX5AsXbFcD.png"
  },
  {
    step: 3,
    title: "Step 3: The Three Equal Divisions & Brow Line",
    instruction: "Project the brow line and centerline forward. Divide the face vertically into three equal sections (1/3 ratio): hairline-to-brow, brow-to-nose, and nose-to-chin.",
    tips: ["Maintain dynamic flow", "Account for tilt perspective"],
    imageUrl: "https://cdn.corenexis.com/f/qi4ja3E9OWf.png"
  },
  {
    step: 4,
    title: "Step 4: Jaw Structure, Ear Placement & Neck",
    instruction: "Outline the jawline extending down from the temporal plane. Position the ear between the brow line and nose base, then anchor the neck structure securely.",
    tips: ["Avoid stiff neck lines", "Let trapezius muscles slope naturally"],
    imageUrl: "https://cdn.corenexis.com/f/F07fBpQIzDQ.png"
  },
  {
    step: 5,
    title: "Step 5: Facial Mapping & Contour Construction",
    instruction: "Map out sockets for the eyes, nose bridge, cheekbones, and lips. Pay attention to foreshortening so the far eye appears narrower.",
    tips: ["Foreshorten the far eye", "Define shadow core edges"],
    imageUrl: "https://cdn.corenexis.com/f/8nRov0zsnTT.png"
  },
  {
    step: 6,
    title: "Step 6: Final Rendering, Shading & Hair Flow",
    instruction: "Refine contours and apply directional shading following muscle structure and hair flow. Add deep shadow cores and highlights for a 3D finish.",
    tips: ["Deepen shadows under jaw & chin", "Keep highlights sharp"],
    imageUrl: "https://cdn.corenexis.com/f/MHi11ZdQQSz.png"
  }
];

const LOCAL_CHALLENGES: LocalChallenge[] = [
  {
    id: "beginner-cube-drawing",
    title: "Mission: Perfect 3D Cube",
    description: "Prove your perspective skills! Can you sketch a perfect 3D cube to claim your XP?",
    difficulty: "beginner",
    xp: 50,
    timeLimit: "5 Min Time Attack",
    previewImage: "https://cdn.corenexis.com/f/19vvmZ50jZt.png",
    steps: CUBE_STEPS
  },
  {
    id: "eye-drawing-1min",
    title: "Challenge: The Realistic Eye",
    description: "Time to step up! Render a hyper-realistic eye and secure your spot on the leaderboard.",
    difficulty: "intermediate",
    xp: 60,
    timeLimit: "10 Min Time Attack",
    previewImage: "https://cdn.corenexis.com/f/jGJJCV2Bi2l.png",
    steps: EYE_STEPS
  },
  {
    id: "advanced-portrait-loomis",
    title: "Boss Level: Loomis Portrait",
    description: "The ultimate test! Construct a flawless 3/4 portrait using the Loomis method to earn massive XP.",
    difficulty: "advanced",
    xp: 70,
    timeLimit: "20 Min Epic Run",
    previewImage: "https://cdn.corenexis.com/f/MHi11ZdQQSz.png",
    steps: PORTRAIT_STEPS
  }
];

const GAMIFIED_TABS = {
  beginner: "Rookie",
  intermediate: "Pro",
  advanced: "Master"
};

export default function ChallengesPage() {
  const [selectedTab, setSelectedTab] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [userXp, setUserXp] = useState<number>(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active Flow State
  const [activeView, setActiveView] = useState<'hub' | 'challenge-flow'>('hub');
  const [activeChallengeId, setActiveChallengeId] = useState<string>("beginner-cube-drawing");
  const [currentStep, setCurrentStep] = useState<number>(0);

  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png";
  const mascotImageUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Otterly%20Take%20the%20Challenge%20(1)%20(2).png";

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    try {
      const cachedXp = localStorage.getItem("user_xp_cache");
      if (cachedXp) {
        setUserXp(Number(cachedXp));
      }

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && profile.xp !== null && profile.xp !== undefined) {
        const dbXp = profile.xp;
        setUserXp(dbXp);
        localStorage.setItem("user_xp_cache", dbXp.toString());
      }

      const { data: completed } = await supabase
        .from("user_completed_challenges")
        .select("challenge_id")
        .eq("user_id", user.id);

      if (completed) {
        setCompletedChallenges(completed.map((c) => c.challenge_id));
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageData();

    const handleXpEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (typeof customEvent.detail === 'number') {
        setUserXp(customEvent.detail);
        localStorage.setItem("user_xp_cache", customEvent.detail.toString());
      }
    };

    window.addEventListener('xpUpdated', handleXpEvent);
    return () => {
      window.removeEventListener('xpUpdated', handleXpEvent);
    };
  }, [fetchPageData]);

  const handleReviewChallenge = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (user) {
        const updatedStreak = await updateActivityStreak(user.id);
        if (updatedStreak !== null) {
          window.dispatchEvent(new CustomEvent('streakUpdated', { detail: updatedStreak }));
        }
      }
    } catch (err) {
      console.error("Error updating streak on review:", err);
    } finally {
      setActiveView('hub');
    }
  };

  const handleCompleteChallenge = async (challenge: LocalChallenge) => {
    if (completedChallenges.includes(challenge.id)) {
      await handleReviewChallenge();
      return;
    }

    setClaimingId(challenge.id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (!user) {
        alert("Please login to complete challenges!");
        setClaimingId(null);
        setActiveView('hub');
        return;
      }

      const { data: newTotalXp, error: rpcError } = await supabase.rpc('increment_user_xp', {
        user_id_param: user.id,
        xp_to_add: challenge.xp
      });

      if (rpcError) {
        console.error("RPC Error:", rpcError);
        alert("Error updating XP: " + rpcError.message);
        setClaimingId(null);
        return;
      }

      const updatedXp = Number(newTotalXp);

      const { error: upsertError } = await supabase
        .from("user_completed_challenges")
        .upsert(
          { user_id: user.id, challenge_id: challenge.id },
          { onConflict: 'user_id,challenge_id' }
        );

      if (upsertError) {
        await supabase.from("user_completed_challenges").insert({
          user_id: user.id,
          challenge_id: challenge.id,
        });
      }

      const updatedStreak = await updateActivityStreak(user.id);
      if (updatedStreak !== null) {
        window.dispatchEvent(new CustomEvent('streakUpdated', { detail: updatedStreak }));
      }

      setUserXp(updatedXp);
      localStorage.setItem("user_xp_cache", updatedXp.toString());
      setCompletedChallenges((prev) => Array.from(new Set([...prev, challenge.id])));
      window.dispatchEvent(new CustomEvent('xpUpdated', { detail: updatedXp }));

      setActiveView('hub');
    } catch (err: any) {
      console.error("Error completing challenge:", err);
      alert("Error saving challenge completion: " + (err.message || "Unknown error"));
    } finally {
      setClaimingId(null);
    }
  };

  const currentChallenge = LOCAL_CHALLENGES.find(c => c.id === activeChallengeId) || LOCAL_CHALLENGES[0];
  const activeStepList = currentChallenge.steps;
  const isCurrentDone = completedChallenges.includes(currentChallenge.id);

  const activeTabChallenge = LOCAL_CHALLENGES.find(c => c.difficulty === selectedTab) || LOCAL_CHALLENGES[0];

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Challenges", path: "/challenges", active: true, icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

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
            <PanelLeft className="w-5 h-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center">
            <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-700 font-black text-xs">
          <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{userXp} XP</span>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link href="/dashboard">
                  <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
                </Link>
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
                          ? "bg-[#2563EB] text-white border-b-4 border-blue-800"
                          : "text-slate-500 hover:bg-slate-50"
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

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <Link href="/dashboard">
            <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
          </Link>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                    item.active
                      ? "bg-[#2563EB] text-white border-b-4 border-blue-800"
                      : "text-slate-500 hover:bg-slate-50"
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

      {/* Main Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-5 overflow-y-auto">
        
        {/* Top Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-xs hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl text-amber-700 font-black text-sm">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{userXp} XP</span>
          </div>
        </div>

        {activeView === 'hub' ? (
          <>
            {/* Top Banner Header with Enlarged Mascot */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-2xs flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1 pr-3">
                <h1 className="text-2xl font-black text-[#0F172A]">Challenges</h1>
                <p className="text-xs font-bold text-slate-500 max-w-xs">
                  Complete step-by-step challenges, earn XP and level up your skills!
                </p>
              </div>
              <img src={mascotImageUrl} alt="Mascot" className="w-32 sm:w-36 h-auto object-contain shrink-0" />
            </div>

            {/* Gamified Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-black text-slate-500 justify-between">
              {(["beginner", "intermediate", "advanced"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`flex-1 py-2 rounded-xl transition-all uppercase tracking-wider text-[11px] ${
                    selectedTab === tab
                      ? "bg-[#2563EB] text-white shadow-2xs"
                      : "hover:text-slate-900"
                  }`}
                >
                  {GAMIFIED_TABS[tab]}
                </button>
              ))}
            </div>

            {/* Challenge Card */}
            <div className="bg-white rounded-[2rem] p-5 border border-slate-200/80 shadow-2xs space-y-4">
              
              {/* Completed Badge Only */}
              {completedChallenges.includes(activeTabChallenge.id) && (
                <div className="flex justify-end w-full">
                  <span className="text-[11px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                </div>
              )}

              {/* Preview Image Frame */}
              <div className="w-full h-32 sm:h-36 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-2">
                <img
                  src={activeTabChallenge.previewImage}
                  alt={activeTabChallenge.title}
                  className="max-h-full max-w-full object-contain hover:scale-105 transition-all duration-300"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h2 className="font-black text-slate-900 text-lg">{activeTabChallenge.title}</h2>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    {activeTabChallenge.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-black">
                  <span className="flex items-center gap-1 text-amber-500">
                    <Zap className="w-3.5 h-3.5 fill-amber-500" />
                    +{activeTabChallenge.xp} XP
                  </span>
                  
                  {/* Timer Pill */}
                  <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">
                    <Timer className="w-3.5 h-3.5" />
                    {activeTabChallenge.timeLimit}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-lg text-[11px] uppercase ${
                    activeTabChallenge.difficulty === "beginner"
                      ? "bg-emerald-50 text-emerald-600"
                      : activeTabChallenge.difficulty === "intermediate"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-purple-50 text-purple-600"
                  }`}>
                    {GAMIFIED_TABS[activeTabChallenge.difficulty]}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveChallengeId(activeTabChallenge.id);
                    setActiveView('challenge-flow');
                    setCurrentStep(0);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs border-b-2 transition-all ${
                    completedChallenges.includes(activeTabChallenge.id)
                      ? "bg-slate-800 hover:bg-slate-900 text-white border-slate-950"
                      : "bg-[#2563EB] hover:bg-blue-600 text-white border-blue-800"
                  }`}
                >
                  <span>{completedChallenges.includes(activeTabChallenge.id) ? 'Review Challenge' : 'Accept Challenge 🚀'}</span>
                  {!completedChallenges.includes(activeTabChallenge.id) && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* STEP-BY-STEP TUTORIAL VIEW */
          <div className="bg-white rounded-[2rem] p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-[11px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-xl">
                Step {currentStep + 1} of {activeStepList.length}
              </span>
              <button
                onClick={() => setActiveView('hub')}
                className="text-xs font-black text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl transition"
              >
                Exit Mission
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">{activeStepList[currentStep].title}</h3>
              <p className="text-xs font-bold text-slate-500 mt-1 leading-relaxed">
                {activeStepList[currentStep].instruction}
              </p>
            </div>

            {/* Container for Tutorial Image */}
            <div className="w-full h-56 sm:h-64 bg-slate-900/5 border border-slate-200/80 rounded-2xl flex items-center justify-center p-3 overflow-hidden shadow-inner">
              <img
                src={activeStepList[currentStep].imageUrl}
                alt="Tutorial step reference"
                className="max-h-full max-w-full object-contain scale-125 sm:scale-135 transition-transform duration-300 transform-gpu"
              />
            </div>

            {/* Tips Section */}
            <div className="bg-amber-50/60 border border-amber-200/60 p-4 rounded-2xl space-y-2">
              <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Pro Tips:
              </h4>
              <ul className="space-y-1">
                {activeStepList[currentStep].tips.map((tip, idx) => (
                  <li key={idx} className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Step Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2.5 rounded-xl font-black text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition"
              >
                Previous
              </button>

              {currentStep < activeStepList.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => Math.min(activeStepList.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl font-black text-xs bg-[#2563EB] text-white hover:bg-blue-600 border-b-2 border-blue-800 transition flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : isCurrentDone ? (
                <button
                  onClick={handleReviewChallenge}
                  className="px-5 py-2.5 rounded-xl font-black text-xs bg-slate-800 hover:bg-slate-900 text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Mission Accomplished (Return)</span>
                </button>
              ) : (
                <button
                  onClick={() => handleCompleteChallenge(currentChallenge)}
                  disabled={claimingId === currentChallenge.id}
                  className="px-5 py-2.5 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-70"
                >
                  {claimingId === currentChallenge.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Finish & Claim +{currentChallenge.xp} XP</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex justify-around items-center z-40">
        {[
          { name: "Home", path: "/dashboard", icon: LayoutDashboard },
          { name: "Scan", path: "/scan", icon: Scan },
          { name: "Challenges", path: "/challenges", active: true, icon: Swords },
          { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
          { name: "Profile", path: "/profile", icon: User },
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