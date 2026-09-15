"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
  });

  // Lockout Checker Logic
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

  // Interval & Cross-Tab Sync
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

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Prevent action if locked or already loading
    if (lockoutSeconds > 0 || loading) return;

    // 2. Client-side Form Validation
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (!consent) {
      setErrorMessage('You must check the consent box to agree to the Terms & Privacy Policy.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const cleanUsername = formData.username.trim();
    if (!usernameRegex.test(cleanUsername)) {
      setErrorMessage('Username must be 3-20 characters long and contain only letters, numbers, and underscores.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // 3. Attempt Tracking Logic (Increment BEFORE API call to catch spam)
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

    // Check if limit exceeded (3 Attempts)
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

      // Supabase Signup Request
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Could not create authentication session.");

      // Insert Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: user.id,
            name: formData.name.trim(),
            username: cleanUsername,
            email: cleanEmail,
            avatar_url: selectedAvatar,
            xp: 0,
            streak: 0,
          }
        ], { onConflict: 'id' });

      if (profileError) console.error("Profile creation error:", profileError);

      // Record Consent
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

      // Clear attempt trackers on success
      localStorage.removeItem('signup_attempts');
      localStorage.removeItem('signup_lockout_until');

      const userData = {
        id: user.id,
        name: formData.name.trim(),
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
      
      // Friendly message handling (Supabase rate limit or standard errors)
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
      <div className="relative max-w-md w-full pt-16">
        
        {/* Mascot */}
        <div className="absolute -top-6 left-6 z-20 w-28 h-28 sm:w-32 sm:h-32 drop-shadow-md pointer-events-none">
          <img src={mascotUrl} alt="Otto Mascot" className="w-full h-full object-contain" />
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border-4 border-[#2563EB] shadow-2xl relative z-10 w-full space-y-3 pt-14">
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
              Join <span className="text-[#2563EB]">Otto</span>
            </h2>
            <p className="text-xs font-semibold text-[#0F172A]/60">Choose your avatar & create account</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-2 text-center">
                Choose Your Avatar
              </label>
              <div className="flex justify-center gap-3">
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
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-1 overflow-hidden transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'ring-4 ring-[#2563EB] scale-110 shadow-md bg-blue-50 border-2 border-[#2563EB]'
                          : 'opacity-70 hover:opacity-100 border border-slate-200 hover:scale-105'
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
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                disabled={lockoutSeconds > 0 || loading}
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Username</label>
              <input
                type="text"
                name="username"
                disabled={lockoutSeconds > 0 || loading}
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50 transition"
              />
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
                boxShadow: lockoutSeconds > 0 || loading ? 'none' : '0px 4px 0px #1D4ED8',
              }}
              className="w-full py-3.5 rounded-2xl font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {lockoutSeconds > 0 
                ? `LOCKED (${lockoutSeconds}s)` 
                : loading 
                ? 'CREATING...' 
                : 'CREATE ACCOUNT'}
            </button>
          </form>

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