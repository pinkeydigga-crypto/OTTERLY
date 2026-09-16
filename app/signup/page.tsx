"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME_MS = 60 * 1000;

const AVATARS = [
  { id: 1, name: 'Blue Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot&backgroundColor=0284c7' },
  { id: 2, name: 'Green Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=GreenBot&backgroundColor=16a34a' },
  { id: 3, name: 'Yellow Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=YellowBot&backgroundColor=eab308' },
  { id: 4, name: 'Purple Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PurpleBot&backgroundColor=9333ea' },
];

export default function SignupPage() {
  const router = useRouter();
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO%20SIGNUP.png';

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Dynamic Typewriter effect state per step
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    const fullText = step === 1 ? "Choose your avatar!" : "Create your account!";
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
    }, 70);

    return () => clearInterval(timer);
  }, [step]);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
  });

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

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'signup_lockout_until' || e.key === 'signup_attempts') {
        syncLockoutState();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncLockoutState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const triggerLockout = () => {
    const lockUntil = Date.now() + LOCKOUT_TIME_MS;
    localStorage.setItem('signup_lockout_until', lockUntil.toString());
    setLockoutSeconds(60);
    setErrorMessage('Too many attempts. Registration locked for 60 seconds.');
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStep(2);
  };

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (lockoutSeconds > 0 || loading) return;

    const cleanName = formData.name.trim();
    const cleanUsername = formData.username.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!cleanName || !cleanUsername || !cleanEmail || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    // Name validation: 2 to 8 characters
    const nameRegex = /^[a-zA-Z\s'-]{2,8}$/;
    if (!nameRegex.test(cleanName)) {
      setErrorMessage('Name must be 2 to 8 characters long and contain only letters.');
      return;
    }

    // Username validation: 2 to 8 characters (alphanumeric or underscores)
    const usernameRegex = /^[a-zA-Z0-9_]{2,8}$/;
    if (!usernameRegex.test(cleanUsername)) {
      setErrorMessage('Username must be 2-8 characters long and contain only letters, numbers, and underscores.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Password validation: minimum 8 characters
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    // Weak password check
    const commonWeakPasswords = ['password', '12345678', 'qwertyui', '00000000', '11111111', 'abcdefgh'];
    if (commonWeakPasswords.includes(password.toLowerCase()) || /^\d+$/.test(password)) {
      setErrorMessage('Password is too weak. Please use a combination of letters, numbers, or symbols.');
      return;
    }

    if (!consent) {
      setErrorMessage('You must check the consent box to agree to the Terms & Privacy Policy.');
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

    try {
      try {
        await supabase.auth.signOut();
      } catch (e) {}

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Could not create authentication session.");

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: user.id,
            name: cleanName,
            username: cleanUsername,
            email: cleanEmail,
            avatar_url: selectedAvatar,
            xp: 0,
            streak: 0,
          }
        ], { onConflict: 'id' });

      if (profileError) console.error("Profile creation error:", profileError);

      const { error: consentError } = await supabase
        .from('user_consents')
        .insert([
          {
            user_id: user.id,
            consent_given: true,
            policy_version: '1.0'
          }
        ]);

      if (consentError) console.error("Consent recording error:", consentError);

      localStorage.removeItem('signup_attempts');
      localStorage.removeItem('signup_lockout_until');

      const userData = {
        id: user.id,
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        avatar: selectedAvatar,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');

      setLoading(false);
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Signup Internal Error:", err);

      const remaining = MAX_ATTEMPTS - newAttempts;
      
      if (err?.status === 429 || err?.message?.toLowerCase().includes("rate limit")) {
        triggerLockout();
      } else {
        setErrorMessage(
          err?.message || `Unable to create account. (${remaining} attempt${remaining > 1 ? 's' : ''} left)`
        );
      }

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      
      {/* Speech Bubble Tail Pointing Left */}
      <style jsx global>{`
        .speech-bubble-tail-left {
          position: absolute;
          left: -7px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-right: 7px solid #60A5FA;
        }
        .speech-bubble-tail-left-inner {
          position: absolute;
          left: -5px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
          border-right: 6px solid #F0F7FF;
        }
      `}</style>

      {/* BACK TO HOME BUTTON */}
      <div className="absolute top-3 sm:top-4 left-4 sm:left-6 z-40">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#0F172A] font-extrabold text-xs px-4 py-2.5 rounded-2xl border-2 border-slate-200 shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#2563EB]" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="relative max-w-md w-full pt-10">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-4 border-[#2563EB] shadow-2xl relative z-10 w-full space-y-4">
          
          {/* STEP INDICATOR DOTS & BACK BUTTON */}
          <div className="flex items-center justify-between pb-1">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs font-black text-[#2563EB] hover:underline cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div className="w-10" />
            )}

            {/* STEP DOTS */}
            <div className="flex items-center justify-center gap-2 mx-auto">
              <div className={`h-2.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-[#2563EB]' : 'w-2.5 bg-slate-200'}`} />
              <div className={`h-2.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-[#2563EB]' : 'w-2.5 bg-slate-200'}`} />
            </div>

            <div className="w-10" />
          </div>

          {/* MASCOT & SPEECH BUBBLE */}
          <div className="flex items-center gap-3 my-2 pl-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md shrink-0">
              <img src={mascotUrl} alt="Otto Mascot" className="w-full h-full object-contain" />
            </div>

            <div className="relative px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black text-[#0F172A] font-sans bg-[#F0F7FF] border-[1.8px] border-[#60A5FA] shadow-sm">
              <span>{typedText}</span>
              {!isTypingComplete && (
                <span className="animate-pulse text-[#2563EB]">|</span>
              )}
              <div className="speech-bubble-tail-left"></div>
              <div className="speech-bubble-tail-left-inner"></div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-semibold">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: CHOOSE AVATAR */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3 max-w-[200px] mx-auto">
                {AVATARS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      disabled={lockoutSeconds > 0 || loading}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedAvatar(avatar.url);
                      }}
                      className={`relative aspect-square rounded-2xl p-1.5 overflow-hidden transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'ring-4 ring-[#2563EB] scale-105 shadow-md bg-blue-50 border-2 border-[#2563EB]'
                          : 'opacity-70 hover:opacity-100 border-2 border-slate-200 hover:scale-105'
                      } ${lockoutSeconds > 0 || loading ? 'opacity-40 pointer-events-none' : ''}`}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full object-contain rounded-xl pointer-events-none"
                      />
                    </button>
                  );
                })}
              </div>

              {/* BUTTON WITH DEEP SHADOW & CHEVRON ICON */}
              <button
                type="submit"
                style={{
                  backgroundColor: '#2563EB',
                  boxShadow: '0px 6px 0px #1D4ED8',
                }}
                className="w-full py-3.5 rounded-2xl font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-1 active:shadow-none transition-all mt-2 flex items-center justify-center gap-1.5"
              >
                <span>NEXT</span>
                <ChevronRight className="w-5 h-5 stroke-[3]" />
              </button>
            </form>
          )}

          {/* STEP 2: USER DETAILS FORM */}
          {step === 2 && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  disabled={lockoutSeconds > 0 || loading}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50 transition"
                />
                <p className="text-[10px] text-[#0F172A]/40 mt-1 pl-1 font-medium">
                  Must be between 2 and 8 characters long.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  disabled={lockoutSeconds > 0 || loading}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="john12"
                  className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50 transition"
                />
                <p className="text-[10px] text-[#0F172A]/40 mt-1 pl-1 font-medium">
                  Must be 2-8 characters long (letters, numbers, underscores).
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  disabled={lockoutSeconds > 0 || loading}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="youremail@gmail.com"
                  className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Set Password</label>
                <input
                  type="password"
                  name="password"
                  disabled={lockoutSeconds > 0 || loading}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50 transition"
                />
                <p className="text-[10px] text-[#0F172A]/40 mt-1 pl-1 font-medium">
                  At least 8 characters. Avoid simple sequences or weak passwords.
                </p>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  disabled={lockoutSeconds > 0 || loading}
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer disabled:opacity-50"
                />
                <label htmlFor="consent" className="text-[11px] font-medium text-[#0F172A]/70 leading-tight cursor-pointer">
                  I consent to the collection and processing of my personal data in accordance with our{' '}
                  <Link href="/terms" className="text-[#2563EB] font-bold hover:underline">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#2563EB] font-bold hover:underline">
                    Privacy Policy
                  </Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || lockoutSeconds > 0}
                style={{
                  backgroundColor: lockoutSeconds > 0 || loading ? '#94A3B8' : '#2563EB',
                  boxShadow: lockoutSeconds > 0 || loading ? 'none' : '0px 6px 0px #1D4ED8',
                }}
                className="w-full py-3.5 rounded-2xl font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-1 active:shadow-none transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {lockoutSeconds > 0 
                  ? `LOCKED (${lockoutSeconds}s)` 
                  : loading 
                  ? 'CREATING...' 
                  : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}

          <div className="pt-1 text-center">
            <p className="text-xs font-semibold text-[#0F172A]/60">
              Already have an account?{' '}
              <Link href="/login" className="text-[#2563EB] font-black hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}