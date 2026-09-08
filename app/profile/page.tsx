"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/components/LoadingScreen";
import {
  LayoutDashboard,
  Swords,
  Scan,
  Trophy,
  Compass,
  Award,
  User,
  Settings,
  Flame,
  Star,
  PanelLeft,
  X,
  Check,
  Save,
  LogOut,
} from "lucide-react";

// Signup wale hi same avatars list
const AVATARS = [
  { id: 1, name: 'Blue Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot&backgroundColor=0284c7' },
  { id: 2, name: 'Green Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=GreenBot&backgroundColor=16a34a' },
  { id: 3, name: 'Yellow Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=YellowBot&backgroundColor=eab308' },
  { id: 4, name: 'Purple Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PurpleBot&backgroundColor=9333ea' },
];

interface Profile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  xp: number;
  streak: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otterly%20logo.png";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Editable Form States
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setName(data.name || "");
        setUsername(data.username || "");
        setSelectedAvatar(data.avatar_url || AVATARS[0].url);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      // 1. Supabase Profiles Table Update
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          username: username.trim(),
          avatar_url: selectedAvatar,
        })
        .eq("id", profile.id);

      if (error) throw error;

      // 2. Update Local State
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: name.trim(),
              username: username.trim(),
              avatar_url: selectedAvatar,
            }
          : null
      );

      // 3. Update Local Storage for Session consistency
      const localUserData = localStorage.getItem("user");
      if (localUserData) {
        const parsed = JSON.parse(localUserData);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsed,
            name: name.trim(),
            username: username.trim(),
            avatar: selectedAvatar,
          })
        );
      }

      setMessage({ type: "success", text: "Profile updated successfully! It will reflect everywhere." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const userXp = profile?.xp || 0;
  const userStreak = profile?.streak || 0;

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Profile", path: "/profile", active: true, icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight pb-20 md:pb-0 font-sans">
      
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
          
          <img
            src={logoUrl}
            alt="Otterly Logo"
            className="h-14 w-auto object-contain max-h-16"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200/80 px-3 py-1 rounded-full text-orange-600 font-extrabold text-xs">
          <Flame className="w-4 h-4 fill-orange-500 stroke-orange-500" />
          <span>{userStreak}</span>
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
                <img
                  src={logoUrl}
                  alt="Otterly Logo"
                  className="h-14 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
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
                          ? "bg-[#2563EB] text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
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
              <img
                src={selectedAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
                alt="User Avatar"
                className="w-10 h-10 rounded-xl object-cover bg-blue-100"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-black text-[#0F172A] truncate">{name || "Artist"}</p>
                <p className="text-xs font-bold text-blue-600">Level {Math.floor(userXp / 100) + 1}</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="Otterly Logo"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                    item.active
                      ? "bg-[#2563EB] text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
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
          <img
            src={selectedAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=BlueBot"}
            alt="User Avatar"
            className="w-10 h-10 rounded-xl object-cover bg-blue-100"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-black text-[#0F172A] truncate">{name || "Artist"}</p>
            <p className="text-xs font-bold text-blue-600">Level {Math.floor(userXp / 100) + 1}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto w-full">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A]">Your Profile</h1>
            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">Manage your personal details & avatar</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 text-red-600 border border-red-200 font-black text-xs hover:bg-red-100 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* User Stats Card Header */}
        <div className="bg-white rounded-[2.5rem] p-6 border-2 border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-blue-50 border-4 border-[#2563EB] p-1 shadow-md overflow-hidden flex items-center justify-center">
              <img src={selectedAvatar} alt="Current Avatar" className="w-full h-full object-contain rounded-2xl" />
            </div>
          </div>

          <div className="text-center sm:text-left space-y-2 flex-1">
            <h2 className="text-2xl font-black text-[#0F172A]">{name || "User Name"}</h2>
            <p className="text-xs font-bold text-slate-400">@{username || "username"}</p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-2">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-amber-700 font-extrabold text-xs">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                <span>{userXp} XP</span>
              </div>

              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl text-orange-600 font-extrabold text-xs">
                <Flame className="w-4 h-4 fill-orange-500 stroke-orange-500" />
                <span>{userStreak} Day Streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-6">
          
          {message && (
            <div
              className={`p-4 rounded-2xl text-xs font-black border ${
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-3">
              Change Avatar
            </label>
            <div className="grid grid-cols-4 gap-3 max-w-md">
              {AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.url)}
                    className={`relative rounded-2xl p-2 border-2 transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? "border-[#2563EB] bg-blue-50 ring-2 ring-[#2563EB] scale-105 shadow-md"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50 hover:scale-100"
                    }`}
                  >
                    <img src={avatar.url} alt={avatar.name} className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-xl" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-[#2563EB] text-white p-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-bold text-[#0F172A]"
            />
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 focus:outline-none focus:border-[#2563EB] text-sm font-bold text-[#0F172A]"
            />
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-2">
              Email Address (Cannot be changed)
            </label>
            <input
              type="email"
              disabled
              value={profile?.email || ""}
              className="w-full px-4 py-3 rounded-2xl bg-slate-100 border-2 border-slate-200 text-sm font-bold text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#2563EB] text-white font-black text-sm uppercase tracking-wider border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "SAVING..." : "SAVE CHANGES"}</span>
          </button>
        </form>

      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex justify-around items-center z-40 shadow-lg">
        {[
          { name: "Home", path: "/dashboard", icon: LayoutDashboard },
          { name: "Scan", path: "/scan", icon: Scan },
          { name: "Challenges", path: "/challenges", icon: Swords },
          { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
          { name: "Profile", path: "/profile", active: true, icon: User },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-black ${
                item.active ? "text-[#2563EB]" : "text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}