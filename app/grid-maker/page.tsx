"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LoadingScreen from "@/components/LoadingScreen";
import {
  ArrowLeft,
  Grid,
  Upload,
  RotateCcw,
  Download,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Slash,
} from "lucide-react";

export default function GridMakerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(5);
  const [gridColor, setGridColor] = useState<string>("#000000"); // Default Black
  const [lineWidth, setLineWidth] = useState<number>(2); // Default 2px
  const [opacity, setOpacity] = useState<number>(80);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDiagonals, setShowDiagonals] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);

  // Download rate limit tracking refs
  const downloadTimesRef = useRef<number[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Authentication Check
  const checkAuth = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        if (typeof window !== "undefined") {
          localStorage.clear();
        }
        router.push("/login");
        return;
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setZoom(100);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Render Grid on Canvas (Fixed Exact Rows & Columns Calculation)
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    // Clear and draw uploaded image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    // Draw Grid Overlay
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = opacity / 100;

      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;

      // Draw Vertical Lines (Exact Cols)
      for (let i = 1; i < cols; i++) {
        const x = Math.round(i * cellWidth);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw Horizontal Lines (Exact Rows)
      for (let j = 1; j < rows; j++) {
        const y = Math.round(j * cellHeight);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Diagonals inside each cell if enabled
      if (showDiagonals) {
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const startX = i * cellWidth;
            const startY = j * cellHeight;
            const endX = startX + cellWidth;
            const endY = startY + cellHeight;

            // Top-Left to Bottom-Right
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Bottom-Left to Top-Right
            ctx.beginPath();
            ctx.moveTo(startX, endY);
            ctx.lineTo(endX, startY);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
    }
  }, [image, rows, cols, gridColor, lineWidth, opacity, showGrid, showDiagonals]);

  useEffect(() => {
    if (!loading) {
      drawCanvas();
    }
  }, [drawCanvas, loading]);

  // Download Image with Rate Limiting
  const handleDownload = () => {
    const now = Date.now();
    const recentDownloads = downloadTimesRef.current.filter(
      (time) => now - time < 60000
    );

    if (recentDownloads.length >= 5) {
      alert("Download limit reached! Please wait a minute before downloading again.");
      return;
    }

    downloadTimesRef.current = [...recentDownloads, now];

    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const link = document.createElement("a");
    link.download = "grid-reference.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Clear/Reset to Defaults
  const handleClear = () => {
    setImage(null);
    setRows(5);
    setCols(5);
    setGridColor("#000000");
    setLineWidth(2);
    setOpacity(80);
    setShowDiagonals(false);
    setZoom(100);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F6FAFF] p-3 sm:p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Top Navigation Header */}
        <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 overflow-hidden">
            <Grid className="w-5 h-5 text-blue-600 shrink-0" />
            <h1 className="text-sm sm:text-lg font-black text-slate-900 truncate">
              Grid Maker Tool
            </h1>
          </div>
        </div>

        {/* Main Workspace */}
        {!image ? (
          /* Empty Upload State */
          <div className="bg-white p-6 sm:p-12 rounded-3xl border-2 border-dashed border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Grid className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Upload Reference Image
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Select an image to overlay customizable grid lines for drawing.
              </p>
            </div>
            <div>
              <label className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl cursor-pointer shadow-md transition">
                <Upload className="w-4 h-4" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          /* Active State: Image on Top, Controls Below */
          <div className="flex flex-col gap-4">
            {/* Canvas Preview Box */}
            <div
              ref={containerRef}
              className="bg-white p-2 sm:p-4 rounded-2xl border border-slate-200 shadow-xs overflow-auto flex items-center justify-center min-h-[300px] order-1"
            >
              <div
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
                className="transition-transform duration-150"
              >
                <canvas ref={canvasRef} className="max-w-full h-auto rounded-xl shadow-xs block" />
              </div>
            </div>

            {/* Controls Panel */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 order-2">
              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Rows Control */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Rows:</span>
                    <span className="text-blue-600 font-black">{rows}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Columns Control */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Columns:</span>
                    <span className="text-blue-600 font-black">{cols}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={cols}
                    onChange={(e) => setCols(Number(e.target.value))}
                    className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Opacity Control */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Opacity:</span>
                    <span className="text-blue-600 font-black">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Line Width Control */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Line Width:</span>
                    <span className="text-blue-600 font-black">{lineWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons & Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Grid Color Picker */}
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600">Color:</span>
                    <input
                      type="color"
                      value={gridColor}
                      onChange={(e) => setGridColor(e.target.value)}
                      className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
                    />
                  </div>

                  {/* Toggle Grid */}
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      showGrid ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{showGrid ? "Hide Grid" : "Show Grid"}</span>
                  </button>

                  {/* Toggle Diagonals */}
                  <button
                    onClick={() => setShowDiagonals(!showDiagonals)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      showDiagonals ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Slash className="w-4 h-4" />
                    <span>Diagonals</span>
                  </button>
                </div>

                {/* Zoom & Utility Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                    <button
                      onClick={() => setZoom((z) => Math.max(50, z - 10))}
                      className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-black text-slate-700 px-1">{zoom}%</span>
                    <button
                      onClick={() => setZoom((z) => Math.min(200, z + 10))}
                      className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}