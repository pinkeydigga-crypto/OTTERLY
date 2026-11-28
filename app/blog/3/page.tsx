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
  Pencil,
  TrendingUp,
} from 'lucide-react';

const SITE_URL = "https://www.otterleo.in";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
const MASCOT_GIF_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif";
const FOUNDER_IMAGE_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";
const INSTAGRAM_URL = "https://www.instagram.com/harjas_gallery";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Sketching Ideas for Beginners & Drawing Techniques That Build Progress (2026)',
  description: 'Explore sketching ideas for beginners, core drawing techniques, and tools that help you track drawing progress every day on Otterleo.',
  keywords: [
    'sketching ideas for beginners',
    'drawing techniques',
    'how a beginner can improve their drawing skills using daily practice',
    'what tools can help me track my progress as I learn to draw',
    'sketching practice',
    'Harjass Digga',
    'Harjas Digga',
    'Otterleo'
  ],
  authors: [{ name: 'Harjass Digga (Harjas Digga)' }],
  creator: 'Harjass Digga',
  alternates: {
    canonical: `${SITE_URL}/blog/3`,
  },
  openGraph: {
    title: 'Sketching Ideas for Beginners & Drawing Techniques | Otterleo',
    description: 'Practical sketching ideas, core drawing techniques, and progress-tracking tools for beginners on Otterleo.',
    url: `${SITE_URL}/blog/3`,
    siteName: 'Otterleo',
    locale: 'en_US',
    type: 'article',
    images: [
      {
        url: FOUNDER_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Sketching Ideas and Drawing Techniques - Otterleo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sketching Ideas & Drawing Techniques | Otterleo',
    description: 'Learn beginner sketching ideas, drawing techniques, and how to track progress on Otterleo.',
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

export default function BlogThreePage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/blog/3/#article`,
        "headline": "Sketching Ideas for Beginners & Drawing Techniques That Build Progress",
        "description": "Discover sketching ideas for beginners, essential drawing techniques, and tools that help track progress in daily practice.",
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
        "mainEntityOfPage": `${SITE_URL}/blog/3`
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/blog/3/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What are good sketching ideas for beginners?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Good sketching ideas for beginners include simple everyday objects like mugs, leaves, shoes, and hands, plus basic cubes, cylinders, and spheres to practice form and shading."
            }
          },
          {
            "@type": "Question",
            "name": "How can a beginner improve their drawing skills using daily practice?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Beginners improve through daily practice by combining short warm-ups, focused drawing techniques like proportion grids and value shading, and reviewing what to fix next."
            }
          },
          {
            "@type": "Question",
            "name": "What tools can help track progress while learning to draw?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Streak counters, XP milestones, daily challenge logs, and saved sketch reviews help you see how consistently you practice and how your accuracy improves over time."
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog/3/#breadcrumb`,
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
            "name": "Blog 3",
            "item": `${SITE_URL}/blog/3`
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
            <span className="text-[#2563EB] font-bold">Guide 3</span>
          </nav>

          {/* Primary SEO H1 Heading */}
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight mb-4">
            Sketching Ideas for Beginners & Drawing Techniques That Build Real Progress
          </h1>

          {/* Author Meta */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-6 mb-8 text-xs sm:text-sm text-[#64748B] font-medium">
            <span>By <Link href="/about" className="font-extrabold text-[#0F172A] hover:text-[#2563EB] hover:underline">Harjass Digga (Founder, Otterleo)</Link></span>
            <span>•</span>
            <span>Updated November 28, 2026</span>
            <span>•</span>
            <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full font-bold text-xs">
              Ideas, Techniques & Progress
            </span>
          </div>

          {/* Direct Answer / GEO Summary Box */}
          <div className="bg-[#F0F9FF] border-l-4 border-[#2563EB] p-5 rounded-r-2xl mb-8">
            <p className="text-xs font-black uppercase text-[#2563EB] tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Quick Overview: Ideas, Techniques & Progress Tracking
            </p>
            <p className="text-sm font-semibold text-[#0F172A] leading-relaxed">
              The best <strong>sketching ideas for beginners</strong> start with simple forms and everyday subjects, paired with core <strong>drawing techniques</strong> like proportion grids and value shading. To see real growth from daily practice, use tools that track streaks, XP, challenges, and sketch feedback—such as the dashboard and practice tools on <Link href="/" className="text-[#2563EB] underline font-bold">Otterleo</Link>.
            </p>
          </div>

          {/* Main Article Body */}
          <div className="space-y-6 text-[#475569] leading-relaxed text-base md:text-lg">
            <p>
              When you sit down to sketch, two questions come up almost immediately: <em>What should I draw today?</em> and <em>How do I know I am actually getting better?</em> Answering both makes daily practice far more effective.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <Pencil className="w-6 h-6 text-[#2563EB]" /> 1. Practical Sketching Ideas & Core Drawing Techniques
            </h2>
            <p>
              Start your <strong>sketching ideas for beginners</strong> list with simple objects around you—a mug, a pair of headphones, a folded leaf, or a hand in a basic pose. Break each subject into cylinders, boxes, and spheres before adding detail.
            </p>
            <p>
              Pair those subjects with foundational <strong>drawing techniques</strong>: light construction lines, grid alignment for accurate proportions, and smooth light-to-shadow value transitions.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#2563EB]" /> 2. Tools That Help Track Your Drawing Progress
            </h2>
            <p>
              Relying on memory alone makes growth hard to notice. Tools that help you track progress include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#475569]">
              <li><strong>Daily streak and XP tracking:</strong> Shows whether you are keeping a steady practice rhythm.</li>
              <li><strong>Daily challenges and practice canvas logs:</strong> Gives repeatable prompts so you can compare attempts over time.</li>
              <li><strong>Sketch feedback and comparison:</strong> Helps you spot what improved from last week and what to fix next.</li>
            </ul>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#2563EB]" /> 3. How Beginners Turn Daily Practice into Skill
            </h2>
            <p>
              Pick an idea, apply one drawing technique, review what needs adjustment next, and repeat daily on Otterleo. Small, measurable reps add up faster than sporadic marathons.
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
                Generate Ideas & Track Your Progress on Otterleo!
              </h3>
              <p className="text-sm md:text-base text-[#1E40AF] mb-6 max-w-xl mx-auto font-medium">
                Use drawing ideas, practice tools, daily challenges, and streak tracking with Otto to see your progress grow.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-base px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Open Dashboard
                </Link>
                <Link
                  href="/blog/2"
                  className="inline-block bg-white hover:bg-slate-50 text-blue-600 font-extrabold text-base px-6 py-3.5 rounded-full border-2 border-blue-200 transition-all active:scale-95"
                >
                  Read Guide 2
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <h2 className="text-2xl font-black text-[#0F172A] pt-6 mb-4">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-[#0F172A] mb-1">What are good sketching ideas for beginners?</h3>
                <p className="text-sm text-[#475569]">
                  Everyday items like mugs, leaves, hands, and basic 3D forms are great starting subjects for building confidence and observation.
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-[#0F172A] mb-1">How can I track my drawing progress?</h3>
                <p className="text-sm text-[#475569]">
                  Tracking streaks, XP, completed challenges, and sketch feedback helps you measure consistency and spot improvements.
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