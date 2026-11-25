"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, CheckCircle2, LayoutDashboard,
  Swords, Scan, Trophy, Compass, User, Settings, PanelLeft, X, ChevronRight,
  Sparkles, Check, ShieldAlert, Palette, Grid, Zap, RefreshCw, Star, Volume2, VolumeX
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { updateActivityStreak } from "@/lib/streak";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";
import LoadingScreen from "@/components/LoadingScreen";

const MAX_CHALLENGE_XP = 200;

declare global {
  interface Window {
    __OTTERLEO_CHALLENGE_FLOW_ACTIVE__?: boolean;
  }
}

function TypewriterText({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className="font-mono text-slate-800 tracking-wide inline-block">
      {displayedText}
      <span className="animate-pulse text-blue-600 font-bold ml-0.5">|</span>
    </span>
  );
}

interface TutorialStep {
  step: number;
  title: string;
  instruction: string;
  tips: string[];
  imageUrl?: string;
  typewriterText?: string;
}

interface LocalChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xp: number;
  stepsCount: number;
  previewImage: string;
  steps: TutorialStep[];
}

const CUBE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil first", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw a shaded cube!"
  },
  {
    step: 2,
    title: "Step 2: Draw a Square Base",
    instruction: "Draw a clean square in the center of your page to start the front face of the cube.",
    tips: ["Keep all four sides nearly equal", "Draw light and neat lines"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/cube1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add 3D Cube Edges",
    instruction: "Draw slanted lines going back from the top and right corners, then connect them to form the top and side faces.",
    tips: ["Keep the slanted lines parallel", "Make corners meet cleanly"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/cube2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Shade the Side and Cast Shadow",
    instruction: "Shade the right side face softly and draw a dark shadow on the ground beside the cube for a 3D look.",
    tips: ["Keep the top face lightest", "Blend the side shading smoothly"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/cube3.jpeg"
  }
];

const FLOWER_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for drawing", "Keep an eraser ready"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Grab your pencil and paper!"
  },
  {
    step: 2,
    title: "Step 2: Draw a Circle in the Middle",
    instruction: "Draw a clean and small circle right in the center of your page for the flower center.",
    tips: ["Draw a light circle first", "Make it round and neat"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/FLOWER1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Draw Five Petals",
    instruction: "Draw five curved petals around the center circle, touching each other nicely.",
    tips: ["Keep all petals similar in size", "Do not press too hard"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/FLOWER2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Draw Stem and Leaves",
    instruction: "Draw a straight line going down from the flower, and add two leaf shapes on the sides.",
    tips: ["Keep the stem straight", "Make two clean leaves"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/FLOWER3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Add Shading",
    instruction: "Shade softly inside the petals and leaves with your pencil to make it look real.",
    tips: ["Blend pencil lines gently", "Make borders darker"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/FLOWER4.jpeg"
  }
];

const FISH_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for drawing", "Keep an eraser ready"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Grab your pencil and paper!"
  },
  {
    step: 2,
    title: "Step 2: Shape a Sleeping Oval",
    instruction: "Draw a light sleeping oval shape with a pointed tip on the right side.",
    tips: ["Keep your hand loose", "Draw light lines first"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/fish%201.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Top Fin and Tail",
    instruction: "Make a smooth curve on top for the upper fin, and join two curved shapes on the right for the tail.",
    tips: ["Keep curves smooth", "Match both tail parts"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/fish%202.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Add Eye, Smile and Side Fin",
    instruction: "Draw a round eye with a tiny white dot, a cute smile, a leaf-shaped side fin, and thin lines inside the fins.",
    tips: ["Leave the white dot empty in the eye", "Draw light lines inside fins"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/fish3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Add Shading and Bubbles",
    instruction: "Shade softly along the top back and fins, then draw two round bubbles near the face.",
    tips: ["Keep pencil shading soft", "Make neat round bubbles"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/fish4.jpeg"
  }
];

const CAR_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for the car body", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw a car!"
  },
  {
    step: 2,
    title: "Step 2: Draw the Car Body Outline",
    instruction: "Sketch a smooth side profile with a curved roof, hood, and straight bottom line.",
    tips: ["Keep the bottom line straight", "Make the roof curve smooth"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/car1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Wheels and Windows",
    instruction: "Draw two round wheels with inner circles at the bottom, and add two window shapes inside the roof.",
    tips: ["Keep both wheels nearly equal in size", "Leave space between the two windows"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/car2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Add Lights, Bumpers and Door Handle",
    instruction: "Draw the front headlight, back tail light, front and back bumpers, door handle, and base line.",
    tips: ["Keep small details neat and clean", "Align lights and bumpers evenly"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/car3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Add Window Shine, Shading and Shadow",
    instruction: "Add small shine lines on the windows, shade the tires and body lightly, and draw a ground shadow below.",
    tips: ["Keep window highlights clean", "Blend the ground shadow softly"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/car4.jpeg"
  }
];

const LEAF_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for the leaf shape", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw a leaf!"
  },
  {
    step: 2,
    title: "Step 2: Draw Leaf Outline, Stem and Center Vein",
    instruction: "Sketch a slanted oval leaf shape with a pointed tip, add the stem at the bottom, and draw a line down the center.",
    tips: ["Keep lines light first", "Make the center line go up to the tip"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LEAF1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Side Veins and Edge Details",
    instruction: "Draw curved side veins branching from the center line and add small jagged touches along the outer edge.",
    tips: ["Curve veins gently toward the tip", "Keep edge notches small and neat"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LEAF2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Add Soft Leaf Shading",
    instruction: "Shade softly across the leaf and along the stem to bring out the veins and natural texture.",
    tips: ["Keep pencil shading light and smooth", "Let the veins stand out cleanly"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LEAF3.jpeg"
  }
];

const BUTTERFLY_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for symmetrical wings", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw a butterfly!"
  },
  {
    step: 2,
    title: "Step 2: Sketch Guide Lines and Wing Shapes",
    instruction: "Draw a light vertical center line and sketch matching upper and lower wing guides on both sides.",
    tips: ["Keep left and right wings balanced", "Draw guide lines lightly first"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/butterfly1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Draw the Body and Smooth Wing Outlines",
    instruction: "Draw an oval body in the center and round out the upper and lower wing edges cleanly.",
    tips: ["Keep the body centered", "Make wing curves smooth on both sides"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/butterfly2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Add Head and Curved Antennae",
    instruction: "Draw a small circle at the top of the body for the head and add two curved antennae.",
    tips: ["Keep both antennae balanced", "Clean up extra guide lines gently"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/butterfly3.jpeg"
  }
];

const TIE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for clean straight lines", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw a tie!"
  },
  {
    step: 2,
    title: "Step 2: Draw the Tie Knot and Tapered Body",
    instruction: "Draw a small trapezoid knot near the top, then connect a long tapered tie body ending in a pointed tip at the bottom.",
    tips: ["Keep left and right edges symmetrical", "Draw light straight lines first"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/tie1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Collar Flaps Around the Knot",
    instruction: "Draw two angled collar shapes extending outward and downward on both sides of the top knot.",
    tips: ["Match the angle of both collar sides", "Keep corners crisp and neat"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/tie2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Draw Diagonal Stripe Bands",
    instruction: "Draw evenly spaced slanted stripe lines across the tie body from top-left to bottom-right.",
    tips: ["Keep the stripes parallel", "Space them evenly down the tie"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/tie3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Add Shading and Contrast",
    instruction: "Shade alternating stripes and add soft shading along the collar and knot for a clean 3D look.",
    tips: ["Keep alternating stripes lighter for contrast", "Blend pencil strokes smoothly"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/tie4.jpeg"
  }
];

const ANIME_BOY_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for face proportions", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw an anime boy!"
  },
  {
    step: 2,
    title: "Step 2: Sketch Head Outline and Guide Lines",
    instruction: "Draw a vertical center line, a horizontal eye guide line, and a pointed anime jawline shape.",
    tips: ["Keep guide lines light", "Make the chin angle smooth"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/animemale1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Ears and Neck Lines",
    instruction: "Draw ears along the eye-line zone on both sides and add two curved neck lines below the jaw.",
    tips: ["Keep both ears balanced", "Connect the neck smoothly to the chin"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/animemale2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Draw Spiky Hair, Eyes and Facial Guides",
    instruction: "Sketch spiky hair strands around the head, eyebrows, anime eye shapes, and light nose and mouth marks.",
    tips: ["Vary the hair spikes naturally", "Align both eyes along the horizontal line"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/animemale3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Refine Eyes, Hair Strands and Details",
    instruction: "Draw the irises, pupils, and eye shine highlights, and refine the spiky hair and collar lines cleanly.",
    tips: ["Leave bright shine spots in the eyes", "Clean up extra guide lines gently"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/animemale4.jpeg"
  }
];

const ANIME_GIRL_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for face proportions", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw an anime girl!"
  },
  {
    step: 2,
    title: "Step 2: Sketch Head Shape, Guidelines and Neck",
    instruction: "Draw a vertical center line, a horizontal eye guide line, a soft anime face outline, and neck curves.",
    tips: ["Keep guide lines light", "Keep the chin soft and balanced"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/animegirl1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Hair Flow, Bangs and Ears",
    instruction: "Sketch flowing long hair around the head, front bangs framing the forehead, and small ears near the eye line.",
    tips: ["Keep left and right hair flow balanced", "Draw bangs with gentle curves"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/animegirl2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Refine Bang Strands and Hair Layers",
    instruction: "Separate the front bangs into clean strands and add flowing inner hair curves along the sides and shoulders.",
    tips: ["Keep strand tips pointed lightly", "Follow the natural curve of the hair"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/animegirl3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Draw Big Anime Eyes, Eyebrows, Nose and Mouth",
    instruction: "Add expressive anime eyes with shine highlights, thin eyebrows, a tiny nose mark, and a soft mouth, then erase extra guides.",
    tips: ["Leave bright shine spots inside both eyes", "Keep facial features centered cleanly"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/animegirl4.jpeg"
  }
];

const EYE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw an eye!"
  },
  {
    step: 2,
    title: "Step 2: Draw Eye Outline",
    instruction: "Draw an almond shape for the eye with a small curve at the corner.",
    tips: ["Keep lines light and soft", "Make matching curves"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Draw Pupil and Light Dot",
    instruction: "Draw a big circle inside for the iris and a dark pupil. Leave a tiny white circle blank for light reflection.",
    tips: ["Do not shade the white light dot", "Make smooth circle shapes"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Add Eyelashes",
    instruction: "Draw dark and curved eyelashes on the top eyelid line.",
    tips: ["Make lashes point outwards", "Keep strokes sharp"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Final Shading",
    instruction: "Shade around the eye edges softly to give it a real 3D depth look.",
    tips: ["Blend shades smoothly", "Keep highlights clean"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye4.jpeg"
  }
];

const NOSE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw a nose!"
  },
  {
    step: 2,
    title: "Step 2: Basic Outline and Nostril Curves",
    instruction: "Draw light guide lines for the nose shape and smooth curves for the bottom nostrils.",
    tips: ["Keep your pencil strokes very light", "Keep both curves balanced"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/nose1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Define Bridge and Nostril Openings",
    instruction: "Darken the inner nostril holes for depth and refine the lines along the nose bridge.",
    tips: ["Keep the lines smooth", "Make the nostril openings neat"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/nose2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Soft Shading and Texture",
    instruction: "Add soft pencil shading along the sides and top of the nose to create realistic skin texture.",
    tips: ["Blend shading smoothly", "Keep your hand relaxed"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/NOSE3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: High Contrast and Highlights",
    instruction: "Deepen the shadows around the tip and edges, leaving a clean white highlight spot for a 3D look.",
    tips: ["High contrast creates realism", "Finish up your challenge when ready"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/NOSE4.jpeg"
  }
];

const LIP_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Keep your pencil sharp", "Use a soft eraser"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to shade lips!"
  },
  {
    step: 2,
    title: "Step 2: Draw Lip Outlines",
    instruction: "Sketch the top lip with a V-shape in the center and bottom lip curve gently.",
    tips: ["Keep lines very light", "Check balance on both sides"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Base Shading",
    instruction: "Apply soft pencil shading across both lips to make them look full and round.",
    tips: ["Darken the center line", "Keep outer edges soft"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Add Texture Lines",
    instruction: "Draw small light curved lines on the lips to show natural skin lines.",
    tips: ["Curve lines gently", "Do not press too hard"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Add Shine and Highlights",
    instruction: "Make lip corners dark and use your eraser to make a bright shine spot on the bottom lip.",
    tips: ["High contrast gives a glossy look", "Keep highlights clean and soft"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips%204.jpeg"
  }
];

const TWO_POINT_BUILDING_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil and straight ruler for perspective lines", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw a 2-point perspective building!"
  },
  {
    step: 2,
    title: "Step 2: Set Horizon, Vanishing Points and Center Corner",
    instruction: "Draw a horizontal horizon line with left and right vanishing points, a center vertical corner line, and guide lines connecting to both points.",
    tips: ["Keep perspective guide lines light", "Make the center vertical edge straight"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/building1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Draw Outer Walls and Middle Ledge",
    instruction: "Add the outer vertical edges of both walls and draw the protruding middle band along the perspective guide lines.",
    tips: ["Keep vertical walls parallel to the center line", "Align the middle band cleanly toward both vanishing points"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/building2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Add Upper Floor, Windows and Door",
    instruction: "Draw the upper story walls, windows on both sides, and the front entrance door following the left and right vanishing points.",
    tips: ["Align top and bottom window edges with the vanishing points", "Keep window and door spacing balanced"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/building3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Finalize Roof Ledge and Clean Outlines",
    instruction: "Add the top roof overhang ledge, refine all structural edges cleanly, and erase extra guide lines.",
    tips: ["Keep main building outlines crisp and neat", "Check alignment toward both vanishing points"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/building4.jpeg"
  }
];

const HEADPHONES_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for clean curves", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw cool headphones!"
  },
  {
    step: 2,
    title: "Step 2: Sketch Headband Arc and Earcups",
    instruction: "Draw a smooth curved arch at the top for the headband and sketch two matching oval-rounded earcups on the sides.",
    tips: ["Keep both earcups balanced in size", "Draw light guide strokes first"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/headphones1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Band Thickness, Sliders and Cushions",
    instruction: "Give the headband thickness, add the connector brackets on each side, and draw the inner cushion lines on both earcups.",
    tips: ["Keep the headband curve even", "Align left and right brackets cleanly"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/headphones2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Refine Cushion Edges and Details",
    instruction: "Add the inner padded band along the headband and refine the outer cushion curves on the earcups.",
    tips: ["Keep lines smooth and neat", "Check symmetry on both sides"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/headphones3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Add Soft Shading and Highlights",
    instruction: "Shade softly along the earcups, band edges, and brackets while keeping light highlights for a sleek 3D look.",
    tips: ["Blend shading smoothly", "Keep highlight bands clean"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/headphones4.jpeg"
  }
];

const WATERDROP_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for clean teardrop curves", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready for realistic water drop shading!"
  },
  {
    step: 2,
    title: "Step 2: Draw Clean Teardrop Outline",
    instruction: "Draw a smooth, symmetrical teardrop shape with a sharp top tip and a rounded base using light pencil strokes.",
    tips: ["Keep left and right curves balanced", "Draw light lines before adding shading"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/waterdrop1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Base Shading and Main Highlight",
    instruction: "Shade softly along the outer edges and upper-left curve while keeping a clean bright crescent highlight on the left.",
    tips: ["Leave the left highlight strip clean", "Keep initial shading soft and even"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/waterdrop2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Deepen Contrast, Bounce Light and Cast Shadow",
    instruction: "Deepen the upper-left shadow, add a pinpoint highlight dot, brighten the bottom-right rim, and blend a soft shadow below.",
    tips: ["Strong contrast makes water look realistic", "Blend the ground cast shadow smoothly"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/waterdrop3.jpeg"
  }
];

const SHADING_ROSE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for petal proportions", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready for realistic rose shading!"
  },
  {
    step: 2,
    title: "Step 2: Sketch Rose Outline and Petal Proportions",
    instruction: "Draw the tight center spiral, overlapping inner and outer petals, curved stem with thorns, and both leaves with light lines.",
    tips: ["Keep guidelines light so shading blends cleanly", "Balance the sizes of the outer petals and leaves"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/rose1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Mid-Tone Shading and Leaf Veins",
    instruction: "Shade softly inside petal folds and along leaf veins following the natural curve of each petal.",
    tips: ["Keep pencil strokes smooth and curved", "Leave lighter areas untouched for highlights"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/rose2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Deepen Contrast and 3D Depth",
    instruction: "Darken shadows around the center bud, under overlapping petals, and along the stem and leaves for strong 3D volume.",
    tips: ["Build dark values gradually in layers", "Keep highlights crisp for realistic depth"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/rose3.jpeg"
  }
];

const CHAIR_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for perspective lines", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw a 3D chair!"
  },
  {
    step: 2,
    title: "Step 2: Sketch Chair Frame and Guidelines",
    instruction: "Lightly sketch the seat plane, backrest posts, cross rail, and four angled legs with construction lines.",
    tips: ["Keep initial sketch lines light", "Check leg angles and seat perspective"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/chair4.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Refine Seat, Backrest and Support Bars",
    instruction: "Define the seat thickness, backrest panel, side stretcher bars, and leg edges cleanly.",
    tips: ["Keep wooden edges straight and neat", "Clean up extra construction marks gently"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/chair3.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Add Outline Depth and Light Shadow Guide",
    instruction: "Strengthen key structural contours and lightly outline the cast shadow under the chair.",
    tips: ["Keep outer edges crisp", "Lightly map where the shadow falls"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/chair2.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Shade Wood Surfaces and Cast Shadow",
    instruction: "Shade the chair legs, backrest, and seat edge with soft directional strokes, and blend the ground shadow underneath.",
    tips: ["Keep top surfaces lighter than shaded sides", "Blend the ground shadow smoothly for 3D depth"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/chair1.jpeg"
  }
];

const LOOMIS_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for construction lines", "Keep an eraser ready"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw a Loomis head!"
  },
  {
    step: 2,
    title: "Step 2: Draw the Sphere and Cross Guidelines",
    instruction: "Draw a clean circle for the cranium and add a vertical center line with a horizontal brow line across it.",
    tips: ["Keep guidelines light", "Make the cross lines straight"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/loomis1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Build the Jawline and Nose Angle",
    instruction: "Extend the front profile for the nose and chin, then connect a clean jawline angle up toward the back of the head.",
    tips: ["Keep proportions balanced", "Check the chin and nose alignment"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/loomis2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Place the Ear and Neck Structure",
    instruction: "Draw an oval ear guide behind the jaw line along the brow-to-nose zone, and add light neck lines below.",
    tips: ["Keep the ear angled naturally", "Connect the neck smoothly"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/loomis3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Refine Facial Features and Clean Up",
    instruction: "Sketch the eyebrow, eye, lips, and detailed ear inside your guide lines, then softly clean up extra marks.",
    tips: ["Refine shapes step by step", "Keep main outlines clear"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/loomis4.jpeg"
  }
];

const HAIR_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a sharp pencil for fine hair strokes", "Keep a kneaded or soft eraser ready"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw realistic hair!"
  },
  {
    step: 2,
    title: "Step 2: Sketch the Hair Outline and Parting",
    instruction: "Draw light flowing curves from the center parting to shape the overall hair volume around the head.",
    tips: ["Keep your lines loose and flowing", "Focus on big hair sections first"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/hair1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Hair Flow and Strand Lines",
    instruction: "Draw long curved strokes following the wave direction from the roots to the tips to build natural movement.",
    tips: ["Follow the wave curve smoothly", "Keep the roots slightly darker"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/hair2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Layer Mid-Tones and Depth",
    instruction: "Shade between the hair clumps with medium-dark strokes while leaving bright white bands untouched for shine.",
    tips: ["Do not shade over the shine bands", "Build depth layer by layer"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/hair3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Deepen Shadows and Add Flyaway Strands",
    instruction: "Darken the roots and under-layers for strong contrast, then add thin loose flyaway hairs around the edges.",
    tips: ["High contrast creates silky realism", "Add light flyaway strands for a natural finish"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/hair4.jpeg"
  }
];

const HAND_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for hand proportions", "Keep an eraser ready"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready for realistic hand shading!"
  },
  {
    step: 2,
    title: "Step 2: Sketch Hand Proportions and Finger Angles",
    instruction: "Lightly map out the wrist, palm, thumb, and curved fingers with clean proportions before adding detail.",
    tips: ["Keep initial lines light and loose", "Check finger lengths and angles carefully"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/hand1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Refine Contours and Knuckle Lines",
    instruction: "Define the outer edges, finger joints, knuckles, and nails cleanly while keeping inner forms clear.",
    tips: ["Follow natural curves around knuckles", "Keep nails clean and proportionate"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/hand2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Build Mid-Tone Shading and Skin Form",
    instruction: "Apply soft layered shading along the underside of fingers, palm creases, and curved edges to build volume.",
    tips: ["Shade along the direction of the form", "Leave lighter highlights on top surfaces"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/hand3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Deepen Shadows and Ground Shadow",
    instruction: "Darken deep crevices between fingers and under the hand, then blend the cast shadow smoothly on the surface.",
    tips: ["Build strong contrast for realism", "Blend shadows evenly without harsh edges"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/hand4.jpeg"
  }
];

const GLASS_BOTTLE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for clean glass contours", "Keep an eraser ready for crisp highlights"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready for glass bottle shading!"
  },
  {
    step: 2,
    title: "Step 2: Draw the Bottle Outline and Neck Threads",
    instruction: "Sketch a clean symmetrical bottle outline with a threaded neck, rounded shoulders, straight sides, and base curve.",
    tips: ["Keep left and right curves balanced", "Draw light construction lines before darkening edges"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/bottle1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Light Glass Reflections and Base Depth",
    instruction: "Sketch vertical reflection bands along the body, inner glass thickness lines, and light base curvature.",
    tips: ["Leave bright vertical strips untouched for glass shine", "Keep pencil strokes light and even"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/bottle2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Build Mid-Tone Shading Inside the Bottle",
    instruction: "Layer soft shading inside the neck, along the inner body walls, and around the bottom glass rim.",
    tips: ["Shade gradually in smooth layers", "Preserve crisp white highlight edges"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/bottlee3.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Deepen Contrast and Ground Cast Shadow",
    instruction: "Darken the neck shadows, inner reflections, and thick glass rim, then blend a soft shadow on the ground.",
    tips: ["Strong contrast makes glass look transparent and glossy", "Keep highlight strips sharp and clean"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/botttlee4.jpeg"
  }
];

const CLOTH_FOLD_TEXTURE_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: "Step 1: Get Your Pencil Ready",
    instruction: "",
    tips: ["Use a light pencil for drape outlines and a soft pencil for shading", "Keep an eraser handy"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif",
    typewriterText: "Get ready to draw cloth fold texture!"
  },
  {
    step: 2,
    title: "Step 2: Sketch Cloth Drape and Fold Lines",
    instruction: "Draw the outer draped cloth shape and trace the main ridge and crease lines flowing down to the base.",
    tips: ["Keep initial lines light and flowing", "Follow how fabric gathers and spreads at the bottom"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/cloth1.jpeg"
  },
  {
    step: 3,
    title: "Step 3: Add Soft Crease Shadows and Base Tones",
    instruction: "Shade softly inside the fold valleys and along the draped curves to separate raised ridges from recessed folds.",
    tips: ["Keep shadows softer in open areas and deeper in creases", "Build shading gently without harsh lines"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/cloth2.jpeg"
  },
  {
    step: 4,
    title: "Step 4: Build Mid-Tones and Fabric Texture",
    instruction: "Layer medium pencil tones across the cloth body with fine directional strokes while keeping raised ridges lighter.",
    tips: ["Follow the flow of the fabric with your pencil strokes", "Preserve lighter highlight zones on fold peaks"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/cloth2.jpeg"
  },
  {
    step: 5,
    title: "Step 5: Deepen Fold Contrast, Texture and Ground Shadow",
    instruction: "Darken deep fold creases and under-edges, refine the woven cloth texture, and blend a soft cast shadow beneath the fabric.",
    tips: ["Strong contrast in creases makes folds look three-dimensional", "Blend the ground shadow smoothly under the hem"],
    imageUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/cloth4.jpeg"
  }
];

const LOCAL_CHALLENGES: LocalChallenge[] = [
  {
    id: "classic-flower-beginner",
    title: "Challenge: Classic Flower Drawing",
    description: "Learn how to draw a beautiful 5-petal classic flower step by step with easy shading.",
    difficulty: "beginner",
    xp: 50,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/FLOWER4.jpeg",
    steps: FLOWER_STEPS
  },
  {
    id: "cute-fish-beginner",
    title: "Challenge: Cute Fish Drawing",
    description: "Learn how to draw an adorable cartoon fish step by step with fins, bubbles, and soft shading.",
    difficulty: "beginner",
    xp: 30,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/fish4.jpeg",
    steps: FISH_STEPS
  },
  {
    id: "car-drawing-beginner",
    title: "Challenge: Car Drawing",
    description: "Draw the car body, add wheels and windows, include lights and bumpers, and finish with shading step by step.",
    difficulty: "beginner",
    xp: 45,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/car4.jpeg",
    steps: CAR_STEPS
  },
  {
    id: "shaded-cube-beginner",
    title: "Challenge: Shaded Cube",
    description: "Learn 3D cube shapes, clean edges, side shading, and ground shadow step by step.",
    difficulty: "beginner",
    xp: 30,
    stepsCount: 3,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/cube3.jpeg",
    steps: CUBE_STEPS
  },
  {
    id: "leaf-drawing-beginner",
    title: "Challenge: Leaf Drawing",
    description: "Draw the leaf shape and center vein, add side veins, and finish with soft shading step by step.",
    difficulty: "beginner",
    xp: 40,
    stepsCount: 3,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LEAF3.jpeg",
    steps: LEAF_STEPS
  },
  {
    id: "butterfly-drawing-beginner",
    title: "Challenge: Butterfly Drawing",
    description: "Sketch wing guides, draw the body and wing outlines, and add the head and antennae step by step.",
    difficulty: "beginner",
    xp: 45,
    stepsCount: 3,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/butterfly3.jpeg",
    steps: BUTTERFLY_STEPS
  },
  {
    id: "tie-drawing-beginner",
    title: "Challenge: Tie Drawing",
    description: "Draw the knot and tapered tie body, add collar flaps and stripes, and finish with shading step by step.",
    difficulty: "beginner",
    xp: 35,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/tie4.jpeg",
    steps: TIE_STEPS
  },
  {
    id: "anime-boy-intermediate",
    title: "Challenge: Anime Boy",
    description: "Sketch head guides and jawline, add ears and neck, draw spiky hair and eyes, and finish with clean anime details step by step.",
    difficulty: "intermediate",
    xp: 85,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/animemale4.jpeg",
    steps: ANIME_BOY_STEPS
  },
  {
    id: "anime-girl-intermediate",
    title: "Challenge: Anime Girl",
    description: "Sketch face guides and neck, add flowing hair and bangs, refine hair layers, and finish with big anime eyes and expression step by step.",
    difficulty: "intermediate",
    xp: 85,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/animegirl4.jpeg",
    steps: ANIME_GIRL_STEPS
  },
  {
    id: "eye-drawing-1min",
    title: "Challenge: The Realistic Eye",
    description: "Master iris details, pupil depth, eyelid folds, and realistic eyelashes step by step.",
    difficulty: "intermediate",
    xp: 60,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/eye4.jpeg",
    steps: EYE_STEPS
  },
  {
    id: "nose-drawing-challenge",
    title: "Challenge: The Realistic Nose",
    description: "Master nose bridge structure, nostril curves, skin texture shading, and 3D highlights step by step.",
    difficulty: "intermediate",
    xp: 70,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/NOSE4.jpeg",
    steps: NOSE_STEPS
  },
  {
    id: "lip-drawing-challenge",
    title: "Challenge: The Realistic Lip",
    description: "Learn lip contours, vertical crease texturing, soft volume shading, and glossy highlights.",
    difficulty: "intermediate",
    xp: 80,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/lips%204.jpeg",
    steps: LIP_STEPS
  },
  {
    id: "two-point-building-intermediate",
    title: "Challenge: 2-Point Perspective Building",
    description: "Set vanishing points and center corner, build outer walls and middle ledge, add windows and door, and finish with roof ledge step by step.",
    difficulty: "intermediate",
    xp: 85,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/building4.jpeg",
    steps: TWO_POINT_BUILDING_STEPS
  },
  {
    id: "cool-headphones-intermediate",
    title: "Challenge: Cool Headphones",
    description: "Sketch the headband and earcups, add cushions and brackets, and finish with soft 3D shading step by step.",
    difficulty: "intermediate",
    xp: 75,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/headphones4.jpeg",
    steps: HEADPHONES_STEPS
  },
  {
    id: "realistic-waterdrop-intermediate",
    title: "Challenge: The Realistic Water Drop",
    description: "Draw a clean teardrop outline, add base shading and main highlight, and finish with contrast, bounce light, and cast shadow step by step.",
    difficulty: "intermediate",
    xp: 75,
    stepsCount: 3,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/waterdrop3.jpeg",
    steps: WATERDROP_STEPS
  },
  {
    id: "shading-rose-intermediate",
    title: "Challenge: Shading Rose",
    description: "Sketch rose outline and petal proportions, layer mid-tones and leaf veins, and finish with deep contrast and 3D depth step by step.",
    difficulty: "intermediate",
    xp: 90,
    stepsCount: 3,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/rose3.jpeg",
    steps: SHADING_ROSE_STEPS
  },
  {
    id: "chair-drawing-intermediate",
    title: "Challenge: Chair Drawing",
    description: "Sketch the chair frame and guidelines, refine the seat, backrest, and support bars, and finish with shading and ground shadow step by step.",
    difficulty: "intermediate",
    xp: 80,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/chair4.jpeg",
    steps: CHAIR_STEPS
  },
  {
    id: "loomis-head-challenge",
    title: "Challenge: The Loomis Head",
    description: "Learn head proportions, sphere and jawline construction, ear placement, and facial features step by step.",
    difficulty: "advanced",
    xp: 100,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/loomis4.jpeg",
    steps: LOOMIS_STEPS
  },
  {
    id: "realistic-hair-challenge",
    title: "Challenge: Realistic Hair Shading",
    description: "Master flowing hair clumps, silky shine highlights, deep root shadows, and natural flyaway strands step by step.",
    difficulty: "advanced",
    xp: 120,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/hair4.jpeg",
    steps: HAIR_STEPS
  },
  {
    id: "realistic-hand-shading-challenge",
    title: "Challenge: Realistic Hand Shading",
    description: "Master hand proportions, knuckle contours, soft skin shading, and cast shadows step by step.",
    difficulty: "advanced",
    xp: 120,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/hand4.jpeg",
    steps: HAND_STEPS
  },
  {
    id: "glass-bottle-shading-advanced",
    title: "Challenge: Glass Bottle Shading",
    description: "Master bottle proportions, glass reflections, layered mid-tone shading, and crisp highlights step by step.",
    difficulty: "advanced",
    xp: 130,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/botttlee4.jpeg",
    steps: GLASS_BOTTLE_STEPS
  },
  {
    id: "cloth-fold-texture-advanced",
    title: "Challenge: Cloth Fold Texture",
    description: "Sketch fabric folds and creases, build layered shading and crease contrast, and finish with cloth texture and ground shadow step by step.",
    difficulty: "advanced",
    xp: 140,
    stepsCount: 4,
    previewImage: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/cloth4.jpeg",
    steps: CLOTH_FOLD_TEXTURE_STEPS
  }
];

export default function ChallengesPage() {
  const isOffline = useOfflineGuard();

  const [userXp, setUserXp] = useState<number>(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const [activeView, setActiveView] = useState<'hub' | 'challenge-flow'>('hub');
  const [activeChallengeId, setActiveChallengeId] = useState<string>("classic-flower-beginner");
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [showLevelModal, setShowLevelModal] = useState<boolean>(false);

  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/logo.png";
  const ottoMascotUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Otterly%20Take%20the%20Challenge%20(1)%20(2)%20(1).png";
  const challengesBannerUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/challangesotto.jpeg";
  const claimMascotUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Cheerful%20Otter%20Mascot%20with%20Star%20Icon%20(1)%20(1).png";

  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgMusicIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bgMusicStepRef = useRef<number>(0);

  useEffect(() => {
    const isChallengeActive = activeView === "challenge-flow";
    window.__OTTERLEO_CHALLENGE_FLOW_ACTIVE__ = isChallengeActive;
    window.dispatchEvent(
      new CustomEvent("challengeFlowChange", {
        detail: { active: isChallengeActive },
      })
    );

    return () => {
      window.__OTTERLEO_CHALLENGE_FLOW_ACTIVE__ = false;
      window.dispatchEvent(
        new CustomEvent("challengeFlowChange", {
          detail: { active: false },
        })
      );
    };
  }, [activeView]);

  const ensureAudioContext = useCallback(async () => {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioCtxRef.current || (audioCtxRef.current.state as string) === "closed") {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;

    if ((ctx.state as string) === "closed") return null;
    if (ctx.state === "suspended") {
      await ctx.resume().catch(() => {});
    }
    if ((ctx.state as string) === "closed") return null;
    return ctx;
  }, []);

  const stopSweetBgMusic = useCallback(() => {
    if (bgMusicIntervalRef.current) {
      clearInterval(bgMusicIntervalRef.current);
      bgMusicIntervalRef.current = null;
    }
  }, []);

  const startSweetBgMusic = useCallback(async () => {
    if (isMuted || activeView !== "challenge-flow") {
      stopSweetBgMusic();
      return;
    }

    const ctx = await ensureAudioContext();
    if (!ctx) return;

    if (bgMusicIntervalRef.current) return;

    const grooveSteps = [
      { freq: 523.25, pulse: 783.99 },
      { freq: 659.25, pulse: 523.25 },
      { freq: 783.99, pulse: 659.25 },
      { freq: 880.00, pulse: 587.33 },
      { freq: 783.99, pulse: 987.77 },
      { freq: 659.25, pulse: 783.99 },
      { freq: 587.33, pulse: 880.00 },
      { freq: 659.25, pulse: 523.25 },
    ];

    const playMinimalBeat = () => {
      if (isMuted || activeView !== "challenge-flow") return;
      const currentCtx = audioCtxRef.current;
      if (!currentCtx || (currentCtx.state as string) !== "running") return;

      try {
        const now = currentCtx.currentTime;
        const stepIdx = bgMusicStepRef.current;
        const { freq, pulse } = grooveSteps[stepIdx % grooveSteps.length];
        bgMusicStepRef.current += 1;

        const mainOsc = currentCtx.createOscillator();
        const mainGain = currentCtx.createGain();
        mainOsc.type = "triangle";
        mainOsc.frequency.setValueAtTime(freq, now);

        mainGain.gain.setValueAtTime(0.0001, now);
        mainGain.gain.linearRampToValueAtTime(0.036, now + 0.02);
        mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

        mainOsc.connect(mainGain);
        mainGain.connect(currentCtx.destination);
        mainOsc.start(now);
        mainOsc.stop(now + 0.36);

        const tapOsc = currentCtx.createOscillator();
        const tapGain = currentCtx.createGain();
        tapOsc.type = "sine";
        tapOsc.frequency.setValueAtTime(pulse, now + 0.24);

        tapGain.gain.setValueAtTime(0.0001, now + 0.24);
        tapGain.gain.linearRampToValueAtTime(0.022, now + 0.255);
        tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.44);

        tapOsc.connect(tapGain);
        tapGain.connect(currentCtx.destination);
        tapOsc.start(now + 0.24);
        tapOsc.stop(now + 0.46);
      } catch {}
    };

    playMinimalBeat();
    bgMusicIntervalRef.current = setInterval(playMinimalBeat, 480);
  }, [activeView, ensureAudioContext, isMuted, stopSweetBgMusic]);

  const triggerHaptic = () => {
    ensureAudioContext();
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const playCelebrationSound = async () => {
    if (typeof window === "undefined") return;

    try {
      const ctx = await ensureAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      const melody = [
        { freq: 523.25, time: 0.0, duration: 0.45, vol: 0.14 },
        { freq: 659.25, time: 0.14, duration: 0.45, vol: 0.14 },
        { freq: 783.99, time: 0.28, duration: 0.5, vol: 0.14 },
        { freq: 1046.50, time: 0.44, duration: 0.9, vol: 0.16 },
        { freq: 987.77, time: 0.72, duration: 0.4, vol: 0.11 },
        { freq: 1046.50, time: 0.92, duration: 1.4, vol: 0.16 },
        { freq: 1318.51, time: 1.15, duration: 1.5, vol: 0.12 },
        { freq: 1567.98, time: 1.4, duration: 1.6, vol: 0.10 },
      ];

      melody.forEach((note) => {
        if ((ctx.state as string) === "closed") return;
        const osc = ctx.createOscillator();
        const overtone = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        overtone.type = "triangle";
        overtone.frequency.setValueAtTime(note.freq * 2, now + note.time);

        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.02, now + note.time);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.duration);

        gain.gain.setValueAtTime(0.001, now + note.time);
        gain.gain.linearRampToValueAtTime(note.vol, now + note.time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.duration);

        osc.connect(gain);
        overtone.connect(overtoneGain);
        overtoneGain.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.time);
        overtone.start(now + note.time);
        osc.stop(now + note.time + note.duration + 0.05);
        overtone.stop(now + note.time + note.duration + 0.05);
      });
    } catch {}
  };

  const toggleMute = () => {
    triggerHaptic();
    setIsMuted(prev => {
      const nextMute = !prev;
      if (nextMute) {
        stopSweetBgMusic();
      } else {
        startSweetBgMusic();
      }
      return nextMute;
    });
  };

  useEffect(() => {
    setMounted(true);

    const unlockOnFirstInteraction = () => {
      ensureAudioContext().then((ctx) => {
        if (ctx && activeView === "challenge-flow" && !isMuted) {
          startSweetBgMusic();
        }
      });
    };

    window.addEventListener("pointerdown", unlockOnFirstInteraction, { once: true });
    window.addEventListener("keydown", unlockOnFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockOnFirstInteraction);
      window.removeEventListener("keydown", unlockOnFirstInteraction);
      stopSweetBgMusic();
      if (audioCtxRef.current && (audioCtxRef.current.state as string) !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [activeView, ensureAudioContext, isMuted, startSweetBgMusic, stopSweetBgMusic]);

  useEffect(() => {
    if (activeView === "challenge-flow" && !isMuted) {
      startSweetBgMusic();
    } else {
      stopSweetBgMusic();
    }
    return () => {
      stopSweetBgMusic();
    };
  }, [activeView, isMuted, startSweetBgMusic, stopSweetBgMusic]);

  useEffect(() => {
    const claimImg = new window.Image();
    claimImg.src = claimMascotUrl;

    LOCAL_CHALLENGES.forEach((challenge) => {
      const stepOne = challenge.steps.find((st) => st.step === 1);
      if (stepOne?.imageUrl) {
        const img = new window.Image();
        img.src = stepOne.imageUrl;
      }
    });
  }, [claimMascotUrl]);

  const handleSelectLevel = (level: "beginner" | "intermediate" | "advanced") => {
    triggerHaptic();
    setSelectedDifficulty(level);
    setShowLevelModal(false);
  };

  const fetchPageData = useCallback(async () => {
    if (typeof window !== "undefined") {
      const cachedXp = localStorage.getItem("user_xp_cache");
      if (cachedXp) {
        setUserXp(Number(cachedXp));
      }
    }

    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 1500);

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (authError || !user) {
        if (!isOffline && typeof window !== "undefined" && navigator.onLine) {
          setIsVerified(false);
        }
        return;
      }

      if (!user.email_confirmed_at) {
        setIsVerified(false);
        return;
      }

      setIsVerified(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("skill_level")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.skill_level) {
        const fetchedLevel = String(profile.skill_level).toLowerCase() as "beginner" | "intermediate" | "advanced";
        if (["beginner", "intermediate", "advanced"].includes(fetchedLevel)) {
          setSelectedDifficulty(fetchedLevel);
        }
      }

      const { data: completed } = await supabase
        .from("user_completed_challenges")
        .select("challenge_id")
        .eq("user_id", user.id);

      if (completed) {
        setCompletedChallenges(completed.map((c) => c.challenge_id));
      }
    } catch (err: unknown) {
      console.error("Error loading data:", err);
    } finally {
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  }, [isOffline]);

  useEffect(() => {
    fetchPageData();

    const handleXpEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (typeof customEvent.detail === 'number') {
        setUserXp(customEvent.detail);
        if (typeof window !== "undefined") {
          localStorage.setItem("user_xp_cache", customEvent.detail.toString());
        }
      }
    };

    window.addEventListener('xpUpdated', handleXpEvent);
    return () => window.removeEventListener('xpUpdated', handleXpEvent);
  }, [fetchPageData]);

  const handleReviewChallenge = async () => {
    triggerHaptic();
    stopSweetBgMusic();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (user) {
        const updatedStreak = await updateActivityStreak(user.id);
        if (updatedStreak !== null) {
          window.dispatchEvent(new CustomEvent('streakUpdated', { detail: updatedStreak }));
        }
      }
    } catch (err: unknown) {
      console.error("Error updating streak on review:", err);
    } finally {
      setActiveView('hub');
    }
  };

  const handleOpenClaimModal = () => {
    triggerHaptic();
    stopSweetBgMusic();
    playCelebrationSound();
    setShowClaimModal(true);
  };

  const handleConfirmClaimXP = async (challenge: LocalChallenge) => {
    triggerHaptic();
    if (claimingId === challenge.id) return;

    const verifiedChallenge = LOCAL_CHALLENGES.find((c) => c.id === challenge.id);
    if (!verifiedChallenge) return;

    setClaimingId(verifiedChallenge.id);
    const previousXp = userXp;
    const safeXpToAdd = Math.max(0, Math.min(Number(verifiedChallenge.xp) || 0, MAX_CHALLENGE_XP));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || (await supabase.auth.getUser()).data.user;

      if (!user || !user.email_confirmed_at) {
        if (!isOffline) {
          alert("Please verify your account to complete challenges!");
        } else {
          alert("You are offline. Please connect to the internet.");
        }
        setClaimingId(null);
        setShowClaimModal(false);
        setActiveView('hub');
        return;
      }

      const { data: newTotalXp, error: rpcError } = await supabase.rpc('complete_challenge_and_add_xp', {
        p_challenge_id: verifiedChallenge.id,
        p_xp_to_add: safeXpToAdd
      });

      if (rpcError) {
        setUserXp(previousXp);
        console.error("RPC Error:", rpcError);
        alert("Server response slow. Please try again in a moment.");
        return;
      }

      const rawUpdatedXp = Number.isFinite(Number(newTotalXp))
        ? Number(newTotalXp)
        : previousXp + safeXpToAdd;
      const updatedXp = Math.min(rawUpdatedXp, previousXp + MAX_CHALLENGE_XP);

      const updatedStreak = await updateActivityStreak(user.id);
      if (updatedStreak !== null) {
        window.dispatchEvent(new CustomEvent('streakUpdated', { detail: updatedStreak }));
      }

      setUserXp(updatedXp);
      if (typeof window !== "undefined") {
        localStorage.setItem("user_xp_cache", updatedXp.toString());
      }
      setCompletedChallenges((prev) => Array.from(new Set([...prev, verifiedChallenge.id])));
      window.dispatchEvent(new CustomEvent('xpUpdated', { detail: updatedXp }));

      setShowClaimModal(false);
      setActiveView('hub');
    } catch (err: unknown) {
      setUserXp(previousXp);
      console.error("Error completing challenge:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      alert("Error saving challenge completion: " + message);
    } finally {
      setClaimingId(null);
    }
  };

  if (!mounted || loading) {
    return <LoadingScreen />;
  }

  if (isVerified === false && !isOffline) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 tracking-tight font-sans">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 max-w-md w-full text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Please verify your email address to complete challenges and earn XP.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              className="block w-full py-3.5 bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs rounded-2xl border-b-2 border-blue-800 transition text-center"
            >
              Log In / Verify Account
            </Link>
            <Link
              href="/dashboard"
              className="block w-full py-3 text-slate-500 font-black text-xs hover:bg-slate-50 rounded-2xl transition text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredChallenges = LOCAL_CHALLENGES.filter(
    c => selectedDifficulty ? c.difficulty === selectedDifficulty : true
  );

  const currentChallenge = LOCAL_CHALLENGES.find(c => c.id === activeChallengeId) || LOCAL_CHALLENGES[0];
  const activeStepList = currentChallenge.steps;
  const isCurrentDone = completedChallenges.includes(currentChallenge.id);
  const isLastStep = currentStep === activeStepList.length - 1;

  const desktopNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tools", path: "/tools", icon: Sparkles },
    { name: "Practice", path: "/practice", icon: Palette },
    { name: "Grid Maker", path: "/grid-maker", icon: Grid },
    { name: "Challenges", path: "/challenges", active: true, icon: Swords },
    { name: "Scan", path: "/scan", icon: Scan },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Learning Path", path: "/learning-path", icon: Compass },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const mobileGamifiedNav = [
    {
      path: "/dashboard",
      label: "Home",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/HOME.png",
      sizeClass: "w-[26px] h-[26px]"
    },
    {
      path: "/challenges",
      label: "Challenges",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/SWORD.png",
      sizeClass: "w-[26px] h-[26px]"
    },
    {
      path: "/otto-chat",
      label: "Otto Chat",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/chatnav.png",
      sizeClass: "w-[26px] h-[26px]"
    },
    {
      path: "/scan",
      label: "Scan",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/EYES%20NAV.png",
      sizeClass: "w-[30px] h-[30px]"
    },
    {
      path: "/leaderboard",
      label: "Leaderboard",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/Glossy%20Golden%20Crown%20Icon%20(2)%20(1).png",
      sizeClass: "w-[30px] h-[30px]"
    },
    {
      path: "/tools",
      label: "Tools",
      iconUrl: "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/settingnav.png",
      sizeClass: "w-[26px] h-[26px]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row tracking-tight font-sans pb-24 md:pb-0 relative">

      {showClaimModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-1 flex flex-col items-center justify-center">
              <div className="w-32 h-32 relative flex items-center justify-center mx-auto">
                <img
                  src={claimMascotUrl}
                  alt="Otto Celebration Mascot"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>

              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
                + {currentChallenge.xp} XP
              </h2>
            </div>

            <button
              onClick={() => handleConfirmClaimXP(currentChallenge)}
              disabled={claimingId === currentChallenge.id}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-base rounded-full shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {claimingId === currentChallenge.id ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Star className="w-5 h-5 fill-white text-white" />
                  <span>Claim XP</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {showLevelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

            <p className="text-[11px] font-black uppercase tracking-wider text-blue-600">
              QUESTION 1 OF 1
            </p>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              What is your current skill level?
            </h2>

            <div className="flex items-center gap-3 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
              <div className="w-14 h-14 relative shrink-0">
                <Image
                  src={ottoMascotUrl}
                  alt="Otto Mascot"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-slate-600 leading-snug">
                Challenges will be customized specifically for your level!
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">YOUR LEVEL</p>

              <div className="flex flex-wrap gap-2.5">
                {[
                  { level: "beginner", label: "Beginner" },
                  { level: "intermediate", label: "Intermediate" },
                  { level: "advanced", label: "Advanced" },
                ].map((item) => (
                  <button
                    key={item.level}
                    onClick={() => handleSelectLevel(item.level as "beginner" | "intermediate" | "advanced")}
                    className="px-5 py-3 rounded-full border border-slate-200 bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700 font-bold text-sm transition-all shadow-2xs hover:shadow-md active:scale-95 cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerHaptic();
              setIsMobileSidebarOpen(true);
            }}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <Image
            src={logoUrl}
            alt="Otterleo Logo"
            width={120}
            height={48}
            style={{ width: 'auto', height: 'auto' }}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>
      </header>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <aside className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Image
                  src={logoUrl}
                  alt="Otterleo Logo"
                  width={120}
                  height={48}
                  style={{ width: 'auto', height: 'auto' }}
                  className="h-10 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all border border-slate-200"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
                {desktopNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => {
                        triggerHaptic();
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                        item.active
                          ? "bg-[#2563EB] text-white border-b-4 border-blue-800"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Image
              src={logoUrl}
              alt="Otterleo Logo"
              width={160}
              height={64}
              style={{ width: 'auto', height: 'auto' }}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>

          <nav className="space-y-1.5">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={triggerHaptic}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                    item.active
                      ? "bg-[#2563EB] text-white border-b-4 border-blue-800"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-4 overflow-y-auto">

        <div className="hidden md:flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={triggerHaptic}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-xs hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {activeView === 'hub' ? (
          <>
            <div className="bg-white p-3 sm:p-4 rounded-[2rem] border border-slate-200/80 shadow-2xs flex items-center justify-center relative overflow-hidden">
              <img
                src={challengesBannerUrl}
                alt="Challenges with Otto"
                className="w-full h-28 sm:h-36 object-contain -rotate-1 hover:rotate-0 transition-transform duration-300 select-none"
              />
            </div>

            <div className="flex items-stretch justify-between bg-white rounded-full border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="flex flex-col justify-center pl-5 pr-4 py-2">
                <span className="text-[11px] font-bold text-slate-500 leading-tight">
                  Selected Level:
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 capitalize leading-tight">
                  {selectedDifficulty}
                </span>
              </div>

              <button
                onClick={() => setShowLevelModal(true)}
                className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 bg-[#071126] hover:bg-[#0D1B3A] active:scale-[0.99] text-white font-black text-xs sm:text-sm transition cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4 text-white" />
                <span>Change Level</span>
              </button>
            </div>

            <div className="space-y-4">
              {filteredChallenges.length === 0 ? (
                <div className="bg-[#E8F1FF] rounded-[2rem] p-8 border border-blue-100 text-center space-y-2">
                  <p className="text-sm font-black text-slate-700">No challenges available for this level yet.</p>
                  <p className="text-xs font-bold text-slate-500">Try changing your level to explore more challenges!</p>
                </div>
              ) : (
                filteredChallenges.map((challenge) => {
                  const isDone = completedChallenges.includes(challenge.id);
                  return (
                    <div
                      key={challenge.id}
                      className="relative overflow-hidden bg-[#E8F1FF] rounded-[2rem] p-5 border border-blue-100 shadow-2xs space-y-4"
                    >
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-28 bg-gradient-to-r from-transparent via-white/65 to-transparent animate-card-shine z-30" />

                      {isDone && (
                        <div className="flex justify-end w-full relative z-20">
                          <span className="text-[11px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        </div>
                      )}

                      <div className="w-full h-36 sm:h-44 flex items-center justify-center relative z-20">
                        <img
                          src={challenge.previewImage}
                          alt={challenge.title}
                          className="w-full h-full object-contain hover:scale-105 transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-3 relative z-20">
                        <div>
                          <h2 className="font-black text-slate-900 text-lg">{challenge.title}</h2>
                          <p className="text-xs font-bold text-slate-600 mt-1">
                            {challenge.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                          <span className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            +{challenge.xp} XP
                          </span>

                          <span className="px-2.5 py-1 rounded-full text-[11px] uppercase border bg-blue-50 text-blue-700 border-blue-200/70">
                            {challenge.stepsCount} STEPS
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            triggerHaptic();
                            ensureAudioContext();
                            setActiveChallengeId(challenge.id);
                            setActiveView('challenge-flow');
                            setCurrentStep(0);
                          }}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs border-b-2 transition-all cursor-pointer ${
                            isDone
                              ? "bg-slate-800 hover:bg-slate-900 text-white border-slate-950"
                              : "bg-[#2563EB] hover:bg-blue-600 text-white border-blue-800"
                          }`}
                        >
                          <span>{isDone ? 'Review Challenge' : 'Accept Challenge 🚀'}</span>
                          {!isDone && <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-[2rem] p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-[11px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-xl">
                Step {currentStep + 1} of {activeStepList.length}
              </span>
              <button
                onClick={() => {
                  triggerHaptic();
                  stopSweetBgMusic();
                  setActiveView('hub');
                }}
                className="text-xs font-black text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                Exit Mission
              </button>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">{activeStepList[currentStep].title}</h3>
              {activeStepList[currentStep].instruction && (
                <p className="text-xs font-bold text-slate-500 mt-0.5 leading-relaxed">
                  {activeStepList[currentStep].instruction}
                </p>
              )}
            </div>

            {activeStepList[currentStep].typewriterText ? (
              <div key={currentStep} className="w-full flex flex-col sm:flex-row-reverse items-center justify-center gap-3 sm:gap-5 py-2 px-1">

                <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 flex items-center justify-center relative">
                  {activeStepList[currentStep].imageUrl && (
                    <img
                      src={activeStepList[currentStep].imageUrl!}
                      alt="Otto Mascot Step"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="relative bg-blue-50/80 border border-blue-200 rounded-2xl px-5 py-3 shadow-2xs max-w-xs text-center sm:text-left">
                  <div className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-l-[10px] border-l-blue-200 border-b-8 border-b-transparent">
                    <div className="absolute right-[1px] -top-[7px] w-0 h-0 border-t-[7px] border-t-transparent border-l-[9px] border-l-blue-50 border-b-[7px] border-b-transparent" />
                  </div>

                  <div className="block sm:hidden absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-b-[10px] border-b-blue-200 border-r-8 border-r-transparent">
                    <div className="absolute -left-[7px] top-[1px] w-0 h-0 border-l-[7px] border-l-transparent border-b-[9px] border-b-blue-50 border-r-[7px] border-r-transparent" />
                  </div>

                  <p className="text-sm font-extrabold text-blue-950">
                    <TypewriterText text={activeStepList[currentStep].typewriterText || ""} speed={50} />
                  </p>
                </div>

              </div>
            ) : (
              <div key={currentStep} className="w-full h-48 sm:h-56 flex items-center justify-center relative overflow-hidden bg-slate-50/50 rounded-2xl">
                {activeStepList[currentStep].imageUrl && (
                  <img
                    src={activeStepList[currentStep].imageUrl!}
                    alt="Tutorial step reference"
                    className="w-full h-full object-contain scale-100 transition-all duration-200"
                  />
                )}
              </div>
            )}

            {currentStep !== 0 && activeStepList[currentStep].tips?.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200/60 p-3 rounded-2xl space-y-1.5">
                <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Pro Tips:
                </h4>
                <ul className="space-y-1">
                  {activeStepList[currentStep].tips.map((tip, idx) => (
                    <li key={idx} className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  triggerHaptic();
                  setCurrentStep(prev => Math.max(0, prev - 1));
                }}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-xl font-black text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition cursor-pointer"
              >
                Previous
              </button>

              <button
                onClick={toggleMute}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isMuted
                    ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                    : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                }`}
                title={isMuted ? "Unmute Music" : "Mute Music"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {!isLastStep ? (
                <button
                  onClick={() => {
                    triggerHaptic();
                    setCurrentStep(prev => Math.min(activeStepList.length - 1, prev + 1));
                  }}
                  className="px-5 py-2 rounded-xl font-black text-xs bg-[#2563EB] text-white hover:bg-blue-600 border-b-2 border-blue-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {isCurrentDone ? (
                    <button
                      onClick={handleReviewChallenge}
                      className="px-5 py-2 rounded-xl font-black text-xs bg-slate-800 hover:bg-slate-900 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Return to Hub</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenClaimModal}
                      className="px-5 py-2 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Finish & Claim +{currentChallenge.xp} XP</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {!isMobileSidebarOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:w-[410px] sm:mx-auto z-[399] transition-all duration-300 translate-y-0 opacity-100 pointer-events-none lg:hidden">
          <div className="w-full rounded-full border transition-colors duration-300 pointer-events-auto backdrop-blur-2xl shadow-2xl overflow-hidden bg-[#F0F6FF]/95 border-blue-100/80 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <nav className="w-full max-w-md mx-auto h-[56px] grid grid-cols-6 items-stretch justify-items-center relative px-2">
              {mobileGamifiedNav.map((item) => {
                const isActive = item.path === "/challenges";

                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    onClick={triggerHaptic}
                    aria-label={item.label}
                    className="group relative w-full h-full flex flex-col items-center justify-center focus:outline-none select-none cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 pointer-events-auto"
                  >
                    <div className={`relative flex flex-col items-center justify-center rounded-full transition-all duration-200 ${
                      isActive ? "bg-sky-100/70 border border-[#03A9F4]/70 shadow-xs w-[48px] h-[36px]" : "w-[38px] h-[38px]"
                    }`}>
                      <div className="relative flex items-center justify-center w-full h-full">
                        <img
                          alt={item.label}
                          className={`${item.sizeClass} object-contain rounded-lg drop-shadow-sm select-none`}
                          src={item.iconUrl}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

    </div>
  );
}
