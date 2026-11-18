"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, CheckCircle2, LayoutDashboard,
  Swords, Scan, Trophy, Compass, User, Settings, PanelLeft, X, ChevronRight,
  Sparkles, Check, ShieldAlert, Palette, Grid, Zap, RefreshCw, Star, Volume2, VolumeX, MoreHorizontal
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { updateActivityStreak } from "@/lib/streak";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";
import PracticeCanvas from "@/components/PracticeCanvas";
import LoadingScreen from "@/components/LoadingScreen";

function TypewriterText({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className="font-mono text-slate-800 tracking-wide inline-block">
      {displayedText}
      <span className="animate-pulse text-blue-600 font-bold ml-0.5">|</span>
    </span>
  );
}

interface TutorialStep {
  step: number;
  title: string;
  instruction: string;
  tips: string[];
  imageUrl?: string;
  typewriterText?: string;
}

interface LocalChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xp: number;
  previewImage: string;
  steps: TutorialStep[];
}

const FLOWER_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for drawing", "Keep an eraser ready"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Grab your pencil and paper!"
  },
  {
    step: 2,
    title: "Step 2: Draw a Circle in the Middle",
    instruction: "Draw a clean and small circle right in the center of your page for the flower center.",
    tips: ["Draw a light circle first", "Make it round and neat"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/FLOWER1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Draw Five Petals",
    instruction: "Draw five curved petals around the center circle, touching each other nicely.",
    tips: ["Keep all petals similar in size", "Do not press too hard"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/FLOWER2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Draw Stem and Leaves",
    instruction: "Draw a straight line going down from the flower, and add two leaf shapes on the sides.",
    tips: ["Keep the stem straight", "Make two clean leaves"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/FLOWER3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Add Shading",
    instruction: "Shade softly inside the petals and leaves with your pencil to make it look real.",
    tips: ["Blend pencil lines gently", "Make borders darker"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/FLOWER4.jpeg"
  },
  {
    step: 6,
    title: "Step 6: Practice on Digital Canvas",
    instruction: "Great job! Now practice drawing your flower on the digital canvas below.",
    tips: ["Take your time", "Have fun drawing"],
    imageUrl: ""
  }
];

const FISH_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for drawing", "Keep an eraser ready"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Grab your pencil and paper!"
  },
  {
    step: 2,
    title: "Step 2: Shape a Sleeping Oval",
    instruction: "Draw a light sleeping oval shape with a pointed tip on the right side.",
    tips: ["Keep your hand loose", "Draw light lines first"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/fish%201.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Top Fin and Tail",
    instruction: "Make a smooth curve on top for the upper fin, and join two curved shapes on the right for the tail.",
    tips: ["Keep curves smooth", "Match both tail parts"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/fish%202.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Add Eye, Smile and Side Fin",
    instruction: "Draw a round eye with a tiny white dot, a cute smile, a leaf-shaped side fin, and thin lines inside the fins.",
    tips: ["Leave the white dot empty in the eye", "Draw light lines inside fins"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/fish3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Add Shading and Bubbles",
    instruction: "Shade softly along the top back and fins, then draw two round bubbles near the face.",
    tips: ["Keep pencil shading soft", "Make neat round bubbles"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/fish4.jpeg"
  },
  {
    step: 6,
    title: "Step 6: Practice on Digital Canvas",
    instruction: "Awesome! Now practice drawing your cute fish on the digital canvas below.",
    tips: ["Use brush tool smoothly", "Have fun drawing"],
    imageUrl: ""
  }
];

const EYE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw an eye!"
  },
  {
    step: 2,
    title: "Step 2: Draw Eye Outline",
    instruction: "Draw an almond shape for the eye with a small curve at the corner.",
    tips: ["Keep lines light and soft", "Make matching curves"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Draw Pupil and Light Dot",
    instruction: "Draw a big circle inside for the iris and a dark pupil. Leave a tiny white circle blank for light reflection.",
    tips: ["Do not shade the white light dot", "Make smooth circle shapes"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Add Eyelashes",
    instruction: "Draw dark and curved eyelashes on the top eyelid line.",
    tips: ["Make lashes point outwards", "Keep strokes sharp"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Final Shading",
    instruction: "Shade around the eye edges softly to give it a real 3D depth look.",
    tips: ["Blend shades smoothly", "Keep highlights clean"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye4.jpeg"
  },
  {
    step: 6,
    title: "Step 6: Practice on Digital Canvas",
    instruction: "Wonderful! Practice drawing the realistic eye on the canvas below.",
    tips: ["Take your time on details", "Have fun"],
    imageUrl: ""
  }
];

const LIP_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Keep your pencil sharp", "Use a soft eraser"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to shade lips!"
  },
  {
    step: 2,
    title: "Step 2: Draw Lip Outlines",
    instruction: "Sketch the top lip with a V-shape in the center and bottom lip curve gently.",
    tips: ["Keep lines very light", "Check balance on both sides"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Base Shading",
    instruction: "Apply soft pencil shading across both lips to make them look full and round.",
    tips: ["Darken the center line", "Keep outer edges soft"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Add Texture Lines",
    instruction: "Draw small light curved lines on the lips to show natural skin lines.",
    tips: ["Curve lines gently", "Do not press too hard"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Add Shine and Highlights",
    instruction: "Make lip corners dark and use your eraser to make a bright shine spot on the bottom lip.",
    tips: ["High contrast gives a glossy look", "Test your skills on canvas next"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips%204.jpeg"
  }
];

const LOCAL_CHALLENGES: LocalChallenge[] = [
  {
    id: "classic-flower-beginner",
    title: "Challenge: Classic Flower Drawing",
    description: "Learn how to draw a beautiful 5-petal classic flower step by step with easy shading.",
    difficulty: "beginner",
    xp: 50,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/FLOWER4.jpeg",
    steps: FLOWER_STEPS
  },
  {
    id: "cute-fish-beginner",
    title: "Challenge: Cute Fish Drawing",
    description: "Learn how to draw an adorable cartoon fish step by step with fins, bubbles, and soft shading.",
    difficulty: "beginner",
    xp: 30,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/fish4.jpeg",
    steps: FISH_STEPS
  },
  {
    id: "eye-drawing-1min",
    title: "Challenge: The Realistic Eye",
    description: "Master iris details, pupil depth, eyelid folds, and realistic eyelashes step by step.",
    difficulty: "intermediate",
    xp: 60,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye4.jpeg",
    steps: EYE_STEPS
  },
  {
    id: "lip-drawing-challenge",
    title: "Challenge: The Realistic Lip",
    description: "Learn lip contours, vertical crease texturing, soft volume shading, and glossy highlights.",
    difficulty: "intermediate",
    xp: 80,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips%204.jpeg",
    steps: LIP_STEPS
  }
];

export default function ChallengesPage() {
  const isOffline = useOfflineGuard();

  const [userXp, setUserXp] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar_url: string } | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const [activeView, setActiveView] = useState<'hub' | 'challenge-flow'>('hub');
  const [activeChallengeId, setActiveChallengeId] = useState<string>("classic-flower-beginner");
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [showLevelModal, setShowLevelModal] = useState<boolean>(false);

  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
  const ottoMascotUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Otterly%20Take%20the%20Challenge%20(1)%20(2)%20(1).png";
  const claimMascotUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Cheerful%20Otter%20Mascot%20with%20Star%20Icon.png";

  const audioCtxRef = useRef<AudioContext | null>(null);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const playCelebrationSound = async () => {
    if (typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || (audioCtxRef.current.state as string) === "closed") {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;

      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => {});
      }
      if ((ctx.state as string) === "closed") return;

      const now = ctx.currentTime;

      // 3-second sweet, warm ascending chime & sparkle celebration melody
      const melody = [
        { freq: 523.25, time: 0.0, duration: 0.45, vol: 0.14 },   // C5
        { freq: 659.25, time: 0.14, duration: 0.45, vol: 0.14 },  // E5
        { freq: 783.99, time: 0.28, duration: 0.5, vol: 0.14 },   // G5
        { freq: 1046.50, time: 0.44, duration: 0.9, vol: 0.16 },  // C6
        { freq: 987.77, time: 0.72, duration: 0.4, vol: 0.11 },   // B5
        { freq: 1046.50, time: 0.92, duration: 1.4, vol: 0.16 },  // C6 (warm hold)
        { freq: 1318.51, time: 1.15, duration: 1.5, vol: 0.12 },  // E6 (sweet sparkle)
        { freq: 1567.98, time: 1.4, duration: 1.6, vol: 0.10 },   // G6 (gentle shimmer tail to 3s)
      ];

      melody.forEach((note) => {
        if ((ctx.state as string) === "closed") return;
        const osc = ctx.createOscillator();
        const overtone = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        overtone.type = "triangle";
        overtone.frequency.setValueAtTime(note.freq * 2, now + note.time);

        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.02, now + note.time);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.duration);

        gain.gain.setValueAtTime(0.001, now + note.time);
        gain.gain.linearRampToValueAtTime(note.vol, now + note.time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.duration);

        osc.connect(gain);
        overtone.connect(overtoneGain);
        overtoneGain.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.time);
        overtone.start(now + note.time);
        osc.stop(now + note.time + note.duration + 0.05);
        overtone.stop(now + note.time + note.duration + 0.05);
      });
    } catch {}
  };

  const speakStepText = useCallback((title: string, instruction: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      
      if (isMuted) return;

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const executeSpeech = () => {
        let formattedText = `${title}. ${instruction || ""}`;
        formattedText = formattedText
          .replace(/,/g, ", ")
          .replace(/\./g, "... ");

        const utterance = new SpeechSynthesisUtterance(formattedText);
        utterance.rate = 0.90;
        utterance.pitch = 0.90;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const maleVoice = voices.find(v => 
          (v.name.includes('Google UK English Male') || 
           v.name.includes('Google US English Male') || 
           v.name.includes('David') || 
           v.name.includes('George') || 
           v.name.includes('Male')) && v.lang.includes('en')
        ) || voices.find(v => v.lang.includes('en'));

        if (maleVoice) {
          utterance.voice = maleVoice;
        }

        window.speechSynthesis.speak(utterance);
      };

      const voicesCheck = window.speechSynthesis.getVoices();
      if (voicesCheck.length > 0) {
        setTimeout(executeSpeech, 50);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          executeSpeech();
        };
        setTimeout(executeSpeech, 300);
      }
    }
  }, [isMuted]);

  const toggleMute = () => {
    triggerHaptic();
    setIsMuted(prev => {
      const nextMute = !prev;
      if (nextMute) {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } else {
        const challenge = LOCAL_CHALLENGES.find(c => c.id === activeChallengeId) || LOCAL_CHALLENGES[0];
        const stepObj = challenge.steps[currentStep];
        if (stepObj) {
          speakStepText(stepObj.title, stepObj.instruction || stepObj.typewriterText || "");
        }
      }
      return nextMute;
    });
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      if (audioCtxRef.current && (audioCtxRef.current.state as string) !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const claimImg = new window.Image();
    claimImg.src = claimMascotUrl;

    LOCAL_CHALLENGES.forEach((challenge) => {
      challenge.steps.forEach((st) => {
        if (st.imageUrl) {
          const img = new window.Image();
          img.src = st.imageUrl;
        }
      });
    });
  }, []);

  useEffect(() => {
    if (activeView === 'challenge-flow') {
      const challenge = LOCAL_CHALLENGES.find(c => c.id === activeChallengeId) || LOCAL_CHALLENGES[0];
      const stepObj = challenge.steps[currentStep];
      if (stepObj) {
        speakStepText(stepObj.title, stepObj.instruction || stepObj.typewriterText || "");
      }
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeView, activeChallengeId, currentStep, speakStepText]);

  const handleSelectLevel = (level: "beginner" | "intermediate" | "advanced") => {
    triggerHaptic();
    setSelectedDifficulty(level);
    setShowLevelModal(false);
  };

  const fetchPageData = useCallback(async () => {
    if (typeof window !== "undefined") {
      const cachedXp = localStorage.getItem("user_xp_cache");
      if (cachedXp) {
        setUserXp(Number(cachedXp));
      }
    }

    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 1500);

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (authError || !user) {
        if (!isOffline && typeof window !== "undefined" && navigator.onLine) {
          setIsVerified(false);
        }
        return;
      }

      if (!user.email_confirmed_at) {
        setIsVerified(false);
        return;
      }

      setIsVerified(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, username, avatar_url, xp, skill_level")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.xp !== null && profile.xp !== undefined) {
          const dbXp = profile.xp;
          setUserXp(dbXp);
          if (typeof window !== "undefined") {
            localStorage.setItem("user_xp_cache", dbXp.toString());
          }
        }
        setUserProfile({
          name: (profile.name || profile.username || "Artist").replace(/<[^>]*>?/gm, "").trim(),
          avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
        });

        if (profile.skill_level) {
          const fetchedLevel = profile.skill_level.toLowerCase() as "beginner" | "intermediate" | "advanced";
          if (["beginner", "intermediate", "advanced"].includes(fetchedLevel)) {
            setSelectedDifficulty(fetchedLevel);
          }
        }
      } else {
        setUserProfile({
          name: user.email?.split("@")[0] || "Artist",
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
        });
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
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  }, [isOffline]);

  useEffect(() => {
    fetchPageData();

    const handleXpEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (typeof customEvent.detail === 'number') {
        setUserXp(customEvent.detail);
        if (typeof window !== "undefined") {
          localStorage.setItem("user_xp_cache", customEvent.detail.toString());
        }
      }
    };

    window.addEventListener('xpUpdated', handleXpEvent);
    return () => window.removeEventListener('xpUpdated', handleXpEvent);
  }, [fetchPageData]);

  const handleReviewChallenge = async () => {
    triggerHaptic();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
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

  const handleOpenClaimModal = () => {
    triggerHaptic();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    playCelebrationSound();
    setShowClaimModal(true);
  };

  const handleConfirmClaimXP = async (challenge: LocalChallenge) => {
    triggerHaptic();
    if (claimingId === challenge.id) return;

    setClaimingId(challenge.id);
    const previousXp = userXp;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (!user || !user.email_confirmed_at) {
        if (!isOffline) {
          alert("Please verify your account to complete challenges!");
        } else {
          alert("You are offline. Please connect to the internet.");
        }
        setClaimingId(null);
        setShowClaimModal(false);
        setActiveView('hub');
        return;
      }

      const { data: newTotalXp, error: rpcError } = await supabase.rpc('complete_challenge_and_add_xp', {
        p_challenge_id: challenge.id,
        p_xp_to_add: challenge.xp
      });

      if (rpcError) {
        setUserXp(previousXp);
        console.error("RPC Error:", rpcError);
        alert("Server response slow. Please try again in a moment.");
        return;
      }

      const updatedXp = Number(newTotalXp);

      const updatedStreak = await updateActivityStreak(user.id);
      if (updatedStreak !== null) {
        window.dispatchEvent(new CustomEvent('streakUpdated', { detail: updatedStreak }));
      }

      setUserXp(updatedXp);
      if (typeof window !== "undefined") {
        localStorage.setItem("user_xp_cache", updatedXp.toString());
      }
      setCompletedChallenges((prev) => Array.from(new Set([...prev, challenge.id])));
      window.dispatchEvent(new CustomEvent('xpUpdated', { detail: updatedXp }));

      setShowClaimModal(false);
      setActiveView('hub');
    } catch (err: any) {
      setUserXp(previousXp);
      console.error("Error completing challenge:", err);
      alert("Error saving challenge completion: " + (err.message || "Unknown error"));
    } finally {
      setClaimingId(null);
    }
  };

  if (!mounted || loading) {
    return <LoadingScreen />;
  }

  if (isVerified === false && !isOffline) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 tracking-tight font-sans">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 max-w-md w-full text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Please verify your email address to complete challenges and earn XP.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              className="block w-full py-3.5 bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs rounded-2xl border-b-2 border-blue-800 transition text-center"
            >
              Log In / Verify Account
            </Link>
            <Link
              href="/dashboard"
              className="block w-full py-3 text-slate-500 font-black text-xs hover:bg-slate-50 rounded-2xl transition text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredChallenges = LOCAL_CHALLENGES.filter(
    c => selectedDifficulty ? c.difficulty === selectedDifficulty : true
  );

  const currentChallenge = LOCAL_CHALLENGES.find(c => c.id === activeChallengeId) || LOCAL_CHALLENGES[0];
  const activeStepList = currentChallenge.steps;
  const isCurrentDone = completedChallenges.includes(currentChallenge.id);
  const isLastStep = currentStep === activeStepList.length - 1;

  const desktopNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tools", path: "/tools", icon: Sparkles },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", active: true, icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const mobileGamifiedNav = [
    {
      path: "/dashboard",
      label: "Home",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/HOME.png",
      sizeClass: "w-[26px] h-[26px]"
    },
    {
      path: "/challenges",
      label: "Challenges",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/SWORD.png",
      sizeClass: "w-[26px] h-[26px]"
    },
    {
      path: "/practice",
      label: "Practice",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/PAINT.png",
      sizeClass: "w-[26px] h-[26px]"
    },
    {
      path: "/scan",
      label: "Scan",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/EYES%20NAV.png",
      sizeClass: "w-[30px] h-[30px]"
    },
    {
      path: "/leaderboard",
      label: "Leaderboard",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Glossy%20Golden%20Crown%20Icon.png",
      sizeClass: "w-[30px] h-[30px]"
    },
    {
      path: "/tools",
      label: "Tools",
      isCustomIcon: true,
      sizeClass: "w-[26px] h-[26px]"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row tracking-tight font-sans pb-24 md:pb-0 relative">
      
      {showClaimModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-1 flex flex-col items-center justify-center">
              <div className="w-32 h-32 relative flex items-center justify-center mx-auto">
                <img
                  src={claimMascotUrl}
                  alt="Otto Celebration Mascot"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>

              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
                + {currentChallenge.xp} XP
              </h2>
            </div>

            <button
              onClick={() => handleConfirmClaimXP(currentChallenge)}
              disabled={claimingId === currentChallenge.id}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-base rounded-full shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {claimingId === currentChallenge.id ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Star className="w-5 h-5 fill-white text-white" />
                  <span>Claim XP</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {showLevelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <p className="text-[11px] font-black uppercase tracking-wider text-blue-600">
              QUESTION 1 OF 1
            </p>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              What is your current skill level?
            </h2>

            <div className="flex items-center gap-3 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
              <div className="w-14 h-14 relative shrink-0">
                <Image
                  src={ottoMascotUrl}
                  alt="Otto Mascot"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-slate-600 leading-snug">
                Challenges will be customized specifically for your level!
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">YOUR LEVEL</p>
              
              <div className="flex flex-wrap gap-2.5">
                {[
                  { level: "beginner", label: "Beginner" },
                  { level: "intermediate", label: "Intermediate" },
                  { level: "advanced", label: "Advanced" },
                ].map((item) => (
                  <button
                    key={item.level}
                    onClick={() => handleSelectLevel(item.level as any)}
                    className="px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700 font-bold text-sm transition-all shadow-2xs hover:shadow-md active:scale-95 cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerHaptic();
              setIsMobileSidebarOpen(true);
            }}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          
          <Image
            src={logoUrl}
            alt="Otterleo Logo"
            width={120}
            height={48}
            style={{ width: 'auto', height: 'auto' }}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>
      </header>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Image
                  src={logoUrl}
                  alt="Otterleo Logo"
                  width={120}
                  height={48}
                  style={{ width: 'auto', height: 'auto' }}
                  className="h-10 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all border border-slate-200"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
                {desktopNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => {
                        triggerHaptic();
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                        item.active
                          ? "bg-[#2563EB] text-white border-b-4 border-blue-800"
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

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <Image
                src={userProfile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
                alt="User Avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover bg-blue-100"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-black text-[#0F172A] truncate">{userProfile?.name || "Artist"}</p>
                <p className="text-xs font-bold text-blue-600">Level {Math.floor(userXp / 100) + 1}</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Image
              src={logoUrl}
              alt="Otterleo Logo"
              width={160}
              height={64}
              style={{ width: 'auto', height: 'auto' }}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>

          <nav className="space-y-1.5">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={triggerHaptic}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                    item.active
                      ? "bg-[#2563EB] text-white border-b-4 border-blue-800"
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

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <Image
            src={userProfile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
            alt="User Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-xl object-cover bg-blue-100"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-black text-[#0F172A] truncate">{userProfile?.name || "Artist"}</p>
            <p className="text-xs font-bold text-blue-600">Level {Math.floor(userXp / 100) + 1}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-4 overflow-y-auto">
        
        <div className="hidden md:flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={triggerHaptic}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-xs hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {activeView === 'hub' ? (
          <>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-2xs flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1 pr-3">
                <h1 className="text-2xl font-black text-[#0F172A]">Challenges</h1>
                <p className="text-xs font-bold text-slate-500 max-w-xs leading-relaxed">
                  Complete step-by-step challenges, earn XP, and level up your drawing skills!
                </p>
              </div>
              <Image
                src={ottoMascotUrl}
                alt="Mascot"
                width={128}
                height={128}
                style={{ width: 'auto', height: 'auto' }}
                className="w-24 sm:w-28 h-auto object-contain shrink-0"
              />
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 pl-2">Selected Level:</span>
                {selectedDifficulty && (
                  <span className="px-3 py-1 rounded-full text-xs font-black capitalize bg-slate-900 text-white shadow-xs">
                    {selectedDifficulty}
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowLevelModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Change Level</span>
              </button>
            </div>

            <div className="space-y-4">
              {filteredChallenges.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 text-center space-y-2">
                  <p className="text-sm font-black text-slate-700">No challenges available for this level yet.</p>
                  <p className="text-xs font-bold text-slate-400">Try changing your level to explore more challenges!</p>
                </div>
              ) : (
                filteredChallenges.map((challenge) => {
                  const isDone = completedChallenges.includes(challenge.id);
                  return (
                    <div
                      key={challenge.id}
                      className="bg-white rounded-[2rem] p-5 border border-slate-200/80 shadow-2xs space-y-4"
                    >
                      {isDone && (
                        <div className="flex justify-end w-full">
                          <span className="text-[11px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        </div>
                      )}

                      <div className="w-full h-36 sm:h-44 flex items-center justify-center relative">
                        <img
                          src={challenge.previewImage}
                          alt={challenge.title}
                          className="w-full h-full object-contain hover:scale-105 transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h2 className="font-black text-slate-900 text-lg">{challenge.title}</h2>
                          <p className="text-xs font-bold text-slate-500 mt-1">
                            {challenge.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-black">
                          <span className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            +{challenge.xp} XP
                          </span>

                          <span className="px-2.5 py-1 rounded-lg text-[11px] uppercase border bg-slate-50 text-slate-600 border-slate-200">
                            {challenge.difficulty}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            triggerHaptic();
                            setActiveChallengeId(challenge.id);
                            setActiveView('challenge-flow');
                            setCurrentStep(0);
                          }}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs border-b-2 transition-all cursor-pointer ${
                            isDone
                              ? "bg-slate-800 hover:bg-slate-900 text-white border-slate-950"
                              : "bg-[#2563EB] hover:bg-blue-600 text-white border-blue-800"
                          }`}
                        >
                          <span>{isDone ? 'Review Challenge' : 'Accept Challenge 🚀'}</span>
                          {!isDone && <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-[2rem] p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-[11px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-xl">
                Step {currentStep + 1} of {activeStepList.length}
              </span>
              <button
                onClick={() => {
                  triggerHaptic();
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setActiveView('hub');
                }}
                className="text-xs font-black text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                Exit Mission
              </button>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">{activeStepList[currentStep].title}</h3>
              {activeStepList[currentStep].instruction && (
                <p className="text-xs font-bold text-slate-500 mt-0.5 leading-relaxed">
                  {activeStepList[currentStep].instruction}
                </p>
              )}
            </div>

            {isLastStep ? (
              <div className="space-y-3">
                <div className="text-center bg-indigo-50 border border-indigo-200 py-2 px-3 rounded-xl">
                  <p className="text-xs font-black text-indigo-700 uppercase tracking-wide flex items-center justify-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    You can also practice it on digital canvas
                  </p>
                </div>
                <PracticeCanvas />
              </div>
            ) : activeStepList[currentStep].typewriterText ? (
              <div key={currentStep} className="w-full flex flex-col sm:flex-row-reverse items-center justify-center gap-3 sm:gap-5 py-2 px-1">
                
                <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 flex items-center justify-center relative">
                  {activeStepList[currentStep].imageUrl && (
                    <img
                      src={activeStepList[currentStep].imageUrl!}
                      alt="Otto Mascot Step"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="relative bg-blue-50/80 border border-blue-200 rounded-2xl px-5 py-3 shadow-2xs max-w-xs text-center sm:text-left">
                  <div className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-l-[10px] border-l-blue-200 border-b-8 border-b-transparent">
                    <div className="absolute right-[1px] -top-[7px] w-0 h-0 border-t-[7px] border-t-transparent border-l-[9px] border-l-blue-50 border-b-[7px] border-b-transparent" />
                  </div>

                  <div className="block sm:hidden absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-b-[10px] border-b-blue-200 border-r-8 border-r-transparent">
                    <div className="absolute -left-[7px] top-[1px] w-0 h-0 border-l-[7px] border-l-transparent border-b-[9px] border-b-blue-50 border-r-[7px] border-r-transparent" />
                  </div>

                  <p className="text-sm font-extrabold text-blue-950">
                    <TypewriterText text={activeStepList[currentStep].typewriterText || ""} speed={50} />
                  </p>
                </div>

              </div>
            ) : (
              <div key={currentStep} className="w-full h-48 sm:h-56 flex items-center justify-center relative overflow-hidden bg-slate-50/50 rounded-2xl">
                {activeStepList[currentStep].imageUrl && (
                  <img
                    src={activeStepList[currentStep].imageUrl!}
                    alt="Tutorial step reference"
                    className="w-full h-full object-contain scale-100 transition-all duration-200"
                  />
                )}
              </div>
            )}

            {currentStep !== 0 && activeStepList[currentStep].tips?.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200/60 p-3 rounded-2xl space-y-1.5">
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
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  triggerHaptic();
                  setCurrentStep(prev => Math.max(0, prev - 1));
                }}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-xl font-black text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition cursor-pointer"
              >
                Previous
              </button>

              <button
                onClick={toggleMute}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isMuted 
                    ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100" 
                    : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                }`}
                title={isMuted ? "Unmute Voice" : "Mute Voice"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {!isLastStep ? (
                <button
                  onClick={() => {
                    triggerHaptic();
                    setCurrentStep(prev => Math.min(activeStepList.length - 1, prev + 1));
                  }}
                  className="px-5 py-2 rounded-xl font-black text-xs bg-[#2563EB] text-white hover:bg-blue-600 border-b-2 border-blue-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {isCurrentDone ? (
                    <button
                      onClick={handleReviewChallenge}
                      className="px-5 py-2 rounded-xl font-black text-xs bg-slate-800 hover:bg-slate-900 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Return to Hub</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenClaimModal}
                      className="px-5 py-2 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Finish & Claim +{currentChallenge.xp} XP</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {!isMobileSidebarOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:w-[410px] sm:mx-auto z-[399] transition-all duration-300 translate-y-0 opacity-100 pointer-events-none lg:hidden">
          <div className="w-full rounded-full border transition-colors duration-300 pointer-events-auto backdrop-blur-2xl shadow-2xl overflow-hidden bg-[#F0F6FF]/95 border-blue-100/80 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <nav className="w-full max-w-md mx-auto h-[56px] grid grid-cols-6 items-stretch justify-items-center relative px-2">
              {mobileGamifiedNav.map((item) => {
                const isActive = item.path === "/challenges";

                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    onClick={triggerHaptic}
                    aria-label={item.label}
                    className="group relative w-full h-full flex flex-col items-center justify-center focus:outline-none select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 pointer-events-auto"
                  >
                    <div className={`relative flex flex-col items-center justify-center rounded-full transition-all duration-200 ${
                      isActive ? "bg-sky-100/70 border border-[#03A9F4]/70 shadow-xs w-[48px] h-[36px]" : "w-[38px] h-[38px]"
                    }`}>
                      <div className="relative flex items-center justify-center w-full h-full">
                        {item.isCustomIcon ? (
                          <MoreHorizontal className="w-6 h-6 text-slate-700 drop-shadow-sm select-none" />
                        ) : (
                          <img
                            alt={item.label}
                            className={`${item.sizeClass} object-contain drop-shadow-sm select-none`}
                            src={item.iconUrl}
                            crossOrigin="anonymous"
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

    </div>
  );
}