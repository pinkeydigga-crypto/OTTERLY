"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 60 * 1000;

// SVG Dicebear Avatars
const AVATARS = [
  { id: 1, name: 'Blue Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot&backgroundColor=0284c7' },
  { id: 2, name: 'Green Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=GreenBot&backgroundColor=16a34a' },
  { id: 3, name: 'Yellow Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=YellowBot&backgroundColor=eab308' },
  { id: 4, name: 'Purple Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PurpleBot&backgroundColor=9333ea' },
];

export default function SignupPage() {
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

  // Check Rate Limit state on initial load & tick down timer
  useEffect(() => {
    const checkLockout = () => {
      const lockUntil = localStorage.getItem('signup_lockout_until');
      if (lockUntil) {
        const remainingTime = Math.ceil((parseInt(lockUntil, 10) - Date.now()) / 1000);
        if (remainingTime > 0) {
          setLockoutSeconds(remainingTime);
        } else {
          localStorage.removeItem('signup_lockout_until');
          localStorage.removeItem('signup_attempts');
          setLockoutSeconds(0);
        }
      }
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async () => {
    if (lockoutSeconds > 0) return;

    // Check rate limit attempts
    const attempts = parseInt(localStorage.getItem('signup_attempts') || '0', 10);
    if (attempts >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_TIME_MS;
      localStorage.setItem('signup_lockout_until', lockUntil.toString());
      setLockoutSeconds(60);
      setErrorMessage('Too many registration attempts. Please wait 60 seconds.');
      return;
    }

    if (!formData.name || !formData.username || !formData.email || !formData.password) {
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

    setLoading(true);
    setErrorMessage('');

    try {
      await supabase.auth.signOut();
      localStorage.clear();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Could not create authentication session.");

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

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      const { error: consentError } = await supabase
        .from('user_consents')
        .insert([
          {
            user_id: user.id,
            consent_given: true,
            policy_version: '1.0'
          }
        ]);

      if (consentError) {
        console.error("Consent recording error:", consentError);
      }

      // Success: Clear rate limit state
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

      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error("Signup Internal Debug:", err);

      const newAttempts = attempts + 1;
      localStorage.setItem('signup_attempts', newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_TIME_MS;
        localStorage.setItem('signup_lockout_until', lockUntil.toString());
        setLockoutSeconds(60);
        setErrorMessage('Too many failed attempts. Registration locked for 60 seconds.');
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;
        setErrorMessage(`Unable to create account. Please try again. (${remaining} attempt${remaining > 1 ? 's' : ''} left)`);
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

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-2 text-center">
                Choose Your Avatar
              </label>
              <div className="flex justify-center gap-3">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    disabled={lockoutSeconds > 0}
                    onClick={() => setSelectedAvatar(avatar.url)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-1 overflow-hidden transition-all duration-200 cursor-pointer ${
                      selectedAvatar === avatar.url
                        ? 'ring-4 ring-[#2563EB] scale-110 shadow-md bg-blue-50'
                        : 'opacity-70 hover:opacity-100 border border-slate-200 hover:scale-105'
                    } ${lockoutSeconds > 0 ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                disabled={lockoutSeconds > 0}
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Username</label>
              <input
                type="text"
                name="username"
                disabled={lockoutSeconds > 0}
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                disabled={lockoutSeconds > 0}
                value={formData.email}
                onChange={handleChange}
                placeholder="youremail@gmail.com"
                className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Set Password</label>
              <input
                type="password"
                name="password"
                disabled={lockoutSeconds > 0}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50"
              />
            </div>

            {/* Consent Checkbox with Terms & Privacy Policy Links */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="consent"
                disabled={lockoutSeconds > 0}
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
              type="button"
              onClick={handleSignup}
              disabled={loading || lockoutSeconds > 0}
              style={{ backgroundColor: '#2563EB', boxShadow: '0px 4px 0px #1D4ED8' }}
              className="w-full py-3.5 rounded-2xl font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all mt-2 disabled:opacity-50"
            >
              {lockoutSeconds > 0 
                ? `LOCKED (${lockoutSeconds}s)` 
                : loading 
                ? 'CREATING...' 
                : 'CREATE ACCOUNT'}
            </button>
          </div>

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