"use client";

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
  const [consent, setConsent] = useState(false); // DPDP explicit consent state

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async () => {
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    // DPDP Compliance: Explicit, unambiguous consent check
    if (!consent) {
      setErrorMessage('You must consent to the Privacy Policy and Terms to create an account.');
      return;
    }

    // Security: Strict Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Security: Username Sanitization & Validation (Alphanumeric and underscores only, 3-20 chars)
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
      // 1. HARD LOGOUT & CLEAR LOCAL STORAGE
      await supabase.auth.signOut();
      localStorage.clear();

      // 2. Supabase Auth Create User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Could not create authentication session.");

      // 3. Directly Insert Unique Profile record into Supabase Table
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

      // 4. Store active user credentials locally
      const userData = {
        id: user.id,
        name: formData.name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        avatar: selectedAvatar,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');

      // 5. Force Navigation
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error("Signup Catch Error:", err);
      setErrorMessage(err.message || 'Signup failed. Please try again.');
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
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
              Join <span className="text-[#2563EB]">Otto</span>
            </h2>
            <p className="text-xs font-semibold text-[#0F172A]/60">Choose your avatar & create account</p>
            
            {/* Security & Data Responsibility Badge */}
            <div className="pt-1">
              <span className="inline-block bg-blue-50 text-[#2563EB] text-[10px] font-extrabold px-3 py-1 rounded-full border border-blue-100 tracking-wide">
                🔒 Your data, our responsibility — 100% Secure & Compliant
              </span>
            </div>
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
                    onClick={() => setSelectedAvatar(avatar.url)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-1 overflow-hidden transition-all duration-200 cursor-pointer ${
                      selectedAvatar === avatar.url
                        ? 'ring-4 ring-[#2563EB] scale-110 shadow-md bg-blue-50'
                        : 'opacity-70 hover:opacity-100 border border-slate-200 hover:scale-105'
                    }`}
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
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="youremail@gmail.com"
                className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Set Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A]"
              />
            </div>

            {/* DPDP Compliance: Explicit Consent Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
              />
              <label htmlFor="consent" className="text-[11px] font-medium text-[#0F172A]/70 leading-tight cursor-pointer">
                I consent to the collection and processing of my personal data in accordance with the{' '}
                <Link href="/privacy" className="text-[#2563EB] font-bold hover:underline">
                  Privacy Policy
                </Link>.
              </label>
            </div>

            <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              style={{ backgroundColor: '#2563EB', boxShadow: '0px 4px 0px #1D4ED8' }}
              className="w-full py-3.5 rounded-2xl font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all mt-2 disabled:opacity-50"
            >
              {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
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