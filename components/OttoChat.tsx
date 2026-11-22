"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import OttoMessage from "@/components/OttoMessage";
import { Send, MessageSquare } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "otto_single_thread_v1";
const OTTO_MASCOT_URL =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/chat.jpeg";

const ENGLISH_STARTERS = [
  "How do I shade a sphere smoothly?",
  "Tips for getting face proportions right",
  "Where can I practice sketching right now?",
  "How do I check my streak and XP?",
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
        body: JSON.stringify({ messages: nextMessages.slice(-4) }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.reply || "Give it another try in a moment!",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Couldn't reach Otto right now. Please try again shortly!",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const hasStartedChat = messages.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200/90 rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[600px] h-[calc(100vh-170px)] max-h-[720px]">
      <style jsx>{`
        @keyframes ottoBlurReveal {
          0% {
            filter: blur(5px);
            opacity: 0.45;
            transform: translateY(2px);
          }
          45% {
            filter: blur(0px);
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            filter: blur(0px);
            opacity: 0.95;
          }
          100% {
            filter: blur(5px);
            opacity: 0.45;
            transform: translateY(2px);
          }
        }
        .otto-thinking-blur {
          animation: ottoBlurReveal 1.6s ease-in-out infinite;
          will-change: filter, opacity, transform;
        }
      `}</style>

      <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center gap-3.5 shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5 fill-[#2563EB]/15" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#0F172A] leading-tight">Chat</h1>
          <p className="text-xs font-medium text-slate-500">
            Ask questions, get help and improve your drawings!
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 bg-[#FAFBFD] flex flex-col">
        {!hasStartedChat ? (
          <div className="my-auto flex flex-col items-center text-center max-w-md mx-auto space-y-4 py-4">
            <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-3xl overflow-hidden flex items-center justify-center">
              <img
                src={OTTO_MASCOT_URL}
                alt="Otto Drawing Mentor"
                className="w-full h-full object-contain select-none"
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                Start a Conversation!
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                Ask anything about drawing, get AI help or discuss your art.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {ENGLISH_STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  disabled={sending}
                  onClick={() => sendMessage(starter)}
                  className="text-xs font-bold text-[#2563EB] bg-blue-50/90 hover:bg-blue-100 border border-blue-200/70 px-3.5 py-2 rounded-full transition cursor-pointer disabled:opacity-50"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <OttoMessage key={index} role={msg.role} content={msg.content} />
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-500">
                  <span className="inline-block otto-thinking-blur">Otto is thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3.5 bg-white border-t border-slate-100 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2.5 bg-white border border-blue-200/90 rounded-full pl-4 pr-1.5 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-[#2563EB]/30"
        >
          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none py-1.5"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="w-9 h-9 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white disabled:opacity-45 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}