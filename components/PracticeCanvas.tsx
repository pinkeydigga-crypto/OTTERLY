"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { RotateCcw, Pencil, Highlighter, Undo2, Redo2 } from "lucide-react";

type ToolType = "pencil" | "highlighter";

const HIGHLIGHTER_COLORS = [
  { name: "Grey", value: "rgba(107, 114, 128, 0.4)" },
  { name: "White", value: "rgba(255, 255, 255, 0.8)" },
  { name: "Blue", value: "rgba(59, 130, 246, 0.4)" },
  { name: "Red", value: "rgba(239, 68, 68, 0.4)" },
  { name: "Yellow", value: "rgba(234, 179, 8, 0.4)" },
];

export default function PracticeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(3);
  const [activeTool, setActiveTool] = useState<ToolType>("pencil");
  const [highlighterColor, setHighlighterColor] = useState(HIGHLIGHTER_COLORS[2].value);

  // History Stack for Undo & Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Drawing Path Points Ref to prevent overlapping patches
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  const baseImageDataRef = useRef<ImageData | null>(null);

  // Save State to History Stack
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, imageData];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Init Canvas Dimensions
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill Solid White Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([imageData]);
    setHistoryIndex(0);
  }, []);

  useEffect(() => {
    initCanvas();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
  }, [initCanvas]);

  // Undo Function
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  // Redo Function
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  // Accurate Coordinate Helper
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Start Drawing Stroke
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if ("touches" in e && e.cancelable) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Store base canvas state before drawing current stroke
    baseImageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const coords = getCoordinates(e);
    currentPathRef.current = [coords];
    setIsDrawing(true);
  };

  // Render Whole Stroke Continuously (Fixes Overlap Patches)
  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if ("touches" in e && e.cancelable) {
      e.preventDefault();
    }

    if (!isDrawing || !baseImageDataRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCoordinates(e);
    currentPathRef.current.push(coords);

    const points = currentPathRef.current;
    if (points.length < 2) return;

    // Restore base image before redraw to avoid opacity stacking/patches
    ctx.putImageData(baseImageDataRef.current, 0, 0);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    if (activeTool === "pencil") {
      // REAL PENCIL FEEL
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 0.85; // Natural Graphite Translucency
    } else {
      // NO-PATCH SMOOTH HIGHLIGHTER
      ctx.strokeStyle = highlighterColor;
      ctx.lineWidth = lineWidth * 4.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 1.0;
    }

    ctx.stroke();
    ctx.globalAlpha = 1.0; // Reset
  };

  // Finish Stroke & Commit
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      currentPathRef.current = [];
      baseImageDataRef.current = null;
      saveState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-full overflow-hidden">
      {/* Big Sketchbook Canvas Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-2xl bg-white border-4 border-slate-200 rounded-[2rem] p-2 sm:p-3 shadow-md"
      >
        {/* Sketchbook Top Rings */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 opacity-30 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
        </div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[380px] sm:h-[450px] bg-white rounded-[1.5rem] cursor-crosshair touch-none border border-slate-100 block"
        />

        {/* OTTERLEO LOGO BRANDING AT CANVAS FOOTER */}
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none opacity-90 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <img
            src="https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png"
            alt="Otterleo Logo"
            className="h-5 w-auto object-contain"
          />
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-2.5 w-full max-w-2xl p-3 bg-slate-50 rounded-2xl border border-slate-200">
        
        {/* Tool Switcher, Undo/Redo & Clear Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
          
          {/* Pencil & Highlighter Tool Buttons */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setActiveTool("pencil")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${
                activeTool === "pencil"
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" /> Pencil
            </button>
            <button
              type="button"
              onClick={() => setActiveTool("highlighter")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${
                activeTool === "highlighter"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Highlighter className="w-3.5 h-3.5" /> Highlighter
            </button>
          </div>

          {/* Size Slider */}
          <div className="flex items-center gap-2 grow max-w-[150px] min-w-[100px]">
            <span className="text-[11px] font-black text-slate-500 shrink-0">Size:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Undo & Redo Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Clear Button */}
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1 text-xs font-black bg-white text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-slate-200 transition shrink-0 ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>

        {/* Highlighter Color Palette */}
        {activeTool === "highlighter" && (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 w-full">
            <span className="text-[11px] font-black text-slate-500 shrink-0">Highlighter Color:</span>
            <div className="flex items-center gap-2 shrink-0">
              {HIGHLIGHTER_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  title={c.name}
                  onClick={() => setHighlighterColor(c.value)}
                  style={{ backgroundColor: c.value.replace(/0\.\d+/, "0.9") }}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                    highlighterColor === c.value
                      ? "border-slate-800 scale-110 shadow-sm"
                      : "border-slate-300 hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}