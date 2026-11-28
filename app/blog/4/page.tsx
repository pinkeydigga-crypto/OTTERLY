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
  Compass,
  Layers,
} from 'lucide-react';

const SITE_URL = "https://www.otterleo.in";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
const MASCOT_GIF_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/VID-20260918-WA00101-ezgif.com-video-to-gif-converter_transparent.gif";
const FOUNDER_IMAGE_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";
const INSTAGRAM_URL = "https://www.instagram.com/harjas_gallery";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Step by Step Drawing for Beginners: Easy Sketches & Guided Practice (2026)',
  description: 'Follow a clear step-by-step path to draw easy sketches for beginners, build core proportions, and practice guided drawing lessons on Otterleo.',
  keywords: [
    'step by step drawing for beginners',
    'easy sketches to draw',
    'online lessons drawing',
    'easy drawings for beginners',
    'guided drawing practice',
    'Harjass Digga',
    'Harjas Digga',
    'Otterleo'
  ],
  authors: [{ name: 'Harjass Digga (Harjas Digga)' }],
  creator: 'Harjass Digga',
  alternates: {
    canonical: `${SITE_URL}/blog/4`,
  },
  openGraph: {
    title: 'Step by Step Drawing for Beginners & Easy Sketches | Otterleo',
    description: 'Simple step-by-step drawing steps, easy sketches, and guided practice on Otterleo.',
    url: `${SITE_URL}/blog/4`,
    siteName: 'Otterleo',
    locale: 'en_US',
    type: 'article',
    images: [
      {
        url: FOUNDER_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Step by Step Drawing for Beginners - Otterleo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Step by Step Drawing for Beginners | Otterleo',
    description: 'Learn step-by-step drawing and easy sketches with guided tools on Otterleo.',
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

export default function BlogFourPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/blog/4/#article`,
        "headline": "Step by Step Drawing for Beginners: Easy Sketches & Guided Practice",
        "description": "A clear step-by-step approach for beginners to learn easy sketches, proportions, and guided drawing practice.",
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
        "mainEntityOfPage": `${SITE_URL}/blog/4`
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/blog/4/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the best step-by-step order for a beginner learning to draw?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Start with simple lines and basic 3D shapes, practice easy sketches like everyday objects, use grids or guides to check proportions, and add shading after outlines feel steady."
            }
          },
          {
            "@type": "Question",
            "name": "How can I make easy sketches look cleaner without rushing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sketch light construction shapes first, verify placement and angles before darkening lines, and keep shading on one consistent light side."
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog/4/#breadcrumb`,
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
            "name": "Blog 4",
            "item": `${SITE_URL}/blog/4`
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
            <span className="text-[#2563EB] font-bold">Guide 4</span>
          </nav>

          {/* Primary SEO H1 Heading */}
          <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight mb-4">
            Step by Step Drawing for Beginners: Easy Sketches & Guided Practice
          </h1>

          {/* Author Meta */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-6 mb-8 text-xs sm:text-sm text-[#64748B] font-medium">
            <span>By <Link href="/about" className="font-extrabold text-[#0F172A] hover:text-[#2563EB] hover:underline">Harjass Digga (Founder, Otterleo)</Link></span>
            <span>•</span>
            <span>Updated November 28, 2026</span>
            <span>•</span>
            <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full font-bold text-xs">
              Step-by-Step Beginners
            </span>
          </div>

          {/* Direct Answer / GEO Summary Box */}
          <div className="bg-[#F0F9FF] border-l-4 border-[#2563EB] p-5 rounded-r-2xl mb-8">
            <p className="text-xs font-black uppercase text-[#2563EB] tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Quick Overview: Follow a Clear Order
            </p>
            <p className="text-sm font-semibold text-[#0F172A] leading-relaxed">
              For <strong>step by step drawing for beginners</strong>, move in stages: rough shapes first, proportions and alignment second, and shading or details last. Using <Link href="/" className="text-[#2563EB] underline font-bold">Otterleo</Link>&apos;s learning path, grid maker, and practice canvas keeps each step structured.
            </p>
          </div>

          {/* Main Article Body */}
          <div className="space-y-6 text-[#475569] leading-relaxed text-base md:text-lg">
            <p>
              Beginners often jump straight into tiny details or heavy shading before the basic shape is in place. Following a predictable order makes <strong>easy sketches to draw</strong> much cleaner and less frustrating.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#2563EB]" /> 1. Block In Simple Shapes Before Adding Detail
            </h2>
            <p>
              Every complex object or character can be simplified into boxes, cylinders, ovals, and guiding center lines. Sketching these lightly lets you adjust size and placement easily before committing to final lines.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#2563EB]" /> 2. Check Proportions & Light Direction Early
            </h2>
            <p>
              Before shading, check how parts relate to one another—width versus height, spacing, and symmetry. A reference grid or step-by-step guide on Otterleo helps keep proportions steady while you practice.
            </p>

            <h2 className="text-2xl font-black text-[#0F172A] pt-4 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#2563EB]" /> 3. Finish with Clean Outlines and Value Shading
            </h2>
            <p>
              Once the structure looks right, clean up stray lines, add a single light source in mind, and shade midtones and cast shadows gradually.
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
                Follow Step-by-Step Drawing on Otterleo!
              </h3>
              <p className="text-sm md:text-base text-[#1E40AF] mb-6 max-w-xl mx-auto font-medium">
                Explore learning paths, grids, and practice tools designed for steady beginner progress.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/learning-path"
                  className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-base px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Open Learning Path
                </Link>
                <Link
                  href="/blog/3"
                  className="inline-block bg-white hover:bg-slate-50 text-blue-600 font-extrabold text-base px-6 py-3.5 rounded-full border-2 border-blue-200 transition-all active:scale-95"
                >
                  Read Guide 3
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <h2 className="text-2xl font-black text-[#0F172A] pt-6 mb-4">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-[#0F172A] mb-1">What is the best order for step by step drawing?</h3>
                <p className="text-sm text-[#475569]">
                  Start with rough shapes and guidelines, check proportions, refine edges, and add shading last.
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-[#0F172A] mb-1">How does Otterleo support beginners?</h3>
                <p className="text-sm text-[#475569]">
                  It combines guided learning paths, practice tools, grid references, and feedback so beginners can practice step by step.
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