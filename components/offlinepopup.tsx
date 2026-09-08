"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflinePopup() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md animate-bounce">
      <div className="bg-slate-900/95 text-white border-2 border-red-500/40 shadow-2xl backdrop-blur-md px-5 py-3.5 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-100">
            Offline — reconnect to load or save
          </span>
        </div>
      </div>
    </div>
  );
}