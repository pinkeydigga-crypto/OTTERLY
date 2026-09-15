"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  Scan,
  Trophy,
  Compass,
  Award,
  User,
  Settings,
  PanelLeft,
  X,
  Flame,
} from "lucide-react";

interface SidebarProps {
  userName: string;
  userXp: number;
  userStreak: number;
  avatarUrl: string;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  userName,
  userXp,
  userStreak,
  avatarUrl,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const logoUrl =
    "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png";

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Achievements", path: "/achievements", icon: Award },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
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
            alt="Otterleo Logo"
            className="h-14 w-auto object-contain max-h-16"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200/80 px-3 py-1 rounded-full text-orange-600 font-extrabold text-xs">
          <Flame className="w-4 h-4 fill-orange-500 stroke-orange-500" />
          <span>{userStreak}</span>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Sidebar */}
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
                  alt="Otterleo Logo"
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
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                        isActive
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
                src={avatarUrl}
                alt="User Avatar"
                className="w-10 h-10 rounded-xl object-cover bg-blue-100"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-black text-[#0F172A] truncate">
                  {userName}
                </p>
                <p className="text-xs font-bold text-blue-600">
                  Level {Math.floor(userXp / 100) + 1}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Permanent Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="Otterleo Logo"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                    isActive
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
            src={avatarUrl}
            alt="User Avatar"
            className="w-10 h-10 rounded-xl object-cover bg-blue-100"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-black text-[#0F172A] truncate">
              {userName}
            </p>
            <p className="text-xs font-bold text-blue-600">
              Level {Math.floor(userXp / 100) + 1}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}