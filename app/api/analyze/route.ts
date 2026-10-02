import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY || "";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const MODELS_TO_TRY = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-1.5-flash",
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

// Regex to validate if string is UUID format
const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  console.log("🚀 [API START] Scan request received!");

  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "0.0.0.0";

    if (isRateLimited(ip)) {
      console.log("⚠️ Rate limit hit");
      return NextResponse.json(
        {
          isDrawing: false,
          message: "Too many requests. Please wait 1 minute before scanning again. (#100)",
          errorCode: "#100",
        },
        { status: 429 }
      );
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://otsiwrtnkzhrztl.supabase.co";

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    const body = await req.json().catch(() => null);

    const rawUserId = body?.userId ? String(body.userId).trim() : null;
    const trackingIdentifier = rawUserId || `ip_${ip}`;

    // Layer 1 Security: Local Cookie Check
    const cookieStore = await cookies();
    const cookieKey = `otto_scan_lock_${trackingIdentifier.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const lastScanCookie = cookieStore.get(cookieKey);

    if (lastScanCookie) {
      const lastScanTime = new Date(lastScanCookie.value).getTime();
      const hoursPassed = (Date.now() - lastScanTime) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        const nextAllowed = new Date(lastScanTime + 24 * 60 * 60 * 1000);
        console.log("🔒 Cookie lock active");
        return NextResponse.json(
          {
            isDrawing: false,
            lockActive: true,
            nextAllowedTime: nextAllowed.toISOString(),
            message: "Daily scan limit reached. You can scan 1 artwork per 24 hours. (#101)",
            errorCode: "#101",
          },
          { status: 423 }
        );
      }
    }

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY missing in .env file!");
      return NextResponse.json(
        { isDrawing: false, message: "Something went wrong. Please try again later. (#102)", errorCode: "#102" },
        { status: 500 }
      );
    }

    if (!body || !body.image || typeof body.image !== "string") {
      console.log("❌ Invalid image input");
      return NextResponse.json(
        { isDrawing: false, message: "Please upload a valid image. (#103)", errorCode: "#103" },
        { status: 400 }
      );
    }

    const imageStr = body.image;
    if (imageStr.length > 7 * 1024 * 1024) {
      return NextResponse.json(
        { isDrawing: false, message: "Image size too large. Maximum allowed limit is 5MB. (#104)", errorCode: "#104" },
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
        { isDrawing: false, message: "Format not supported. Please upload JPG, PNG, or WEBP. (#105)", errorCode: "#105" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64Data, "base64");
    if (!isValidImageHeader(buffer)) {
      return NextResponse.json(
        { isDrawing: false, message: "Corrupted or invalid image file. (#105)", errorCode: "#105" },
        { status: 400 }
      );
    }

    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      try {
        supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        });
      } catch (err: any) {
        console.error("❌ [Supabase Client Creation Error]:", err?.message);
      }
    }

    // Layer 2 Security: Supabase Check for scan_logs
    if (supabase) {
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        let query = supabase
          .from("scan_logs")
          .select("scanned_at")
          .gte("scanned_at", twentyFourHoursAgo)
          .order("scanned_at", { ascending: false })
          .limit(1);

        if (rawUserId && isValidUUID(rawUserId)) {
          query = query.eq("user_id", rawUserId);
        } else {
          query = query.eq("ip_address", ip);
        }

        const { data: recentScans, error: dbQueryError } = await query;

        if (dbQueryError) {
          console.warn("⚠️ Supabase Lock Query Warning:", dbQueryError.message);
        } else if (recentScans && recentScans.length > 0) {
          const lastScanTime = new Date(recentScans[0].scanned_at).getTime();
          const nextAllowed = new Date(lastScanTime + 24 * 60 * 60 * 1000);

          console.log("🔒 Supabase DB lock active!");
          return NextResponse.json(
            {
              isDrawing: false,
              lockActive: true,
              nextAllowedTime: nextAllowed.toISOString(),
              message: "Daily scan limit reached. You can scan 1 artwork per 24 hours. (#101)",
              errorCode: "#101",
            },
            { status: 423 }
          );
        }
      } catch (dbErr: any) {
        console.warn("⚠️ Supabase Query Catch Warning:", dbErr?.message);
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
      Return ONLY: {"isDrawing": false, "message": "Please upload a valid artwork, sketch, or drawing. Otto AI only analyzes art. (#106)"}

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

    console.log("📡 Calling Gemini API...");

    modelLoop: for (const modelName of MODELS_TO_TRY) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`⏳ Trying model: ${modelName} (Attempt ${attempt})`);
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
                  temperature: 0.2,
                },
              }),
            }
          ).finally(() => clearTimeout(timeoutId));

          lastApiStatus = apiResponse.status;
          console.log(`📥 Gemini HTTP Response Status: ${apiResponse.status}`);

          if (apiResponse.ok) {
            const data = await apiResponse.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const cleanJsonText = rawText.replace(/```json\n?|\n?```/g, "").trim();
              jsonResult = JSON.parse(cleanJsonText);
              console.log(`✅ SUCCESS with Gemini Model: ${modelName}`);
              break modelLoop;
            }
          } else {
            const errData = await apiResponse.json().catch(() => null);
            console.error(`❌ [Gemini API Error] Status ${apiResponse.status}:`, JSON.stringify(errData));

            if (apiResponse.status === 503 || apiResponse.status === 429) {
              break;
            }

            if (attempt === 1) {
              await sleep(500);
            }
          }
        } catch (err: any) {
          console.error(`⚠️ [Fetch Exception] ${modelName}:`, err?.message || err);
          if (attempt === 1) {
            await sleep(500);
          }
        }
      }
    }

    // API Error (#108): NO LOCK
    if (!jsonResult) {
      console.error("❌ ALL models failed. Returning 108 Error.");
      return NextResponse.json(
        {
          isDrawing: false,
          message: "Something went wrong. Please try again. (#108)",
          errorCode: "#108",
          status: lastApiStatus,
        },
        { status: 502 }
      );
    }

    // Success response
    if (jsonResult.isDrawing === true || jsonResult.isDrawing === "true") {
      const now = new Date();
      const nextAllowed = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      jsonResult.nextAllowedTime = nextAllowed.toISOString();

      // Insert Log to Supabase
      if (supabase) {
        try {
          const insertPayload: Record<string, any> = {
            scanned_at: now.toISOString(),
            ip_address: ip,
          };

          // Valid UUID check taaki Supabase insert reject na kare
          if (rawUserId && isValidUUID(rawUserId)) {
            insertPayload.user_id = rawUserId;
          }

          const { data: insertedData, error: insertError } = await supabase
            .from("scan_logs")
            .insert([insertPayload])
            .select();

          if (insertError) {
            console.error("❌ [SUPABASE INSERT ERROR]:", insertError.message, insertError.details);
          } else {
            console.log("✅ [SUPABASE INSERT SUCCESS]: Logged scan to table!", insertedData);
          }
        } catch (dbInsertErr: any) {
          console.error("❌ Supabase DB Insert Catch Error:", dbInsertErr?.message);
        }
      }

      // Set cookie lock
      const response = NextResponse.json(jsonResult, { status: 200 });
      response.cookies.set(cookieKey, now.toISOString(), {
        maxAge: 86400,
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      return response;
    }

    // Non-drawing image (#106): NO LOCK
    if (!jsonResult.message) {
      jsonResult.message = "Please upload a valid artwork, sketch, or drawing. Otto AI only analyzes art. (#106)";
    }

    return NextResponse.json(jsonResult, { status: 200 });

  } catch (error: any) {
    console.error("❌ Catch Block Internal Error:", error);
    return NextResponse.json(
      { isDrawing: false, message: "Something went wrong. Please try again. (#500)", errorCode: "#500" },
      { status: 500 }
    );
  }
}