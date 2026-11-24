"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import OttoMessage from "@/components/OttoMessage";
import { ArrowLeft, History } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface OttoApiResponse {
  reply: string;
  limitReached?: boolean;
}

const STORAGE_KEY = "otto_single_thread_v1";
const DAY_LIMIT_LOCK_MS = 5 * 60 * 1000; // 5 minutes
const OTTO_HEADER_MASCOT_URL =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/onboard%20(1).png";
const OTTO_CENTER_MASCOT_URL =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/chat.jpeg";

const ENGLISH_STARTERS = [
  "How do I shade a sphere smoothly?",
  "Tips for getting face proportions right",
  "Where can I practice sketching right now?",
  "I'm a beginner—where should I start?",
];

function formatRemainingTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function OttoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [archivedMessages, setArchivedMessages] = useState<ChatMessage[]>([]);
  const [showLoadPreviousBtn, setShowLoadPreviousBtn] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const isSendLocked = lockUntil !== null && remainingMs > 0;

  useEffect(() => {
    const reloadOnOffline = () => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    };

    if (typeof window !== "undefined" && !navigator.onLine) {
      window.location.reload();
      return;
    }

    window.addEventListener("offline", reloadOnOffline);
    return () => {
      window.removeEventListener("offline", reloadOnOffline);
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArchivedMessages(parsed);
          setShowLoadPreviousBtn(true);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
      }
    } catch {}
  }, [messages, hydrated]);

  useEffect(() => {
    if (!lockUntil) {
      setRemainingMs(0);
      return;
    }

    const updateTimer = () => {
      const diff = lockUntil - Date.now();
      if (diff <= 0) {
        setLockUntil(null);
        setRemainingMs(0);
      } else {
        setRemainingMs(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockUntil]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleLoadPreviousChats = () => {
    if (archivedMessages.length === 0) return;
    setMessages(archivedMessages);
    setArchivedMessages([]);
    setShowLoadPreviousBtn(false);
  };

  const requestOttoReply = async (conversation: ChatMessage[]): Promise<OttoApiResponse> => {
    if (typeof window !== "undefined" && !navigator.onLine) {
      window.location.reload();
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const res = await fetch("/api/otto-chat", {
      method: "POST",
      headers,
      body: JSON.stringify({ messages: conversation.slice(-4) }),
    });

    const data = await res.json();
    return {
      reply: data?.reply || "Give it another try in a moment.",
      limitReached: Boolean(data?.limitReached),
    };
  };

  const sendMessage = async (presetText?: string) => {
    if (typeof window !== "undefined" && !navigator.onLine) {
      window.location.reload();
      return;
    }

    const cleanText = (presetText ?? input).trim();
    if (!cleanText || sending || isSendLocked) return;

    if (showLoadPreviousBtn) {
      setArchivedMessages([]);
      setShowLoadPreviousBtn(false);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }

    const baseMessages = showLoadPreviousBtn ? [] : messages;
    const nextMessages: ChatMessage[] = [
      ...baseMessages,
      { role: "user", content: cleanText },
    ];

    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const { reply, limitReached } = await requestOttoReply(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // Lock sending button for 5 minutes right after showing the 10-chat limit message
      if (limitReached) {
        setLockUntil(Date.now() + DAY_LIMIT_LOCK_MS);
      }
    } catch {
      if (typeof window !== "undefined" && !navigator.onLine) {
        window.location.reload();
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Couldn't reach Otto right now. Please try again shortly.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleRegenerate = async (assistantIndex: number) => {
    if (typeof window !== "undefined" && !navigator.onLine) {
      window.location.reload();
      return;
    }

    if (sending || isSendLocked) return;

    const priorMessages = messages.slice(0, assistantIndex);
    const hasUserPrompt = priorMessages.some((m) => m.role === "user");
    if (!hasUserPrompt) return;

    setMessages(priorMessages);
    setSending(true);

    try {
      const { reply, limitReached } = await requestOttoReply(priorMessages);
      setMessages([...priorMessages, { role: "assistant", content: reply }]);

      if (limitReached) {
        setLockUntil(Date.now() + DAY_LIMIT_LOCK_MS);
      }
    } catch {
      if (typeof window !== "undefined" && !navigator.onLine) {
        window.location.reload();
        return;
      }
      setMessages([
        ...priorMessages,
        {
          role: "assistant",
          content: "Couldn't reach Otto right now. Please try again shortly.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-dvh bg-[#FAFBFD] flex flex-col overflow-hidden">
      <style jsx>{`
        @keyframes ottoShinySweep {
          0% {
            background-position: 180% center;
          }
          100% {
            background-position: -80% center;
          }
        }
        .otto-thinking-shiny {
          display: inline-block;
          background: linear-gradient(
            90deg,
            #64748b 0%,
            #64748b 35%,
            #ffffff 50%,
            #2563eb 58%,
            #64748b 72%,
            #64748b 100%
          );
          background-size: 240% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: ottoShinySweep 1.8s linear infinite;
          will-change: background-position;
        }
      `}</style>

      {/* Top Header: Mascot + Otto on Left, Back to Home Pill on Right */}
      <header className="w-full px-4 sm:px-8 py-3 bg-white border-b border-slate-200/80 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src={OTTO_HEADER_MASCOT_URL}
              alt="Otto"
              className="w-9 h-9 rounded-xl object-cover border border-blue-200 bg-white"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black text-[#0F172A]">Otto</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#2563EB] bg-slate-100/90 hover:bg-blue-50 px-4 py-2 rounded-full transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Scrollable Stream: Top Hero Always Stays in Place */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 flex flex-col">
        <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col space-y-6">
          <div className="flex flex-col items-center text-center max-w-md mx-auto space-y-4 pt-1">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-white p-2 shadow-2xs border border-slate-100 flex items-center justify-center">
              <img
                src={OTTO_CENTER_MASCOT_URL}
                alt="Otto Drawing Mentor"
                className="w-full h-full object-contain select-none"
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                Hey! Let&apos;s level up your art 🎨
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                Tell me your skill level or ask any sketching question—I&apos;ll guide you step by step!
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {ENGLISH_STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  disabled={sending || isSendLocked}
                  onClick={() => sendMessage(starter)}
                  className="text-xs font-bold text-[#2563EB] bg-white hover:bg-blue-50 border border-blue-200/80 px-3.5 py-2 rounded-full shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  {starter}
                </button>
              ))}
            </div>

            {showLoadPreviousBtn && (
              <button
                type="button"
                disabled={sending}
                onClick={handleLoadPreviousChats}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#2563EB] bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 px-4 py-2 rounded-full shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                <History className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Load previous chats</span>
              </button>
            )}
          </div>

          {messages.length > 0 && (
            <div className="space-y-5 pb-2 border-t border-slate-200/60 pt-5">
              {messages.map((msg, index) => (
                <OttoMessage
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  isRegenerating={sending || isSendLocked}
                  onRegenerate={
                    msg.role === "assistant" && !isSendLocked
                      ? () => handleRegenerate(index)
                      : undefined
                  }
                />
              ))}

              {sending && (
                <div className="py-1">
                  <span className="otto-thinking-shiny text-sm font-semibold">
                    Otto is thinking...
                  </span>
                </div>
              )}
            </div>
          )}

          <div ref={endRef} />
        </div>
      </main>

      {/* Bottom Card Input */}
      <footer className="w-full px-4 sm:px-6 py-3 bg-[#FAFBFD] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="max-w-3xl mx-auto flex items-center gap-3 bg-white border border-slate-200/90 rounded-[22px] p-2 shadow-sm focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-[#2563EB]/15 transition"
        >
          <div className="flex-1 bg-[#F1F3F6] rounded-full px-4 py-2.5 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              placeholder="Ask anything..."
              className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={sending || isSendLocked || !input.trim()}
            aria-label={isSendLocked ? `Locked for ${formatRemainingTime(remainingMs)}` : "Send message"}
            className={`${
              isSendLocked ? "px-3.5 w-auto gap-1.5" : "w-11"
            } h-11 rounded-[14px] bg-[#2563EB] hover:bg-[#1D4ED8] active:translate-y-[2px] border-b-[4px] border-[#1E40AF] active:border-b-[2px] text-white disabled:opacity-50 flex items-center justify-center transition-all cursor-pointer shrink-0`}
          >
            {isSendLocked ? (
              <span className="text-xs font-extrabold tabular-nums">
                {formatRemainingTime(remainingMs)}
              </span>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            )}
          </button>
        </form>
      </footer>
    </div>
  );
}