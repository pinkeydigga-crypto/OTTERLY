"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import OttoMessage from "@/components/OttoMessage";
import { ArrowLeft } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "otto_single_thread_v1";
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

export default function OttoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages, hydrated]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const requestOttoReply = async (conversation: ChatMessage[]): Promise<string> => {
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
    return data?.reply || "Give it another try in a moment 😊";
  };

  const sendMessage = async (presetText?: string) => {
    const cleanText = (presetText ?? input).trim();
    if (!cleanText || sending) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: cleanText },
    ];

    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const reply = await requestOttoReply(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Couldn't reach Otto right now. Please try again shortly 😊",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleRegenerate = async (assistantIndex: number) => {
    if (sending) return;

    const priorMessages = messages.slice(0, assistantIndex);
    const hasUserPrompt = priorMessages.some((m) => m.role === "user");
    if (!hasUserPrompt) return;

    setMessages(priorMessages);
    setSending(true);

    try {
      const reply = await requestOttoReply(priorMessages);
      setMessages([...priorMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...priorMessages,
        {
          role: "assistant",
          content: "Couldn't reach Otto right now. Please try again shortly 😊",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const hasStartedChat = messages.length > 0;

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

      {/* Full-Screen Scrollable Chat Stream */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col">
        <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col">
          {!hasStartedChat ? (
            <div className="my-auto flex flex-col items-center text-center max-w-md mx-auto space-y-5 py-6">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-white p-2 shadow-xs border border-slate-100 flex items-center justify-center">
                <img
                  src={OTTO_CENTER_MASCOT_URL}
                  alt="Otto Drawing Mentor"
                  className="w-full h-full object-contain select-none"
                />
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  Hey! Let&apos;s level up your art 🎨
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                  Tell me your skill level or ask any sketching question—I&apos;ll guide you step by step!
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {ENGLISH_STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    disabled={sending}
                    onClick={() => sendMessage(starter)}
                    className="text-xs font-bold text-[#2563EB] bg-white hover:bg-blue-50 border border-blue-200/80 px-3.5 py-2 rounded-full shadow-2xs transition cursor-pointer disabled:opacity-50"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5 pb-2">
              {messages.map((msg, index) => (
                <OttoMessage
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  isRegenerating={sending}
                  onRegenerate={
                    msg.role === "assistant" ? () => handleRegenerate(index) : undefined
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

      {/* Bottom Card Input (No Mic / No Image Icon, 3D Blue Send Button) */}
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
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="w-11 h-11 rounded-[14px] bg-[#2563EB] hover:bg-[#1D4ED8] active:translate-y-[2px] border-b-[4px] border-[#1E40AF] active:border-b-[2px] text-white disabled:opacity-45 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
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
          </button>
        </form>
      </footer>
    </div>
  );
}