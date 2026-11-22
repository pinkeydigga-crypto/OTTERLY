import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

const MAX_PER_MINUTE = 2;
const MAX_PER_DAY = 8;
const MAX_HISTORY = 4;
const MAX_OUTPUT_TOKENS = 550;

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GEMINI_CHAT_API_KEY = process.env.GEMINI_CHAT_API_KEY || "";

const OTTO_SYSTEM_PROMPT = `You are Otto, Otterleo's friendly drawing mentor. Always reply ONLY in clear, natural English. Never use Hindi or Hinglish. Keep every reply short, crisp, and complete (around 3-5 short bullet points or a brief paragraph) so it finishes cleanly within token limits and never cuts off mid-sentence. Never use markdown tables.

APP FACTS YOU KNOW:
- Dashboard (/dashboard): Shows Total XP, Current Streak (days), Your Rank, and XP Wheel.
- Practice Canvas (/practice): Interactive drawing canvas with Reset and Download controls. Its name is Practice Canvas.
- AI Scan (/scan): Upload artwork for AI feedback, score, and tips.
- Leaderboard (/leaderboard): Check XP and rank.
- Grid Maker (/grid-maker): Reference grids for proportions.
- Idea Generator (/idea-generator): Drawing prompts and ideas.

STRICT LINK RULES:
1. Only share links that match what the user needs right now. Never dump all links in every reply.
2. When recommending Practice: include a blue link to Practice (/practice) and add relevant links (/leaderboard, /grid-maker, /idea-generator) only when helpful. Do not mention or promote any paid plan.
3. When artwork feedback, critique, or scanning is needed: include a blue link to Scan (/scan).
4. When the user asks for the name of Practice ("practice ka name", "name of practice", "practice name"): write <a href="/practice" class="text-[#2563EB] font-black underline">Practice Canvas</a> in blue (#2563EB) linking to /practice.
5. Format links in blue: <a href="PATH" class="text-[#2563EB] font-bold underline">Label</a>.`;

const ABUSE_PATTERNS = [
  /\b(fuck|fucker|fucking|shit|bitch|asshole|bastard|dick|cunt|slut|whore)\b/i,
  /\b(chutiya|bhosdike|bhosdi|gaand|gandu|randi|lauda|lund|chut|madarchod|behenchod|bc|mc)\b/i,
  /teri\s*ma(a)?\s*ki/i,
];

function isAbusive(text: string): boolean {
  return ABUSE_PATTERNS.some((rx) => rx.test(text));
}

function getTodayLocalDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  return fwd ? fwd.split(",")[0].trim() : realIp || "unknown";
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function ottoErrorReply(code: "101" | "102" | "103" | "104" | "105" | "106", status = 500) {
  return NextResponse.json(
    {
      reply: `Otto failed to give response, try again later (${code})`,
      errorCode: code,
    },
    { status }
  );
}

async function resolveRateKey(
  req: NextRequest,
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>
): Promise<string> {
  const ip = getClientIp(req);
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      if (data?.user?.id) {
        return `user:${data.user.id}|ip:${ip}`;
      }
    }
  }

  return `ip:${ip}`;
}

async function verifyAndConsumeLimit(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  rateKey: string
): Promise<{ allowed: boolean; message?: string; status?: number }> {
  const todayStr = getTodayLocalDate();
  const currentMinuteBucket = Math.floor(Date.now() / 60000);

  const { data: existing, error: fetchError } = await supabase
    .from("otto_chat_usage")
    .select("rate_key, day_date, day_count, minute_bucket, minute_count")
    .eq("rate_key", rateKey)
    .maybeSingle();

  if (fetchError) {
    return {
      allowed: false,
      message: "Otto failed to give response, try again later (102)",
      status: 503,
    };
  }

  let nextDayCount = 1;
  let nextMinuteCount = 1;

  if (existing) {
    const sameDay = existing.day_date === todayStr;
    const sameMinute = sameDay && Number(existing.minute_bucket) === currentMinuteBucket;

    const currentDayCount = sameDay ? Number(existing.day_count) || 0 : 0;
    const currentMinuteCount = sameMinute ? Number(existing.minute_count) || 0 : 0;

    if (currentDayCount >= MAX_PER_DAY) {
      return {
        allowed: false,
        message: "You have reached today's chat limit. Come back tomorrow for more drawing tips!",
        status: 429,
      };
    }

    if (currentMinuteCount >= MAX_PER_MINUTE) {
      return {
        allowed: false,
        message: "Whoa, slow down a bit! Give it a minute and try again.",
        status: 429,
      };
    }

    nextDayCount = currentDayCount + 1;
    nextMinuteCount = currentMinuteCount + 1;
  }

  const { error: upsertError } = await supabase
    .from("otto_chat_usage")
    .upsert(
      {
        rate_key: rateKey,
        day_date: todayStr,
        day_count: nextDayCount,
        minute_bucket: currentMinuteBucket,
        minute_count: nextMinuteCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "rate_key" }
    );

  if (upsertError) {
    return {
      allowed: false,
      message: "Otto failed to give response, try again later (103)",
      status: 503,
    };
  }

  return { allowed: true };
}

async function askGroq(messages: Array<{ role: string; content: string }>): Promise<string | null> {
  if (!GROQ_API_KEY) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "system", content: OTTO_SYSTEM_PROMPT }, ...messages],
        temperature: 0.6,
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

async function askGemini(messages: Array<{ role: string; content: string }>): Promise<string | null> {
  if (!GEMINI_CHAT_API_KEY) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GEMINI_CHAT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "system", content: OTTO_SYSTEM_PROMPT }, ...messages],
        temperature: 0.6,
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return ottoErrorReply("106", 400);
    }

    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUserMsg = [...rawMessages]
      .reverse()
      .find((m: { role?: string; content?: string }) => m?.role === "user")?.content;

    const userText = String(lastUserMsg || "").trim().slice(0, 400);
    if (!userText) {
      return NextResponse.json({
        reply: "Ask me anything about sketching, shading, proportions, or drawing tools!",
      });
    }

    if (isAbusive(userText)) {
      return NextResponse.json({
        reply: "Hey, keep it friendly! What are you sketching today?",
      });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return ottoErrorReply("101", 503);
    }

    const rateKey = await resolveRateKey(req, supabase);
    const limitCheck = await verifyAndConsumeLimit(supabase, rateKey);

    if (!limitCheck.allowed) {
      return NextResponse.json(
        { reply: limitCheck.message, limitReached: true },
        { status: limitCheck.status || 429 }
      );
    }

    const cleanHistory = rawMessages.slice(-MAX_HISTORY).map((m: { role?: string; content?: string }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 400),
    }));

    const reply = (await askGroq(cleanHistory)) || (await askGemini(cleanHistory));

    if (!reply) {
      return ottoErrorReply("104", 502);
    }

    return NextResponse.json({ reply });
  } catch {
    return ottoErrorReply("105", 500);
  }
}