import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY || "";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const MODELS_TO_TRY = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const lastScanCookie = cookieStore.get("otto_last_scan_time");

    // 1. 24-HOUR SCAN LOCK CHECK
    if (lastScanCookie) {
      const lastScanTime = new Date(lastScanCookie.value).getTime();
      const currentTime = new Date().getTime();
      const hoursPassed = (currentTime - lastScanTime) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        const nextAllowed = new Date(lastScanTime + 24 * 60 * 60 * 1000);
        return NextResponse.json(
          {
            isDrawing: false,
            lockActive: true,
            nextAllowedTime: nextAllowed.toISOString(),
            message: "Daily scan limit reached. You can only perform 1 scan every 24 hours.",
            errorCode: "ERR_101", // Code 101: 24h Lock Active
          },
          { status: 423 }
        );
      }
    }

    // 2. SERVER & API KEY VALIDATION
    if (!apiKey) {
      console.error("[Otto AI Internal Log]: GEMINI_API_KEY is missing in env.");
      return NextResponse.json(
        {
          isDrawing: false,
          message: "Otto AI is temporarily busy. Please try again later. (Error 102)",
          errorCode: "ERR_102", // Code 102: Missing Server API Key
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.image || typeof body.image !== "string") {
      return NextResponse.json(
        { 
          isDrawing: false, 
          message: "Invalid image upload. Please try uploading again. (Error 103)",
          errorCode: "ERR_103", // Code 103: Bad Request / Empty Payload
        },
        { status: 400 }
      );
    }

    const imageStr = body.image;

    if (imageStr.length > 7 * 1024 * 1024) {
      return NextResponse.json(
        { 
          isDrawing: false, 
          message: "File size is too large. Maximum limit is 5MB. (Error 104)",
          errorCode: "ERR_104", // Code 104: Image Size Exceeded
        },
        { status: 400 }
      );
    }

    let mimeType = "image/jpeg";
    let base64Data = imageStr;

    if (imageStr.includes(";base64,")) {
      const parts = imageStr.split(";base64,");
      const mimeHeader = parts[0].replace("data:", "");
      mimeType = mimeHeader.toLowerCase();
      base64Data = parts[1];
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          isDrawing: false,
          message: "Unsupported file format. Please upload JPG, PNG, or WEBP. (Error 105)",
          errorCode: "ERR_105", // Code 105: Unsupported Mime Type
        },
        { status: 400 }
      );
    }

    const promptText = `
      You are "Otto", an expert visual art mentor. Inspect the artwork image carefully in full detail.
      Provide a comprehensive, highly insightful evaluation written in clear, simple Indian English.

      FIRST STEP - IMAGE VALIDATION:
      Verify if image is a drawing, sketch, painting, digital art, or illustration.
      If it is a real photo (face, person, object, document page, screenshot):
        Return {"isDrawing": false, "message": "Please upload a drawing, sketch, or digital art. Otto AI can only check artwork."}

      If artwork, evaluate lines, proportions, shading, depth, and technique. Return ONLY valid JSON:
      {
        "isDrawing": true,
        "score": number,
        "skillLevel": "Beginner" | "Intermediate" | "Advanced",
        "strengths": [
          "Detailed observation about what was executed well",
          "Second clear strength point regarding line control or shading",
          "Third praise point highlighting artistic effort"
        ],
        "areasToImprove": [
          "Detailed explanation of what needs refinement",
          "Second specific area to improve",
          "Third specific improvement point"
        ],
        "actionableImprovements": [
          "Step 1: Concrete guidance on how to fix line control or shading",
          "Step 2: Practical technique exercise",
          "Step 3: Tool or measurement tip"
        ],
        "practiceRecommendation": "A detailed 15-minute daily practice drill tailored to fix observed flaws.",
        "motivationalFeedback": "An encouraging closing note from Otto.",
        "message": ""
      }
    `;

    // 3. INTERNAL API CALL WITH RETRIES
    let jsonResult = null;
    let internalErrorLog = "";

    for (const modelName of MODELS_TO_TRY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const apiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                maxOutputTokens: 1200,
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
          internalErrorLog = await apiResponse.text();
          console.error(`[Otto AI Model ${modelName} Failure]:`, internalErrorLog);
        }
      } catch (err) {
        console.error(`[Otto AI Internal Catch]: Model ${modelName} failed`, err);
      }
    }

    if (!jsonResult) {
      return NextResponse.json(
        {
          isDrawing: false,
          message: "Otto AI is temporarily busy. Please try again in a few seconds. (Error 106)",
          errorCode: "ERR_106", // Code 106: All Backend Model Attempts Failed / Auth Failure
        },
        { status: 502 }
      );
    }

    // 4. SET COOKIE IF VALID ARTWORK
    if (jsonResult.isDrawing === true) {
      const now = new Date();
      const nextAllowed = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      cookieStore.set("otto_last_scan_time", now.toISOString(), {
        maxAge: 86400,
        path: "/",
        httpOnly: true,
        sameSite: "strict",
      });

      jsonResult.nextAllowedTime = nextAllowed.toISOString();
    }

    return NextResponse.json(jsonResult);
  } catch (error: unknown) {
    console.error("[Otto AI Server Execution Error]:", error);
    return NextResponse.json(
      {
        isDrawing: false,
        message: "Otto AI service connection timed out. Please try again. (Error 107)",
        errorCode: "ERR_107", // Code 107: General Runtime Catch / Network Timeout
      },
      { status: 500 }
    );
  }
}