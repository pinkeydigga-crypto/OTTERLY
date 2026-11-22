"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import OttoChat from "@/components/OttoChat";
import {
  LayoutDashboard,
  Swords,
  Scan,
  Trophy,
  Compass,
  User,
  Settings,
  PanelLeft,
  Sparkles,
  MoreHorizontal,
  X,
} from "lucide-react";

const CHAT_NAV_ICON_URL =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/chatnav.png";

export default function OttoChatPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const logoUrl =
    "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tools", path: "/tools", icon: Sparkles },
    { name: "Otto Chat", path: "/otto-chat", active: true, customIconUrl: CHAT_NAV_ICON_URL },
    { name: "Challenges", path: "/challenges", icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const mobileGamifiedNav = [
    {
      path: "/dashboard",
      label: "Home",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/HOME.png",
      sizeClass: "w-[26px] h-[26px]",
    },
    {
      path: "/challenges",
      label: "Challenges",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/SWORD.png",
      sizeClass: "w-[26px] h-[26px]",
    },
    {
      path: "/otto-chat",
      label: "Otto Chat",
      iconUrl: CHAT_NAV_ICON_URL,
      sizeClass: "w-[26px] h-[26px]",
    },
    {
      path: "/scan",
      label: "Scan",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/EYES%20NAV.png",
      sizeClass: "w-[30px] h-[30px]",
    },
    {
      path: "/leaderboard",
      label: "Leaderboard",
      iconUrl:
        "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Glossy%20Golden%20Crown%20Icon%20(2)%20(1).png",
      sizeClass: "w-[30px] h-[30px]",
    },
    {
      path: "/tools",
      label: "Tools",
      isCustomIcon: true,
      sizeClass: "w-[26px] h-[26px]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col md:flex-row tracking-tight pb-24 md:pb-0 font-sans overflow-x-hidden">
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
          <Image
            src={logoUrl}
            alt="Otterleo Logo"
            width={120}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Image
                  src={logoUrl}
                  alt="Otterleo Logo"
                  width={120}
                  height={48}
                  className="h-10 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all border border-slate-200"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                        item.active
                          ? "bg-[#2563EB] text-white border-b-4 border-blue-800"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {item.customIconUrl ? (
                        <img
                          src={item.customIconUrl}
                          alt={item.name}
                          className="w-5 h-5 object-contain shrink-0"
                        />
                      ) : (
                        Icon && <Icon className="w-5 h-5 shrink-0" />
                      )}
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Image
              src={logoUrl}
              alt="Otterleo Logo"
              width={160}
              height={64}
              className="h-14 sm:h-16 w-auto object-contain"
              priority
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
                      ? "bg-[#2563EB] text-white border-b-4 border-blue-800"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.customIconUrl ? (
                    <img
                      src={item.customIconUrl}
                      alt={item.name}
                      className="w-5 h-5 object-contain shrink-0"
                    />
                  ) : (
                    Icon && <Icon className="w-5 h-5 shrink-0" />
                  )}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 flex items-center justify-center w-full">
        <OttoChat />
      </main>

      {/* Mobile Bottom Dock */}
      {!isMobileSidebarOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:w-[410px] sm:mx-auto z-[399] pointer-events-none lg:hidden">
          <div className="w-full rounded-full border pointer-events-auto backdrop-blur-2xl shadow-2xl overflow-hidden bg-[#F0F6FF]/95 border-blue-100/80 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <nav className="w-full max-w-md mx-auto h-[56px] grid grid-cols-6 items-stretch justify-items-center relative px-2">
              {mobileGamifiedNav.map((item) => {
                const isActive = item.path === "/otto-chat";

                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    aria-label={item.label}
                    className="group relative w-full h-full flex flex-col items-center justify-center focus:outline-none select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 pointer-events-auto"
                  >
                    <div
                      className={`relative flex flex-col items-center justify-center rounded-full transition-all duration-200 ${
                        isActive
                          ? "bg-sky-100/70 border border-[#03A9F4]/70 shadow-xs w-[48px] h-[36px]"
                          : "w-[38px] h-[38px]"
                      }`}
                    >
                      <div className="relative flex items-center justify-center w-full h-full">
                        {item.isCustomIcon ? (
                          <MoreHorizontal className="w-6 h-6 text-slate-700 drop-shadow-sm select-none" />
                        ) : (
                          <img
                            alt={item.label}
                            className={`${item.sizeClass} object-contain drop-shadow-sm select-none`}
                            src={item.iconUrl}
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}