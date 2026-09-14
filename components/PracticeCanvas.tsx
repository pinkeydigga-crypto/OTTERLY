"use client";

import React, { useRef, useState, useEffect } from "react";
import { RotateCcw, Pencil, Highlighter } from "lucide-react";

type ToolType = "pencil" | "highlighter";

const HIGHLIGHTER_COLORS = [
  { name: "Grey", value: "rgba(107, 114, 128, 0.4)" },
  { name: "White", value: "rgba(255, 255, 255, 0.7)" },
  { name: "Blue", value: "rgba(59, 130, 246, 0.4)" },
  { name: "Red", value: "rgba(239, 68, 68, 0.4)" },
  { name: "Yellow", value: "rgba(234, 179, 8, 0.4)" },
];

export default function PracticeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(3);
  const [activeTool, setActiveTool] = useState<ToolType>("pencil");
  const [highlighterColor, setHighlighterColor] = useState(HIGHLIGHTER_COLORS[2].value); // Default Blue
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas White Background Set Karein
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coords = getCoordinates(e);
    lastPointRef.current = coords;
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentPoint = getCoordinates(e);
    const lastPoint = lastPointRef.current;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);

    if (activeTool === "pencil") {
      // Smooth Graphite/Pencil Style Texture
      ctx.strokeStyle = "rgba(30, 41, 59, 0.85)"; // Soft Dark Charcoal Line
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 0.5;
      ctx.shadowColor = "#000000";
    } else {
      // Highlighter Style Stroke
      ctx.strokeStyle = highlighterColor;
      ctx.lineWidth = lineWidth * 4; // Highlighter thick stroke
      ctx.lineCap = "square";
      ctx.lineJoin = "miter";
      ctx.shadowBlur = 0;
    }

    ctx.stroke();
    lastPointRef.current = currentPoint;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* White Drawing Canvas */}
      <div className="relative w-full max-w-[450px] aspect-[4/3] border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        <canvas
          ref={canvasRef}
          width={450}
          height={337}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
        />
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-2.5 w-full max-w-[450px] p-3 bg-slate-50 rounded-2xl border border-slate-200">
        
        {/* Tool Switcher & Controls */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Pencil & Highlighter Tool Buttons */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
            <button
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
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-500">Size:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-16 sm:w-20 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Clear Button */}
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1 text-xs font-black bg-white text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-xl border border-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>

        {/* Highlighter Color Palette (Active when Highlighter is selected) */}
        {activeTool === "highlighter" && (
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200">
            <span className="text-[11px] font-black text-slate-500">Highlighter Color:</span>
            <div className="flex items-center gap-2">
              {HIGHLIGHTER_COLORS.map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => setHighlighterColor(c.value)}
                  style={{ backgroundColor: c.value.replace(/0\.\d+/, "0.9") }}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
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