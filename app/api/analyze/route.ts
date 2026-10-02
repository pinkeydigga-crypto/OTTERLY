import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY || "";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const MODELS_TO_TRY = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash"
];

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 10;

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

function isValidImageHeader(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  const hex = buffer.subarray(0, 4).toString("hex").toUpperCase();

  const isJpeg = hex.startsWith("FFD8FF");
  const isPng = hex.startsWith("89504E47");
  const isWebp = hex.startsWith("52494646");

  return isJpeg || isPng || isWebp;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    // Auto-detect Supabase Environment Variables with all possible fallback names
    const supabaseUrl = 
      process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.SUPABASE_URL;

    const supabaseKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_KEY ||
      process.env.SUPABASE_KEY;

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

    // Initialize Supabase Client
    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }

    if (userId && supabase) {
      const { data: isAllowed, error: lockError } = await supabase
        .rpc("check_and_lock_scan", { user_id_param: userId });

      if (lockError) {
        console.warn("⚠️ Supabase RPC Lock Warning:", lockError.message);
      }

      if (isAllowed === false) {
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
      You are "Otto", a supportive art mentor who gives insightful, detailed, clear, and encouraging feedback.
      Analyze the artwork in detail using SIMPLE and EASY English.

      SCORING CRITERIA (Fair & Balanced):
      - 0-30: Extremely rough, unrecognizable, or scribbled.
      - 31-50: Beginner level (messy lines, minor shape errors, basic coloring attempt).
      - 51-70: Intermediate attempt (clear subject, good effort, needs refinement).
      - 71-88: Skilled artwork (clean execution, good technique).
      - 89-100: Exceptional / Masterpiece.

      INSTRUCTIONS:
      - Strengths: Highlight 2 specific good points in detailed simple sentences.
      - Areas to Improve: List 3 detailed, constructive technical feedback points explaining what needs work.
      - Actionable Improvements: Provide 2 practical step-by-step guidance points.
      - Practice Recommendation: Give a specific 15-minute daily exercise drill.

      SUPPORTED ART TYPES:
      Handmade Pencil Sketches, Digital Art, Paintings, Mandala Art, Mehndi/Henna Designs, Doodles, Line Art, Geometric Drawings, 3D Tutorials/Exercises, Perspective Diagrams.

      VALIDATION RULE:
      If not related to art/drawing/design (e.g. selfie, document, code, real photo):
      Return ONLY: {"isDrawing": false, "message": "Please upload a valid artwork, sketch, or drawing. Otto AI only analyzes art."}

      RETURN STRICTLY VALID JSON ONLY:
      {
        "isDrawing": true,
        "artCategory": "Detected Category Name",
        "score": 38,
        "skillLevel": "Beginner",
        "strengths": [
          "The overall concept and subject choice are clearly recognizable",
          "Shows good enthusiasm in filling out the shape with color"
        ],
        "areasToImprove": [
          "Outlines appear shaky and slightly uneven around the edges",
          "Coloring spills over the main boundary lines in multiple spots",
          "Shading lacks depth and uniform pencil pressure"
        ],
        "actionableImprovements": [
          "Trace light guidelines first before making dark final strokes",
          "Color in small circular motions to stay strictly inside boundaries"
        ],
        "practiceRecommendation": "Spend 15 minutes daily practicing continuous straight lines and smooth circles without rushing.",
        "motivationalFeedback": "You have a great creative spark! Practice steady hand control every day to make your artwork pop.",
        "message": ""
      }
    `;

    let jsonResult: any = null;
    let lastApiStatus = 0;
    let lastApiErrorMsg = "";

    modelLoop: for (const modelName of MODELS_TO_TRY) {
      for (let attempt = 1; attempt <= 2; attempt++) {
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
                  maxOutputTokens: 2048,
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
              console.log(`✅ Success with Gemini Model: ${modelName}`);
              break modelLoop;
            }
          } else {
            const errData = await apiResponse.json().catch(() => null);
            lastApiErrorMsg = errData?.error?.message || apiResponse.statusText;
            console.error(`❌ [Gemini Error] Model ${modelName} Status ${apiResponse.status}:`, lastApiErrorMsg);

            if (apiResponse.status === 503 && attempt === 1) {
              await sleep(1000);
            }
          }
        } catch (err: any) {
          console.warn(`⚠️ [Otto AI Fetch Warning] Model ${modelName} Attempt ${attempt} failed:`, err?.message || err);
        }
      }
    }

    if (!jsonResult) {
      return NextResponse.json(
        {
          isDrawing: false,
          message: lastApiErrorMsg || "Otto AI server is experiencing high traffic. Please try again in a few moments.",
          errorCode: "ERR_108_FETCH_FAILED",
          status: lastApiStatus,
        },
        { status: 502 }
      );
    }

    if (jsonResult.isDrawing === true) {
      const now = new Date();
      const nextAllowed = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      jsonResult.nextAllowedTime = nextAllowed.toISOString();

      // INSERT SCAN LOG INTO SCAN_LOGS TABLE
      if (userId && supabase) {
        const { error: insertError } = await supabase
          .from("scan_logs")
          .insert([
            { user_id: userId, scanned_at: now.toISOString() }
          ]);

        if (insertError) {
          console.error("❌ Failed to insert into scan_logs:", insertError.message);
        } else {
          console.log(`✅ Successfully inserted scan_log for userId: ${userId}`);
        }
      } else {
        console.warn("⚠️️ Could not log scan details:", {
          hasUserId: !!userId,
          hasSupabaseUrl: !!supabaseUrl,
          hasSupabaseKey: !!supabaseKey
        });
      }

      const response = NextResponse.json(jsonResult, { status: 200 });
      response.cookies.set(cookieKey, now.toISOString(), {
        maxAge: 86400,
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      return response;
    }

    return NextResponse.json(jsonResult, { status: 200 });

  } catch (error: any) {
    console.error("❌ Catch Block Internal Error:", error);
    return NextResponse.json(
      { isDrawing: false, message: "Internal server runtime error. Try again.", errorCode: "ERR_107", rawError: error?.message },
      { status: 500 }
    );
  }
}