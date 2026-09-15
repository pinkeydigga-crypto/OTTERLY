"use client";

import React, { useRef, useState, useEffect } from "react";
import PracticeCanvas from  "@/components/PracticeCanvas";
import { Download, RotateCcw } from "lucide-react";

export default function PracticePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Function to capture and download the canvas image
  const handleSaveDrawing = () => {
    setIsSaving(true);
    try {
      // Container ke andar real <canvas> element ko find karein
      const canvas = containerRef.current?.querySelector("canvas");

      if (!canvas) {
        alert("Canvas element nahi mila!");
        setIsSaving(false);
        return;
      }

      // High quality PNG image URL extract karein
      const dataUrl = canvas.toDataURL("image/png");

      // Download link trigger karein
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

  // Canvas clear karne ke liye optional function
  const handleClearDrawing = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Agar white background fill rakhna ho:
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section with Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              Practice Canvas
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Draw whatever you like and download your artwork directly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Clear Button */}
            <button
              onClick={handleClearDrawing}
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:bg-slate-100 border border-slate-200 font-bold rounded-xl text-sm transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>

            {/* Save Drawing Button */}
            <button
              onClick={handleSaveDrawing}
              disabled={isSaving}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-xl text-sm transition-all shadow-md active:scale-95"
            >
              <Download className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Drawing"}
            </button>
          </div>
        </div>

        {/* Practice Canvas Component Wrapper */}
        <div ref={containerRef} className="w-full">
          <PracticeCanvas />
        </div>
      </div>
    </main>
  );
}