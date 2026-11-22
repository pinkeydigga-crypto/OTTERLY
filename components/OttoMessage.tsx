"use client";

import React from "react";
import Link from "next/link";

interface OttoMessageProps {
  role: "user" | "assistant";
  content: string;
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
        <strong key={`${keyPrefix}-b-${match.index}`} className="font-bold text-slate-900">
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
            className="text-[#2563EB] font-bold underline decoration-[#2563EB]/60 hover:text-blue-700"
          >
            {label}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-a-${href}-${match.index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563EB] font-bold underline decoration-[#2563EB]/60 hover:text-blue-700"
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

export default function OttoMessage({ role, content }: OttoMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-xs">
          {content}
        </div>
      </div>
    );
  }

  const lines = content.split("\n");

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-xs space-y-1">
        {lines.map((line, idx) => (
          <p key={idx} className="leading-relaxed">
            {renderInlineFormatting(line, `line-${idx}`)}
          </p>
        ))}
      </div>
    </div>
  );
}