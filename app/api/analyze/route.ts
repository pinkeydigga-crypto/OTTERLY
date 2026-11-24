import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY || "";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

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

function detectImageMime(buffer: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") {
    return "image/webp";
  }

  return null;
}

function normalizeAiResult(raw: Record<string, unknown>): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;

  const isDrawing =
    raw.isDrawing === true ||
    raw.isDrawing === "true" ||
    String(raw.isDrawing).toLowerCase() === "true";

  if (!isDrawing) {
    return {
      isDrawing: false,
      message:
        typeof raw.message === "string" && raw.message.trim()
          ? raw.message.trim().slice(0, 300)
          : "Please upload a valid artwork, sketch, or drawing. Otto AI only analyzes art. (#106)",
    };
  }

  const rawScore = Number(raw.score);
  const score = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(100, Math.round(rawScore)))
    : 50;

  const allowedSkills = new Set(["Beginner", "Intermediate", "Advanced"]);
  const skillLevel =
    typeof raw.skillLevel === "string" && allowedSkills.has(raw.skillLevel)
      ? raw.skillLevel
      : score <= 50
      ? "Beginner"
      : score <= 75
      ? "Intermediate"
      : "Advanced";

  const toStringArray = (val: unknown) =>
    Array.isArray(val) ? val.filter((x): x is string => typeof x === "string").slice(0, 6) : [];

  return {
    ...raw,
    isDrawing: true,
    score,
    skillLevel,
    strengths: toStringArray(raw.strengths),
    areasToImprove: toStringArray(raw.areasToImprove),
    actionableImprovements: toStringArray(raw.actionableImprovements),
    practiceRecommendation:
      typeof raw.practiceRecommendation === "string" ? raw.practiceRecommendation.slice(0, 1000) : "",
    motivationalFeedback:
      typeof raw.motivationalFeedback === "string" ? raw.motivationalFeedback.slice(0, 600) : "",
    message: typeof raw.message === "string" ? raw.message.slice(0, 300) : "",
  };
}

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const getTodayLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
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

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "";

    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    const body = await req.json().catch(() => null);
    const todayStr = getTodayLocalDate();

    let supabase = null;
    if (supabaseUrl && supabaseServiceKey) {
      try {
        supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false },
        });
      } catch {
        supabase = null;
      }
    }

    if (!supabase) {
      return NextResponse.json(
        {
          isDrawing: false,
          message: "Something went wrong. Please try again later. (#102)",
          errorCode: "#102",
        },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json(
        {
          isDrawing: false,
          message: "User authentication failed. Please login to scan. (#109)",
          errorCode: "#109",
        },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return NextResponse.json(
        {
          isDrawing: false,
          message: "User authentication failed. Please login to scan. (#109)",
          errorCode: "#109",
        },
        { status: 401 }
      );
    }

    const { data: authUserData, error: authError } = await supabase.auth.getUser(token);
    const verifiedUserId = authError ? null : authUserData?.user?.id || null;

    if (!verifiedUserId || !isValidUUID(verifiedUserId)) {
      return NextResponse.json(
        {
          isDrawing: false,
          message: "User authentication failed. Please login to scan. (#109)",
          errorCode: "#109",
        },
        { status: 401 }
      );
    }

    const activeUserId = verifiedUserId;

    const { data: profileData, error: dbQueryError } = await supabase
      .from("profiles")
      .select("last_scanned_at")
      .eq("id", activeUserId)
      .maybeSingle();

    if (!dbQueryError && profileData && profileData.last_scanned_at) {
      const lastScanDate = new Date(profileData.last_scanned_at);
      const lastYear = lastScanDate.getFullYear();
      const lastMonth = String(lastScanDate.getMonth() + 1).padStart(2, "0");
      const lastDay = String(lastScanDate.getDate()).padStart(2, "0");
      const dbScanDateStr = `${lastYear}-${lastMonth}-${lastDay}`;

      if (dbScanDateStr === todayStr) {
        return NextResponse.json(
          {
            isDrawing: false,
            lockActive: true,
            message: "Your scan limit is out. Come back tomorrow!",
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
    let declaredMime = "image/jpeg";
    let base64Data = imageStr;

    if (imageStr.includes(";base64,")) {
      const parts = imageStr.split(";base64,");
      declaredMime = parts[0].replace("data:", "").toLowerCase().trim();
      base64Data = parts[1] || "";
    }

    if (!ALLOWED_MIME_TYPES.includes(declaredMime)) {
      return NextResponse.json(
        { isDrawing: false, message: "Format not supported. Please upload JPG, PNG, or WEBP. (#105)", errorCode: "#105" },
        { status: 400 }
      );
    }

    const approxBase64Bytes = Math.floor((base64Data.length * 3) / 4);
    if (approxBase64Bytes > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { isDrawing: false, message: "Image size too large. Maximum allowed limit is 5MB. (#104)", errorCode: "#104" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { isDrawing: false, message: "Image size too large. Maximum allowed limit is 5MB. (#104)", errorCode: "#104" },
        { status: 400 }
      );
    }

    const detectedMime = detectImageMime(buffer);
    if (!detectedMime) {
      return NextResponse.json(
        { isDrawing: false, message: "Corrupted or invalid image file. (#105)", errorCode: "#105" },
        { status: 400 }
      );
    }

    const promptText = `
      You are "Otto", an expert, highly encouraging, and insightful art mentor.
      Analyze the uploaded artwork in detail using rich, descriptive, and professional yet simple English. Make the points descriptive and detailed.

      SCORING CRITERIA:
- 0-30: Rough/scribbled.
- 31-50: Beginner level.
- 51-70: Intermediate attempt.
- 71-88: Skilled artwork.
- 89-100: Exceptional / Masterpiece.

      VALIDATION RULE:
      If not related to art/drawing/design:
      Return ONLY: {"isDrawing": false, "message": "Please upload a valid artwork, sketch, or drawing. Otto AI only analyzes art. (#106)"}

      PROMO INSTRUCTION:
      In the 'practiceRecommendation' or 'motivationalFeedback', naturally include a short, friendly nudge or advice for the user to try out daily step-by-step challenges in the 'Challenges' section regularly or practice directly on the digital 'Practice Canvas' to build consistency.

      RETURN STRICTLY VALID JSON ONLY following this exact structure:
      {
        "isDrawing": true,
        "artCategory": "Detected Category Name",
        "score": 65,
        "skillLevel": "Intermediate",
        "strengths": [
          "First detailed sentence describing a strong artistic point.",
          "Second detailed sentence highlighting shading, texture, or form definition.",
          "Third detailed sentence praising emotional expression, creativity, or visual balance."
        ],
        "areasToImprove": [
          "First detailed sentence pointing out proportion, perspective, or contrast adjustment needed.",
          "Second detailed sentence highlighting edge control, detailing, or lighting consistency."
        ],
        "actionableImprovements": ["Provide concrete technical steps to refine the artwork."],
        "practiceRecommendation": "Write a rich, 2-3 sentence daily practice drill, and naturally add a short friendly promo advice to explore the 'Challenges' section or use the digital 'Practice Canvas' for daily streak growth.",
        "motivationalFeedback": "Keep your encouragement warm, catchy, and inspiring!",
        "message": ""
      }
    `;

    let jsonResult: Record<string, unknown> | null = null;

    modelLoop: for (const modelName of MODELS_TO_TRY) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
            {
              method: "POST",
              signal: controller.signal,
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: promptText },
                      { inlineData: { mimeType: detectedMime, data: base64Data } },
                    ],
                  },
                ],
                generationConfig: {
                  responseMimeType: "application/json",
                  temperature: 0.3,
                },
              }),
            }
          ).finally(() => clearTimeout(timeoutId));

          if (apiResponse.ok) {
            const data = await apiResponse.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const cleanJsonText = rawText.replace(/```json\n?|\n?```/g, "").trim();
              const parsed = JSON.parse(cleanJsonText);
              const normalized = normalizeAiResult(parsed);
              if (normalized) {
                jsonResult = normalized;
                break modelLoop;
              }
            }
          } else {
            if (attempt === 1) await sleep(500);
          }
        } catch {
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

    if (isDrawingValid) {
      const nowTimestampz = new Date().toISOString();
      await supabase
        .from("profiles")
        .update({ last_scanned_at: nowTimestampz })
        .eq("id", activeUserId);
    }

    if (!jsonResult.message) {
      jsonResult.message = "Please upload a valid artwork, sketch, or drawing. Otto AI only analyzes art. (#106)";
    }

    return NextResponse.json(jsonResult, { status: 200 });
  } catch {
    return NextResponse.json(
      { isDrawing: false, message: "Something went wrong. Please try again. (#500)", errorCode: "#500" },
      { status: 500 }
    );
  }
}