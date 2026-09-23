import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';

const SITE_URL = "https://www.otterleo.in";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
const MASCOT_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20dahsbaord%20mascot.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'About Us & Mission',
  description: 'Learn drawing and sketching in a fun way with Otterleo. Discover our mission, meet Otto our mascot, and practice with gamified daily art challenges.',
  keywords: [
    'Otterleo',
    'What is Otterleo',
    'How to learn drawing and sketching in fun way',
    'Best fun drawing and sketching learning platform',
    'Fun sketching website',
    'Otterleo Drawing and Sketching App',
    'AI Drawing and Sketching Coach',
    'Gamified Sketching Lessons',
    'Otto Mascot',
    'Learn Sketching AI',
    'Drawing and Sketching App XP Streaks'
  ],
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About Otterleo — The Fun Way to Learn Drawing & Sketching',
    description: 'Learn drawing and sketching with Otterleo and Otto. Make art fun, affordable, and accessible.',
    url: `${SITE_URL}/about`,
    siteName: 'Otterleo',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: LOGO_URL,
        width: 1200,
        height: 630,
        alt: 'Otterleo - Fun Drawing and Sketching Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Otterleo — The Fun Way to Learn Drawing & Sketching',
    description: 'Gamified drawing and sketching learning platform. Master art with instant AI feedback.',
    images: [LOGO_URL],
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
        "name": "Otterleo AI",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": LOGO_URL
        },
        "sameAs": [
          SITE_URL
        ]
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/about/#webpage`,
        "url": `${SITE_URL}/about`,
        "name": "About Otterleo & Otto Mascot",
        "description": "Learn about Otterleo, the gamified drawing platform with AI visual feedback.",
        "isPartOf": {
          "@id": `${SITE_URL}/#website`
        },
        "breadcrumb": {
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
            "name": "What is Otterleo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo is a fun online drawing and sketching learning platform where users complete daily challenges, practice on interactive canvas, earn XP, customize avatars, scan artwork for instant AI feedback, and compete on global leaderboards."
            }
          },
          {
            "@type": "Question",
            "name": "How to learn drawing and sketching in a fun way?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo turns learning drawing and sketching into a game with daily practice challenges, streak rewards, interactive canvas tools, leaderboard rankings, and AI-powered visual feedback."
            }
          },
          {
            "@type": "Question",
            "name": "How does the AI Artwork Scan feature work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Users can scan their physical paper drawings or sketches using their camera to receive instant accuracy scores, feedback on proportions, shading analysis, and tips for improvement."
            }
          },
          {
            "@type": "Question",
            "name": "Is Otterleo suitable for absolute beginners in drawing and sketching?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Otterleo is designed for beginners of all ages. Otto guides you through step-by-step bite-sized lessons so you can master basic sketching and drawing fundamentals without feeling overwhelmed."
            }
          },
          {
            "@type": "Question",
            "name": "Can I practice drawing and sketching directly on digital canvas?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! You can choose to draw on physical paper and scan it, or practice directly on Otterleo's interactive digital canvas using touch or stylus input."
            }
          }
        ]
      }
    ]
  };

  const faqs = [
    {
      q: "What is Otterleo?",
      a: "Otterleo is a fun online drawing and sketching learning platform where users complete daily challenges, practice on an interactive canvas, earn XP, customize avatars, scan artwork for instant AI feedback, and compete on global leaderboards while mastering art step-by-step."
    },
    {
      q: "How to learn drawing and sketching in a fun way?",
      a: "Otterleo turns drawing and sketching into a game! Complete daily practice challenges, maintain streaks, track progress on leaderboards, unlock achievements, and get instant AI-powered feedback on your paper or digital sketches."
    },
    {
      q: "How does the AI Artwork Scan feature work?",
      a: "Scan your paper drawings or sketches using your camera to get an instant precision score, feedback on proportions, line accuracy, and shading techniques powered by computer vision."
    },
    {
      q: "Is Otterleo suitable for absolute beginners in drawing and sketching?",
      a: "Yes! Otterleo is built for absolute beginners as well as intermediate artists. Guided by our mascot Otto, lessons are broken into simple, gamified levels to help you build core sketching skills at your own pace."
    },
    {
      q: "Can I practice drawing and sketching directly on digital canvas?",
      a: "Yes! Otterleo offers an interactive built-in canvas where you can sketch directly online. You can also practice on traditional paper and scan it anytime for instant feedback."
    }
  ];

  return (
    <div className="bg-[#F8FAFC] text-[#1E293B] font-sans min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <main className="max-w-4xl mx-auto px-6 py-8">
        
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
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Otterleo — <span className="text-[#2563EB]">The Fun Way to Learn Drawing & Sketching</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto font-medium">
            Practice on canvas, scan artwork for AI feedback, complete sketch challenges, earn XP, and compete on leaderboards daily.
          </p>
        </section>

        {/* MISSION & OTTO MASCOT SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#E2E8F0] my-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-4">
              Meet Otto & The Otterleo Mission
            </h2>
            <p className="text-[#475569] leading-relaxed mb-4 font-normal">
              Learning drawing and sketching shouldn't feel like a boring lecture. At <strong>Otterleo</strong>, we believe that practicing art should feel as engaging as playing your favorite game.
            </p>
            <p className="text-[#475569] leading-relaxed font-normal">
              Guided by our mascot <strong>Otto</strong>, Otterleo turns fundamental drawing and sketching skills into bite-sized levels. Earn XP, maintain daily streaks, set custom avatars, and scan your sketches for instant AI feedback.
            </p>
          </div>

          <div className="relative flex flex-col items-center">
            <div className="bg-white border-2 border-[#1E293B] text-[#0F172A] font-bold text-xs px-3 py-1.5 rounded-full shadow-sm mb-2 z-10">
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
          <h2 className="text-2xl font-extrabold text-center text-[#0F172A] mb-8">
            Why Start Your Drawing & Sketching Journey With Otterleo?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Fun Challenges & XP</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Complete daily drawing and sketching challenges, earn XP, build daily streaks, and set unique avatars.</p>
            </div>
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">AI Artwork Scan</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Scan physical paper sketches to get instant precision scores, feedback, and improvement tips.</p>
            </div>
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Canvas & Leaderboard</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Practice anytime on the interactive Otterleo canvas and compete with artists on the leaderboard.</p>
            </div>
          </div>
        </section>

        {/* COLLAPSIBLE FAQ SECTION */}
        <section className="my-12 bg-white rounded-3xl p-8 md:p-10 border border-[#E2E8F0] shadow-sm">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-2 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-[#64748B] text-center mb-8 text-sm md:text-base">
            Click on any question to view the answer.
          </p>

          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center cursor-pointer p-5 font-bold text-[#0F172A] text-base select-none">
                  <span className="flex items-center gap-2">
                    <span className="text-[#2563EB]">Q:</span> {faq.q}
                  </span>
                  <ChevronDown className="w-5 h-5 text-[#64748B] transition-transform duration-300 group-open:rotate-180 flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5 pt-1 text-sm text-[#475569] leading-relaxed border-t border-[#E2E8F0] mt-2">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CONTACT US SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-[#E2E8F0] text-center">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Have Questions or Feedback?</h2>
          <p className="text-[#64748B] mb-6">Reach out to the Otterleo team anytime.</p>
          
          <div className="flex justify-center items-center gap-4 text-sm font-medium">
            <a 
              href="mailto:otterleosupport@gmail.com" 
              className="w-full sm:w-auto bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] px-6 py-3 rounded-xl border border-[#CBD5E1] transition-all"
            >
              otterleosupport@gmail.com
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}