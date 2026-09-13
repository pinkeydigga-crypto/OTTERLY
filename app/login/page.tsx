"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 60 * 1000;

export default function LoginPage() {
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO%20SIGNUP.png';

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

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

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (lockoutSeconds > 0) return;

    const attempts = parseInt(localStorage.getItem('login_attempts') || '0', 10);
    if (attempts >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_TIME_MS;
      localStorage.setItem('login_lockout_until', lockUntil.toString());
      setLockoutSeconds(60);
      setErrorMessage('Too many attempts. Please try again after 60 seconds.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const cleanEmail = formData.email.trim().toLowerCase();

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('login_lockout_until');

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        const userData = {
          id: authData.user.id,
          email: cleanEmail,
          name: profile?.name || cleanEmail.split('@')[0],
          username: profile?.username || cleanEmail.split('@')[0],
          avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${cleanEmail}&background=2563EB&color=fff`,
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        window.location.assign('/dashboard');
      }
    } catch (err: any) {
      console.error("Internal Auth Debug:", err);

      const newAttempts = attempts + 1;
      localStorage.setItem('login_attempts', newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_TIME_MS;
        localStorage.setItem('login_lockout_until', lockUntil.toString());
        setLockoutSeconds(60);
        setErrorMessage('Too many failed attempts. Login locked for 60 seconds.');
      } else {
        // GENERIC ERROR: Internal error leak rokne ke liye single secure message
        const remaining = MAX_ATTEMPTS - newAttempts;
        setErrorMessage(`Invalid email or password. (${remaining} attempt${remaining > 1 ? 's' : ''} left)`);
      }

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      <div className="relative max-w-md w-full pt-16">
        
        <div className="absolute -top-6 left-6 z-20 w-28 h-28 sm:w-32 sm:h-32 drop-shadow-md pointer-events-none">
          <img src={mascotUrl} alt="Otto Mascot" className="w-full h-full object-contain" />
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border-4 border-[#2563EB] shadow-2xl relative z-10 w-full space-y-4 pt-14">
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
              Welcome Back to <span className="text-[#2563EB]">Otto</span>
            </h2>
            <p className="text-xs font-semibold text-[#0F172A]/60">Enter your email & password to log in</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-center font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                disabled={lockoutSeconds > 0}
                autoComplete="off"
                value={formData.email}
                onChange={handleChange}
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
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A] disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || lockoutSeconds > 0}
              style={{ backgroundColor: '#2563EB', boxShadow: '0px 4px 0px #1D4ED8' }}
              className="w-full py-3.5 rounded-2xl font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all mt-2 disabled:opacity-50"
            >
              {lockoutSeconds > 0 
                ? `LOCKED (${lockoutSeconds}s)` 
                : loading 
                ? 'LOGGING IN...' 
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