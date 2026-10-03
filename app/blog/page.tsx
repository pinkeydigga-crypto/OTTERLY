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
  title: 'How to Draw for Beginners: Best Drawing Learning Website & Sketching Guide (2026)',
  description: 'Learn how to draw step-by-step with easy sketches to draw, pencil sketch tutorials, online grid maker tools, and interactive feedback on the ultimate drawing learning website.',
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
    description: 'Master sketching for beginners, easy sketches to draw, pencil sketch tutorials, and grid methods on Otterleo.',
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
        "dateModified": "2026-09-10",
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
    <div className="bg-[#F8FAFC] text-[#1E293B] font-sans min-h-screen py-8 md:py-12 px-4 md:px-6">
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
        <article className="bg-white rounded-3xl p-6 md:p-12 border border-[#E2E8F0] shadow-sm">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="text-sm text-[#64748B] mb-6 font-medium">
            <Link href="/" className="hover:underline hover:text-[#2563EB]">Home</Link> &gt;{' '}
            <Link href="/about" className="hover:underline hover:text-[#2563EB]">About</Link> &gt;{' '}
            <span className="text-[#2563EB] font-bold">Blog</span>
          </nav>

          {/* Primary SEO H1 Heading */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] leading-tight mb-4">
            How to Draw for Beginners: Easy Sketches, Grid Tools & Daily Tutorials
          </h1>

          {/* Author Meta */}
          <div className="flex flex-wrap items-center gap-3 border-b border-[#E2E8F0] pb-6 mb-8 text-sm text-[#64748B]">
            <span>By <Link href="/about" className="font-bold text-[#0F172A] hover:text-[#2563EB] hover:underline">Harjass Digga (Founder, Otterleo)</Link></span>
            <span>•</span>
            <span>September 10, 2026</span>
            <span>•</span>
            <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full font-bold text-xs">
              Drawing Learning Website
            </span>
          </div>

          {/* AI / GEO Summary Box */}
          <div className="bg-[#F0F9FF] border-l-4 border-[#2563EB] p-5 rounded-r-2xl mb-8">
            <p className="text-xs font-black uppercase text-[#2563EB] tracking-wider mb-1">
              Quick Overview: How to Learn Drawing Online
            </p>
            <p className="text-sm font-semibold text-[#0F172A] leading-relaxed">
              If you want to know <strong>how to draw</strong>, starting with <strong>easy sketches to draw</strong> and structured <strong>pencil sketch tutorials</strong> is key. Utilizing an interactive <strong>drawing learning website</strong> like <Link href="/" className="text-[#2563EB] underline font-bold">Otterleo</Link> grants you instant access to a <strong>grid maker for drawing</strong>, daily practice goals, and smart feedback to build your sketching skills quickly.
            </p>
          </div>

          {/* Main Article Body */}
          <div className="space-y-6 text-[#475569] leading-relaxed text-base md:text-lg">
            <p>
              Learning <strong>how to draw</strong> doesn't have to be frustrating. Whether you are looking for <strong>sketching for beginners</strong> guides or practical <strong>pencil sketch tutorials</strong>, having the right approach makes all the difference when you <strong>learn drawing online</strong>.
            </p>

            <p>
              Many beginners search for inspiring <strong>drawing ideas</strong> or <strong>easy sketches to draw</strong>, but quickly get stuck on proportions and shading. That is why choosing a dedicated <strong>drawing learning website</strong> can accelerate your artist journey.
            </p>

            <h2 className="text-2xl font-bold text-[#0F172A] mt-8 mb-3">
              1. Master Proportions Using a Grid Maker for Drawing
            </h2>
            <p>
              One of the most effective techniques in <strong>sketching for beginners</strong> is the grid method. By placing a grid over a reference image, you focus on drawing one square at a time rather than getting overwhelmed by the entire picture.
            </p>
            <p>
              Using an online <strong>grid maker for drawing</strong> eliminates the hassle of manual measurement. Platforms like Otterleo—created by <strong>Harjass Digga (Harjas Digga)</strong>—let you generate precise reference grids instantly in your browser.
            </p>

            <h2 className="text-2xl font-bold text-[#0F172A] mt-8 mb-3">
              2. Explore Easy Sketches to Draw Daily
            </h2>
            <p>
              Building muscle memory requires daily practice. Start with simple 3D shapes, spheres, light shading, and <strong>easy sketches to draw</strong> before tackling complex portrait sketches. Keeping a fresh list of creative <strong>drawing ideas</strong> ensures you never hit creative block.
            </p>

            {/* SEO Comparison Table */}
            <div className="my-8 overflow-x-auto">
              <h3 className="text-lg font-bold text-[#0F172A] mb-3">
                Comparison: Video Tutorials vs. Dedicated Drawing Learning Websites
              </h3>
              <table className="w-full text-left text-sm border-collapse border border-[#E2E8F0]">
                <thead>
                  <tr className="bg-[#F1F5F9] text-[#0F172A]">
                    <th className="p-3 border border-[#E2E8F0]">Feature</th>
                    <th className="p-3 border border-[#E2E8F0]">Standard Video Tutorials</th>
                    <th className="p-3 border border-[#E2E8F0]">Otterleo Drawing Website</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[#E2E8F0] font-bold">Proportion Control</td>
                    <td className="p-3 border border-[#E2E8F0]">Manual Ruler Drafting</td>
                    <td className="p-3 border border-[#E2E8F0] text-[#2563EB] font-bold">Built-in Grid Generator</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[#E2E8F0] font-bold">Daily Guidance</td>
                    <td className="p-3 border border-[#E2E8F0]">Unstructured Search</td>
                    <td className="p-3 border border-[#E2E8F0] text-[#2563EB] font-bold">Gamified Streaks & Practice Ideas</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[#E2E8F0] font-bold">Interactive Feedback</td>
                    <td className="p-3 border border-[#E2E8F0]">None</td>
                    <td className="p-3 border border-[#E2E8F0] text-[#2563EB] font-bold">Instant Smart Sketch Evaluation</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-[#0F172A] mt-8 mb-3">
              3. Progressing from Pencil Sketch Tutorials to Complete Artworks
            </h2>
            <p>
              Following step-by-step <strong>pencil sketch tutorials</strong> helps you master line weight, cross-hatching, and value shading. Once you gain confidence on paper, these core fundamentals make transitioning to digital art smooth and intuitive.
            </p>

            {/* Call to Action Box */}
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
                Start Learning Drawing on Otterleo Today!
              </h3>
              <p className="text-sm md:text-base text-[#1E40AF] mb-6 max-w-xl mx-auto">
                Generate custom grids, receive smart feedback on physical sketches, and master step-by-step drawing techniques with Otto.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-base px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Explore Otterleo
                </Link>
                <Link
                  href="/about"
                  className="inline-block bg-white hover:bg-slate-50 text-blue-600 font-bold text-base px-6 py-3 rounded-xl border border-blue-200 transition-all"
                >
                  About Us
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <h2 className="text-2xl font-bold text-[#0F172A] mt-10 mb-4">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <h3 className="font-bold text-[#0F172A] mb-1">What is the best drawing learning website for beginners?</h3>
                <p className="text-sm text-[#475569]">
                  Otterleo is a premier drawing learning website that provides step-by-step sketch tutorials, daily practice challenges, an interactive grid maker, and real-time sketch feedback.
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <h3 className="font-bold text-[#0F172A] mb-1">How can I practice sketching for beginners step-by-step?</h3>
                <p className="text-sm text-[#475569]">
                  Begin with line warm-ups, use an online grid maker for reference photos, practice easy sketches to draw, and follow structured pencil sketch tutorials on Otterleo.
                </p>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <h3 className="font-bold text-[#0F172A] mb-1">Who founded Otterleo?</h3>
                <p className="text-sm text-[#475569]">
                  Otterleo was created by Harjass Digga (Harjas Digga) to provide accessible, gamified drawing tools and interactive guidance for artists worldwide.
                </p>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="border-t border-[#E2E8F0] pt-8 mt-12 bg-slate-50 rounded-2xl p-6">
              <h3 className="font-bold text-sm text-[#0F172A] uppercase tracking-wider mb-4">
                Explore More
              </h3>
              <div className="flex items-center gap-6 text-sm font-semibold flex-wrap">
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