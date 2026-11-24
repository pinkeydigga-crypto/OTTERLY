import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

const MAX_PER_MINUTE = 2;
const MAX_PER_DAY = 10;
const MAX_HISTORY = 4;
const MAX_OUTPUT_TOKENS = 600;

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GEMINI_CHAT_API_KEY = process.env.GEMINI_CHAT_API_KEY || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

const GEMINI_FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
] as const;

const OTTO_SYSTEM_PROMPT = `You are Otto, Otterleo's sweet, warm, and encouraging drawing mentor.

LANGUAGE ADAPTATION:
- Always default to clear, simple English.
- Only switch to Hinglish when the user speaks in Hinglish; if they use another language like Hindi, adapt naturally to that too.
- Never use the ✨ emoji.

TYPO & CONTEXT UNDERSTANDING:
- Naturally understand spelling mistakes and typos (such as "drawng", "sktech", "shding", "porpotion") without making a fuss.
- Treat beginner self-doubt ("I don't know anything", "muje kuch nhi ata yar") and normal friendly conversation warmly—do not mark them as off-topic.

EMOJI & HOOK RULES:
- Do NOT put an emoji in every reply. Only use emojis when they genuinely fit—when no emoji is needed, use 0 emojis (most replies can have no emoji at all).
- Do NOT default to smile emojis like 😊 every time. Vary emojis naturally based on what fits the moment—including heart emojis like ❤️ or 💙 when being warm/sweet, or drawing/mood emojis like 🎨, ✏️, 👍 when relevant (never ✨), with a MAXIMUM of 2 emojis per reply.
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

const INSTANT_CACHE: Record<string, string> = {
  hi: "Hey there! Ready to sketch something fun today? Tell me what you'd like to draw.",
  hello: "Hello! I'm Otto, your drawing buddy. What are we sketching today?",
  "practice ka name":
    'It is called <a href="/practice" class="text-[#2563EB] font-black underline">Practice Canvas</a>. You can draw freely, reset, and download your work there.',
  "name of practice":
    'It is called <a href="/practice" class="text-[#2563EB] font-black underline">Practice Canvas</a>. You can draw freely, reset, and download your work there.',
  "practice name":
    'It is called <a href="/practice" class="text-[#2563EB] font-black underline">Practice Canvas</a>. You can draw freely, reset, and download your work there.',
};

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
  supabase: NonNullable<typeof supabaseAdmin>
): Promise<string | null> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      if (data?.user?.id) {
        return `user:${data.user.id}`;
      }
    }
  }

  return null;
}

async function askGroq(messages: Array<{ role: string; content: string }>): Promise<string | null> {
  if (!GROQ_API_KEY) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

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

  for (const model of GEMINI_FALLBACK_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GEMINI_CHAT_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: OTTO_SYSTEM_PROMPT }, ...messages],
            temperature: 0.65,
            max_tokens: MAX_OUTPUT_TOKENS,
          }),
        }
      ).finally(() => clearTimeout(timeoutId));

      if (!res.ok) continue;
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    } catch {
      continue;
    }
  }

  return null;
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

    if (!supabaseAdmin) {
      return ottoErrorReply("101", 503);
    }

    const rateKey = await resolveRateKey(req, supabaseAdmin);
    if (!rateKey) {
      return NextResponse.json(
        { reply: "Please log in again to chat with Otto." },
        { status: 401 }
      );
    }

    const normalizedQuery = userText.toLowerCase().replace(/[?.!]+$/g, "").trim();
    if (INSTANT_CACHE[normalizedQuery]) {
      return NextResponse.json({ reply: INSTANT_CACHE[normalizedQuery] });
    }

    const { data: quotaRes, error: rpcErr } = await supabaseAdmin.rpc("reserve_otto_quota", {
      p_rate_key: rateKey,
      p_day_date: getTodayLocalDate(),
      p_minute_bucket: Math.floor(Date.now() / 60000),
      p_max_day: MAX_PER_DAY,
      p_max_minute: MAX_PER_MINUTE,
    });

    if (rpcErr || !quotaRes) {
      return ottoErrorReply("102", 503);
    }

    if (!quotaRes.allowed) {
      const msg =
        quotaRes.reason === "day"
          ? "You've used all 10 chats for today! Take a sweet break and come back tomorrow whenever you're ready 😊"
          : "Give it just a minute and try again 😊";
      return NextResponse.json({ reply: msg, limitReached: true }, { status: 429 });
    }

    const cleanHistory = rawMessages.slice(-MAX_HISTORY).map((m: { role?: string; content?: string }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 350),
    }));

    const reply = (await askGroq(cleanHistory)) || (await askGemini(cleanHistory));

    if (!reply) {
      if (quotaRes.is_new) {
        await supabaseAdmin.from("otto_chat_usage").delete().eq("rate_key", rateKey);
      } else {
        await supabaseAdmin
          .from("otto_chat_usage")
          .update({
            day_date: quotaRes.prev_day_date,
            day_count: quotaRes.prev_day_count,
            minute_bucket: quotaRes.prev_minute_bucket,
            minute_count: quotaRes.prev_minute_count,
            updated_at: new Date().toISOString(),
          })
          .eq("rate_key", rateKey);
      }
      return ottoErrorReply("104", 502);
    }

    return NextResponse.json({ reply });
  } catch {
    return ottoErrorReply("105", 500);
  }
}