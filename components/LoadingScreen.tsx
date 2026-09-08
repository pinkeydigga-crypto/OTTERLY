"use client";

export default function LoadingScreen() {
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20loading%20screen.png";

  return (
    <div className="min-h-screen w-full bg-[#F6FAFF] flex flex-col justify-center items-center gap-3 z-50">
      {/* Static Logo Image */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 relative">
        <img
          src={logoUrl}
          alt="Otterly Logo"
          className="w-full h-full object-contain drop-shadow-md rounded-2xl"
        />
      </div>

      {/* Brand Name Text */}
      <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
        Otterly
      </h1>

      {/* Animated 3 Dots Only */}
      <div className="flex items-center gap-1.5 mt-1">
        <span className="w-2.5 h-2.5 bg-[#2563EB] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2.5 h-2.5 bg-[#2563EB] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2.5 h-2.5 bg-[#2563EB] rounded-full animate-bounce"></span>
      </div>
    </div>
  );
}