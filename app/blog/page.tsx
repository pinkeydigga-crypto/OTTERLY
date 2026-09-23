import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Home, Camera } from 'lucide-react';

const SITE_URL = "https://www.otterleo.in";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
const MASCOT_GIF_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif";
const FOUNDER_IMAGE_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";
const INSTAGRAM_URL = "https://www.instagram.com/harjas_gallery";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'How to Learn Drawing in a Fun Way (2026 Guide) | Otterleo',
  description: 'Learn how to learn drawing in a fun way using interactive feedback, online drawing courses, and daily gamified challenges on Otterleo drawing learning website.',
  keywords: [
    'how to learn drawing in fun way',
    'drawing learning online',
    'drawing courses',
    'drawing learning website',
    'learn drawing for beginners',
    'Otterleo',
    'gamified art lessons',
    'Harjas Digga Otterleo'
  ],
  authors: [{ name: 'Harjas Digga' }],
  creator: 'Harjas Digga',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'How to Learn Drawing in a Fun Way Online | Otterleo',
    description: 'Master sketching fast with online drawing courses, gamified goals, and instant feedback on the ultimate drawing learning website.',
    url: `${SITE_URL}/blog`,
    siteName: 'Otterleo',
    locale: 'en_US',
    type: 'article',
    images: [
      {
        url: FOUNDER_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Learn Drawing in a Fun Way - Otterleo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Learn Drawing in a Fun Way | Otterleo',
    description: 'Gamified online drawing courses with instant feedback on Otterleo drawing learning website.',
    images: [FOUNDER_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/blog/#article`,
        "headline": "How to Learn Drawing in a Fun Way Online in 2026: Beginner's Guide",
        "description": "Learn drawing online in an interactive way with daily gamified challenges, feedback, and structured drawing courses on Otterleo.",
        "image": FOUNDER_IMAGE_URL,
        "author": {
          "@type": "Person",
          "name": "Harjas Digga",
          "jobTitle": "Founder of Otterleo",
          "image": FOUNDER_IMAGE_URL,
          "url": `${SITE_URL}/about`
        },
        "publisher": {
          "@type": "Organization",
          "name": "Otterleo AI",
          "url": SITE_URL,
          "logo": {
            "@type": "ImageObject",
            "url": LOGO_URL
          }
        },
        "datePublished": "2026-09-10",
        "dateModified": "2026-09-10",
        "mainEntityOfPage": `${SITE_URL}/blog`
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/blog/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How to learn drawing in a fun way?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The best way to learn drawing in a fun way is through gamified practice: maintaining daily drawing streaks, earning XP points, getting instant feedback on paper sketches, and taking structured step-by-step online drawing courses on platforms like Otterleo."
            }
          },
          {
            "@type": "Question",
            "name": "Which is the best drawing learning website for beginners?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo (founded by Harjas Digga) is one of the best drawing learning websites for beginners, offering interactive lessons, daily streaks, grid maker tools, and real-time sketch evaluations."
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog/#breadcrumb`,
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
            "name": "About",
            "item": `${SITE_URL}/about`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Blog",
            "item": `${SITE_URL}/blog`
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-[#F8FAFC] text-[#1E293B] font-sans min-h-screen py-8 md:py-12 px-4 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Header Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 hover:border-blue-300 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3] text-blue-600" />
            <span>Back to Home</span>
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
        <article className="bg-white rounded-3xl p-6 md:p-12 border border-[#E2E8F0] shadow-sm">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="text-sm text-[#64748B] mb-6 font-medium">
            <Link href="/" className="hover:underline hover:text-[#2563EB]">Home</Link> &gt;{' '}
            <Link href="/about" className="hover:underline hover:text-[#2563EB]">About</Link> &gt;{' '}
            <span className="text-[#2563EB] font-bold">Blog</span>
          </nav>

          {/* Primary SEO H1 Heading */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] leading-tight mb-4">
            How to Learn Drawing in a Fun Way: Complete Guide for Online Beginners
          </h1>

          {/* Author Meta */}
          <div className="flex flex-wrap items-center gap-3 border-b border-[#E2E8F0] pb-6 mb-8 text-sm text-[#64748B]">
            <span>By <Link href="/about" className="font-bold text-[#0F172A] hover:text-[#2563EB] hover:underline">Harjas Digga (Founder, Otterleo)</Link></span>
            <span>•</span>
            <span>September 10, 2026</span>
            <span>•</span>
            <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full font-bold text-xs">
              Drawing Learning Online
            </span>
          </div>

          {/* LLM & AI Summary Box */}
          <div className="bg-[#F0F9FF] border-l-4 border-[#2563EB] p-5 rounded-r-2xl mb-8">
            <p className="text-xs font-black uppercase text-[#2563EB] tracking-wider mb-1">
              Quick Answer / Summary for Beginners
            </p>
            <p className="text-sm font-semibold text-[#0F172A] leading-relaxed">
              To learn drawing in a fun way, replace boring repetitive drills with gamified daily goals (streaks & XP), interactive online drawing courses, and instant feedback. Using a specialized <strong>drawing learning website</strong> like <Link href="/" className="text-[#2563EB] underline font-bold">Otterleo</Link> helps beginners fix line art, proportions, and shading step-by-step. Read more <Link href="/about" className="text-[#2563EB] underline font-bold">about Otterleo mission</Link>.
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6 text-[#475569] leading-relaxed text-base md:text-lg">
            <p>
              Many people believe that practicing sketch art requires years of tedious theory. But if you want to know <strong>how to learn drawing in a fun way</strong>, the secret lies in interactive, gamified practice and instant smart feedback that keeps you motivated every single day.
            </p>

            <p>
              When exploring <strong>drawing learning online</strong>, standard video platforms often lack direct feedback. That is where a dedicated <strong>drawing learning website</strong> like <Link href="/" className="text-[#2563EB] font-bold hover:underline">Otterleo</Link> transforms art practice into an engaging journey with leveling systems, streaks, and smart evaluations.
            </p>

            <h2 className="text-2xl font-bold text-[#0F172A] mt-8 mb-3">
              1. Turn Everyday Practice Into a Game
            </h2>
            <p>
              The easiest way to understand how to learn drawing in a fun way is by treating sketch practice like a game. Earning XP points, maintaining daily streaks, and climbing global leaderboards remove the friction of getting started. Daily 10-minute warmups make building muscle memory effortless.
            </p>

            <h2 className="text-2xl font-bold text-[#0F172A] mt-8 mb-3">
              2. Choose Structured Online Drawing Courses
            </h2>
            <p>
              Instead of watching random YouTube tutorials without a direction, enrolling in step-by-step <strong>drawing courses</strong> gives you a clear roadmap. Starting with basic lines, geometry, and shading before moving to portraits ensures smooth progress without feeling overwhelmed. You can explore our roadmap on our <Link href="/about" className="text-[#2563EB] font-bold hover:underline">About Page</Link>.
            </p>

            {/* GEO / LLM Table Comparison Block */}
            <div className="my-8 overflow-x-auto">
              <h3 className="text-lg font-bold text-[#0F172A] mb-3">
                Comparison: Traditional Classes vs. Gamified Drawing Learning Websites
              </h3>
              <table className="w-full text-left text-sm border-collapse border border-[#E2E8F0]">
                <thead>
                  <tr className="bg-[#F1F5F9] text-[#0F172A]">
                    <th className="p-3 border border-[#E2E8F0]">Feature</th>
                    <th className="p-3 border border-[#E2E8F0]">Traditional Classes</th>
                    <th className="p-3 border border-[#E2E8F0]">Otterleo (Drawing Website)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[#E2E8F0] font-bold">Feedback Speed</td>
                    <td className="p-3 border border-[#E2E8F0]">Weekly / Slow</td>
                    <td className="p-3 border border-[#E2E8F0] text-[#2563EB] font-bold">Instant 24/7 Scan</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[#E2E8F0] font-bold">Motivation System</td>
                    <td className="p-3 border border-[#E2E8F0]">Manual Homework</td>
                    <td className="p-3 border border-[#E2E8F0] text-[#2563EB] font-bold">Gamified Streaks, XP & Leaderboards</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[#E2E8F0] font-bold">Course Access</td>
                    <td className="p-3 border border-[#E2E8F0]">Fixed Timings</td>
                    <td className="p-3 border border-[#E2E8F0] text-[#2563EB] font-bold">Self-paced Online Drawing Courses</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-[#0F172A] mt-8 mb-3">
              3. Instant Feedback on Your Sketches
            </h2>
            <p>
              The biggest struggle with self-taught drawing learning online is knowing what to fix. By scanning your physical pencil drawings into <Link href="/about" className="text-[#2563EB] font-bold hover:underline">Otterleo</Link>, you receive instant feedback on proportions, shading depth, and perspective—making skill improvement fast and fun.
            </p>

            {/* High-Converting CTA Box with GIF Mascot */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-6 md:p-8 my-10 text-center shadow-sm">
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
              <h3 className="text-xl md:text-2xl font-bold text-[#1E3A8A] mb-2">
                Start Learning Drawing the Fun Way with Otto!
              </h3>
              <p className="text-sm md:text-base text-[#1E40AF] mb-6 max-w-xl mx-auto">
                Access structured online drawing courses, instant feedback, daily streak rewards, and official skill certificates on Otterleo.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-base px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Explore Otterleo Drawing Website
                </Link>
                <Link
                  href="/about"
                  className="inline-block bg-white hover:bg-slate-50 text-blue-600 font-bold text-base px-6 py-3 rounded-xl border border-blue-200 transition-all"
                >
                  Learn About Us
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <h2 className="text-2xl font-bold text-[#0F172A] mt-10 mb-4">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <h3 className="font-bold text-[#0F172A] mb-1">How to learn drawing in a fun way?</h3>
                <p className="text-sm text-[#475569]">
                  Practice daily in short sessions, use gamified streak trackers, attempt weekly challenges, and get real-time feedback on your physical drawings using Otterleo.
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <h3 className="font-bold text-[#0F172A] mb-1">Which is the best website for online drawing courses?</h3>
                <p className="text-sm text-[#475569]">
                  Otterleo provides beginner-friendly online drawing courses with interactive tools like the Grid Maker and 24/7 sketch feedback. Learn more on our <Link href="/about" className="text-[#2563EB] underline font-semibold">About Page</Link>.
                </p>
              </div>
            </div>

            {/* Blog Footer Links with Instagram */}
            <div className="border-t border-[#E2E8F0] pt-8 mt-12 bg-slate-50 rounded-2xl p-6">
              <h3 className="font-bold text-sm text-[#0F172A] uppercase tracking-wider mb-4">
                Explore More on Otterleo
              </h3>
              <div className="flex items-center gap-6 text-sm font-semibold flex-wrap">
                <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-[#2563EB] transition-colors">
                  <Home className="w-4 h-4 text-blue-500" />
                  <span>Home Page</span>
                </Link>
                <Link href="/about" className="flex items-center gap-2 text-slate-600 hover:text-[#2563EB] transition-colors">
                  <User className="w-4 h-4 text-blue-500" />
                  <span>About Otterleo</span>
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