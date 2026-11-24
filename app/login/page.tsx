"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';

const MAX_ATTEMPTS = 4;
const LOCKOUT_TIME_MS = 5 * 60 * 1000;
const THROTTLE_COOLDOWN_MS = 3000;

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

export default function LoginPage() {
  const router = useRouter();
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO%20SIGNUP.png';

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSignupOption, setShowSignupOption] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [isThrottled, setIsThrottled] = useState(false);

  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const processingAuthUserIdRef = useRef<string | null>(null);
  const completedAuthUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fullText = "Welcome Back to Otto!";
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
  }, []);

  const handleMissingProfileSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
    } catch (e) {}

    processingAuthUserIdRef.current = null;
    completedAuthUserIdRef.current = null;

    setLoading(false);
    setGoogleLoading(false);
    setShowSignupOption(true);
    setErrorMessage("No account found. Please sign up first.");
  }, []);

  const completeLoginAfterAuth = useCallback(
    async (user: any) => {
      const cleanEmail = (user?.email || '').trim().toLowerCase();
      if (!user?.id || !cleanEmail) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error(`Could not check profile: ${profileError.message}`);
      }

      if (profile) {
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('login_lockout_until');

        const safeEmailParam = encodeURIComponent(cleanEmail);
        const userData = {
          id: user.id,
          email: cleanEmail,
          name: profile?.name || cleanEmail.split('@')[0],
          avatar:
            profile?.avatar_url ||
            `https://ui-avatars.com/api/?name=${safeEmailParam}&background=2563EB&color=fff`,
          skill_level: profile?.skill_level || 'beginner',
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        router.push('/dashboard');
      } else {
        await handleMissingProfileSignOut();
      }
    },
    [handleMissingProfileSignOut, router]
  );

  const runAuthSyncOnce = useCallback(
    async (user: any, onStart?: () => void) => {
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
      onStart?.();

      try {
        await completeLoginAfterAuth(user);
        completedAuthUserIdRef.current = userId;
      } finally {
        if (processingAuthUserIdRef.current === userId) {
          processingAuthUserIdRef.current = null;
        }
      }
    },
    [completeLoginAfterAuth]
  );

  useEffect(() => {
    let active = true;

    async function syncGoogleLoginReturn() {
      try {
        const user = await getCurrentAuthUser();
        if (!active || !user) return;
        await runAuthSyncOnce(user, () => setGoogleLoading(true));
      } catch (err: any) {
        if (!active) return;
        console.error("Google login sync error:", err);
        setGoogleLoading(false);
        setShowSignupOption(false);
        setErrorMessage(err?.message || "Could not verify your account. Please try again.");
      }
    }

    void syncGoogleLoginReturn();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;

      if (event === 'SIGNED_OUT') {
        processingAuthUserIdRef.current = null;
        completedAuthUserIdRef.current = null;
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user?.email) {
        try {
          await runAuthSyncOnce(session.user, () => setGoogleLoading(true));
        } catch (err: any) {
          if (!active) return;
          setGoogleLoading(false);
          setShowSignupOption(false);
          setErrorMessage(err?.message || "Could not verify your account.");
        }
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [runAuthSyncOnce]);

  const lastClickTimeRef = useRef<number>(0);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const checkLockout = () => {
      const lockUntil = localStorage.getItem('login_lockout_until');
      if (lockUntil) {
        const remainingTime = Math.ceil((parseInt(lockUntil, 10) - Date.now()) / 1000);
        if (remainingTime > 0) {
          setLockoutSeconds(remainingTime);
        } else {
          localStorage.removeItem('login_lockout_until');
          localStorage.removeItem('login_attempts');
          setLockoutSeconds(0);
        }
      }
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleGoogleLogin = async () => {
    if (lockoutSeconds > 0 || loading || googleLoading) return;

    setGoogleLoading(true);
    setErrorMessage('');
    setShowSignupOption(false);

    try {
      const redirectTo =
        typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setErrorMessage(err?.message || "Unable to continue with Google.");
      setGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (lockoutSeconds > 0 || loading || googleLoading) return;

    const now = Date.now();
    if (now - lastClickTimeRef.current < THROTTLE_COOLDOWN_MS) {
      return;
    }
    lastClickTimeRef.current = now;
    setIsThrottled(true);

    const attempts = parseInt(localStorage.getItem('login_attempts') || '0', 10);
    if (attempts >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_TIME_MS;
      localStorage.setItem('login_lockout_until', lockUntil.toString());
      setLockoutSeconds(LOCKOUT_TIME_MS / 1000);
      setShowSignupOption(false);
      setErrorMessage('Too many failed attempts. Login locked for 5 minutes.');
      setIsThrottled(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setShowSignupOption(false);

    const cleanEmail = formData.email.trim().toLowerCase();

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        processingAuthUserIdRef.current = authData.user.id;
        completedAuthUserIdRef.current = authData.user.id;
        await completeLoginAfterAuth(authData.user);
      }
    } catch (err: any) {
      console.error("Internal Auth Debug:", err);

      const newAttempts = attempts + 1;
      localStorage.setItem('login_attempts', newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_TIME_MS;
        localStorage.setItem('login_lockout_until', lockUntil.toString());
        setLockoutSeconds(LOCKOUT_TIME_MS / 1000);
        setErrorMessage('Too many failed attempts. Login locked for 5 minutes.');
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;
        setErrorMessage(`Invalid email or password. (${remaining} attempt${remaining > 1 ? 's' : ''} left)`);
      }

      setLoading(false);
      setTimeout(() => setIsThrottled(false), THROTTLE_COOLDOWN_MS);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">

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

        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-4 border-[#2563EB] shadow-2xl relative z-10 w-full space-y-4">

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
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-semibold space-y-2">
              <p>{errorMessage}</p>
              {showSignupOption && (
                <div>
                  <Link
                    href="/signup"
                    className="inline-block px-4 py-1.5 rounded-full bg-[#2563EB] text-white font-black text-[11px] uppercase tracking-wider hover:opacity-95"
                  >
                    Create an Account
                  </Link>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading || lockoutSeconds > 0}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-[#CBD5E1] hover:border-[#2563EB] shadow-sm font-bold text-sm text-[#0F172A] cursor-pointer active:translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2.5"
          >
            <GoogleColorIcon />
            <span>
              {lockoutSeconds > 0
                ? `LOCKED (${formatTime(lockoutSeconds)})`
                : googleLoading
                ? 'CONNECTING...'
                : 'Continue with Google'}
            </span>
          </button>

          <div className="relative flex items-center py-0.5">
            <div className="flex-grow border-t border-slate-200" />
            <span className="mx-3 text-[10px] font-black uppercase tracking-wider text-slate-400">or</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4 pt-0.5">
            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                disabled={lockoutSeconds > 0}
                autoComplete="off"
                value={formData.email}
                onChange={(e) => {
                  handleChange(e);
                  setErrorMessage('');
                  setShowSignupOption(false);
                }}
                placeholder="youremail@gmail.com"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                disabled={lockoutSeconds > 0}
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => {
                  handleChange(e);
                  setErrorMessage('');
                  setShowSignupOption(false);
                }}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading || lockoutSeconds > 0 || isThrottled}
              style={{ backgroundColor: '#2563EB', boxShadow: '0px 6px 0px #1D4ED8' }}
              className="w-full py-3.5 rounded-2xl font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-1 active:shadow-none transition-all mt-2 disabled:opacity-50"
            >
              {lockoutSeconds > 0
                ? `LOCKED (${formatTime(lockoutSeconds)})`
                : loading
                ? 'LOGGING IN...'
                : isThrottled
                ? 'PLEASE WAIT...'
                : 'LOG IN'}
            </button>
          </form>

          <div className="pt-1 text-center">
            <p className="text-xs font-semibold text-[#0F172A]/60">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#2563EB] font-black hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}