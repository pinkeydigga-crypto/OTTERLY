"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { RefreshCw } from "lucide-react";

export default function LoadingScreen() {
  const [showRefresh, setShowRefresh] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRefresh(true);
    }, 5000); // 5 seconds timer

    return () => clearTimeout(timer);
  }, []);

  const logoUrl =
    "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/output-onlinepngtools%20(6).png";

  return (
    <div className="min-h-screen w-full bg-[#F6FAFF] flex flex-col justify-center items-center gap-3 z-50 fixed inset-0">
      {/* Static Logo Image with High Priority */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 relative">
        <Image
          src={logoUrl}
          alt="Otterleo Logo"
          width={112}
          height={112}
          priority={true}
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          sizes="(max-width: 640px) 96px, 112px"
          className="w-full h-full object-contain drop-shadow-md rounded-2xl"
        />
      </div>

      {/* Brand Name Text */}
      <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
        Otterleo
      </h1>

      {/* Animated 3 Dots Only */}
      <div className="flex items-center gap-1.5 mt-1">
        <span className="w-2.5 h-2.5 bg-[#2563EB] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2.5 h-2.5 bg-[#2563EB] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2.5 h-2.5 bg-[#2563EB] rounded-full animate-bounce"></span>
      </div>

      {/* Show Refresh option after 5 seconds if stuck */}
      {showRefresh && (
        <div className="flex flex-col items-center gap-2 mt-4 animate-in fade-in duration-300">
          <p className="text-xs font-bold text-slate-400">
            Taking longer than expected?
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Page</span>
          </button>
        </div>
      )}
    </div>
  );
}