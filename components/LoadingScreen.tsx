"use client";

import Image from "next/image";

export default function LoadingScreen() {
  const logoUrl =
    "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/output-onlinepngtools%20(6).png";

  return (
    <div className="min-h-screen w-full bg-[#F6FAFF] flex flex-col justify-center items-center gap-3 z-50">
      {/* Browser browser ko bolta hai ki yeh image turant fetch kare */}
      <link rel="preload" as="image" href={logoUrl} />

      {/* Static Logo Image with Priority */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 relative">
        <Image
          src={logoUrl}
          alt="Otterleo Logo"
          width={112}
          height={112}
          priority
          unoptimized
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
    </div>
  );
}