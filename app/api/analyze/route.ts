import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY || "";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const MODELS_TO_TRY = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-1.5-flash"
];

// Anti-Hacker In-Memory Rate Limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 5;

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count += 1;
  return false;
}

// Global In-Memory Concurrency Queue
let activeRequestsCount = 0;
const MAX_CONCURRENT_HEAVY_JOBS = 3;

async function waitForServerCapacity(maxWaitMs = 15000): Promise<boolean> {
  const startTime = Date.now();
  while (activeRequestsCount >= MAX_CONCURRENT_HEAVY_JOBS) {
    if (Date.now() - startTime > maxWaitMs) {
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return true;
}

// Magic Bytes Check
function isValidImageHeader(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  const hex = buffer.subarray(0, 4).toString("hex").toUpperCase();

  const isJpeg = hex.startsWith("FFD8FF");
  const isPng = hex.startsWith("89504E47");
  const isWebp = hex.startsWith("52494646");

  return isJpeg || isPng || isWebp;
}

export async function POST(req: Request) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "0.0.0.0";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          isDrawing: false,
          message: "Too many requests. Please wait 1 minute before scanning again.",
          errorCode: "ERR_100",
        },
        { status: 429 }
      );
    }

    const capacityAvailable = await waitForServerCapacity(12000);
    if (!capacityAvailable) {
      return NextResponse.json(
        {
          isDrawing: false,
          message: "Server is under heavy load. Please try again in 5 seconds.",
          errorCode: "ERR_108_BUSY",
        },
        { status: 503 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const body = await req.json().catch(() => null);
    const userId = body?.userId;

    const cookieStore = await cookies();
    const cookieKey = userId ? `otto_last_scan_time_${userId}` : "otto_last_scan_time";
    const lastScanCookie = cookieStore.get(cookieKey);

    if (lastScanCookie) {
      const lastScanTime = new Date(lastScanCookie.value).getTime();
      const hoursPassed = (Date.now() - lastScanTime) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        const nextAllowed = new Date(lastScanTime + 24 * 60 * 60 * 1000);
        return NextResponse.json(
          {
            isDrawing: false,
            lockActive: true,
            nextAllowedTime: nextAllowed.toISOString(),
            message: "Daily scan limit reached for this account.",
            errorCode: "ERR_101A",
          },
          { status: 423 }
        );
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { isDrawing: false, message: "Server configuration issue: GEMINI_API_KEY missing.", errorCode: "ERR_102" },
        { status: 500 }
      );
    }

    if (!body || !body.image || typeof body.image !== "string") {
      return NextResponse.json(
        { isDrawing: false, message: "Please upload a valid artwork image payload.", errorCode: "ERR_103" },
        { status: 400 }
      );
    }

    const imageStr = body.image;
    if (imageStr.length > 7 * 1024 * 1024) {
      return NextResponse.json(
        { isDrawing: false, message: "Image size too large. Maximum allowed limit is 5MB.", errorCode: "ERR_104" },
        { status: 400 }
      );
    }

    let mimeType = "image/jpeg";
    let base64Data = imageStr;

    if (imageStr.includes(";base64,")) {
      const parts = imageStr.split(";base64,");
      mimeType = parts[0].replace("data:", "").toLowerCase().trim();
      base64Data = parts[1];
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { isDrawing: false, message: "Format not supported. Upload JPG, PNG, or WEBP.", errorCode: "ERR_105A" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64Data, "base64");
    if (!isValidImageHeader(buffer)) {
      return NextResponse.json(
        { isDrawing: false, message: "Corrupted or invalid image file detected.", errorCode: "ERR_105B" },
        { status: 400 }
      );
    }

    let supabaseAdmin = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    }

    if (userId && supabaseAdmin) {
      const { data: isAllowed, error: lockError } = await supabaseAdmin
        .rpc("check_and_lock_scan", { user_id_param: userId });

      if (lockError || !isAllowed) {
        return NextResponse.json(
          {
            isDrawing: false,
            lockActive: true,
            message: "Daily scan limit reached for your account.",
            errorCode: "ERR_101B",
          },
          { status: 423 }
        );
      }
    }

    const promptText = `
      You are "Otto", a world-class, professional art critique and drawing mentor.
      Analyze the uploaded image with extreme precision and attention to fine detail.

      SUPPORTED ART TYPES:
      Handmade Pencil Sketches, Digital Art, Paintings, Mandala Art, Mehndi/Henna Designs, Doodles, Line Art, Geometric Drawings, 3D Tutorials/Exercises, Perspective Diagrams.

      VALIDATION RULE:
      If the image is strictly NOT related to art, drawing, or design (e.g., real human face/selfie, document, code, wallpaper, real object photo):
      Return ONLY: {"isDrawing": false, "message": "Please upload a valid artwork, sketch, mandala, or drawing practice exercise. Otto AI only analyzes art."}

      CRITIQUE INSTRUCTIONS FOR VALID ARTWORK:
      - TONE & LANGUAGE: Use clear, simple, professional English ONLY. Do NOT use Hinglish words.
      - DEEP CRITIQUE (areasToImprove): Be ultra-specific. Identify exact technical flaws.
      - DAILY PRACTICE (practiceRecommendation): Provide a highly custom 10-15 minute step-by-step drill.

      RETURN STRICTLY VALID JSON ONLY:
      {
        "isDrawing": true,
        "artCategory": "Detected Category Name",
        "score": 85,
        "skillLevel": "Intermediate",
        "strengths": ["Clear line structure"],
        "areasToImprove": ["Minor shading imbalance"],
        "actionableImprovements": ["Step 1: Adjust pencil pressure"],
        "practiceRecommendation": "15-minute daily shading drill",
        "motivationalFeedback": "Great progress, keep practicing daily!",
        "message": ""
      }
    `;

    let jsonResult = null;
    let lastApiStatus = 0;

    activeRequestsCount++;

    try {
      for (const modelName of MODELS_TO_TRY) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000);

          const apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              signal: controller.signal,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: promptText },
                      { inlineData: { mimeType: mimeType, data: base64Data } },
                    ],
                  },
                ],
                generationConfig: {
                  responseMimeType: "application/json",
                  maxOutputTokens: 800,
                  temperature: 0.2,
                },
              }),
            }
          ).finally(() => clearTimeout(timeoutId));

          lastApiStatus = apiResponse.status;

          if (apiResponse.ok) {
            const data = await apiResponse.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const cleanJsonText = rawText.replace(/```json\n?|\n?```/g, "").trim();
              jsonResult = JSON.parse(cleanJsonText);
              break;
            }
          }
        } catch (err) {
          console.warn(`[Otto AI Fetch Warning] Model ${modelName} call failed.`);
        }
      }
    } finally {
      activeRequestsCount = Math.max(0, activeRequestsCount - 1);
    }

    if (!jsonResult) {
      let debugCode = "ERR_106A";
      let debugMessage = "Otto AI is busy right now. Please try again in 5 seconds.";

      if (lastApiStatus === 400 || lastApiStatus === 403) {
        debugCode = "ERR_106B";
        debugMessage = "AI API Key permission error or key disabled.";
      } else if (lastApiStatus === 429) {
        debugCode = "ERR_106C";
        debugMessage = "AI Provider quota exceeded. Try again in a few moments.";
      }

      return NextResponse.json(
        { isDrawing: false, message: debugMessage, errorCode: debugCode, httpStatus: lastApiStatus },
        { status: 502 }
      );
    }

    if (jsonResult.isDrawing === true) {
      const now = new Date();
      const nextAllowed = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      cookieStore.set(cookieKey, now.toISOString(), {
        maxAge: 86400,
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      // FIX: UPSERT QUERY FIXES NULL VALUE ISSUE IN DATABASE
      if (userId && supabaseAdmin) {
        const { error: dbError } = await supabaseAdmin
          .from("profiles")
          .upsert(
            { id: userId, last_scanned_at: now.toISOString() },
            { onConflict: "id" }
          );

        if (dbError) {
          console.error("Supabase Scan Update Error:", dbError.message);
        }
      }

      jsonResult.nextAllowedTime = nextAllowed.toISOString();
    }

    return NextResponse.json(jsonResult);
  } catch (error: unknown) {
    return NextResponse.json(
      { isDrawing: false, message: "Internal server runtime error. Try again.", errorCode: "ERR_107" },
      { status: 500 }
    );
  }
}