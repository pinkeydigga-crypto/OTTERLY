"use client";

import React from "react";
import Link from "next/link";

interface OttoMessageProps {
  role: "user" | "assistant";
  content: string;
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

  const tokenRegex = /(<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>|\[([^\]]+)\]\(([^)]+)\))/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const href = match[2] || match[5] || "/practice";
    const label = match[3] || match[4] || href;
    const isInternal = href.startsWith("/");

    parts.push(
      isInternal ? (
        <Link
          key={`${href}-${match.index}`}
          href={href}
          className="text-[#2563EB] font-bold underline decoration-[#2563EB]/60 hover:text-blue-700"
        >
          {label}
        </Link>
      ) : (
        <a
          key={`${href}-${match.index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2563EB] font-bold underline decoration-[#2563EB]/60 hover:text-blue-700"
        >
          {label}
        </a>
      )
    );

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] whitespace-pre-line rounded-2xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-xs">
        {parts}
      </div>
    </div>
  );
}