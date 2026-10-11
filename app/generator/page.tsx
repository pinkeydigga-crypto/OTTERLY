'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowLeft, 
  Compass, 
  Target, 
  Clock, 
  Pencil, 
  Flame, 
  Camera, 
  RotateCcw,
  BookOpen,
  Layers,
  Zap,
  Smile,
  Shuffle
} from 'lucide-react';

export interface PromptDetail {
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  summary?: string;
  howToDraw: string[];
  focusPoints: string[];
  shadingTip: string;
  warmupExercise: string;
}

const CATEGORIES_DATA: Record<string, { name: string; icon: any; prompts: PromptDetail[] }> = {
  genz: {
    name: "Gen-Z Aesthetic",
    icon: Sparkles,
    prompts: [
      {
        title: "Girl with Oversized T-Shirt and Lower",
        category: "Gen-Z Aesthetic",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        howToDraw: [
          "Step 1: Draw a big box outline for the loose oversized T-shirt dropping down over the shoulders.",
          "Step 2: Add relaxed baggy straight lines for the lower sweatpants at the bottom.",
          "Step 3: Draw messy hair tied in a loose claw clip and add chunky sneakers on the feet."
        ],
        focusPoints: [
          "Wide baggy shoulders on the t-shirt.",
          "Loose cloth folds around the knees.",
          "Casual and chill posture."
        ],
        shadingTip: "Shade softly inside the baggy armpits and pant folds to show loose cotton fabric.",
        warmupExercise: "Draw 5 loose wave curves to practice baggy cloth lines."
      },
      {
        title: "Trendy Girl with Big Headphones",
        category: "Gen-Z Aesthetic",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        howToDraw: [
          "Step 1: Draw a round head shape with a messy hair bun on top.",
          "Step 2: Place a thick, bulky studio headphone band right over the head and ears.",
          "Step 3: Add tiny cute daisy flower dots under the eyes and a relaxed face expression."
        ],
        focusPoints: [
          "Thick round earcups on the headphones.",
          "Cute daisy face paint dots on the cheeks.",
          "Chill and calm eyes."
        ],
        shadingTip: "Keep your line art light and add a soft pink blush color on the cheeks.",
        warmupExercise: "Practice drawing 10 quick daisy flower petals."
      },
      {
        title: "Sleeping Cat & Boba Tea",
        category: "Gen-Z Aesthetic",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        howToDraw: [
          "Step 1: Draw a round curved shape for a sleeping cat curled up like a ball.",
          "Step 2: Draw a straight tall cup beside the cat with a wide straw sticking out.",
          "Step 3: Add tiny circles at the bottom of the cup for boba pearls."
        ],
        focusPoints: [
          "Soft furry circular outline for the cat.",
          "Clear cup cylinder with water condensation drops.",
          "Stacked boba pearls at the base."
        ],
        shadingTip: "Add a soft light grey shadow under the cat and cup to ground them.",
        warmupExercise: "Draw 5 smooth circles for the tea pearls."
      },
      {
        title: "Shiny Chrome Butterfly",
        category: "Gen-Z Aesthetic",
        difficulty: "Intermediate",
        estimatedTime: "25 Mins",
        howToDraw: [
          "Step 1: Draw a small center body and head for the butterfly.",
          "Step 2: Sketch symmetrical wing outlines with sharp pointy edges.",
          "Step 3: Add retro 4-point sparkle star shapes around the wings."
        ],
        focusPoints: [
          "Sharp metallic wing cut shapes.",
          "Retro 4-point sparkle stars.",
          "Clean vector-style symmetry."
        ],
        shadingTip: "Leave pure white paper blank on the wings to make them look like shiny chrome metal.",
        warmupExercise: "Draw 5 sharp star shapes with cross lines."
      },
      {
        title: "Phone Mirror Selfie with Stickers",
        category: "Gen-Z Aesthetic",
        difficulty: "Intermediate",
        estimatedTime: "25 Mins",
        howToDraw: [
          "Step 1: Draw a big rectangular mirror frame with small round fairy lights around it.",
          "Step 2: Draw a hand holding a smartphone up, blocking part of the face.",
          "Step 3: Cover the phone case and mirror edges with tiny cute cartoon stickers."
        ],
        focusPoints: [
          "Hand grip angle holding the phone.",
          "Round glowing fairy light bulbs on the frame.",
          "Mini sticker details."
        ],
        shadingTip: "Use light cross-hatching around the mirror corners to show depth.",
        warmupExercise: "Practice drawing 5 straight rectangular phone shapes."
      },
      {
        title: "Dreamy Clouds & Checker Sun",
        category: "Gen-Z Aesthetic",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        howToDraw: [
          "Step 1: Draw a big circle sun shape in the background horizon.",
          "Step 2: Fill the sun circle with a clean checkerboard grid pattern.",
          "Step 3: Draw soft rounded fluffy cloud shapes drifting across the front."
        ],
        focusPoints: [
          "Neat checkerboard grid inside the sun.",
          "Soft rounded fluffy cloud curves.",
          "Simple and calm horizon line."
        ],
        shadingTip: "Blend the cloud edges softly so they look light and airy.",
        warmupExercise: "Draw 10 connected cloud bump lines."
      },
      {
        title: "Retro Cassette Tape & Wires",
        category: "Gen-Z Aesthetic",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        howToDraw: [
          "Step 1: Draw a rectangle box with rounded corners for the cassette body.",
          "Step 2: Draw two round tape reels inside a clear plastic window.",
          "Step 3: Add a winding headphone cord looping around the tape corners."
        ],
        focusPoints: [
          "Cassette tape window and reel teeth.",
          "Handwritten text label line.",
          "Smooth looping headphone wire."
        ],
        shadingTip: "Shade inside the tape wheels to show depth behind the plastic shell.",
        warmupExercise: "Draw 5 smooth spiral loops for the cord."
      },
      {
        title: "Chunky Skate Sneakers",
        category: "Gen-Z Aesthetic",
        difficulty: "Intermediate",
        estimatedTime: "30 Mins",
        howToDraw: [
          "Step 1: Draw a thick, bulky shoe sole outline with a wide shape.",
          "Step 2: Add wide fat shoelaces tied across the top.",
          "Step 3: Draw cool melting drip patterns along the bottom sole edge."
        ],
        focusPoints: [
          "Thick rubber sole thickness.",
          "Wide fat shoelace loops.",
          "Melting drip art design."
        ],
        shadingTip: "Make the ground shadow dark directly under the sole so the shoe feels heavy.",
        warmupExercise: "Quickly sketch 3 simple shoe side profiles."
      },
      {
        title: "Vintage Soda Can & Cherries",
        category: "Gen-Z Aesthetic",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        howToDraw: [
          "Step 1: Draw a straight vertical cylinder can with a curved top rim.",
          "Step 2: Draw a pull tab mechanism on top of the can lid.",
          "Step 3: Draw two round cherries with long stems resting beside the can."
        ],
        focusPoints: [
          "Straight cylinder can proportions.",
          "Glossy round cherry shapes with reflection dots.",
          "Simple vintage label text block."
        ],
        shadingTip: "Leave a bright white highlight strip running down the side of the metal can.",
        warmupExercise: "Draw 3 clean cylinder shapes to warm up."
      },
      {
        title: "Cozy Oversized Hoodie",
        category: "Gen-Z Aesthetic",
        difficulty: "Intermediate",
        estimatedTime: "25 Mins",
        summary: "A fashion drawing focusing on the heavy fabric folds, big front pocket, and drawstrings of a baggy hoodie.",
        howToDraw: [
          "Step 1: Draw a loose V-neck hood shape dropping down over broad shoulders.",
          "Step 2: Add a big kangaroo pouch pocket in the center stomach area.",
          "Step 3: Draw two long hanging hoodie strings with knotted ends."
        ],
        focusPoints: [
          "Deep fabric folds around the elbow areas.",
          "Big front kangaroo pocket seam.",
          "Relaxed and baggy clothing shape."
        ],
        shadingTip: "Darken the inside of deep clothing creases to make the fabric look thick.",
        warmupExercise: "Draw 5 wavy S-curves to practice cloth folds."
      }
    ]
  },
  anime: {
    name: "Anime & Manga",
    icon: Zap,
    prompts: [
      {
        title: "Naruto with Goku Hair",
        category: "Anime & Manga",
        difficulty: "Intermediate",
        estimatedTime: "25 Mins",
        summary: "A hilarious mashup drawing of Naruto Uzumaki's face wearing Super Saiyan Goku's massive spiky hair style.",
        howToDraw: [
          "Step 1: Draw Naruto's familiar face shape with his whisker cheek marks and headband.",
          "Step 2: Instead of short spiky hair, draw massive, wild Super Saiyan Goku spikes pointing upward in all directions.",
          "Step 3: Give him an intense, energetic hero grin."
        ],
        focusPoints: [
          "Naruto's whisker marks on cheeks.",
          "Massive oversized Goku hair spikes.",
          "Confident anime grin expression."
        ],
        shadingTip: "Use bold cell shading under the giant hair spikes casting a shadow on the forehead.",
        warmupExercise: "Practice drawing 10 giant upward spiky hair clumps."
      },
      {
        title: "Cool Anime Hero Face",
        category: "Anime & Manga",
        difficulty: "Intermediate",
        estimatedTime: "25 Mins",
        summary: "A close-up drawing of a classic anime hero face with sharp eyes, spiky wind-blown hair, and strong jaw lines.",
        howToDraw: [
          "Step 1: Draw an angled chin and jawline shape for the face.",
          "Step 2: Add sharp, intense anime eyes with bright shiny reflection dots inside.",
          "Step 3: Draw spiky hair strands flowing outward in the wind."
        ],
        focusPoints: [
          "Sharp eye shapes with bright reflections.",
          "Layered spiky hair pointing in fun directions.",
          "Clean and strong chin line."
        ],
        shadingTip: "Use bold shadows under the chin and nose for a classic anime style.",
        warmupExercise: "Practice drawing 10 sharp hair spikes."
      },
      {
        title: "Chibi Character with Ramen",
        category: "Anime & Manga",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        summary: "A super cute mini character with a big head, holding chopsticks over a hot bowl of ramen noodles.",
        howToDraw: [
          "Step 1: Draw a massive round circle head with a tiny body underneath.",
          "Step 2: Draw a bowl in front of them with curly steam lines rising up.",
          "Step 3: Add happy closed-curve smiling eyes."
        ],
        focusPoints: [
          "Big round head with a tiny body proportion.",
          "Curly steam lines rising from the bowl.",
          "Happy closed-curve smiling eyes."
        ],
        shadingTip: "Keep your outline lines bold and dark with very simple flat shading.",
        warmupExercise: "Draw 5 round circle heads freehand."
      },
      {
        title: "Mecha Robot Warrior Face",
        category: "Anime & Manga",
        difficulty: "Advanced",
        estimatedTime: "40 Mins",
        summary: "An anime character with mechanical robot armor plates around the neck and a glowing visor eye.",
        howToDraw: [
          "Step 1: Draw a structured robotic helmet base with sharp geometric plates.",
          "Step 2: Add a wide electronic glowing visor glass lens across the eyes.",
          "Step 3: Draw bolt details and panel lines along the neck armor."
        ],
        focusPoints: [
          "Panel lines and bolt details on neck armor.",
          "Glowing electronic visor lens.",
          "Cool tech headset earpieces."
        ],
        shadingTip: "Use dark shadows near metal joints to make the armor look hard and shiny.",
        warmupExercise: "Draw 3 small 3D boxes with cut edges."
      },
      {
        title: "Magical Girl Crystal Wand",
        category: "Anime & Manga",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        summary: "A pretty magical girl stick topped with a glowing heart crystal and cute flowing ribbons.",
        howToDraw: [
          "Step 1: Draw a straight vertical stick handle.",
          "Step 2: Draw a symmetrical heart-shaped crystal gem right at the top.",
          "Step 3: Add flowing ribbon streamers wrapping around the handle stick."
        ],
        focusPoints: [
          "Heart-shaped crystal gem at the top.",
          "Ribbon streamers wrapping around the stick.",
          "Little sparkle stars floating around."
        ],
        shadingTip: "Shade the crystal gem with light and dark contrast to look like glass.",
        warmupExercise: "Draw 5 clean heart shapes."
      },
      {
        title: "School Roof at Sunset",
        category: "Anime & Manga",
        difficulty: "Intermediate",
        estimatedTime: "30 Mins",
        summary: "An anime student leaning against a wire fence on a school rooftop during a warm golden sunset.",
        howToDraw: [
          "Step 1: Draw a diamond wire fence grid pattern across the frame.",
          "Step 2: Draw a student leaning against the railing with clothes blowing in the breeze.",
          "Step 3: Draw a simple sunset horizon line in the background."
        ],
        focusPoints: [
          "Diamond wire fence grid pattern.",
          "Uniform tie and collar blowing in breeze.",
          "Simple sunset background horizon."
        ],
        shadingTip: "Draw the character as a dark silhouette against the bright sunset sky.",
        warmupExercise: "Draw a small grid of diagonal diamond lines."
      },
      {
        title: "Samurai Sword Ready Stance",
        category: "Anime & Manga",
        difficulty: "Advanced",
        estimatedTime: "45 Mins",
        summary: "A warrior in a low crouching battle stance with one hand resting on the handle of a sharp sword.",
        howToDraw: [
          "Step 1: Draw a low crouching leg and arm action pose.",
          "Step 2: Draw flowing traditional hakama pants showing movement.",
          "Step 3: Add a detailed sword handle and hand guard hilt."
        ],
        focusPoints: [
          "Low crouching leg and arm pose.",
          "Flowing traditional pants showing movement.",
          "Detailed sword handle and guard."
        ],
        shadingTip: "Use strong shading to show muscle tension in the crouching pose.",
        warmupExercise: "Draw 5 quick gesture stick figures."
      },
      {
        title: "Cute Cat-Ear Anime Girl",
        category: "Anime & Manga",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        summary: "A cheerful anime portrait featuring fluffy cat ears, a playful wink, and a cute paw hand pose.",
        howToDraw: [
          "Step 1: Draw a cute face portrait with a winking eye and long eyelashes.",
          "Step 2: Add two fluffy cat ears right on top of the head hair.",
          "Step 3: Draw a small hand paw gesture curled near the cheek."
        ],
        focusPoints: [
          "Fluffy furry inner lining inside cat ears.",
          "Playful winking eye expression.",
          "Curled paw hand pose near cheek."
        ],
        shadingTip: "Add a soft pink blush color under the eyes.",
        warmupExercise: "Draw 10 fluffy triangle ear shapes."
      },
      {
        title: "Techwear Street Outfit",
        category: "Anime & Manga",
        difficulty: "Intermediate",
        estimatedTime: "35 Mins",
        summary: "An anime fashion character wearing cargo pants with many straps, buckles, and cool boots.",
        howToDraw: [
          "Step 1: Draw a character standing in a cool street pose.",
          "Step 2: Add utility cargo pants with many straps and plastic belt buckles.",
          "Step 3: Draw heavy high-top boots on the feet."
        ],
        focusPoints: [
          "Strap buckles across chest and pants.",
          "Large utility pockets on trousers.",
          "Heavy high-top boots."
        ],
        shadingTip: "Shade tightly around plastic buckles to give them 3D depth.",
        warmupExercise: "Draw 5 parallel strap lines with belt buckles."
      },
      {
        title: "Anime Energy Power Aura",
        category: "Anime & Manga",
        difficulty: "Intermediate",
        estimatedTime: "30 Mins",
        summary: "An intense anime character powering up, surrounded by jagged fire-like energy flames and floating rocks.",
        howToDraw: [
          "Step 1: Draw a character standing with clenched fists and intense expression.",
          "Step 2: Draw upward surging jagged energy flame shapes all around their body.",
          "Step 3: Add floating small rock debris lifting off the ground."
        ],
        focusPoints: [
          "Upward surging jagged energy flame shapes.",
          "Floating small rocks breaking off ground.",
          "Intense focused facial expression."
        ],
        shadingTip: "Keep the center of the energy flames bright white while shading the outer edges dark.",
        warmupExercise: "Draw 10 jagged flame shapes."
      }
    ]
  },
  practice: {
    name: "Practice & Fundamentals",
    icon: Compass,
    prompts: [
      {
        title: "Simple 3D Shapes (Box, Ball, Tube)",
        category: "Practice & Fundamentals",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        summary: "Draw a simple box, a ball, and a cylinder tube on a table lit from one side.",
        howToDraw: [
          "Step 1: Draw a 3D perspective box using converging lines.",
          "Step 2: Draw a smooth round ball circle next to it.",
          "Step 3: Draw a cylinder tube with parallel vertical sides."
        ],
        focusPoints: [
          "Clean perspective box lines.",
          "Smooth round shading on the ball.",
          "Straight parallel lines on the cylinder."
        ],
        shadingTip: "Find the light source and shade the dark side, core shadow, and cast shadow on each shape.",
        warmupExercise: "Draw 5 freehand circles and 3 perspective boxes."
      },
      {
        title: "1-Point Perspective Street View",
        category: "Practice & Fundamentals",
        difficulty: "Intermediate",
        estimatedTime: "30 Mins",
        summary: "A simple street view where all building tops and road lines meet at one single dot on the horizon.",
        howToDraw: [
          "Step 1: Draw a horizon line across the paper with one vanishing point dot in the center.",
          "Step 2: Draw building walls whose top and bottom lines point directly to that center dot.",
          "Step 3: Add windows and doors that shrink as they get closer to the center."
        ],
        focusPoints: [
          "Single vanishing point dot in the center.",
          "Buildings getting smaller in distance.",
          "Road lines pointing towards center dot."
        ],
        shadingTip: "Make front buildings darker and back buildings lighter for distance depth.",
        warmupExercise: "Draw a center dot and radiate 10 straight lines outward."
      },
      {
        title: "2-Point Perspective Building Corner",
        category: "Practice & Fundamentals",
        difficulty: "Intermediate",
        estimatedTime: "30 Mins",
        summary: "Draw a building corner using two separate vanishing points on the left and right sides.",
        howToDraw: [
          "Step 1: Place two vanishing points on the left and right sides of your horizon line.",
          "Step 2: Draw the sharp vertical corner edge of a building closest to you.",
          "Step 3: Angle your left and right building walls toward their respective vanishing points."
        ],
        focusPoints: [
          "Left and right vanishing points.",
          "Sharp vertical corner edge closest to you.",
          "Windows angled correctly towards points."
        ],
        shadingTip: "Keep the center building corner brightest, and shade the side walls darker.",
        warmupExercise: "Draw 3 overlapping boxes using 2-point perspective."
      },
      {
        title: "9-Step Pencil Shading Bar",
        category: "Practice & Fundamentals",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        summary: "Create a simple bar of 9 boxes going smoothly from pure white paper to dark black pencil shading.",
        howToDraw: [
          "Step 1: Draw a row of 9 connected square boxes in a straight line.",
          "Step 2: Leave the first box completely white and fill the last box with pitch-black pencil.",
          "Step 3: Fill the boxes in between with gradually darker steps."
        ],
        focusPoints: [
          "Even steps of darkness from box to box.",
          "Smooth pencil filling with no white paper gaps.",
          "Good pencil pressure control."
        ],
        shadingTip: "Build darkness by layering light pencil strokes multiple times.",
        warmupExercise: "Fill a small square box with smooth cross-hatching lines."
      },
      {
        title: "Human Skull Bone Structure",
        category: "Practice & Fundamentals",
        difficulty: "Advanced",
        estimatedTime: "40 Mins",
        summary: "Sketch a front or side view human skull, focusing on the round head dome, eye sockets, and jaw bone.",
        howToDraw: [
          "Step 1: Draw a round circle dome for the cranium top.",
          "Step 2: Add deep hollow eye socket holes and a triangular nose opening.",
          "Step 3: Draw the upper and lower jaw teeth line rows."
        ],
        focusPoints: [
          "Proportions between head dome and jaw.",
          "Deep eye socket holes and nose opening.",
          "Teeth line rows on upper and lower jaw."
        ],
        shadingTip: "Shade heavily inside the eye sockets and under cheekbones to show hollow depth.",
        warmupExercise: "Draw a circle and cut the sides flat for a head base."
      },
      {
        title: "Hand Drawing & Finger Joints",
        category: "Practice & Fundamentals",
        difficulty: "Advanced",
        estimatedTime: "35 Mins",
        summary: "Break down a hand pose into simple palm boxes and cylinder tube fingers.",
        howToDraw: [
          "Step 1: Draw a simplified square palm block.",
          "Step 2: Attach segmented cylinder tubes for each finger and thumb.",
          "Step 3: Refine the knuckle joint bumps and finger nail curves."
        ],
        focusPoints: [
          "Correct finger length compared to palm.",
          "Knuckle joint positions.",
          "Thumb shape and palm pad volume."
        ],
        shadingTip: "Shade each finger section like a small cylinder tube to show 3D form.",
        warmupExercise: "Draw 10 small cylinder tubes bending at joints."
      },
      {
        title: "Hanging Cloth Folds",
        category: "Practice & Fundamentals",
        difficulty: "Intermediate",
        estimatedTime: "25 Mins",
        summary: "Draw a piece of cloth hanging from two points, looking at tube-like folds and pull tension lines.",
        howToDraw: [
          "Step 1: Draw two pin points where a cloth sheet is suspended.",
          "Step 2: Draw pull tension lines stretching outward from the pins.",
          "Step 3: Draw tube-like pipe folds hanging down with gravity."
        ],
        focusPoints: [
          "Pull points where cloth is stretched tight.",
          "Tube-shaped folds hanging down with gravity.",
          "Overlapping cloth edges."
        ],
        shadingTip: "Use triangle-shaped shadows inside deep cloth folds.",
        warmupExercise: "Draw 5 sweeping U-shaped cloth drape lines."
      },
      {
        title: "3D Wrap Lines on Objects",
        category: "Practice & Fundamentals",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        summary: "Draw grid wrap lines around rounded objects like an egg or apple to show its 3D round volume.",
        howToDraw: [
          "Step 1: Draw an organic rounded egg or apple shape.",
          "Step 2: Draw curved wrap lines across the surface like globe latitude lines.",
          "Step 3: Make lines curve more dramatically as they reach the outer edges."
        ],
        focusPoints: [
          "Lines wrapping around like globe latitude lines.",
          "Line curves changing as object turns.",
          "Even spacing between wrap lines."
        ],
        shadingTip: "Imagine your pencil is physically wrapping around the curved surface.",
        warmupExercise: "Draw wrap lines around 3 egg shapes."
      },
      {
        title: "Shiny Chrome Metal Ball",
        category: "Practice & Fundamentals",
        difficulty: "Intermediate",
        estimatedTime: "30 Mins",
        summary: "Draw a shiny metal ball reflecting an imaginary room horizon and overhead light.",
        howToDraw: [
          "Step 1: Draw a clean, flawless circle ball outline.",
          "Step 2: Draw a curved horizon line bending inside the circle reflection.",
          "Step 3: Add a sharp bright white reflection dot and dark ground band."
        ],
        focusPoints: [
          "Curved horizon line bending around ball.",
          "Sharp bright white reflection dot.",
          "Dark reflection band near bottom."
        ],
        shadingTip: "Shiny metal needs high contrast between bright white spots and deep black shadows.",
        warmupExercise: "Draw a circle with a curved horizon line through it."
      },
      {
        title: "Plant Leaf Structure & Veins",
        category: "Practice & Fundamentals",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        summary: "A detailed drawing of a plant leaf showing the center stem, branching veins, and outer edges.",
        howToDraw: [
          "Step 1: Draw a curved center stem line from base to tip.",
          "Step 2: Draw branching side veins spreading outward from the center.",
          "Step 3: Outline the natural uneven outer leaf margin shape."
        ],
        focusPoints: [
          "Curved center stem line.",
          "Branching leaf veins spreading outward.",
          "Natural uneven leaf edge shapes."
        ],
        shadingTip: "Keep vein lines lighter than the main leaf shading.",
        warmupExercise: "Draw 5 organic curved stem lines."
      }
    ]
  },
  cute: {
    name: "Cute & Kawaii",
    icon: Smile,
    prompts: [
      {
        title: "Chubby Bird Eating Strawberry",
        category: "Cute & Kawaii",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        summary: "A round chubby little bird holding a tiny red strawberry with both flippers.",
        howToDraw: [
          "Step 1: Draw an extremely round pear-shaped body for the chubby bird.",
          "Step 2: Add tiny webbed feet and a cute little beak.",
          "Step 3: Draw a tiny heart-shaped strawberry held in its flippers."
        ],
        focusPoints: [
          "Very round body shape with tiny feet.",
          "Cute beak holding a heart strawberry.",
          "Simple dot eyes with happy blush marks."
        ],
        shadingTip: "Keep shading very soft and minimal for a clean sticker look.",
        warmupExercise: "Draw 5 round egg shapes."
      },
      {
        title: "Sleeping Fox on Pumpkin",
        category: "Cute & Kawaii",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        summary: "A tiny orange baby fox curled up fast asleep on top of a round autumn pumpkin.",
        howToDraw: [
          "Step 1: Draw a round ribbed autumn pumpkin with a curved stem.",
          "Step 2: Draw a curled circular baby fox sleeping soundly on top.",
          "Step 3: Add a fluffy white-tipped tail wrapped around its face."
        ],
        focusPoints: [
          "Curled circular body with fluffy white tail tip.",
          "Ribbed lines and curved stem on pumpkin.",
          "Peaceful closed eyes."
        ],
        shadingTip: "Use warm orange tones with soft shadows under the sleeping fox.",
        warmupExercise: "Draw 5 smooth curved pumpkin rib lines."
      },
      {
        title: "Happy Avocado Friends",
        category: "Cute & Kawaii",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        summary: "Two smiling avocado halves holding hands, one with the round seed and one without.",
        howToDraw: [
          "Step 1: Draw two pear-shaped green avocado outer skins.",
          "Step 2: Draw a round center seed pit with a happy face in one half.",
          "Step 3: Draw tiny stick arms holding hands together between them."
        ],
        focusPoints: [
          "Pear-shaped green outer skin outlines.",
          "Round center seed with happy smiling face.",
          "Tiny stick arms holding hands."
        ],
        shadingTip: "Add a soft light green color across the inner avocado flesh.",
        warmupExercise: "Draw 5 symmetrical pear shapes."
      },
      {
        title: "Ghost Drinking Bubble Tea",
        category: "Cute & Kawaii",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        summary: "A friendly little sheet ghost floating happily while drinking boba tea through a striped straw.",
        howToDraw: [
          "Step 1: Draw a rounded sheet ghost body with wavy bottom hem lines.",
          "Step 2: Draw a round bubble tea cup beside it with a striped straw.",
          "Step 3: Add a cheerful smiling face expression."
        ],
        focusPoints: [
          "Wavy flowing bottom sheet hem lines.",
          "Round boba tea cup with a straw on top.",
          "Cute cheerful face."
        ],
        shadingTip: "Add a light grey shadow under the floating ghost.",
        warmupExercise: "Draw 5 wavy bottom curves."
      },
      {
        title: "Panda in a Bamboo Basket",
        category: "Cute & Kawaii",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        summary: "A chubby baby panda sitting inside a woven bamboo basket chewing on a green leaf.",
        howToDraw: [
          "Step 1: Draw a round woven bamboo basket with a crisscross grid pattern.",
          "Step 2: Draw a chubby baby panda sitting inside with paws resting on the rim.",
          "Step 3: Add round black ear patches and eye circles."
        ],
        focusPoints: [
          "Round black ear patches and eye circles.",
          "Woven crisscross pattern on round basket.",
          "Paws resting over basket edge."
        ],
        shadingTip: "Shade inside the basket grid to show hollow depth.",
        warmupExercise: "Draw a grid of basket weave lines for 2 minutes."
      },
      {
        title: "Sleepy Sloth on Branch",
        category: "Cute & Kawaii",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        summary: "A relaxed baby sloth hanging upside down with long arms wrapped around a tree branch.",
        howToDraw: [
          "Step 1: Draw a thick tree branch running across your paper.",
          "Step 2: Draw a baby sloth hanging upside down with long arms gripping the wood.",
          "Step 3: Add mask eye patches and a tiny smiling mouth."
        ],
        focusPoints: [
          "Mask eye patches and tiny smiling mouth.",
          "Long curved claws gripping wood branch.",
          "Textured bark lines on branch."
        ],
        shadingTip: "Use soft brown tones to show soft fur texture.",
        warmupExercise: "Draw 5 curved tree branch lines."
      },
      {
        title: "Fluffy Corgi Dog Bottom",
        category: "Cute & Kawaii",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        summary: "A funny back view of a fluffy corgi dog with short legs and a heart-shaped peach bottom.",
        howToDraw: [
          "Step 1: Draw an extremely round, fluffy peach-shaped rear end.",
          "Step 2: Add short stubby back legs pointing outward to the sides.",
          "Step 3: Draw a tiny white fluffy tail stub at the top."
        ],
        focusPoints: [
          "Round fluffy peach rear proportions.",
          "Short stubby back legs pointing out.",
          "Tiny white tail fluff."
        ],
        shadingTip: "Add soft shading around the leg creases to show fluffiness.",
        warmupExercise: "Draw 3 round heart shapes."
      },
      {
        title: "Dinosaur Holding Balloon",
        category: "Cute & Kawaii",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        summary: "A tiny green baby dinosaur with short arms excitedly holding onto a star balloon string.",
        howToDraw: [
          "Step 1: Draw a cute baby dinosaur with soft rounded back scales.",
          "Step 2: Draw stubby short arms reaching upward into the air.",
          "Step 3: Draw a star-shaped helium balloon tied with a ribbon string."
        ],
        focusPoints: [
          "Stubby short arms reaching up.",
          "Soft rounded back scales along spine.",
          "Star-shaped balloon tied with ribbon string."
        ],
        shadingTip: "Add a bright shiny reflection dot on the balloon surface.",
        warmupExercise: "Draw 5 star outlines."
      },
      {
        title: "Stack of Cute Pancakes",
        category: "Cute & Kawaii",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        summary: "A stack of golden pancakes topped with melting butter and a smiling face on top.",
        howToDraw: [
          "Step 1: Draw 3 or 4 layered flattened oval pancake discs stacked together.",
          "Step 2: Draw a melting square of yellow butter on the very top.",
          "Step 3: Add dripping syrup lines and a cute sleepy face on top."
        ],
        focusPoints: [
          "Layered pancake edges with dripping syrup.",
          "Melting square of yellow butter on top.",
          "Cute sleepy face on top pancake."
        ],
        shadingTip: "Use golden-brown shading on the sides of each pancake layer.",
        warmupExercise: "Draw 5 stacked flattening oval shapes."
      },
      {
        title: "Marshmallow Toasting on Stick",
        category: "Cute & Kawaii",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        summary: "A cute fluffy marshmallow on a wooden stick getting a golden-brown toasted cheek.",
        howToDraw: [
          "Step 1: Draw a squishy rounded rectangular pill shape for the marshmallow.",
          "Step 2: Draw a wooden stick piercing straight through the center.",
          "Step 3: Add a happy blushing face looking at its toasted side."
        ],
        focusPoints: [
          "Squishy pillow marshmallow body shape.",
          "Wooden stick piercing through center.",
          "Happy blushing face looking at toasted side."
        ],
        shadingTip: "Use soft warm brown shading on one side to show campfire toast.",
        warmupExercise: "Draw 5 rounded rectangular pill shapes."
      }
    ]
  },
  random: {
    name: "Random Mix",
    icon: Shuffle,
    prompts: [
      {
        title: "UFO Beaming a Rubber Duck",
        category: "Random Mix",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        summary: "A flying saucer spaceship lifting up a startled little yellow rubber bath duck with a light beam.",
        howToDraw: [
          "Step 1: Draw a flying saucer metal disc with glowing dome lights on top.",
          "Step 2: Draw a cone-shaped light beam shining downward.",
          "Step 3: Draw a little rubber duck floating up inside the beam with surprise eyes."
        ],
        focusPoints: [
          "Saucer metal disc rim and glowing dome lights.",
          "Cone-shaped light beam shining down.",
          "Little duck floating up with surprise eyes."
        ],
        shadingTip: "Make the light beam look clear using light parallel lines.",
        warmupExercise: "Draw 3 flying saucer oval shapes."
      },
      {
        title: "Cat in Space Helmet",
        category: "Random Mix",
        difficulty: "Intermediate",
        estimatedTime: "25 Mins",
        summary: "A curious tabby cat wearing a round glass fishbowl space helmet floating among stars.",
        howToDraw: [
          "Step 1: Draw a curious cat face looking forward.",
          "Step 2: Draw a large spherical glass helmet enclosing its head.",
          "Step 3: Add tiny background stars and distant moon craters."
        ],
        focusPoints: [
          "Round glass helmet reflection curve.",
          "Cat whiskers pressed slightly against glass.",
          "Tiny background stars and moon craters."
        ],
        shadingTip: "Add a strong curved glass highlight streak across the helmet dome.",
        warmupExercise: "Draw 5 circles with crescent light reflections."
      },
      {
        title: "Teacup Sailing Paper Boat",
        category: "Random Mix",
        difficulty: "Intermediate",
        estimatedTime: "25 Mins",
        summary: "A vintage tea cup acting as a boat floating on water ripples with an origami paper boat inside.",
        focusPoints: [
          "Tea cup handle angle and inner opening circle.",
          "Origami folded paper boat triangle shape.",
          "Curved water ripple lines around cup base."
        ],
        howToDraw: [
          "Step 1: Draw a vintage teacup with its handle turned to the side.",
          "Step 2: Draw an origami folded paper boat sitting inside the cup bowl.",
          "Step 3: Draw curved water ripple lines surrounding the cup base."
        ],
        shadingTip: "Shade inside the cup bowl to show water depth level.",
        warmupExercise: "Draw 5 folded paper triangle shapes."
      },
      {
        title: "Cactus Wearing Sunglasses",
        category: "Random Mix",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        summary: "A tall desert cactus wearing cool aviator sunglasses and striking a confident pose.",
        howToDraw: [
          "Step 1: Draw a tall saguaro cactus trunk with arm branches.",
          "Step 2: Draw cool aviator sunglasses resting near the top.",
          "Step 3: Add short parallel needle tick lines across the body."
        ],
        focusPoints: [
          "Cactus arm branch curves.",
          "Sharp needle prickle lines.",
          "Cool mirrored sunglasses reflecting sun."
        ],
        shadingTip: "Shade one side of the cactus trunk to show round cylinder volume.",
        warmupExercise: "Draw 10 short parallel needle tick lines."
      },
      {
        title: "Turtle Carrying Bonsai Tree",
        category: "Random Mix",
        difficulty: "Intermediate",
        estimatedTime: "30 Mins",
        summary: "A gentle land turtle carrying a miniature trimmed bonsai tree growing right out of its shell.",
        howToDraw: [
          "Step 1: Draw a land turtle with hexagonal shell plate patterns.",
          "Step 2: Draw a small bonsai pot resting on top of the shell center.",
          "Step 3: Draw a twisted bonsai tree trunk and layered leaf clusters."
        ],
        focusPoints: [
          "Hexagonal shell plate patterns on turtle shell.",
          "Twisted bonsai tree trunk and leaf clusters.",
          "Turtle head and skin texture."
        ],
        shadingTip: "Use dark shadows under the bonsai pot resting on the turtle shell.",
        warmupExercise: "Draw 5 hexagonal turtle shell grids."
      },
      {
        title: "Flying Book with Bird Wings",
        category: "Random Mix",
        difficulty: "Beginner",
        estimatedTime: "20 Mins",
        summary: "An open spellbook soaring through the sky with feathered bird wings sprouting from its spine.",
        howToDraw: [
          "Step 1: Draw an open book with pages fluttering upward in the wind.",
          "Step 2: Attach feathered bird wings to the leather spine cover.",
          "Step 3: Add magical sparkle dust trailing behind."
        ],
        focusPoints: [
          "Open book pages fluttering in wind.",
          "Feathered wings attached to book spine.",
          "Magical sparkle dust trailing behind."
        ],
        shadingTip: "Shade under the wing joints to show a solid connection.",
        warmupExercise: "Draw 5 open book page curves."
      },
      {
        title: "Raccoon on a Skateboard",
        category: "Random Mix",
        difficulty: "Intermediate",
        estimatedTime: "25 Mins",
        summary: "A sneaky raccoon wearing a backward baseball cap balancing expertly while riding a skateboard.",
        howToDraw: [
          "Step 1: Draw a skateboard deck in perspective with four wheels.",
          "Step 2: Draw a raccoon wearing a backward cap balancing with a ringed tail.",
          "Step 3: Add motion speed lines behind the wheels."
        ],
        focusPoints: [
          "Raccoon ringed tail balance posture and eye mask.",
          "Skateboard deck angle and wheel perspective.",
          "Motion speed lines behind wheels."
        ],
        shadingTip: "Add a drop shadow under the skateboard wheels for weight.",
        warmupExercise: "Draw 3 skateboard deck rectangles in perspective."
      },
      {
        title: "Vintage Gramophone with Flowers",
        category: "Random Mix",
        difficulty: "Beginner",
        estimatedTime: "25 Mins",
        summary: "An old-style retro music gramophone player with blooming colorful flowers growing out of its horn speaker.",
        howToDraw: [
          "Step 1: Draw a wooden turntable box base with a small turning crank handle.",
          "Step 2: Draw a wide curved gramophone trumpet horn speaker on top.",
          "Step 3: Draw a bunch of pretty blooming flowers coming out of the horn."
        ],
        focusPoints: [
          "Wide curved gramophone trumpet horn shape.",
          "Wooden box base with turning crank handle.",
          "Bunch of pretty flowers coming out of horn."
        ],
        shadingTip: "Shade inside the trumpet horn to show deep funnel darkness.",
        warmupExercise: "Draw 5 flared trumpet horn shapes."
      },
      {
        title: "Flamingo Pool Float Toy",
        category: "Random Mix",
        difficulty: "Beginner",
        estimatedTime: "15 Mins",
        summary: "A bright pink flamingo ring pool float bobbing in gentle sparkling swimming pool water.",
        howToDraw: [
          "Step 1: Draw a round donut ring tube body with inflation fold lines.",
          "Step 2: Draw a curved flamingo neck and beak head profile rising up.",
          "Step 3: Add water surface reflection lines around the base."
        ],
        focusPoints: [
          "Round donut ring tube body inflation folds.",
          "Curved flamingo neck and beak head profile.",
          "Water surface reflection lines."
        ],
        shadingTip: "Leave a bright curved highlight stripe along the pink inflatable ring.",
        warmupExercise: "Draw 5 donut torus ring shapes."
      },
      {
        title: "Robot Watering a Plant Sprout",
        category: "Random Mix",
        difficulty: "Intermediate",
        estimatedTime: "30 Mins",
        summary: "A gentle rusty robot holding a tiny metal watering can, watering a lone green plant sprout in the dirt.",
        howToDraw: [
          "Step 1: Draw a square robotic head with glowing digital eyes and a body box.",
          "Step 2: Draw a mechanical arm holding a tiny metal watering can spout.",
          "Step 3: Draw a small soil mound on the ground with two green sprout leaves."
        ],
        focusPoints: [
          "Square robotic head with glowing digital eyes.",
          "Mechanical arm holding tiny watering spout.",
          "Small soil mound with two green sprout leaves."
        ],
        shadingTip: "Add small scratch marks and bolt details on the robot metal plating.",
        warmupExercise: "Draw 3 small robotic square boxes with bolt corners."
      }
    ]
  }
};

export default function IdeaGeneratorPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("genz");
  const [currentPrompt, setCurrentPrompt] = useState<PromptDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  
  const [shownIndices, setShownIndices] = useState<Record<string, number[]>>({});

  const handleGenerate = (catKey: string) => {
    setSelectedCategory(catKey);
    setLoading(true);
    setCountdown(5);

    let timeLeft = 5;
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        
        const catPrompts = CATEGORIES_DATA[catKey]?.prompts || CATEGORIES_DATA["genz"].prompts;
        const currentShown = shownIndices[catKey] || [];
        
        let availableIndexes = catPrompts
          .map((_, idx) => idx)
          .filter((idx) => !currentShown.includes(idx));

        if (availableIndexes.length === 0) {
          availableIndexes = catPrompts.map((_, idx) => idx);
        }

        const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
        const randomItem = catPrompts[randomIndex];

        setShownIndices((prev) => ({
          ...prev,
          [catKey]: availableIndexes.length === catPrompts.length ? [randomIndex] : [...currentShown, randomIndex]
        }));

        setCurrentPrompt(randomItem);
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between antialiased selection:bg-[#FFD45A]">
      
      <header className="w-full max-w-5xl mx-auto px-4 pt-5 pb-3 flex justify-between items-center z-10">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#2563EB] bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Dashboard</span>
        </Link>
        <div className="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
          Creative Drawing Ideas
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto px-4 py-4 flex-1 flex flex-col items-center text-center space-y-5">
        
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-[#2563EB] text-[11px] font-black uppercase px-3.5 py-1 rounded-full tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Creative Drawing Ideas
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0F172A]">
            What will you draw today?
          </h1>
          <p className="text-slate-500 font-bold text-xs sm:text-sm max-w-md mx-auto">
            Choose a category below and click generate to reveal your guided drawing challenge with easy steps!
          </p>
        </div>

        <div className="w-full bg-white p-3 sm:p-4 rounded-2xl border-2 border-slate-200/90 shadow-sm flex flex-wrap justify-center gap-2">
          {Object.entries(CATEGORIES_DATA).map(([key, cat]) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  selectedCategory === key
                    ? 'bg-[#2563EB] text-white shadow-md scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="w-full bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="text-left">
            <p className="text-xs font-black text-[#2563EB] uppercase tracking-wider">Selected Category</p>
            <p className="text-sm sm:text-base font-black text-[#0F172A]">
              {CATEGORIES_DATA[selectedCategory]?.name}
            </p>
          </div>
          <button
            onClick={() => handleGenerate(selectedCategory)}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0px_4px_0px_#1D4ED8] active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Generating..." : "Generate Challenge"}</span>
          </button>
        </div>

        <div className="w-full bg-white rounded-3xl p-5 sm:p-8 border-2 border-slate-200/95 shadow-[0_10px_35px_rgba(0,0,0,0.04)] text-left relative overflow-hidden">
          
          {loading ? (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="font-black text-xl text-[#2563EB] animate-pulse">
                  Generating Challenge in {countdown}s...
                </p>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  Structuring steps, shading guide, and focus points...
                </p>
              </div>
            </div>
          ) : currentPrompt ? (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="text-xs font-black text-[#2563EB] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> {currentPrompt.category}
                </span>
                <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-blue-600" /> {currentPrompt.difficulty}
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> {currentPrompt.estimatedTime}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  {currentPrompt.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed">
                  {currentPrompt.summary}
                </p>
              </div>

              {/* How to Draw / Kaise Banega Section */}
              <div className="bg-blue-50/70 p-4 sm:p-5 rounded-2xl border border-blue-200 space-y-2">
                <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#2563EB]" /> How to Draw :
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium pl-1">
                  {currentPrompt.howToDraw.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#2563EB] font-black shrink-0">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#2563EB]" /> Key Focus Points:
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 font-medium pl-1">
                  {currentPrompt.focusPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#2563EB] font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 sm:p-4 rounded-xl space-y-1">
                  <p className="font-black text-amber-900 text-xs flex items-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5 text-amber-700" /> Shading & Contrast Guide:
                  </p>
                  <p className="text-amber-800 font-medium text-xs leading-relaxed">
                    {currentPrompt.shadingTip}
                  </p>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 sm:p-4 rounded-xl space-y-1">
                  <p className="font-black text-emerald-900 text-xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-emerald-700" /> 2-Min Warmup Drill:
                  </p>
                  <p className="text-emerald-800 font-medium text-xs leading-relaxed">
                    {currentPrompt.warmupExercise}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleGenerate(selectedCategory)}
                  className="flex-1 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-white text-[#2563EB] border-[2.5px] border-[#CBD5E1] shadow-[0px_5px_0px_#94A3B8] active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Another Challenge</span>
                </button>
                <Link
                  href="/scan"
                  className="flex-1 py-3.5 text-center rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-[#2563EB] text-white shadow-[0px_5px_0px_#1D4ED8] active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan Artwork</span>
                </Link>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <p className="text-slate-500 font-extrabold text-sm sm:text-base">
                Click &quot;Generate Challenge&quot; above to pick your detailed drawing prompt!
              </p>
              <button
                onClick={() =>handleGenerate(selectedCategory)}
                className="px-8 py-3.5 bg-[#2563EB] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0px_5px_0px_#1D4ED8] active:shadow-none transition inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Generate Challenge Now
              </button>
            </div>
          )}

        </div>

      </main>

      <footer className="w-full py-4 text-center text-[11px] text-slate-400 font-medium">
        Otterleo Creative Hub • Zero API Overhead • Guided Learning
      </footer>

    </div>
  );
}