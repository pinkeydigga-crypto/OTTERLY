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
  Scan,
  Flame,
} from 'lucide-react';

const SITE_URL = "https://www.otterleo.in";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
const MASCOT_GIF_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif";
const FOUNDER_IMAGE_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";
const INSTAGRAM_URL = "https://www.instagram.com/harjas_gallery";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Instant Sketch Feedback: How to Spot What to Fix Next in Your Drawings (2026)',
  description: 'Learn how practical sketch feedback helps you improve proportions, shading, and line confidence faster using daily practice and Otto on Otterleo.',
  keywords: [
    'sketch feedback',
    'drawing critique',
    'how to improve drawing skills',
    'instant sketch review',
    'drawing practice app',
    'daily sketching habit',
    'Harjass Digga',
    'Harjas Digga',
    'Otterleo'
  ],
  authors: [{ name: 'Harjass Digga (Harjas Digga)' }],
  creator: 'Harjass Digga',
  alternates: {
    canonical: `${SITE_URL}/blog/1`,
  },
  openGraph: {
    title: 'Instant Sketch Feedback: Improve Your Drawings Faster on Otterleo',
    description: 'See what to fix next in your sketches with structured feedback, daily streaks, and practice tools on Otterleo.',
    url: `${SITE_URL}/blog/1`,
    siteName: 'Otterleo',
    locale: 'en_US',
    type: 'article',
    images: [
      {
        url: FOUNDER_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Instant Sketch Feedback - Otterleo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instant Sketch Feedback | Otterleo',
    description: 'Get practical sketch feedback and build a daily drawing habit on Otterleo.',
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

export default function BlogOnePage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/blog/1/#article`,
        "headline": "Instant Sketch Feedback: How to Spot What to Fix Next in Your Drawings",
        "description": "Learn how structured sketch feedback helps artists fix proportions, shading, and line confidence faster through daily practice on Otterleo.",
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
        "mainEntityOfPage": `${SITE_URL}/blog/1`
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/blog/1/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does sketch feedback help you draw better?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Specific feedback points out what is working and what to adjust next—such as alignment, light source consistency, or shading contrast—so you do not repeat the same mistakes across sessions."
            }
          },
          {
            "@type": "Question",
            "name": "What can I use on Otterleo to practice and review my drawings?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo offers sketch scanning and feedback with Otto, a practice drawing canvas, a grid maker for proportions, idea generation, and daily challenges with XP and streaks."
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog/1/#breadcrumb`,
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
            "name": "Blog 1",
            "item": `${SITE_URL}/blog/1`
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
            <span className="text-[#2563EB] font-bold">Guide 1</span>
          </nav>

          {/* Primary SEO H1 Heading */}
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight mb-4">
            Instant Sketch Feedback: How to Spot What to Fix Next in Your Drawings
          </h1>

          {/* Author Meta */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-6 mb-8 text-xs sm:text-sm text-[#64748B] font-medium">
            <span>By <Link href="/about" className="font-extrabold text-[#0F172A] hover:text-[#2563EB] hover:underline">Harjass Digga (Founder, Otterleo)</Link></span>
            <span>•</span>
            <span>Updated November 28, 2026</span>
            <span>•</span>
            <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full font-bold text-xs">
              Sketch Feedback Guide
            </span>
          </div>

          {/* Direct Answer / GEO Summary Box */}
          <div className="bg-[#F0F9FF] border-l-4 border-[#2563EB] p-5 rounded-r-2xl mb-8">
            <p className="text-xs font-black uppercase text-[#2563EB] tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Quick Overview: Why Feedback Speeds Up Growth
            </p>
            <p className="text-sm font-semibold text-[#0F172A] leading-relaxed">
              Daily drawing builds consistency, while <strong>instant sketch feedback</strong> shows you the exact next fix for proportions, shading, or line confidence. On <Link href="/" className="text-[#2563EB] underline font-bold">Otterleo</Link>, <strong>Otto</strong> helps you review your work and decide what to improve on your next sketch.
            </p>
          </div>

          {/* Main Article Body */}
          <div className="space-y-6 text-[#475569] leading-relaxed text-base md:text-lg">
            <p>
              Many artists sketch regularly yet feel stuck because they are not sure which detail is throwing off their drawing. A shifted eye position, flat midtones, or hesitant lines are easy to overlook when you have been staring at the same page for an hour.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <Scan className="w-6 h-6 text-[#2563EB]" /> 1. Focus on One Clear Fix After Every Sketch
            </h2>
            <p>
              Instead of trying to fix ten things at once, pick one clear adjustment for your next attempt—like refining core shadows, aligning facial features, or drawing smoother strokes. Clear feedback makes your next practice session purposeful.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#2563EB]" /> 2. Build a Daily Habit Around Small Wins
            </h2>
            <p>
              Short, consistent practice paired with quick feedback beats long, rare sessions. Using Otterleo&apos;s canvas, grid tools, and daily challenges keeps momentum going day after day.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#2563EB]" /> 3. Simple Loop for Your Next Drawing
            </h2>
            <p>
              Sketch a focused subject, review what needs adjustment next, apply that change on a fresh pass, and log your daily streak on Otterleo.
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
                Practice & Improve on Otterleo Today!
              </h3>
              <p className="text-sm md:text-base text-[#1E40AF] mb-6 max-w-xl mx-auto font-medium">
                Use grids, daily challenges, and Otto&apos;s guidance to level up your drawings step by step.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-base px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Open Dashboard
                </Link>
                <Link
                  href="/blog"
                  className="inline-block bg-white hover:bg-slate-50 text-blue-600 font-extrabold text-base px-6 py-3.5 rounded-full border-2 border-blue-200 transition-all active:scale-95"
                >
                  Back to Blog
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <h2 className="text-2xl font-black text-[#0F172A] pt-6 mb-4">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-[#0F172A] mb-1">How does sketch feedback help you draw better?</h3>
                <p className="text-sm text-[#475569]">
                  It highlights what works and points out the next adjustment—such as proportion alignment or shading contrast—so you improve faster.
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-[#0F172A] mb-1">Can beginners use this workflow?</h3>
                <p className="text-sm text-[#475569]">
                  Yes. Focusing on one clear fix at a time makes learning drawing much easier for beginners.
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