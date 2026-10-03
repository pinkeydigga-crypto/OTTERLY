import { NextResponse } from "next/server";
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

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Local Date Formatter YYYY-MM-DD
const getTodayLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  console.log("\n--------------------------------------------------");
  console.log("🚀 [API START] Scan request received!");

  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          isDrawing: false,
          message: "Too many requests. Please wait 1 minute before scanning again. (#100)",
          errorCode: "#100",
        },
        { status: 429 }
      );
    }

    // Checking Env Variables with exact custom variable name support
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "https://otsiwrtnkzhrztl.supabase.co";

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env["NEXT_PUBLIC_SUQ.AbPABASE_ANON_KEY"] || // Exact env variable check
      process.env.SUPABASE_ANON_KEY;

    const body = await req.json().catch(() => null);
    const rawUserId = body?.userId ? String(body.userId).trim() : null;
    const todayStr = getTodayLocalDate();

    console.log("👤 User ID Received:", rawUserId || "MISSING");

    if (!rawUserId || !isValidUUID(rawUserId)) {
      return NextResponse.json(
        {
          isDrawing: false,
          message: "User authentication failed. Please login to scan. (#109)",
          errorCode: "#109",
        },
        { status: 401 }
      );
    }

    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      try {
        supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        });
      } catch (err: any) {
        console.error("❌ [Supabase Init Error]:", err?.message);
      }
    }

    if (!supabase) {
      console.error("❌ DB Client Creation Failed! Check env key.");
      return NextResponse.json(
        { isDrawing: false, message: "Database connection failed. (#110)", errorCode: "#110" },
        { status: 500 }
      );
    }

    // 1. DIRECT DB CHECK: User ne aaj scan kiya hai ya nahi?
    const { data: profileData, error: dbQueryError } = await supabase
      .from("profiles")
      .select("last_scanned_at")
      .eq("id", rawUserId)
      .maybeSingle();

    if (dbQueryError) {
      console.error("❌ Supabase Select Query Error:", dbQueryError.message);
    } else if (profileData && profileData.last_scanned_at) {
      const lastScanDate = new Date(profileData.last_scanned_at);
      const lastYear = lastScanDate.getFullYear();
      const lastMonth = String(lastScanDate.getMonth() + 1).padStart(2, "0");
      const lastDay = String(lastScanDate.getDate()).padStart(2, "0");
      const dbScanDateStr = `${lastYear}-${lastMonth}-${lastDay}`;

      console.log(`📊 DB Last Scan Date: ${dbScanDateStr} | Today: ${todayStr}`);

      if (dbScanDateStr === todayStr) {
        console.log("🔒 LOCK: User already scanned today!");
        return NextResponse.json(
          {
            isDrawing: false,
            lockActive: true,
            message: "Daily scan limit reached! Unlocks tomorrow at midnight. (#101)",
            errorCode: "#101",
          },
          { status: 423 }
        );
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { isDrawing: false, message: "Something went wrong. Please try again later. (#102)", errorCode: "#102" },
        { status: 500 }
      );
    }

    if (!body || !body.image || typeof body.image !== "string") {
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

    const promptText = `
      You are "Otto", a supportive art mentor who gives insightful feedback.
      Analyze the artwork in detail using SIMPLE and EASY English.

      SCORING CRITERIA:
      - 0-30: Rough/scribbled.
      - 31-50: Beginner level.
      - 51-70: Intermediate attempt.
      - 71-88: Skilled artwork.
      - 89-100: Exceptional / Masterpiece.

      VALIDATION RULE:
      If not related to art/drawing/design:
      Return ONLY: {"isDrawing": false, "message": "Please upload a valid artwork, sketch, or drawing. Otto AI only analyzes art. (#106)"}

      RETURN STRICTLY VALID JSON ONLY:
      {
        "isDrawing": true,
        "artCategory": "Detected Category Name",
        "score": 38,
        "skillLevel": "Beginner",
        "strengths": ["Good concept"],
        "areasToImprove": ["Outlines shaky"],
        "actionableImprovements": ["Trace light guidelines"],
        "practiceRecommendation": "Practice straight lines.",
        "motivationalFeedback": "Great spark!",
        "message": ""
      }
    `;

    let jsonResult: any = null;

    console.log("📡 Calling Gemini API...");

    modelLoop: for (const modelName of MODELS_TO_TRY) {
      for (let attempt = 1; attempt <= 2; attempt++) {
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
                  temperature: 0.2,
                },
              }),
            }
          ).finally(() => clearTimeout(timeoutId));

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
            if (attempt === 1) await sleep(500);
          }
        } catch (err: any) {
          if (attempt === 1) await sleep(500);
        }
      }
    }

    if (!jsonResult) {
      return NextResponse.json(
        { isDrawing: false, message: "Something went wrong. Please try again. (#108)", errorCode: "#108" },
        { status: 502 }
      );
    }

    const isDrawingValid =
      jsonResult.isDrawing === true ||
      jsonResult.isDrawing === "true" ||
      String(jsonResult.isDrawing).toLowerCase() === "true";

    // 2. RESULT MILNE PAR HI DB UPDATE HOGA
    if (isDrawingValid) {
      console.log("🟢 Result mil gaya! Profiles table me timestamp update kar rahe hain...");
      const nowTimestampz = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ last_scanned_at: nowTimestampz })
        .eq("id", rawUserId);

      if (updateError) {
        console.error("❌ [SUPABASE UPDATE ERROR]:", updateError.message);
      } else {
        console.log(`🎉 [SUCCESS]: 'last_scanned_at' updated to ${nowTimestampz}`);
      }

      return NextResponse.json(jsonResult, { status: 200 });
    }

    if (!jsonResult.message) {
      jsonResult.message = "Please upload a valid artwork, sketch, or drawing. Otto AI only analyzes art. (#106)";
    }

    return NextResponse.json(jsonResult, { status: 200 });

  } catch (error: any) {
    console.error("❌ Internal Error:", error);
    return NextResponse.json(
      { isDrawing: false, message: "Something went wrong. Please try again. (#500)", errorCode: "#500" },
      { status: 500 }
    );
  }
}