"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, User, Mail, Lock } from 'lucide-react';

const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME_MS = 60 * 1000;

const BLOCKED_EXACT_WORDS = new Set([
  "porn", "porno", "pornhub", "xxx", "nsfw", "hentai", "erotic", "nude", "nudes", "naked",
  "boob", "boobs", "booby", "boobies", "tits", "titties", "tit", "vagina", "penis", "dick",
  "cock", "pussy", "asshole", "bitch", "bastard", "slut", "whore", "fuck", "fucker", "fucking",
  "shit", "cunt", "cum", "jizz", "blowjob", "handjob", "anal", "anus", "rape", "rapist",
  "molest", "pedophile", "pedo", "chutiya", "bc", "mc", "bhosdike", "gaand", "gandu", "randi",
  "lauda", "lund", "chut",
  "daaru", "daru", "sharab", "sharaab", "alcohol", "liquor", "booze", "beer", "vodka",
  "whiskey", "whisky", "rum", "gin", "tequila", "wine", "scotch", "brandy", "drunk",
  "peeyakkad", "bewda", "bevda", "tharra", "countryliquor",
  "drug", "drugs", "nasha", "nashedi", "ganja", "weed", "marijuana", "charas", "hash",
  "hashish", "cocaine", "coke", "heroin", "smack", "brownsugar", "meth", "amphetamine",
  "ecstasy", "molly", "lsd", "acid", "opium", "afeem", "bhang", "ketamine", "xanax",
  "stoney", "stoner", "high", "junkie", "addict", "cartel", "dealer",
]);

const BLOCKED_PHRASES = [
  "teri maa ki",
  "teri ma ki",
  "terimaaki",
  "terimaki",
];

const BLOCKED_SUBSTRINGS = [
  "porn", "xxx", "hentai", "boob", "vagina", "penis", "blowjob", "handjob",
  "chutiya", "bhosdi", "gaand", "gandu", "randi", "lauda", "lund", "chut",
  "terimaaki", "terimaki", "daaru", "daru", "sharab", "sharaab", "alcohol",
  "liquor", "booze", "vodka", "whiskey", "whisky", "tequila", "cocaine",
  "heroin", "marijuana", "charas", "hashish", "ganja", "nashedi", "brownsugar",
  "afeem", "bhang", "ketamine", "pedophile",
];

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isAppropriateName(value: string): boolean {
  const normalized = normalizeText(value);
  if (!normalized) return false;

  const compact = normalized.replace(/\s+/g, "");
  const tokens = normalized.split(" ").filter(Boolean);

  const hasExactTokenMatch = tokens.some((token) => BLOCKED_EXACT_WORDS.has(token));
  const hasCompactExactMatch = BLOCKED_EXACT_WORDS.has(compact);
  const hasPhraseMatch = BLOCKED_PHRASES.some(
    (phrase) => normalized.includes(phrase) || compact.includes(phrase.replace(/\s+/g, ""))
  );
  const hasSubstringMatch = BLOCKED_SUBSTRINGS.some(
    (bad) => normalized.includes(bad) || compact.includes(bad)
  );

  return !(hasExactTokenMatch || hasCompactExactMatch || hasPhraseMatch || hasSubstringMatch);
}

const AVATARS = [
  { id: 1, name: "Blue Bot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot&backgroundColor=0284c7" },
  { id: 2, name: "Green Bot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=GreenBot&backgroundColor=16a34a" },
  { id: 3, name: "Yellow Bot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=YellowBot&backgroundColor=eab308" },
  { id: 4, name: "Purple Bot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=PurpleBot&backgroundColor=9333ea" },
  { id: 5, name: "Lorelei Girl 1", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=LoreleiLady1&backgroundColor=f1f5f9" },
  { id: 6, name: "Lorelei Girl 2", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=LoreleiLady2&backgroundColor=f1f5f9" },
  { id: 7, name: "Lorelei Boy 1", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=LoreleiBoy1&backgroundColor=f1f5f9" },
  { id: 8, name: "Lorelei Boy 2", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=LoreleiBoy2&backgroundColor=f1f5f9" },
];

const SKILL_LEVELS = [
  { id: "beginner", label: "Beginner", desc: "Just starting out with drawing" },
  { id: "intermediate", label: "Intermediate", desc: "Know basic sketching & shapes" },
  { id: "advanced", label: "Advanced", desc: "Looking for challenges & mastery" },
];

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

async function getCurrentAuthUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session?.user?.email) {
    return sessionData.session.user;
  }

  const { data: userData, error } = await supabase.auth.getUser();
  if (!error && userData?.user?.email) {
    return userData.user;
  }

  return null;
}

function GoogleColorIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.5-1.14 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.54-5.17 3.54-8.88Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.01c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.21v3.11C3.18 21.31 7.26 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.61H1.21A11.98 11.98 0 0 0 0 12c0 1.93.46 3.75 1.21 5.39l4.07-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.26 0 3.18 2.69 1.21 6.61l4.07 3.11c.95-2.85 3.6-4.97 6.72-4.97Z"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/onboard%20(1).png';
  const introGifUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/hloi%20(1).gif';

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [introDone, setIntroDone] = useState(false);
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
  const [skillLevel, setSkillLevel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showLoginLink, setShowLoginLink] = useState(false);
  const [consent, setConsent] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const processingAuthUserIdRef = useRef<string | null>(null);
  const completedAuthUserIdRef = useRef<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const triggerSoundAndHaptic = () => {
    if (typeof window !== "undefined") {
      try {
        if ("vibrate" in navigator) {
          navigator.vibrate(20);
        }
        const audio = new Audio("https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/click.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  };

  useEffect(() => {
    let fullText = "Hi there! I'm Otto";
    if (step === 2) {
      fullText = "Sign up with Google or email to begin!";
    } else if (step === 3) {
      fullText = "Enter your email and password.";
    } else if (step === 4) {
      fullText = "Choose your avatar!";
    } else if (step === 5) {
      if (skillLevel === 'beginner') {
        fullText = "That's great! We will help you build your sketching skills from scratch.";
      } else if (skillLevel === 'intermediate') {
        fullText = "Awesome! Let's sharpen your drawing techniques and shading.";
      } else if (skillLevel === 'advanced') {
        fullText = "Incredible! Let's master professional art together.";
      } else {
        fullText = "What's your drawing level?";
      }
    } else if (step === 6) {
      fullText = "What should Otto call you?";
    }

    setTypedText('');
    setIsTypingComplete(false);
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, 45);

    return () => clearInterval(timer);
  }, [step, skillLevel]);

  const findExistingProfile = useCallback(async (userId: string, email: string) => {
    const { data: byId, error: idErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (idErr) throw idErr;
    if (byId) return byId;

    if (email) {
      const { data: byEmail, error: emailErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (emailErr) throw emailErr;
      if (byEmail) return byEmail;
    }

    return null;
  }, []);

  const redirectToDashboardWithProfile = useCallback(
    (profile: any, userId: string, email: string) => {
      try {
        localStorage.removeItem('signup_attempts');
        localStorage.removeItem('signup_lockout_until');
      } catch (e) {}

      const cleanEmail = (profile?.email || email || '').trim().toLowerCase();
      const safeEmailParam = encodeURIComponent(cleanEmail);
      const userData = {
        id: profile?.id || userId,
        name: profile?.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar:
          profile?.avatar_url ||
          `https://ui-avatars.com/api/?name=${safeEmailParam}&background=2563EB&color=fff`,
        skill_level: profile?.skill_level || 'beginner',
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      setLoading(false);
      router.push('/dashboard');
    },
    [router]
  );

  const handleAuthenticatedSignupUser = useCallback(
    async (user: any) => {
      const cleanEmail = (user?.email || '').trim().toLowerCase();
      if (!user?.id || !cleanEmail) return;

      setIntroDone(true);
      setLoading(true);
      setErrorMessage('');
      setShowLoginLink(false);

      const existing = await findExistingProfile(user.id, cleanEmail);
      if (existing) {
        redirectToDashboardWithProfile(existing, user.id, cleanEmail);
        return;
      }

      const googleName =
        typeof user?.user_metadata?.full_name === 'string'
          ? user.user_metadata.full_name.trim()
          : typeof user?.user_metadata?.name === 'string'
          ? user.user_metadata.name.trim()
          : '';

      if (googleName && /^[a-zA-Z\s'-]{2,15}$/.test(googleName) && isAppropriateName(googleName)) {
        setFormData((prev) => ({ ...prev, name: prev.name || googleName }));
      }

      setAuthUser({ id: user.id, email: cleanEmail });
      setLoading(false);
      setStep(4);
    },
    [findExistingProfile, redirectToDashboardWithProfile]
  );

  const runSignupAuthOnce = useCallback(
    async (user: any) => {
      const userId = user?.id;
      const cleanEmail = (user?.email || '').trim().toLowerCase();
      if (!userId || !cleanEmail) return;

      if (
        processingAuthUserIdRef.current === userId ||
        completedAuthUserIdRef.current === userId
      ) {
        return;
      }

      processingAuthUserIdRef.current = userId;
      try {
        await handleAuthenticatedSignupUser(user);
        completedAuthUserIdRef.current = userId;
      } finally {
        if (processingAuthUserIdRef.current === userId) {
          processingAuthUserIdRef.current = null;
        }
      }
    },
    [handleAuthenticatedSignupUser]
  );

  useEffect(() => {
    let active = true;

    async function checkAuthReturn() {
      try {
        const user = await getCurrentAuthUser();
        if (!active || !user) return;
        await runSignupAuthOnce(user);
      } catch (err: any) {
        if (!active) return;
        console.error("Signup session check error:", err);
        setIntroDone(true);
        setLoading(false);
        setErrorMessage(err?.message || "Could not verify your account after sign up.");
      }
    }

    void checkAuthReturn();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;

      if (event === 'SIGNED_OUT') {
        processingAuthUserIdRef.current = null;
        completedAuthUserIdRef.current = null;
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user?.email) {
        try {
          await runSignupAuthOnce(session.user);
        } catch (err: any) {
          if (!active) return;
          setIntroDone(true);
          setLoading(false);
          setErrorMessage(err?.message || "Could not verify your account.");
        }
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [runSignupAuthOnce]);

  const syncLockoutState = useCallback(() => {
    try {
      const lockUntil = localStorage.getItem('signup_lockout_until');
      if (lockUntil) {
        const parsedTime = parseInt(lockUntil, 10);
        if (!isNaN(parsedTime)) {
          const remainingTime = Math.ceil((parsedTime - Date.now()) / 1000);
          if (remainingTime > 0) {
            setLockoutSeconds(remainingTime);
            return;
          }
        }
      }
      localStorage.removeItem('signup_lockout_until');
      localStorage.removeItem('signup_attempts');
      setLockoutSeconds(0);
    } catch (e) {
      setLockoutSeconds(0);
    }
  }, []);

  useEffect(() => {
    syncLockoutState();
    const timer = setInterval(syncLockoutState, 1000);
    return () => clearInterval(timer);
  }, [syncLockoutState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const triggerLockout = () => {
    const lockUntil = Date.now() + LOCKOUT_TIME_MS;
    localStorage.setItem('signup_lockout_until', lockUntil.toString());
    setLockoutSeconds(60);
    setShowLoginLink(false);
    setErrorMessage('Too many attempts. Please wait 60 seconds and try again.');
  };

  const handleGoogleSignupStart = async () => {
    triggerSoundAndHaptic();
    if (lockoutSeconds > 0 || loading) return;

    setLoading(true);
    setErrorMessage('');
    setShowLoginLink(false);

    try {
      const redirectTo =
        typeof window !== 'undefined' ? `${window.location.origin}/signup` : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Google OAuth start error:", err);
      setErrorMessage(err?.message || "Could not start Google sign up.");
      setLoading(false);
    }
  };

  const handleEmailSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerSoundAndHaptic();

    if (lockoutSeconds > 0 || loading) return;

    const cleanEmail = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!cleanEmail || !password || !confirmPassword) {
      setErrorMessage('Please fill in email, password, and confirm password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    let attempts = 0;
    try {
      attempts = parseInt(localStorage.getItem('signup_attempts') || '0', 10);
      if (isNaN(attempts)) attempts = 0;
    } catch (e) {
      attempts = 0;
    }

    const newAttempts = attempts + 1;
    try {
      localStorage.setItem('signup_attempts', newAttempts.toString());
    } catch (e) {}

    if (newAttempts >= MAX_ATTEMPTS) {
      triggerLockout();
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setShowLoginLink(false);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (authError) {
        const msg = authError.message?.toLowerCase() || '';
        if (msg.includes('already registered') || msg.includes('already exists')) {
          setErrorMessage("Account already created. Please log in.");
          setShowLoginLink(true);
          setLoading(false);
          return;
        }
        throw authError;
      }

      const user = authData.user;
      if (!user) {
        throw new Error("Could not create authentication session.");
      }

      if (Array.isArray(user.identities) && user.identities.length === 0) {
        setErrorMessage("Account already created. Please log in.");
        setShowLoginLink(true);
        setLoading(false);
        return;
      }

      processingAuthUserIdRef.current = user.id;
      completedAuthUserIdRef.current = user.id;
      await handleAuthenticatedSignupUser(user);
    } catch (err: any) {
      console.error("Email signup error:", err);
      const remaining = MAX_ATTEMPTS - newAttempts;

      if (err?.status === 429 || err?.message?.toLowerCase().includes("rate limit")) {
        triggerLockout();
      } else {
        setErrorMessage(
          err?.message || `Unable to sign up. (${remaining} attempt${remaining > 1 ? 's' : ''} left)`
        );
      }

      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerSoundAndHaptic();

    if (loading) return;

    if (!skillLevel) {
      setErrorMessage('Please select your drawing level.');
      return;
    }

    const cleanName = formData.name.trim();
    if (!cleanName) {
      setErrorMessage('Please enter your name.');
      return;
    }

    const nameRegex = /^[a-zA-Z\s'-]{2,15}$/;
    if (!nameRegex.test(cleanName)) {
      setErrorMessage('Name must be 2 to 15 characters long and contain only letters.');
      return;
    }

    if (!isAppropriateName(cleanName)) {
      setErrorMessage('Please choose a clean name without inappropriate, offensive, alcohol, or drug words.');
      return;
    }

    if (!consent) {
      setErrorMessage('Please check the consent box to agree to the Terms & Privacy Policy.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setShowLoginLink(false);

    try {
      const currentUser = authUser || (await getCurrentAuthUser());
      const verifiedEmail = (currentUser?.email || '').trim().toLowerCase();

      if (!currentUser?.id || !verifiedEmail) {
        throw new Error("Session expired before saving profile. Please sign up again.");
      }

      const existing = await findExistingProfile(currentUser.id, verifiedEmail);
      if (existing) {
        redirectToDashboardWithProfile(existing, currentUser.id, verifiedEmail);
        return;
      }

      const todayStr = getLocalDateString();

      const { data: createdProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: currentUser.id,
            name: cleanName,
            email: verifiedEmail,
            avatar_url: selectedAvatar,
            skill_level: skillLevel,
            xp: 0,
            streak: 1,
            last_login: todayStr,
          }
        ])
        .select('*')
        .maybeSingle();

      if (profileError) {
        if (profileError.code === '23505') {
          const raceProfile = await findExistingProfile(currentUser.id, verifiedEmail);
          if (raceProfile) {
            redirectToDashboardWithProfile(raceProfile, currentUser.id, verifiedEmail);
            return;
          }
        }
        throw new Error(`Profile could not be saved: ${profileError.message}`);
      }

      if (!createdProfile?.id) {
        throw new Error("Profile was not created. Please check database permissions and try again.");
      }

      const { error: consentError } = await supabase
        .from('user_consents')
        .insert([
          {
            user_id: currentUser.id,
            consent_given: true,
            policy_version: '1.0'
          }
        ]);

      if (consentError) {
        throw new Error(`Consent could not be saved: ${consentError.message}`);
      }

      redirectToDashboardWithProfile(createdProfile, currentUser.id, verifiedEmail);
    } catch (err: any) {
      console.error("Onboarding completion error:", err);
      setErrorMessage(err?.message || "Unable to complete sign up.");
      setLoading(false);
    }
  };

  const showIntroScreen = step === 1 && !introDone;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">

      <link rel="preload" href={introGifUrl} as="image" />
      <img src={introGifUrl} alt="" className="hidden" aria-hidden="true" />

      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-100/70 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-64 h-64 bg-indigo-100/60 rounded-full blur-2xl pointer-events-none" />

      <style jsx global>{`
        .speech-bubble-tail-bottom {
          position: absolute;
          left: 50%;
          bottom: -7px;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid #60A5FA;
        }
        .speech-bubble-tail-bottom-inner {
          position: absolute;
          left: 50%;
          bottom: -5px;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 7px solid #F0F7FF;
        }
        .speech-bubble-tail-left {
          position: absolute;
          left: -7px;
          top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-right: 7px solid #60A5FA;
        }
        .speech-bubble-tail-left-inner {
          position: absolute;
          left: -5px;
          top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
          border-right: 6px solid #60A5FA;
        }
      `}</style>

      {!showIntroScreen && (
        <div className="absolute top-3 sm:top-4 left-4 sm:left-6 z-40">
          <Link
            href="/"
            onClick={triggerSoundAndHaptic}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#0F172A] font-extrabold text-xs px-4 py-2.5 rounded-full border-2 border-slate-200 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span>Back to Home</span>
          </Link>
        </div>
      )}

      <div className="relative max-w-md w-full pt-4">

        {showIntroScreen ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-6 z-10 relative">
            <div className="relative px-6 py-3.5 rounded-2xl text-center text-base sm:text-lg font-black text-[#0F172A] font-sans bg-[#F0F7FF] border-[1.8px] border-[#60A5FA] shadow-md max-w-xs">
              <span>
                {typedText.includes("I'm Otto") ? (
                  <>
                    {typedText.split("I'm Otto")[0]}
                    <span className="text-[#2563EB]">I&apos;m Otto</span>
                  </>
                ) : (
                  typedText
                )}
              </span>
              {!isTypingComplete && (
                <span className="animate-pulse text-[#2563EB]">|</span>
              )}
              <div className="speech-bubble-tail-bottom"></div>
              <div className="speech-bubble-tail-bottom-inner"></div>
            </div>

            <div className="w-full max-w-[280px] aspect-square flex items-center justify-center overflow-hidden">
              <img
                src={introGifUrl}
                alt="Otto Animation"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>

            {isTypingComplete && (
              <button
                type="button"
                onClick={() => {
                  triggerSoundAndHaptic();
                  setIntroDone(true);
                  setStep(2);
                }}
                style={{
                  backgroundColor: '#2563EB',
                  boxShadow: '0px 6px 0px #1D4ED8',
                }}
                className="w-full py-4 rounded-full font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-1 active:shadow-none transition-all animate-fadeIn"
              >
                CONTINUE
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-4 border-[#2563EB] shadow-2xl relative z-10 w-full space-y-4">

            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  triggerSoundAndHaptic();
                  setErrorMessage('');
                  setShowLoginLink(false);
                  if (step === 3) {
                    setStep(2);
                  } else if (step === 2) {
                    setIntroDone(false);
                    setStep(1);
                  } else if (step > 4) {
                    setStep((prev) => (prev - 1) as 4 | 5 | 6);
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-black text-[#2563EB] hover:underline cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center justify-center gap-2 mx-auto">
                <div className={`h-2.5 rounded-full transition-all duration-300 ${step <= 3 ? 'w-8 bg-[#2563EB]' : 'w-2.5 bg-slate-200'}`} />
                <div className={`h-2.5 rounded-full transition-all duration-300 ${step === 4 ? 'w-8 bg-[#2563EB]' : 'w-2.5 bg-slate-200'}`} />
                <div className={`h-2.5 rounded-full transition-all duration-300 ${step === 5 ? 'w-8 bg-[#2563EB]' : 'w-2.5 bg-slate-200'}`} />
                <div className={`h-2.5 rounded-full transition-all duration-300 ${step === 6 ? 'w-8 bg-[#2563EB]' : 'w-2.5 bg-slate-200'}`} />
              </div>

              <div className="w-10" />
            </div>

            <div className="flex items-center gap-3 my-2 px-1">
              <div className="w-24 h-20 sm:w-28 sm:h-24 drop-shadow-md shrink-0">
                <img src={mascotUrl} alt="Otto Mascot" className="w-full h-full object-contain scale-110" />
              </div>

              <div className="relative px-4 py-2.5 rounded-2xl text-sm sm:text-base font-black text-[#0F172A] font-sans bg-[#F0F7FF] border-[1.8px] border-[#60A5FA] shadow-sm flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping shrink-0"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#2563EB]">OTTO</span>
                </div>
                <span>{typedText}</span>
                {!isTypingComplete && (
                  <span className="animate-pulse text-[#2563EB]">|</span>
                )}
                <div className="speech-bubble-tail-left"></div>
                <div className="speech-bubble-tail-left-inner"></div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-semibold space-y-2">
                <p>{errorMessage}</p>
                {showLoginLink && (
                  <div>
                    <Link
                      href="/login"
                      onClick={triggerSoundAndHaptic}
                      className="inline-block px-4 py-1.5 rounded-full bg-[#2563EB] text-white font-black text-[11px] uppercase tracking-wider hover:opacity-95"
                    >
                      Go to Log In
                    </Link>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleSignupStart}
                  disabled={loading || lockoutSeconds > 0}
                  className="w-full py-3.5 px-4 rounded-full bg-white hover:bg-slate-50 border-2 border-[#CBD5E1] hover:border-[#2563EB] shadow-sm font-bold text-sm sm:text-base text-[#0F172A] cursor-pointer active:translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                >
                  <GoogleColorIcon />
                  <span>
                    {lockoutSeconds > 0
                      ? `LOCKED (${lockoutSeconds}s)`
                      : loading
                      ? 'CONNECTING...'
                      : 'Continue with Google'}
                  </span>
                </button>

                <div className="relative flex items-center py-0.5">
                  <div className="flex-grow border-t border-slate-200" />
                  <span className="mx-3 text-[10px] font-black uppercase tracking-wider text-slate-400">or</span>
                  <div className="flex-grow border-t border-slate-200" />
                </div>

                <button
                  type="button"
                  disabled={loading || lockoutSeconds > 0}
                  onClick={() => {
                    triggerSoundAndHaptic();
                    setErrorMessage('');
                    setShowLoginLink(false);
                    setStep(3);
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-slate-50 border border-slate-300 font-bold text-xs text-[#0F172A] cursor-pointer active:translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign up with email</span>
                </button>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleEmailSignupSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      disabled={lockoutSeconds > 0 || loading}
                      value={formData.email}
                      onChange={(e) => {
                        handleChange(e);
                        setErrorMessage('');
                        setShowLoginLink(false);
                      }}
                      placeholder="youremail@gmail.com"
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all font-medium text-[#0F172A] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Set Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      name="password"
                      disabled={lockoutSeconds > 0 || loading}
                      value={formData.password}
                      onChange={(e) => {
                        handleChange(e);
                        setErrorMessage('');
                        setShowLoginLink(false);
                      }}
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all font-medium text-[#0F172A] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Confirm Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      name="confirmPassword"
                      disabled={lockoutSeconds > 0 || loading}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        handleChange(e);
                        setErrorMessage('');
                        setShowLoginLink(false);
                      }}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all font-medium text-[#0F172A] disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || lockoutSeconds > 0}
                  style={{
                    backgroundColor: lockoutSeconds > 0 || loading ? '#94A3B8' : '#2563EB',
                    boxShadow: lockoutSeconds > 0 || loading ? 'none' : '0px 6px 0px #1D4ED8',
                  }}
                  className="w-full py-3.5 rounded-full font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-1 active:shadow-none transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {lockoutSeconds > 0
                    ? `LOCKED (${lockoutSeconds}s)`
                    : loading
                    ? 'VERIFYING...'
                    : 'CONTINUE'}
                </button>
              </form>
            )}

            {step === 4 && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-4 gap-3.5 max-w-md mx-auto">
                  {AVATARS.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.url;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => {
                          triggerSoundAndHaptic();
                          setSelectedAvatar(avatar.url);
                          setErrorMessage('');
                        }}
                        className={`relative aspect-square rounded-2xl p-1.5 overflow-hidden transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'ring-4 ring-[#2563EB] scale-105 shadow-md bg-blue-50 border-2 border-[#2563EB]'
                            : 'opacity-80 hover:opacity-100 border-2 border-slate-200 hover:scale-105'
                        }`}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-contain scale-125 rounded-xl pointer-events-none"
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerSoundAndHaptic();
                    setErrorMessage('');
                    setStep(5);
                  }}
                  style={{
                    backgroundColor: '#2563EB',
                    boxShadow: '0px 6px 0px #1D4ED8',
                  }}
                  className="w-full py-3.5 rounded-full font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-1 active:shadow-none transition-all mt-2"
                >
                  NEXT
                </button>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3 pt-1">
                <div className="space-y-2.5">
                  {SKILL_LEVELS.map((lvl) => {
                    const isSelected = skillLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => {
                          triggerSoundAndHaptic();
                          setSkillLevel(lvl.id);
                          setErrorMessage('');
                        }}
                        className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                          isSelected
                            ? 'border-[#2563EB] bg-[#F0F7FF] shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#2563EB]" />
                        )}

                        <div className={`pl-1 ${isSelected ? 'pl-3' : ''} min-w-0`}>
                          <p className={`text-xs sm:text-sm font-black ${isSelected ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                            {lvl.label}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500">
                            {lvl.desc}
                          </p>
                        </div>

                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-slate-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerSoundAndHaptic();
                    if (!skillLevel) {
                      setErrorMessage('Please select your drawing level to continue.');
                      return;
                    }
                    setErrorMessage('');
                    setStep(6);
                  }}
                  style={{
                    backgroundColor: '#2563EB',
                    boxShadow: '0px 6px 0px #1D4ED8',
                  }}
                  className="w-full py-3.5 rounded-full font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-1 active:shadow-none transition-all mt-2"
                >
                  NEXT
                </button>
              </div>
            )}

            {step === 6 && (
              <form onSubmit={handleCompleteOnboarding} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Your Name</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      name="name"
                      disabled={loading}
                      value={formData.name}
                      onChange={(e) => {
                        handleChange(e);
                        setErrorMessage('');
                      }}
                      placeholder="John Doe"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all font-medium text-[#0F172A] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    disabled={loading}
                    checked={consent}
                    onChange={(e) => {
                      triggerSoundAndHaptic();
                      setConsent(e.target.checked);
                      setErrorMessage('');
                    }}
                    className="mt-0.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer disabled:opacity-50"
                  />
                  <label htmlFor="consent" className="text-[11px] font-medium text-[#0F172A]/70 leading-tight cursor-pointer">
                    I consent to the collection and processing of my personal data in accordance with our{' '}
                    <Link href="/terms" onClick={triggerSoundAndHaptic} className="text-[#2563EB] font-bold hover:underline">
                      Terms &amp; Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" onClick={triggerSoundAndHaptic} className="text-[#2563EB] font-bold hover:underline">
                      Privacy Policy
                    </Link>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#94A3B8' : '#2563EB',
                    boxShadow: loading ? 'none' : '0px 6px 0px #1D4ED8',
                  }}
                  className="w-full py-3.5 rounded-full font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-1 active:shadow-none transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'SAVING...' : 'SUBMIT'}
                </button>
              </form>
            )}

            <div className="pt-1 text-center">
              <p className="text-xs font-semibold text-[#0F172A]/60">
                Already have an account?{' '}
                <Link href="/login" onClick={triggerSoundAndHaptic} className="text-[#2563EB] font-black hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}