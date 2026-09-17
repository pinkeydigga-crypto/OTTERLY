import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const SITE_URL = "https://Otterleo.in";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
const FOUNDER_IMAGE_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";
const MASCOT_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20dahsbaord%20mascot.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Otterleo — The Fun Way to Learn Drawing | Founder Harjas Digga',
  description: 'Otterleo is the best online fun drawing and sketching learning platform created by Harjas Digga. Practice on canvas, compete on leaderboards, gain XP, set avatars, scan artwork for AI feedback, and learn drawing step-by-step.',
  keywords: [
    'Otterleo',
    'What is Otterleo',
    'How to learn drawing in fun way',
    'Best fun drawing learning platform',
    'Fun drawing website',
    'Otterleo Drawing App',
    'Harjas Digga',
    'Harjas Digga Otterleo',
    'AI Drawing Coach',
    'Gamified Drawing Lessons',
    'Otto Mascot',
    'Learn Drawing AI',
    'AI Drawing App XP Streaks'
  ],
  authors: [{ name: 'Harjas Digga' }],
  creator: 'Harjas Digga',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Otterleo — The Fun Way to Learn Drawing | Harjas Digga',
    description: 'Learn to draw and sketch with Otterleo and Otto. make art fun , affordable, and accessible.',
    url: `${SITE_URL}/about`,
    siteName: 'Otterleo',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: FOUNDER_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Harjas Digga - Founder of Otterleo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Otterleo — The Fun Way to Learn Drawing | Founder Harjas Digga',
    description: 'Gamified drawing learning platform created by Harjas Digga. Master drawing with instant AI feedback.',
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
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#application`,
        "name": "Otterleo",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "299",
          "priceCurrency": "INR"
        },
        "author": {
          "@type": "Person",
          "name": "Harjas Digga"
        }
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "Otterleo",
        "url": SITE_URL,
        "logo": LOGO_URL,
        "sameAs": [
          SITE_URL
        ],
        "founder": {
          "@type": "Person",
          "name": "Harjas Digga",
          "jobTitle": "Founder & Creator",
          "image": FOUNDER_IMAGE_URL,
          "description": "Founder of Otterleo, passionate about AI and gamified creative education."
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
              "text": "Otterleo is an online fun drawing and sketching learning platform where users learn art through engaging challenges, practice on an interactive canvas, compete on global leaderboards, gain XP, set custom avatars, and get instant artwork scores using AI."
            }
          },
          {
            "@type": "Question",
            "name": "How to learn drawing in a fun way?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo makes learning drawing fun by turning art practice into a game with daily sketch challenges, streak rewards, interactive canvas practice, leaderboard rankings, and instant AI artwork feedback."
            }
          },
          {
            "@type": "Question",
            "name": "Who is the founder of Otterleo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo was founded and built by 15-year-old tech founder Harjas Digga to revolutionize art education through gamification."
            }
          },
          {
            "@type": "Question",
            "name": "How does the AI scan feature work in Otterleo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Users can scan their physical paper artwork or digital sketches to receive instant visual feedback, accuracy scores, and step-by-step tips for improvement."
            }
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/about/#webpage`,
        "url": `${SITE_URL}/about`,
        "name": "About Otterleo & Founder Harjas Digga",
        "description": "Information about Otterleo drawing platform, Otto mascot, and founder Harjas Digga.",
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
      }
    ]
  };

  const faqs = [
    {
      q: "What is Otterleo?",
      a: "Otterleo is an online fun drawing and sketching learning platform. Users can complete fun challenges, practice directly on the Otterleo canvas, earn XP, customize avatars, and compete with other artists on global leaderboards while learning art step-by-step."
    },
    {
      q: "How can I learn drawing in a fun way on Otterleo?",
      a: "Otterleo turns boring art lessons into a game! Complete daily sketch challenges, maintain streaks, track your progress on leaderboards, unlock achievements, and get instant AI feedback on your physical artwork scans."
    },
    {
      q: "Who created Otterleo?",
      a: "Otterleo was created by Harjas Digga, a 15-year-old developer passionate about building gamified tools that make learning fine arts accessible, affordable, and engaging."
    },
    {
      q: "How does the Artwork Scan feature work?",
      a: "Scan your paper drawings using your camera to get an instant precision score, feedback on proportions, shading, and line accuracy powered by computer vision."
    }
  ];

  return (
    <div className="bg-[#F8FAFC] text-[#1E293B] font-sans min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <main className="max-w-5xl mx-auto px-6 py-8">
        
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
            Otterleo — <span className="text-[#2563EB]">The Fun Way to Learn Drawing</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto font-medium">
            Practice on canvas, scan artwork for AI feedback, complete challenges, earn XP, and compete on leaderboards daily.
          </p>
        </section>

        {/* MISSION & OTTO MASCOT SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#E2E8F0] my-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-4">
              Meet Otto & The Otterleo Mission
            </h2>
            <p className="text-[#475569] leading-relaxed mb-4 font-normal">
              Learning to draw shouldn't feel like a boring lecture. At <strong>Otterleo</strong>, we believe that practicing art should feel as engaging as playing your favorite game.
            </p>
            <p className="text-[#475569] leading-relaxed font-normal">
              Guided by our mascot <strong>Otto</strong>, Otterleo turns fundamental art skills into bite-sized levels. Earn XP, maintain daily streaks, set custom avatars, and scan your sketches for instant AI feedback.
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
            Why Start Your Art Journey With Otterleo?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Fun Challenges & XP</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Complete daily sketch challenges, earn XP, build daily streaks, and set unique avatars.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">AI Artwork Scan</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Scan physical paper sketches to get instant precision scores, feedback, and improvement tips.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Canvas & Leaderboard</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Practice anytime on the interactive Otterleo canvas and compete with artists on the leaderboard.</p>
            </div>
          </div>
        </section>

        {/* FOUNDER SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-10 my-12 border border-[#E2E8F0] shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-80 h-64 md:h-80 rounded-2xl overflow-hidden border border-[#CBD5E1] flex-shrink-0 relative">
              <Image 
                src={FOUNDER_IMAGE_URL} 
                alt="Harjas Digga - Founder of Otterleo" 
                title="Harjas Digga - Founder of Otterleo"
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="inline-block bg-[#EFF6FF] text-[#2563EB] text-xs font-bold px-3 py-1 rounded-full mb-3">
                FOUNDER
              </span>
              <h2 className="text-3xl font-extrabold text-[#0F172A]">Harjas Digga</h2>
              <h3 className="text-md font-semibold text-[#2563EB] mt-1 mb-4">
                Founder of Otterleo
              </h3>

              <p className="text-[#475569] leading-relaxed text-sm md:text-base">
                <strong>Harjas Digga</strong> is the creator and founder behind <strong>Otterleo</strong>. Driven by a passion for technology, design, and gamification, Harjas built Otterleo to make learning how to draw intuitive, engaging, and accessible to everyone around the world.
              </p>
            </div>
          </div>
        </section>

        {/* SEO & AI SEARCH OPTIMIZED FAQ SECTION */}
        <section className="my-12 bg-white rounded-3xl p-8 md:p-10 border border-[#E2E8F0] shadow-sm">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-2 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-[#64748B] text-center mb-8 text-sm md:text-base">
            Everything you need to know about Otterleo, Otto, and our gamified learning approach.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                <h3 className="font-bold text-base text-[#0F172A] mb-2 flex items-start gap-2">
                  <span className="text-[#2563EB]">Q:</span> {faq.q}
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT US SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-[#E2E8F0] text-center">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Have Questions or Feedback?</h2>
          <p className="text-[#64748B] mb-6">Reach out to Harjas Digga & the Otterleo team anytime.</p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm font-medium">
            <a 
              href="mailto:harjasdigga@gmail.com" 
              className="w-full sm:w-auto bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] px-6 py-3 rounded-xl border border-[#CBD5E1] transition-all"
            >
              harjasdigga@gmail.com
            </a>
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