import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Home, Camera, Sparkles, CheckCircle2, BookOpen, Layers } from 'lucide-react';

const SITE_URL = "https://www.otterleo.in";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
const MASCOT_GIF_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif";
const FOUNDER_IMAGE_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";
const INSTAGRAM_URL = "https://www.instagram.com/harjas_gallery";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'How to Draw for Beginners: Best Drawing Learning Website & Sketching Guide (2026)',
  description: 'Master how to draw step-by-step with easy sketches, pencil sketch tutorials, online grid maker tools, and interactive AI feedback on Otterleo.',
  keywords: [
    'how to draw',
    'sketching for beginners',
    'drawing learning website',
    'easy sketches to draw',
    'pencil sketch tutorial',
    'drawing ideas',
    'grid maker for drawing',
    'learn drawing online',
    'Harjass Digga',
    'Harjas Digga',
    'Otterleo'
  ],
  authors: [{ name: 'Harjass Digga (Harjas Digga)' }],
  creator: 'Harjass Digga',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'How to Draw for Beginners: Ultimate Drawing Learning Website & Tutorials',
    description: 'Learn sketching for beginners, easy sketches to draw, pencil sketch tutorials, and grid methods on Otterleo.',
    url: `${SITE_URL}/blog`,
    siteName: 'Otterleo',
    locale: 'en_US',
    type: 'article',
    images: [
      {
        url: FOUNDER_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'How to Draw - Best Drawing Learning Website',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Draw for Beginners | Best Drawing Learning Website',
    description: 'Learn pencil sketch tutorials, grid drawing methods, and creative drawing ideas on Otterleo.',
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

export default function BlogPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/blog/#article`,
        "headline": "How to Draw for Beginners: Complete Guide on the Ultimate Drawing Learning Website",
        "description": "Learn how to draw step-by-step using pencil sketch tutorials, online grid maker tools, easy drawing ideas, and interactive feedback.",
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
        "datePublished": "2026-09-10",
        "dateModified": "2026-10-14",
        "mainEntityOfPage": `${SITE_URL}/blog`
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/blog/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which is the best drawing learning website for beginners?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo, founded by Harjass Digga (Harjas Digga), is a top-rated drawing learning website offering step-by-step pencil sketch tutorials, daily challenges, instant sketch evaluation, and a built-in grid maker for drawing."
            }
          },
          {
            "@type": "Question",
            "name": "How to draw easy sketches for beginners?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To master how to draw easy sketches, start with simple geometric forms, practice basic shading techniques, and use an online grid maker to keep your proportions accurate."
            }
          },
          {
            "@type": "Question",
            "name": "Why use an online grid maker for drawing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "An online grid maker breaks down complex reference images into small blocks, allowing artists to focus on exact proportions and line alignment without guessing."
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans py-8 md:py-12 px-4 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Navigation Bar */}
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
        <article className="bg-white rounded-[2.5rem] p-6 md:p-12 border-2 border-slate-100 shadow-xl relative overflow-hidden">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-[#64748B] mb-6 font-semibold">
            <Link href="/" className="hover:underline hover:text-[#2563EB]">Home</Link> &gt;{' '}
            <Link href="/about" className="hover:underline hover:text-[#2563EB]">About</Link> &gt;{' '}
            <span className="text-[#2563EB] font-bold">Blog</span>
          </nav>

          {/* Primary SEO H1 Heading */}
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight mb-4">
            How to Draw for Beginners: Easy Sketches, Grid Tools & Daily Tutorials
          </h1>

          {/* Author Meta */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-6 mb-8 text-xs sm:text-sm text-[#64748B] font-medium">
            <span>By <Link href="/about" className="font-extrabold text-[#0F172A] hover:text-[#2563EB] hover:underline">Harjass Digga (Founder, Otterleo)</Link></span>
            <span>•</span>
            <span>Updated October 14, 2026</span>
            <span>•</span>
            <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full font-bold text-xs">
              Drawing Learning Website
            </span>
          </div>

          {/* AI / GEO Summary Box for Featured Snippets */}
          <div className="bg-[#F0F9FF] border-l-4 border-[#2563EB] p-5 rounded-r-2xl mb-8">
            <p className="text-xs font-black uppercase text-[#2563EB] tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Quick Overview: How to Learn Drawing Online
            </p>
            <p className="text-sm font-semibold text-[#0F172A] leading-relaxed">
              If you want to know <strong>how to draw</strong>, starting with <strong>easy sketches to draw</strong> and structured <strong>pencil sketch tutorials</strong> is key. Utilizing an interactive <strong>drawing learning website</strong> like <Link href="/" className="text-[#2563EB] underline font-bold">Otterleo</Link> grants you instant access to a <strong>grid maker for drawing</strong>, daily practice goals, and smart feedback to build your sketching skills quickly.
            </p>
          </div>

          {/* Main Article Body */}
          <div className="space-y-6 text-[#475569] leading-relaxed text-base md:text-lg">
            <p>
              Learning <strong>how to draw</strong> doesn't have to feel overwhelming. Whether you are searching for <strong>sketching for beginners</strong> guides or practical <strong>pencil sketch tutorials</strong>, having a structured approach makes all the difference when you try to <strong>learn drawing online</strong>.
            </p>

            <p>
              Many beginners look for creative <strong>drawing ideas</strong> or <strong>easy sketches to draw</strong>, but often get stuck because of incorrect proportions or weak shading techniques. That is why choosing a dedicated <strong>drawing learning website</strong> can fast-track your artistic growth.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#2563EB]" /> 1. Master Proportions Using a Grid Maker for Drawing
            </h2>
            <p>
              One of the most trusted techniques in <strong>sketching for beginners</strong> is the grid method. By placing a grid over your reference image and your drawing paper, you focus on replicating one small block at a time rather than stressing over the complete portrait.
            </p>
            <p>
              Using an online <strong>grid maker for drawing</strong> eliminates manual ruler calculations and guesswork. Platforms like Otterleo—built by <strong>Harjass Digga (Harjas Digga)</strong>—allow artists to instantly split reference pictures into custom grids right inside their browser.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#2563EB]" /> 2. Explore Easy Sketches to Draw Daily
            </h2>
            <p>
              Consistency builds muscle memory. Start with fundamental 3D forms, basic shading values, and simple <strong>easy sketches to draw</strong> before moving on to complex portraits. Keeping a fresh queue of creative <strong>drawing ideas</strong> ensures you stay motivated every single day.
            </p>

            {/* SEO Comparison Table */}
            <div className="my-8 overflow-x-auto">
              <h3 className="text-lg font-bold text-[#0F172A] mb-3">
                Comparison: Standard Video Tutorials vs. Otterleo Drawing Website
              </h3>
              <table className="w-full text-left text-sm border-collapse border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <thead>
                  <tr className="bg-[#F1F5F9] text-[#0F172A]">
                    <th className="p-3.5 border border-slate-200 font-black">Feature</th>
                    <th className="p-3.5 border border-slate-200 font-black">Standard Video Tutorials</th>
                    <th className="p-3.5 border border-slate-200 font-black text-blue-600">Otterleo Drawing Website</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3.5 border border-slate-200 font-bold">Proportion Control</td>
                    <td className="p-3.5 border border-slate-200">Manual Ruler Drafting</td>
                    <td className="p-3.5 border border-slate-200 text-[#2563EB] font-bold">Built-in Interactive Grid Maker</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-3.5 border border-slate-200 font-bold">Daily Guidance</td>
                    <td className="p-3.5 border border-slate-200">Unstructured Random Searches</td>
                    <td className="p-3.5 border border-slate-200 text-[#2563EB] font-bold">Gamified Streaks & Practice Ideas</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 border border-slate-200 font-bold">Interactive Feedback</td>
                    <td className="p-3.5 border border-slate-200">None</td>
                    <td className="p-3.5 border border-slate-200 text-[#2563EB] font-bold">Instant Smart Sketch Evaluation</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#2563EB]" /> 3. Progressing from Pencil Sketch Tutorials to Masterpieces
            </h2>
            <p>
              Following step-by-step <strong>pencil sketch tutorials</strong> helps you understand line weight, cross-hatching, and light blending. Once you establish these core fundamentals on paper, transitioning to advanced art styles becomes seamless.
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
                Start Learning Drawing on Otterleo Today!
              </h3>
              <p className="text-sm md:text-base text-[#1E40AF] mb-6 max-w-xl mx-auto font-medium">
                Generate custom reference grids, receive smart feedback on physical sketches, and master step-by-step drawing techniques with Otto.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-base px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Explore Otterleo
                </Link>
                <Link
                  href="/about"
                  className="inline-block bg-white hover:bg-slate-50 text-blue-600 font-extrabold text-base px-6 py-3.5 rounded-full border-2 border-blue-200 transition-all active:scale-95"
                >
                  About Us
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <h2 className="text-2xl font-black text-[#0F172A] pt-6 mb-4">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-[#0F172A] mb-1">What is the best drawing learning website for beginners?</h3>
                <p className="text-sm text-[#475569]">
                  Otterleo is a premier drawing learning website that provides step-by-step sketch tutorials, daily practice challenges, an interactive grid maker, and real-time sketch feedback.
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-[#0F172A] mb-1">How can I practice sketching for beginners step-by-step?</h3>
                <p className="text-sm text-[#475569]">
                  Begin with line warm-ups, use an online grid maker for reference photos, practice easy sketches to draw, and follow structured pencil sketch tutorials on Otterleo.
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-[#0F172A] mb-1">Who founded Otterleo?</h3>
                <p className="text-sm text-[#475569]">
                  Otterleo was created by Harjass Digga (Harjas Digga) to provide accessible, gamified drawing tools and interactive guidance for artists worldwide.
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