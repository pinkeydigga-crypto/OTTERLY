 import { NextResponse } from "next/server";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { cookies } from "next/headers";



// Force maximum route execution time (Vercel Serverless Config)

export const maxDuration = 60;



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");



export async function POST(req: Request) {

  try {

    const cookieStore = await cookies();

    const lastScanCookie = cookieStore.get("otto_last_scan_time");



    // 1. STRICT 24-HOUR SCAN LOCK CHECK (Via HTTP-Only Cookie)

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

          },

          { status: 423 } // HTTP 423 Locked

        );

      }

    }



    // 2. INPUT VALIDATION

    const { image } = await req.json();



    if (!image) {

      return NextResponse.json(

        { isDrawing: false, message: "No image provided for analysis." },

        { status: 400 }

      );

    }



    if (!process.env.GEMINI_API_KEY) {

      return NextResponse.json(

        {

          isDrawing: false,

          message: "API Key missing in .env.local file. Please check configuration.",

        },

        { status: 500 }

      );

    }



    const base64Data = image.split(",")[1] || image;

    const mimeType = image.split(";")[0]?.split(":")[1] || "image/jpeg";



    // 3. GEMINI AI ANALYSIS SETUP

    const model = genAI.getGenerativeModel({

      model: "gemini-3.6-flash",

      generationConfig: {

        responseMimeType: "application/json",

      },

    });



    const prompt = `

      You are "Otto", a world-class professional art mentor, master illustrator, and compassionate drawing coach.

      Your task is to perform a rigorous, structured, and constructive visual audit on the provided image.



      FIRST STEP - IMAGE VALIDATION:

      Determine if the uploaded image is genuinely a hand-drawn sketch, pencil drawing, digital artwork, painting, doodle, or creative illustration.

      - If the image is a real-life photo of a human face, person, object, scene, document, textbook page, screenshot, meme, or non-artistic content:

        Set "isDrawing": false and set "message": "Please upload a drawing, sketch, or painting. Otto AI can only evaluate hand-drawn or digital artwork."

      - If the image IS a drawing or artwork:

        Set "isDrawing": true and proceed with full evaluation below.



      EVALUATION METRICS & SCORING GUIDELINES:

      Analyze the artwork across these foundational art pillars:

      1. Line Quality & Control (Confidence, line weight, stroke consistency)

      2. Proportion & Anatomy/Geometry (Scale accuracy, spatial alignment, structural balance)

      3. Shading, Contrast & Form (Value range, light source consistency, 3D volume depth)

      4. Perspective & Composition (Vanishing points, placement, framing, depth)

      5. Creativity & Technical Execution (Details, clean rendering, artistic effort)



      SKILL LEVEL CLASSIFICATION:

      - "Beginner": Raw shapes, basic line work, limited shading, developing proportions.

      - "Intermediate": Good line confidence, clear structure, decent value range, minor proportional errors.

      - "Advanced": Strong anatomy/perspective, masterful shading, polished details, refined technique.



      OUTPUT INSTRUCTIONS:

      Return ONLY a JSON object with this exact JSON schema:

      {

        "isDrawing": boolean,

        "score": number, // Overall rating out of 100 based on technical quality

        "skillLevel": "Beginner" | "Intermediate" | "Advanced",

        "strengths": [

          "Detailed, specific praise about line quality, technique, or proportions",

          "Another specific strength observed in the artwork",

          "At least 3 clear strengths"

        ],

        "areasToImprove": [

          "Constructive criticism on shading, proportions, or perspective",

          "Specific technical flaw that needs refinement",

          "At least 2-3 detailed areas"

        ],

        "actionableImprovements": [

          "Step 1: Concrete technique or exercise to practice next",

          "Step 2: Specific advice on tools, light source, or line weight",

          "At least 3 practical action steps"

        ],

        "whatNotToDo": [

          "Common mistake to avoid in future drawings (e.g. smudge shading, harsh dark outlines)",

          "Another specific pitfall to prevent",

          "At least 2 important warnings"

        ],

        "practiceRecommendation": "A tailored 10 to 15 minute daily drawing drill designed specifically for this artist's current stage.",

        "motivationalFeedback": "An inspiring, warm, and highly encouraging 2-sentence closing quote from Otto the Art Coach to keep the artist motivated.",

        "message": ""

      }

    `;



    const result = await model.generateContent([

      prompt,

      {

        inlineData: {

          data: base64Data,

          mimeType: mimeType,

        },

      },

    ]);



    const text = result.response.text();

    const parsedData = JSON.parse(text);



    // 4. SET 24-HOUR COOKIE ONLY IF ARTWORK IS VALID

    if (parsedData.isDrawing === true) {

      const now = new Date();

      const nextAllowed = new Date(now.getTime() + 24 * 60 * 60 * 1000);



      // Set cookie for 24 hours (86400 seconds)

      cookieStore.set("otto_last_scan_time", now.toISOString(), {

        maxAge: 86400,

        path: "/",

        httpOnly: true,

        sameSite: "strict",

      });



      parsedData.nextAllowedTime = nextAllowed.toISOString();

    }



    return NextResponse.json(parsedData);



  } catch (error: any) {

    console.error("AI Analysis Detailed Error:", error);

    return NextResponse.json(

      {

        isDrawing: false,

        message: error.message || "Failed to analyze artwork. Please try again.",

      },

      { status: 500 }

    );

  }

} 

