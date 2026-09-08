"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const cleanEmail = formData.email.trim().toLowerCase();

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        await supabase.from('profiles').upsert([
          {
            id: authData.user.id,
            name: formData.name,
            username: formData.username,
            email: cleanEmail,
            avatar_url: selectedAvatar,
          },
        ]);
      }

      const userData = { ...formData, email: cleanEmail, avatar: selectedAvatar };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      <div className="relative max-w-md w-full pt-16">
        
        {/* Mascot Always Top-Left on Phone & Laptop */}
        <div className="absolute -top-6 left-6 z-20 w-28 h-28 sm:w-32 sm:h-32 drop-shadow-md pointer-events-none">
          <img src={mascotUrl} alt="Otto Mascot" className="w-full h-full object-contain" />
        </div>

        {/* Form Card */}
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

          <form onSubmit={handleSubmit} className="space-y-3">
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
                    <img src={avatar.url} alt={avatar.name} className="w-full h-full object-contain rounded-xl" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-wider mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                required
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
                required
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
                required
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
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-medium text-[#0F172A]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#2563EB', boxShadow: '0px 4px 0px #1D4ED8' }}
              className="w-full py-3.5 rounded-2xl font-black text-base text-white uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all mt-2 disabled:opacity-50"
            >
              {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
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