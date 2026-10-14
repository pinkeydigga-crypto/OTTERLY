import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';

const SITE_URL = "https://www.otterleo.in";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
const MASCOT_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20dahsbaord%20mascot.png";
const FOUNDER_IMAGE_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'About Us — Otterleo | Best Drawing Learning Website & Sketching Platform',
  description: 'Discover Otterleo, the ultimate drawing learning website founded by Harjass Digga (Harjas Digga). Learn how to draw with easy sketches, grid tools, and Otto.',
  keywords: [
    'Otterleo',
    'What is Otterleo',
    'Harjass Digga',
    'Harjas Digga',
    'how to draw',
    'sketching for beginners',
    'drawing learning website',
    'easy sketches to draw',
    'pencil sketch tutorial',
    'grid maker for drawing',
    'AI Drawing Coach',
    'Otto Mascot'
  ],
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About Otterleo — Ultimate Drawing Learning Website',
    description: 'Learn how to draw and master sketching for beginners with Otterleo, founded by Harjass Digga (Harjas Digga).',
    url: `${SITE_URL}/about`,
    siteName: 'Otterleo',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: FOUNDER_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Harjass Digga - Founder of Otterleo Drawing Learning Website',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Otterleo | Drawing Learning Website',
    description: 'Meet Harjass Digga (Harjas Digga) and learn how Otterleo is transforming sketching for beginners.',
    images: [FOUNDER_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "Otterleo",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          "url": LOGO_URL
        },
        "founder": {
          "@type": "Person",
          "name": "Harjass Digga",
          "alternateName": "Harjas Digga",
          "jobTitle": "Founder of Otterleo",
          "image": FOUNDER_IMAGE_URL,
          "url": `${SITE_URL}/about`
        }
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/about/#webpage`,
        "url": `${SITE_URL}/about`,
        "name": "About Harjass Digga & Otterleo Drawing Learning Website",
        "description": "Learn about Harjass Digga (Harjas Digga), founder of Otterleo, the leading drawing learning website.",
        "isPartOf": {
          "@id": `${SITE_URL}/#website`
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "@id": `${SITE_URL}/about/#breadcrumb`,
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
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/about/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Who is Harjass Digga and Harjas Digga?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Harjass Digga (also known as Harjas Digga) is the visionary founder of Otterleo, a premier drawing learning website dedicated to helping artists master sketching for beginners, easy sketches to draw, and advanced grid techniques."
            }
          },
          {
            "@type": "Question",
            "name": "What is Otterleo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo is a top-rated drawing learning website created by Harjass Digga (Harjas Digga) where users learn how to draw through step-by-step pencil sketch tutorials, daily challenges, grid maker tools, and instant AI feedback."
            }
          },
          {
            "@type": "Question",
            "name": "How to learn drawing and sketching on Otterleo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Users can follow structured pencil sketch tutorials, practice easy sketches to draw, use the built-in grid maker for drawing proportions, and scan paper artwork for instant AI evaluation."
            }
          }
        ]
      }
    ]
  };

  const faqs = [
    {
      q: "Who is Harjass Digga / Harjas Digga?",
      a: "Harjass Digga (also known as Harjas Digga) is the founder of Otterleo. He built this drawing learning website to make sketching for beginners engaging, structured, and accessible through gamified daily challenges and smart AI feedback."
    },
    {
      q: "What is Otterleo?",
      a: "Otterleo is a premier drawing learning website where artists learn how to draw using pencil sketch tutorials, online grid maker tools, easy sketches to draw, and daily streak challenges."
    },
    {
      q: "How to learn drawing and sketching effectively?",
      a: "By mastering foundational shapes, utilizing a grid maker for drawing accurate proportions, following step-by-step pencil sketch tutorials, and practicing daily on Otterleo."
    },
    {
      q: "How does the AI Artwork Scan feature work?",
      a: "You can scan your paper sketches with your camera on Otterleo to receive instant accuracy scores, proportion analysis, and improvement tips."
    },
    {
      q: "Is Otterleo suitable for beginners?",
      a: "Yes! Otterleo is specifically designed as a drawing learning website for beginners and intermediate artists, guided by our mascot Otto."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {/* BACK TO HOME BUTTON */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#0F172A] font-extrabold text-xs px-4 py-2.5 rounded-2xl border-2 border-slate-200 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#2563EB]" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* HERO SECTION */}
        <section className="text-center pb-10 pt-2">
          <div className="flex justify-center mb-6">
            <Image 
              src={LOGO_URL} 
              alt="Otterleo Logo" 
              title="Otterleo Logo"
              width={200}
              height={80}
              priority
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight mb-4">
            About Otterleo — <span className="text-[#2563EB]">The Ultimate Drawing Learning Website</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto font-medium">
            Founded by <strong>Harjass Digga (Harjas Digga)</strong>, Otterleo helps you master <strong>how to draw</strong> through easy sketches, pencil sketch tutorials, and smart grid tools.
          </p>
        </section>

        {/* FOUNDER BIO SECTION (TARGETING HARJASS DIGGA / HARJAS DIGGA) */}
        <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-xl border-2 border-slate-100 my-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-4 border-blue-600 shadow-lg shrink-0">
            <Image 
              src={FOUNDER_IMAGE_URL} 
              alt="Harjass Digga (Harjas Digga) - Founder of Otterleo" 
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              Meet the Founder: Harjass Digga (Harjas Digga)
            </h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
              <strong>Harjass Digga</strong> (also searched as <strong>Harjas Digga</strong>) created <strong>Otterleo</strong> to bridge the gap between traditional art education and interactive digital tools. Passionate about <strong>sketching for beginners</strong>, Harjas built this <strong>drawing learning website</strong> so anyone can learn <strong>how to draw</strong> using an online <strong>grid maker for drawing</strong> and AI feedback.
            </p>
          </div>
        </section>

        {/* MISSION & OTTO MASCOT SECTION */}
        <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-xl border-2 border-slate-100 my-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl md:text-3xl font-black text-[#0F172A]">
              Meet Otto & The Otterleo Mission
            </h2>
            <p className="text-[#475569] leading-relaxed font-medium">
              Learning <strong>how to draw</strong> shouldn't feel boring. At <strong>Otterleo</strong>, we combine <strong>easy sketches to draw</strong> with gamified daily challenges to make art fun and accessible.
            </p>
            <p className="text-[#475569] leading-relaxed font-medium">
              Guided by our mascot <strong>Otto</strong>, our <strong>drawing learning website</strong> turns fundamental <strong>pencil sketch tutorials</strong> into bite-sized levels. Earn XP, maintain daily streaks, and use our <strong>grid maker for drawing</strong> to master proportions instantly.
            </p>
          </div>

          <div className="relative flex flex-col items-center shrink-0">
            <div className="bg-white border-2 border-[#1E293B] text-[#0F172A] font-extrabold text-xs px-3 py-1.5 rounded-full shadow-sm mb-2 z-10">
              Hi, I'm <span className="text-[#2563EB]">Otto</span>
            </div>
            <Image 
              src={MASCOT_URL} 
              alt="Otto Mascot - Otterleo Coach" 
              width={176}
              height={176}
              className="w-36 md:w-44 h-auto object-contain"
            />
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="my-12">
          <h2 className="text-2xl font-black text-center text-[#0F172A] mb-8">
            Why Choose Our Drawing Learning Website?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border-2 border-slate-100 shadow-md">
              <h3 className="font-black text-lg text-[#0F172A] mb-2">Grid Maker for Drawing</h3>
              <p className="text-sm text-[#64748B] leading-relaxed font-medium">Split reference photos into precise grids instantly to master proportions like a pro artist.</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border-2 border-slate-100 shadow-md">
              <h3 className="font-black text-lg text-[#0F172A] mb-2">Pencil Sketch Tutorials</h3>
              <p className="text-sm text-[#64748B] leading-relaxed font-medium">Follow structured step-by-step guides for sketching for beginners and easy drawings.</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border-2 border-slate-100 shadow-md">
              <h3 className="font-black text-lg text-[#0F172A] mb-2">AI Artwork Scan</h3>
              <p className="text-sm text-[#64748B] leading-relaxed font-medium">Scan your physical paper sketches with your camera for instant accuracy scores and tips.</p>
            </div>
          </div>
        </section>

        {/* COLLAPSIBLE FAQ SECTION */}
        <section className="my-12 bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 border-2 border-slate-100 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-2 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-[#64748B] text-center mb-8 text-sm md:text-base font-semibold">
            Click on any question to view the answer.
          </p>

          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group bg-[#F8FAFC] border-2 border-slate-200 rounded-2xl transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center cursor-pointer p-5 font-extrabold text-[#0F172A] text-base select-none">
                  <span className="flex items-center gap-2">
                    <span className="text-[#2563EB]">Q:</span> {faq.q}
                  </span>
                  <ChevronDown className="w-5 h-5 text-[#64748B] transition-transform duration-300 group-open:rotate-180 flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5 pt-1 text-sm text-[#475569] leading-relaxed border-t border-slate-200 mt-2 font-medium">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CONTACT US SECTION */}
        <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-xl border-2 border-slate-100 text-center">
          <h2 className="text-2xl font-black text-[#0F172A] mb-2">Have Questions or Feedback?</h2>
          <p className="text-[#64748B] mb-6 font-semibold">Reach out to Harjass Digga and the Otterleo team anytime.</p>
          
          <div className="flex justify-center items-center gap-4 text-sm font-bold">
            <a 
              href="mailto:otterleosupport@gmail.com" 
              className="w-full sm:w-auto bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] px-6 py-3.5 rounded-2xl border-2 border-slate-200 transition-all"
            >
              otterleosupport@gmail.com
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}