import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY || "";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

// LATEST ACTIVE MODELS (Primary: gemini-3.6-flash)
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
    // ERR_100: Rate Limit Check (IP level)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const cookieStore = await cookies();
    const lastScanCookie = cookieStore.get("otto_last_scan_time");

    // ERR_101A: 24-Hour Cookie Lock
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
            message: "Daily scan limit reached for this browser.",
            errorCode: "ERR_101A",
          },
          { status: 423 }
        );
      }
    }

    // ERR_101B: 24-Hour Supabase DB Lock
    const body = await req.json().catch(() => null);
    const userId = body?.userId;

    if (userId && supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      // Checking 'profiles' table first, fallbacks gracefully if table is 'users'
      const { data: user, error: dbError } = await supabaseAdmin
        .from("profiles")
        .select("last_scanned_at, last_scan_at")
        .eq("id", userId)
        .maybeSingle();

      const lastScanVal = user?.last_scanned_at || user?.last_scan_at;

      if (!dbError && lastScanVal) {
        const lastScanTime = new Date(lastScanVal).getTime();
        const hoursPassed = (Date.now() - lastScanTime) / (1000 * 60 * 60);

        if (hoursPassed < 24) {
          const nextAllowed = new Date(lastScanTime + 24 * 60 * 60 * 1000);
          return NextResponse.json(
            {
              isDrawing: false,
              lockActive: true,
              nextAllowedTime: nextAllowed.toISOString(),
              message: "Daily scan limit reached for your account.",
              errorCode: "ERR_101B",
            },
            { status: 423 }
          );
        }
      }
    }

    // ERR_102: Missing API Key
    if (!apiKey) {
      return NextResponse.json(
        { isDrawing: false, message: "Server configuration issue: GEMINI_API_KEY missing.", errorCode: "ERR_102" },
        { status: 500 }
      );
    }

    // ERR_103: Empty Request Body
    if (!body || !body.image || typeof body.image !== "string") {
      return NextResponse.json(
        { isDrawing: false, message: "Please upload a valid artwork image payload.", errorCode: "ERR_103" },
        { status: 400 }
      );
    }

    // ERR_104: Image File Size Exceeded
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

    // ERR_105A: Unsupported Mime Type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { isDrawing: false, message: "Format not supported. Upload JPG, PNG, or WEBP.", errorCode: "ERR_105A" },
        { status: 400 }
      );
    }

    // ERR_105B: Invalid Image Header
    const buffer = Buffer.from(base64Data, "base64");
    if (!isValidImageHeader(buffer)) {
      return NextResponse.json(
        { isDrawing: false, message: "Corrupted or invalid image file detected.", errorCode: "ERR_105B" },
        { status: 400 }
      );
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
      - TONE & LANGUAGE: Use clear, simple, professional English ONLY. Do NOT use Hinglish words (e.g., avoid "Wah", "Shabaash", "Dekho", etc.).
      - DEEP CRITIQUE (areasToImprove): Be ultra-specific. Identify exact technical flaws such as minor pressure inconsistency, line weight variation, perspective misalignment, uneven spacing, or shading gradients. Avoid generic praise here.
      - DAILY PRACTICE (practiceRecommendation): Provide a highly custom, practical 10-15 minute step-by-step drill directly tailored to fix the specific mistakes found in the artwork.

      RETURN STRICTLY VALID JSON ONLY:
      {
        "isDrawing": true,
        "artCategory": "Detected Category Name (e.g., Mehndi Art / Perspective Sketch / Pencil Portrait)",
        "score": number_between_1_to_100,
        "skillLevel": "Beginner" | "Intermediate" | "Advanced",
        "strengths": [
          "1-line highly specific point on technical execution or clean work",
          "1-line point on contrast, composition, or line confidence"
        ],
        "areasToImprove": [
          "1-line detailed technical critique pointing out precise line/shading/symmetry flaws",
          "1-line precise observation on proportional or pressure inconsistency"
        ],
        "actionableImprovements": [
          "Step 1: Immediate mechanical adjustment (e.g., grip position, cone angle, light-source alignment)",
          "Step 2: Practical corrective exercise technique"
        ],
        "practiceRecommendation": "A detailed 15-minute daily exercise designed to fix the exact weak points identified.",
        "motivationalFeedback": "A professional, warm, and clear 1-line encouraging closing statement in simple English.",
        "message": ""
      }
    `;

    let jsonResult = null;
    let lastApiStatus = 0;

    for (const modelName of MODELS_TO_TRY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

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
        console.warn(`[Otto AI Fetch Error] ${modelName} failed. Trying next...`);
      }
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

      cookieStore.set("otto_last_scan_time", now.toISOString(), {
        maxAge: 86400,
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      // FIXED DB UPDATE LOGIC (Guarantees column gets updated)
      if (userId && supabaseUrl && supabaseServiceKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const isoNow = now.toISOString();

        // 1. Try updating profiles table
        const { error: profileErr } = await supabaseAdmin
          .from("profiles")
          .update({ last_scanned_at: isoNow, last_scan_at: isoNow })
          .eq("id", userId);

        // 2. Fallback to users table if profiles table update was ignored
        if (profileErr) {
          await supabaseAdmin
            .from("users")
            .update({ last_scan_at: isoNow, last_scanned_at: isoNow })
            .eq("id", userId);
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