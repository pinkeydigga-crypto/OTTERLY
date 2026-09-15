"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import PracticeCanvas from "@/components/PracticeCanvas";
import { Download, RotateCcw, Home } from "lucide-react";

export default function PracticePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Asset URLs
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png";
  const mascotImageUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Screenshot_15-9-2026_185944_chatgpt.com-removebg-preview.png";

  // Function to capture and download the canvas image safely
  const handleSaveDrawing = () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const canvas = containerRef.current?.querySelector("canvas");

      if (!canvas) {
        alert("Canvas element nahi mila!");
        setIsSaving(false);
        return;
      }

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `practice-drawing-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to save drawing:", error);
      alert("Drawing save karne me error aaya.");
    } finally {
      setIsSaving(false);
    }
  };

  // Canvas clear karne ke liye function
  const handleClearDrawing = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 1. Dashboard / Home Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-black text-sm hover:bg-slate-100 transition-all shadow-xs"
          >
            <Home className="w-4 h-4 text-blue-600" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* 2. Top Header Card (Logo on top left + Mascot on right side banner layout) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          
          {/* Top Logo */}
          <div className="flex justify-start w-full">
            <img
              src={logoUrl}
              alt="Otterleo Logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          {/* Text Left & Mascot Right Layout */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Text on Left */}
            <div className="text-center sm:text-left flex-1 space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                Practice Canvas
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-md">
                Draw whatever you like and download your artwork directly.
              </p>
            </div>

            {/* Mascot on Right */}
            <div className="w-28 sm:w-36 h-auto shrink-0 flex items-center justify-center">
              <img
                src={mascotImageUrl}
                alt="Mascot"
                className="w-full h-auto object-contain drop-shadow-md"
                crossOrigin="anonymous"
              />
            </div>
          </div>

        </div>

        {/* 3. Main Practice Canvas */}
        <div ref={containerRef} className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <PracticeCanvas />
        </div>

        {/* 4. Action Controls Below Canvas (Reset & Download) */}
        <div className="flex items-center justify-end gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={handleClearDrawing}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:bg-slate-100 border border-slate-200 font-bold rounded-xl text-sm transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <button
            onClick={handleSaveDrawing}
            disabled={isSaving}
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-black rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isSaving ? "Saving..." : "Download"}
          </button>
        </div>

      </div>
    </main>
  );
}