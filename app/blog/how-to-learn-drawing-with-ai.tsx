import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

const SITE_URL = "https://otterly-prototype.vercel.app";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otterly%20logo%20(1).png";
const MASCOT_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20dahsbaord%20mascot.png";
const FOUNDER_IMAGE_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'How to Learn Drawing with AI (2026 Step-by-Step Guide) | Otterly AI',
  description: 'Master drawing fast using AI feedback, daily gamified challenges, and structured lessons on Otterly AI. Complete beginner guide by founder Harjas Digga.',
  keywords: [
    'How to learn drawing with AI',
    'Otterly AI',
    'AI drawing coach',
    'learn drawing for beginners',
    'Otterly AI blog',
    'gamified art lessons',
    'Harjas Digga Otterly',
    'drawing feedback AI'
  ],
  authors: [{ name: 'Harjas Digga' }],
  creator: 'Harjas Digga',
  alternates: {
    canonical: '/blog/how-to-learn-drawing-with-ai',
  },
  openGraph: {
    title: 'How to Learn Drawing with AI in 2026: Step-by-Step Guide | Otterly AI',
    description: 'Learn drawing step-by-step using instant AI sketch feedback and gamified daily goals on Otterly AI.',
    url: `${SITE_URL}/blog/how-to-learn-drawing-with-ai`,
    siteName: 'Otterly AI',
    locale: 'en_US',
    type: 'article',
    images: [
      {
        url: FOUNDER_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Learn Drawing with Otterly AI - Harjas Digga',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Learn Drawing with AI (2026 Guide) | Otterly AI',
    description: 'Gamified AI drawing lessons and instant feedback by Otterly AI founder Harjas Digga.',
    images: [FOUNDER_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HowToLearnDrawingWithAIPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/blog/how-to-learn-drawing-with-ai/#article`,
        "headline": "How to Learn Drawing with AI in 2026: A Step-by-Step Guide for Beginners",
        "description": "Learn how AI feedback and gamified learning can help you master drawing step-by-step with Otterly AI.",
        "author": {
          "@type": "Person",
          "name": "Harjas Digga",
          "jobTitle": "Founder of Otterly AI",
          "image": FOUNDER_IMAGE_URL
        },
        "publisher": {
          "@type": "Organization",
          "name": "Otterly AI",
          "url": SITE_URL,
          "logo": LOGO_URL
        },
        "datePublished": "2026-09-10",
        "dateModified": "2026-09-10",
        "mainEntityOfPage": `${SITE_URL}/blog/how-to-learn-drawing-with-ai`
      },
      {
        "@type": "BreadcrumbList",
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
            "name": "How to Learn Drawing with AI",
            "item": `${SITE_URL}/blog/how-to-learn-drawing-with-ai`
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-[#F8FAFC] text-[#1E293B] font-sans min-h-screen py-12 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 border border-[#E2E8F0] shadow-sm">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-sm text-[#64748B] mb-6 font-medium">
          <Link href="/" className="hover:underline hover:text-[#2563EB]">Home</Link> &gt;{' '}
          <Link href="/about" className="hover:underline hover:text-[#2563EB]">About</Link> &gt;{' '}
          <span className="text-[#2563EB] font-bold">Blog</span>
        </nav>

        {/* Primary SEO H1 Heading */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] leading-tight mb-4">
          How to Learn Drawing with AI in 2026: A Step-by-Step Guide
        </h1>

        {/* Author Meta */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E2E8F0] pb-6 mb-8 text-sm text-[#64748B]">
          <span className="font-bold text-[#0F172A]">By Harjas Digga (Founder, Otterly AI)</span>
          <span>•</span>
          <span>September 10, 2026</span>
          <span>•</span>
          <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full font-bold text-xs">
            Art & AI Guide
          </span>
        </div>

        {/* Main Content */}
        <div className="space-y-6 text-[#475569] leading-relaxed text-base md:text-lg">
          <p>
            Learning to draw used to mean paying thousands of rupees for expensive live classes or spending endless hours watching unstructured YouTube tutorials. Today, smart AI feedback systems combined with gamified daily goals make art education accessible, interactive, and fun for everyone.
          </p>

          <p>
            With platforms like <Link href="/" className="text-[#2563EB] font-bold hover:underline">Otterly AI</Link>, you get a personalized drawing coach right on your phone or laptop. Here is how you can master drawing step-by-step starting today.
          </p>

          <h2 className="text-2xl font-bold text-[#0F172A] mt-8 mb-3">
            1. Master the Fundamentals First (Lines, Shapes & Forms)
          </h2>
          <p>
            Every complex portrait or anime character starts with simple geometry. Spend your first few days practicing smooth line control, perfect circles, cubes, cylinders, and spheres. Daily 10-minute targeted warmups build muscle memory much faster than occasional long sessions.
          </p>

          <h2 className="text-2xl font-bold text-[#0F172A] mt-8 mb-3">
            2. Get Instant AI Feedback on Your Sketches
          </h2>
          <p>
            The biggest hurdle for self-taught artists is not knowing <em>where</em> their mistakes lie. By uploading or scanning your physical paper sketches into <Link href="/about" className="text-[#2563EB] font-bold hover:underline">Otterly AI</Link>, you get real-time feedback on proportions, shading, perspective, and alignment.
          </p>

          <h2 className="text-2xl font-bold text-[#0F172A] mt-8 mb-3">
            3. Build Consistency through Gamified Learning
          </h2>
          <p>
            Consistency beats raw talent every single time. Earning daily XP, keeping a streak alive, and unlocking official skill certificates turn practice into an addicting game.
          </p>

          {/* High-Converting CTA Box */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-6 md:p-8 my-10 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <Image 
                src={MASCOT_URL} 
                alt="Otto Mascot - Otterly AI Coach" 
                width={80} 
                height={80} 
                className="w-20 h-auto object-contain"
              />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#1E3A8A] mb-2">
              Start Learning Drawing with Otto Today!
            </h3>
            <p className="text-sm md:text-base text-[#1E40AF] mb-6 max-w-xl mx-auto">
              Get full video courses, instant 24/7 AI feedback, daily streaks, and official certificates for just ₹299 (instead of ₹2,000+ live classes).
            </p>
            <Link
              href="/"
              className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-base px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Get Started on Otterly AI
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-[#0F172A] mt-8 mb-3">
            Why Choose Otterly AI Over Expensive Courses?
          </h2>
          <p>
            Traditional art bootcamps charge anywhere between ₹2,000 to ₹5,000 for rigid schedule classes. <Link href="/" className="text-[#2563EB] font-bold hover:underline">Otterly AI</Link>, created by <strong>Harjas Digga</strong>, gives you self-paced video lessons, infinite AI evaluations, and daily drawing challenges all at a fraction of that cost.
          </p>
        </div>
      </article>
    </div>
  );
}