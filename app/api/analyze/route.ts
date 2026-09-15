import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY || "";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

// Cost-effective models priority list
const MODELS_TO_TRY = [
  "gemini-1.5-flash",
  "gemini-2.5-flash",
];

// Supabase Service Role Client (RLS Bypass karne ke liye Server-side Client)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const lastScanCookie = cookieStore.get("otto_last_scan_time");

    // ==========================================
    // 1. COOKIE-BASED 24-HOUR CHECK
    // ==========================================
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
            message: "Daily limit reached. You can scan only 1 drawing every 24 hours.",
            errorCode: "ERR_101",
          },
          { status: 423 }
        );
      }
    }

    // ==========================================
    // 2. USER ID / DB CHECK (RLS Bypassed via Service Role)
    // ==========================================
    const body = await req.json().catch(() => null);
    const userId = body?.userId; // Client se userId optional pass ho sakti hai

    if (userId) {
      const { data: user, error: dbError } = await supabaseAdmin
        .from("users")
        .select("last_scan_at")
        .eq("id", userId)
        .single();

      if (!dbError && user?.last_scan_at) {
        const lastScanTime = new Date(user.last_scan_at).getTime();
        const hoursPassed = (Date.now() - lastScanTime) / (1000 * 60 * 60);

        if (hoursPassed < 24) {
          const nextAllowed = new Date(lastScanTime + 24 * 60 * 60 * 1000);
          return NextResponse.json(
            {
              isDrawing: false,
              lockActive: true,
              nextAllowedTime: nextAllowed.toISOString(),
              message: "Daily scan limit reached for your account.",
              errorCode: "ERR_101",
            },
            { status: 423 }
          );
        }
      }
    }

    // ==========================================
    // 3. INPUT VALIDATIONS
    // ==========================================
    if (!apiKey) {
      return NextResponse.json(
        { isDrawing: false, message: "Server configuration issue. (Error 102)", errorCode: "ERR_102" },
        { status: 500 }
      );
    }

    if (!body || !body.image || typeof body.image !== "string") {
      return NextResponse.json(
        { isDrawing: false, message: "Please upload a valid image file. (Error 103)", errorCode: "ERR_103" },
        { status: 400 }
      );
    }

    const imageStr = body.image;
    if (imageStr.length > 7 * 1024 * 1024) {
      return NextResponse.json(
        { isDrawing: false, message: "Image size is too large. Max limit is 5MB. (Error 104)", errorCode: "ERR_104" },
        { status: 400 }
      );
    }

    let mimeType = "image/jpeg";
    let base64Data = imageStr;

    if (imageStr.includes(";base64,")) {
      const parts = imageStr.split(";base64,");
      mimeType = parts[0].replace("data:", "").toLowerCase();
      base64Data = parts[1];
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { isDrawing: false, message: "Format not supported. Upload JPG, PNG, or WEBP.", errorCode: "ERR_105" },
        { status: 400 }
      );
    }

    // ==========================================
    // 4. COST-OPTIMIZED HIGH-TRAINED PROMPT
    // ==========================================
    const promptText = `
      You are "Otto", a friendly expert drawing mentor.
      Examine the uploaded image closely.

      VALIDATION:
      If NOT a handmade drawing/sketch/painting (e.g. real photo, document, face):
      Return ONLY: {"isDrawing": false, "message": "Please upload a real artwork or sketch. Otto AI only reviews drawings."}

      IF VALID DRAWING:
      Give actionable critique in simple, clear Hinglish/Indian English.
      Return strictly valid JSON format:
      {
        "isDrawing": true,
        "score": number_between_1_to_100,
        "skillLevel": "Beginner" | "Intermediate" | "Advanced",
        "strengths": [
          "Short point on good line control or proportions",
          "Short point on shading or details"
        ],
        "areasToImprove": [
          "Short point on what is weak or misaligned",
          "Short point on shading or perspective fix"
        ],
        "actionableImprovements": [
          "Step 1: Simple fix technique",
          "Step 2: Practical daily drill"
        ],
        "practiceRecommendation": "1-line daily 10-minute exercise tip.",
        "motivationalFeedback": "Warm 1-line encouraging note.",
        "message": ""
      }
    `;

    // ==========================================
    // 5. GEMINI API CALL WITH TOKEN CAPS
    // ==========================================
    let jsonResult = null;

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
                maxOutputTokens: 600, // Token budget limit to save costs
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
            break;
          }
        }
      } catch (err) {
        console.error(`[Otto AI Error]: Model ${modelName} failed`, err);
      }
    }

    if (!jsonResult) {
      return NextResponse.json(
        { isDrawing: false, message: "Otto AI is busy. Please try again.", errorCode: "ERR_106" },
        { status: 502 }
      );
    }

    // ==========================================
    // 6. DB UPDATE & COOKIE SETTING ON SUCCESS
    // ==========================================
    if (jsonResult.isDrawing === true) {
      const now = new Date();
      const nextAllowed = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Set Cookie
      cookieStore.set("otto_last_scan_time", now.toISOString(), {
        maxAge: 86400,
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      // DB update bypassing RLS using Service Role Key
      if (userId) {
        await supabaseAdmin
          .from("users")
          .update({ last_scan_at: now.toISOString() })
          .eq("id", userId);
      }

      jsonResult.nextAllowedTime = nextAllowed.toISOString();
    }

    return NextResponse.json(jsonResult);
  } catch (error: unknown) {
    return NextResponse.json(
      { isDrawing: false, message: "Service connection error. Try again.", errorCode: "ERR_107" },
      { status: 500 }
    );
  }
}