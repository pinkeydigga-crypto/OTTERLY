import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  User,
  Home,
  Camera,
  Sparkles,
  CheckCircle2,
  Grid,
  Lightbulb,
} from 'lucide-react';

const SITE_URL = "https://www.otterleo.in";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
const MASCOT_GIF_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif";
const FOUNDER_IMAGE_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";
const INSTAGRAM_URL = "https://www.instagram.com/harjas_gallery";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Best Drawing Practice Tools: Grid Maker, Idea Generator & Canvas (2026)',
  description: 'See how a grid maker, drawing idea generator, and daily practice canvas work together to improve sketching speed and accuracy on Otterleo.',
  keywords: [
    'drawing practice tools',
    'grid maker for drawing',
    'drawing idea generator',
    'online lessons drawing',
    'practice drawing canvas',
    'sketching tools',
    'Harjass Digga',
    'Harjas Digga',
    'Otterleo'
  ],
  authors: [{ name: 'Harjass Digga (Harjas Digga)' }],
  creator: 'Harjass Digga',
  alternates: {
    canonical: `${SITE_URL}/blog/5`,
  },
  openGraph: {
    title: 'Best Drawing Practice Tools: Grid Maker, Idea Generator & Canvas | Otterleo',
    description: 'Combine grid tools, drawing prompts, and daily practice on Otterleo to sketch with better accuracy.',
    url: `${SITE_URL}/blog/5`,
    siteName: 'Otterleo',
    locale: 'en_US',
    type: 'article',
    images: [
      {
        url: FOUNDER_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Drawing Practice Tools - Otterleo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Drawing Practice Tools | Otterleo',
    description: 'How grid makers, idea generators, and practice sessions help you draw better on Otterleo.',
    images: [FOUNDER_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function BlogFivePage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/blog/5/#article`,
        "headline": "Best Drawing Practice Tools: Grid Maker, Idea Generator & Canvas",
        "description": "Learn how grids, drawing prompts, and structured practice tools help artists build accuracy and consistency.",
        "image": FOUNDER_IMAGE_URL,
        "author": {
          "@type": "Person",
          "name": "Harjass Digga",
          "alternateName": "Harjas Digga",
          "jobTitle": "Founder of Otterleo",
          "image": FOUNDER_IMAGE_URL,
          "url": `${SITE_URL}/about`
        },
        "publisher": {
          "@type": "Organization",
          "name": "Otterleo",
          "url": SITE_URL,
          "logo": {
            "@type": "ImageObject",
            "url": LOGO_URL
          }
        },
        "datePublished": "2026-11-28",
        "dateModified": "2026-11-28",
        "mainEntityOfPage": `${SITE_URL}/blog/5`
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/blog/5/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does a grid maker help when sketching?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A grid maker divides a reference image into equal squares so you can compare small sections and keep proportions and angles accurate."
            }
          },
          {
            "@type": "Question",
            "name": "When should I use a drawing idea generator?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Use an idea generator whenever you are stuck on what to sketch next so you spend your time drawing rather than searching for prompts."
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog/5/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": SITE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `${SITE_URL}/blog`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Blog 5",
            "item": `${SITE_URL}/blog/5`
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans py-8 md:py-12 px-4 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 hover:border-blue-300 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3] text-blue-600" />
            <span>All Blogs</span>
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 font-bold text-xs sm:text-sm hover:bg-blue-100 transition-all"
          >
            <User className="w-4 h-4" />
            <span>About Us</span>
          </Link>
        </div>

        {/* Main Article Container */}
        <article className="bg-white rounded-[2.5rem] p-6 md:p-12 border-2 border-slate-100 shadow-xl relative overflow-hidden">

          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-[#64748B] mb-6 font-semibold">
            <Link href="/" className="hover:underline hover:text-[#2563EB]">Home</Link> &gt;{' '}
            <Link href="/blog" className="hover:underline hover:text-[#2563EB]">Blog</Link> &gt;{' '}
            <span className="text-[#2563EB] font-bold">Guide 5</span>
          </nav>

          {/* Primary SEO H1 Heading */}
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight mb-4">
            Best Drawing Practice Tools: Grid Maker, Idea Generator & Canvas
          </h1>

          {/* Author Meta */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-6 mb-8 text-xs sm:text-sm text-[#64748B] font-medium">
            <span>By <Link href="/about" className="font-extrabold text-[#0F172A] hover:text-[#2563EB] hover:underline">Harjass Digga (Founder, Otterleo)</Link></span>
            <span>•</span>
            <span>Updated November 28, 2026</span>
            <span>•</span>
            <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full font-bold text-xs">
              Practice Tools
            </span>
          </div>

          {/* Direct Answer / GEO Summary Box */}
          <div className="bg-[#F0F9FF] border-l-4 border-[#2563EB] p-5 rounded-r-2xl mb-8">
            <p className="text-xs font-black uppercase text-[#2563EB] tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Quick Overview: Right Tool for Each Step
            </p>
            <p className="text-sm font-semibold text-[#0F172A] leading-relaxed">
              Having the right <strong>drawing practice tools</strong> removes friction at every stage: an idea generator helps you pick what to draw, a <strong>grid maker for drawing</strong> keeps proportions aligned, and a practice canvas or challenge lets you warm up daily. On <Link href="/" className="text-[#2563EB] underline font-bold">Otterleo</Link>, these tools work alongside sketch feedback from Otto.
            </p>
          </div>

          {/* Main Article Body */}
          <div className="space-y-6 text-[#475569] leading-relaxed text-base md:text-lg">
            <p>
              You do not need dozens of complicated apps to practice drawing well. A few focused tools—picking a prompt, setting up proportions, warming up strokes, and reviewing what to fix next—cover most of what an artist needs.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-[#2563EB]" /> 1. Use an Idea Generator When You Feel Stuck
            </h2>
            <p>
              When you open your sketchbook and cannot decide on a subject, an idea generator gives you quick prompts so you can start drawing immediately instead of scrolling endlessly.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <Grid className="w-6 h-6 text-[#2563EB]" /> 2. Use a Grid Maker to Train Proportions
            </h2>
            <p>
              Reference grids train your eye to measure relative placement across small squares. Over time, this helps you judge angles, spacing, and alignment more accurately even when sketching freehand.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#2563EB]" /> 3. Combine Practice Canvas, Challenges & Feedback
            </h2>
            <p>
              Warming up on a practice canvas, completing daily challenges, and checking what to fix next with Otto on Otterleo turns casual sketching into measurable progress.
            </p>

            {/* Call to Action Box */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[2rem] p-6 md:p-8 my-10 text-center shadow-sm">
              <div className="flex justify-center mb-4">
                <Image
                  src={MASCOT_GIF_URL}
                  alt="Otto Mascot GIF - Otterleo Coach"
                  width={100}
                  height={100}
                  unoptimized={true}
                  className="w-24 h-auto object-contain"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-[#1E3A8A] mb-2">
                Try Otterleo&apos;s Drawing Tools Today!
              </h3>
              <p className="text-sm md:text-base text-[#1E40AF] mb-6 max-w-xl mx-auto font-medium">
                Explore the practice canvas, grid maker, idea generator, and challenges with Otto.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/tools"
                  className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-base px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Explore Tools
                </Link>
                <Link
                  href="/blog/4"
                  className="inline-block bg-white hover:bg-slate-50 text-blue-600 font-extrabold text-base px-6 py-3.5 rounded-full border-2 border-blue-200 transition-all active:scale-95"
                >
                  Read Guide 4
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <h2 className="text-2xl font-black text-[#0F172A] pt-6 mb-4">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-[#0F172A] mb-1">How does a grid maker help beginners?</h3>
                <p className="text-sm text-[#475569]">
                  It breaks reference images into small blocks so you can focus on exact proportions and placement one square at a time.
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-[#0F172A] mb-1">Which tools are on Otterleo?</h3>
                <p className="text-sm text-[#475569]">
                  Otterleo includes sketch feedback with Otto, a practice canvas, a grid maker, an idea generator, daily challenges, and learning paths.
                </p>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="border-t border-slate-100 pt-8 mt-12 bg-slate-50 rounded-2xl p-6">
              <h3 className="font-black text-xs text-[#0F172A] uppercase tracking-wider mb-4">
                Explore More Pages
              </h3>
              <div className="flex items-center gap-6 text-sm font-bold flex-wrap">
                <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-[#2563EB] transition-colors">
                  <Home className="w-4 h-4 text-blue-500" />
                  <span>Home Page</span>
                </Link>
                <Link href="/blog" className="flex items-center gap-2 text-slate-600 hover:text-[#2563EB] transition-colors">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Main Blog</span>
                </Link>
                <Link href="/about" className="flex items-center gap-2 text-slate-600 hover:text-[#2563EB] transition-colors">
                  <User className="w-4 h-4 text-blue-500" />
                  <span>About Us</span>
                </Link>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-600 hover:text-[#E1306C] transition-colors"
                >
                  <Camera className="w-4 h-4 text-pink-600" />
                  <span>harjas_gallery</span>
                </a>
              </div>
            </div>

          </div>
        </article>
      </div>
    </div>
  );
}