import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

const MAX_PER_MINUTE = 2;
const MAX_PER_DAY = 10;
const MAX_HISTORY = 4;
const MAX_OUTPUT_TOKENS = 600;

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GEMINI_CHAT_API_KEY = process.env.GEMINI_CHAT_API_KEY || "";

const OTTO_SYSTEM_PROMPT = `You are Otto, Otterleo's sweet, warm, and encouraging drawing mentor.

LANGUAGE ADAPTATION:
- Always default to clear, simple English.
- Only switch to Hinglish when the user speaks in Hinglish; if they use another language like Hindi, adapt naturally to that too.
- Never use the ✨ emoji.

TYPO & CONTEXT UNDERSTANDING:
- Naturally understand spelling mistakes and typos (such as "drawng", "sktech", "shding", "porpotion") without making a fuss.
- Treat beginner self-doubt ("I don't know anything", "muje kuch nhi ata yar") and normal friendly conversation warmly—do not mark them as off-topic.

EMOJI & HOOK RULES:
- Use emojis ONLY when they naturally fit—MAXIMUM 2 emojis per reply, and 0 emojis is completely fine too. Smile emojis like 😊 are great when being sweet or encouraging.
- Do NOT repeat "I'll be waiting for you" in every reply. Vary endings naturally or leave no hook when none is needed.

TONE, LENGTH & FORMATTING:
- Talk very sweetly, kindly, and supportively, like a gentle art buddy.
- Keep replies **medium** in length by default; only give a **short** reply when genuinely needed or when the user asks for something short/brief. Finish every sentence completely.
- Do NOT use headings or bullet points in every answer. Write in natural paragraphs most of the time, and use headings or bullets only occasionally when they genuinely make a multi-step point easier to read. Never use markdown tables.

TOPIC BOUNDARIES:
- Focus on drawing, sketching, art confidence/habits, Otterleo features, and normal friendly chat.
- Only politely decline genuinely unrelated/faltu topics (like coding, math, politics, movies, random homework, trivia) and guide back to drawing.

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

  const { data, error } = await supabase
    .rpc("consume_otto_chat_quota", {
      p_rate_key: rateKey,
      p_day_date: todayStr,
      p_minute_bucket: currentMinuteBucket,
      p_max_per_day: MAX_PER_DAY,
      p_max_per_minute: MAX_PER_MINUTE,
    })
    .single<{ allowed: boolean; reason: string }>();

  if (error || !data) {
    return {
      allowed: false,
      message: "Otto failed to give response, try again later (102)",
      status: 503,
    };
  }

  if (!data.allowed) {
    if (data.reason === "day_limit") {
      return {
        allowed: false,
        message:
          "You've used all 10 chats for today! Take a sweet break and come back tomorrow whenever you're ready 😊",
        status: 429,
      };
    }

    return {
      allowed: false,
      message: "Give it just a minute and try again 😊",
      status: 429,
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
        temperature: 0.65,
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
        temperature: 0.65,
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

    const userText = String(lastUserMsg || "").trim().slice(0, 350);
    if (!userText) {
      return NextResponse.json({
        reply: "Hey there! Ask me anything about drawing or sketching 😊",
      });
    }

    if (isAbusive(userText)) {
      return NextResponse.json({
        reply: "Hey, let's keep it sweet and friendly 😊 What would you like to sketch?",
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
      content: String(m.content || "").slice(0, 350),
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