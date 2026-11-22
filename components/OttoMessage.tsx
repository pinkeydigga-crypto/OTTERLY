"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";

interface OttoMessageProps {
  role: "user" | "assistant";
  content: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

function renderInlineFormatting(text: string, keyPrefix: string): React.ReactNode[] {
  const tokenRegex =
    /(<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[6]) {
      parts.push(
        <strong key={`${keyPrefix}-b-${match.index}`} className="font-semibold text-slate-900">
          {match[6]}
        </strong>
      );
    } else {
      const href = match[2] || match[5] || "/practice";
      const label = match[3] || match[4] || href;
      const isInternal = href.startsWith("/");

      parts.push(
        isInternal ? (
          <Link
            key={`${keyPrefix}-l-${href}-${match.index}`}
            href={href}
            className="text-[#2563EB] font-semibold underline decoration-[#2563EB]/60 hover:text-blue-700"
          >
            {label}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-a-${href}-${match.index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563EB] font-semibold underline decoration-[#2563EB]/60 hover:text-blue-700"
          >
            {label}
          </a>
        )
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function stripHtmlTags(raw: string): string {
  return raw
    .replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .trim();
}

export default function OttoMessage({
  role,
  content,
  onRegenerate,
  isRegenerating = false,
}: OttoMessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/15 px-4 py-2.5 text-sm font-medium text-slate-900">
          {content}
        </div>
      </div>
    );
  }

  const lines = content.split("\n").filter((l) => l.trim().length > 0);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(stripHtmlTags(content));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const toggleFeedback = (type: "up" | "down") => {
    setFeedback((prev) => (prev === type ? null : type));
  };

  return (
    <div className="group w-full py-1">
      <div className="text-[15px] leading-7 font-normal text-slate-800 space-y-2">
        {lines.map((line, idx) => (
          <p key={idx}>{renderInlineFormatting(line, `line-${idx}`)}</p>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-slate-400/70 group-hover:text-slate-500 transition-colors select-none">
        <button
          type="button"
          onClick={handleCopy}
          title="Copy"
          aria-label="Copy response"
          className="inline-flex items-center gap-1 px-1.5 py-1 rounded-md text-[11px] font-medium hover:text-slate-800 hover:bg-slate-100/80 transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>

        <span className="text-slate-300 text-[10px]">·</span>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating || !onRegenerate}
          title="Regenerate"
          aria-label="Regenerate response"
          className="inline-flex items-center gap-1 px-1.5 py-1 rounded-md text-[11px] font-medium hover:text-slate-800 hover:bg-slate-100/80 disabled:opacity-40 transition cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
          <span>Regenerate</span>
        </button>

        <span className="text-slate-300 text-[10px]">·</span>

        <button
          type="button"
          onClick={() => toggleFeedback("up")}
          title="Helpful"
          aria-label="Helpful response"
          className={`p-1 rounded-md transition cursor-pointer ${
            feedback === "up"
              ? "text-[#2563EB] bg-blue-50"
              : "hover:text-slate-800 hover:bg-slate-100/80"
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => toggleFeedback("down")}
          title="Not helpful"
          aria-label="Not helpful response"
          className={`p-1 rounded-md transition cursor-pointer ${
            feedback === "down"
              ? "text-rose-600 bg-rose-50"
              : "hover:text-slate-800 hover:bg-slate-100/80"
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}