import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY || "";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const MODELS_TO_TRY = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
];

// Security: Check real file signatures (Magic Bytes)
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const cookieStore = await cookies();
    const lastScanCookie = cookieStore.get("otto_last_scan_time");

    // 1. COOKIE 24-HOUR CHECK
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
            message: "Daily limit reached. You can scan only 1 artwork every 24 hours.",
            errorCode: "ERR_101",
          },
          { status: 423 }
        );
      }
    }

    // 2. DB CHECK (RLS Bypassed via Service Key)
    const body = await req.json().catch(() => null);
    const userId = body?.userId;

    if (userId && supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
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

    // 3. INPUT VALIDATION & SECURITY
    if (!apiKey) {
      return NextResponse.json(
        { isDrawing: false, message: "Server configuration issue. (Error 102)", errorCode: "ERR_102" },
        { status: 500 }
      );
    }

    if (!body || !body.image || typeof body.image !== "string") {
      return NextResponse.json(
        { isDrawing: false, message: "Please upload a valid artwork image.", errorCode: "ERR_103" },
        { status: 400 }
      );
    }

    const imageStr = body.image;
    if (imageStr.length > 7 * 1024 * 1024) {
      return NextResponse.json(
        { isDrawing: false, message: "Image size too large. Max limit is 5MB.", errorCode: "ERR_104" },
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
        { isDrawing: false, message: "Format not supported. Upload JPG, PNG, or WEBP.", errorCode: "ERR_105" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(base64Data, "base64");
    if (!isValidImageHeader(buffer)) {
      return NextResponse.json(
        { isDrawing: false, message: "Invalid image file detected.", errorCode: "ERR_105" },
        { status: 400 }
      );
    }

    // 4. DETAILED & COST-OPTIMIZED PROMPT
    const promptText = `
      You are "Otto", an expert, friendly art and drawing mentor.
      Examine the uploaded image very carefully.

      SUPPORTED ART TYPES:
      Handmade Pencil Sketches, Digital Drawings, Paintings, Mandala Art, Mehndi/Henna Patterns, Doodles, Line Art.

      VALIDATION:
      If the image is NOT an art form (e.g. real human photo, document, wallpaper, screenshot, random object):
      Return ONLY: {"isDrawing": false, "message": "Please upload a real artwork, sketch, mandala, or mehndi design. Otto AI only analyzes art."}

      CRITIQUE INSTRUCTIONS FOR VALID ARTWORK:
      - Automatically detect the art category (e.g., Pencil Sketch, Mandala Art, Mehndi Design, Digital Art, Portrait).
      - Use very easy Indian English / Hinglish so anyone can understand clearly.
      - Be accurate: analyze symmetry for mandala/mehndi, proportions for portraits, line clarity, shading, and filling/neatness.

      RETURN STRICTLY VALID JSON ONLY:
      {
        "isDrawing": true,
        "artCategory": "Detected Category Name (e.g. Mandala Art / Pencil Sketch / Mehndi Design)",
        "score": number_between_1_to_100,
        "skillLevel": "Beginner" | "Intermediate" | "Advanced",
        "strengths": [
          "1-line point on what looks good (e.g., great symmetry, clean lines, or smooth shading)",
          "1-line point on detail work or creative effort"
        ],
        "areasToImprove": [
          "1-line clear point on mistake (e.g., uneven spacing, light shading, misaligned lines)",
          "1-line point on overall finish or proportions"
        ],
        "actionableImprovements": [
          "Step 1: Immediate practical correction step",
          "Step 2: Simple drill or daily technique to practice"
        ],
        "practiceRecommendation": "Specific 10-minute daily practice rule for this exact art style.",
        "motivationalFeedback": "Warm, highly encouraging 1-line closing message.",
        "message": ""
      }
    `;

    // 5. GEMINI API CALL (800 TOKENS)
    let jsonResult = null;

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
                maxOutputTokens: 800, // Token limit raised for detailed response
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
        } else {
          const errText = await apiResponse.text();
          console.error(`[Otto AI Model Failed - ${modelName}]: Status ${apiResponse.status} - ${errText}`);
        }
      } catch (err) {
        console.error(`[Otto AI Fetch Error - ${modelName}]:`, err);
      }
    }

    if (!jsonResult) {
      return NextResponse.json(
        { isDrawing: false, message: "Otto AI is busy right now. Please try again in a few seconds.", errorCode: "ERR_106" },
        { status: 502 }
      );
    }

    // 6. DB & COOKIE UPDATE
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

      if (userId && supabaseUrl && supabaseServiceKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        await supabaseAdmin
          .from("users")
          .update({ last_scan_at: now.toISOString() })
          .eq("id", userId);
      }

      jsonResult.nextAllowedTime = nextAllowed.toISOString();
    }

    return NextResponse.json(jsonResult);
  } catch (error: unknown) {
    console.error("[Otto AI Critical Error]:", error);
    return NextResponse.json(
      { isDrawing: false, message: "Service connection error. Try again.", errorCode: "ERR_107" },
      { status: 500 }
    );
  }
}