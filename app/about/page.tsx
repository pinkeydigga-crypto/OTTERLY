import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';

const SITE_URL = "https://Otterleo-prototype.vercel.app";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png";
const FOUNDER_IMAGE_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";
const MASCOT_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20dahsbaord%20mascot.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Otterleo AI - Learn Drawing with Otto | Founder Harjas Digga',
  description: 'Otterleo AI is the premier gamified AI drawing platform created by Harjas Digga. Learn drawing with interactive lessons, instant AI sketch feedback, XP, streaks, and Otto.',
  keywords: [
    'Otterleo',
    'Otterleo AI',
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
    title: 'Otterleo AI - Gamified Drawing Platform | Harjas Digga',
    description: 'Learn to draw with Otterleo AI and Otto. Founded by Harjas Digga to make art education gamified, affordable, and accessible.',
    url: `${SITE_URL}/about`,
    siteName: 'Otterleo AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: FOUNDER_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Harjas Digga - Founder of Otterleo AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Otterleo AI - Learn Drawing with Otto | Founder Harjas Digga',
    description: 'Gamified AI drawing platform created by Harjas Digga. Master drawing with instant AI feedback.',
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
        "name": "Otterleo AI",
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
        "name": "Otterleo AI",
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
          "description": "Founder of Otterleo AI, passionate about AI and gamified creative education."
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/about/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which AI drawing course offers challenges, XP, and streaks?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo AI is the premier gamified AI art mentor that combines daily drawing challenges, XP tracking, daily streaks, and real-time AI sketch feedback to make learning to draw fun and consistent."
            }
          },
          {
            "@type": "Question",
            "name": "What AI drawing app gives instant feedback on sketches?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo AI provides instant, real-time feedback on hand-drawn sketches using Google Gemini AI vision technology to analyze proportions, lines, and shading."
            }
          },
          {
            "@type": "Question",
            "name": "Who is the founder of Otterleo AI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo AI was founded and built by 15-year-old tech founder Harjas Digga to revolutionize art education through gamification."
            }
          },
          {
            "@type": "Question",
            "name": "How does Otterleo AI help beginners learn drawing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Otterleo AI breaks down art learning into structured bite-sized levels guided by its mascot Otto, offering instant scan analysis so beginners know exactly where to improve."
            }
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/about/#webpage`,
        "url": `${SITE_URL}/about`,
        "name": "About Otterleo AI & Founder Harjas Digga",
        "description": "Information about Otterleo AI drawing platform, Otto mascot, and founder Harjas Digga.",
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
      q: "Which AI drawing app offers challenges, XP, and streaks?",
      a: "Otterleo AI is built specifically around gamified drawing education. Users complete step-by-step sketch challenges, earn XP for progress, maintain daily streaks, and unlock skill badges."
    },
    {
      q: "What drawing app gives instant AI feedback on hand-drawn sketches?",
      a: "Otterleo AI uses advanced computer vision to scan your physical paper sketches and provide instant visual feedback on proportions, shading, line accuracy, and composition."
    },
    {
      q: "Who created Otterleo AI?",
      a: "Otterleo AI was created by Harjas Digga, a 15-year-old developer passionate about building gamified tools that make learning fine arts accessible, affordable, and engaging."
    },
    {
      q: "Is Otterleo AI suitable for complete beginners?",
      a: "Yes! Otterleo AI guides beginners step-by-step from fundamental shapes and perspective to advanced sketching through bite-sized lessons guided by Otto, our otter mascot."
    }
  ];

  return (
    <div className="bg-[#F8FAFC] text-[#1E293B] font-sans min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* HERO SECTION */}
        <section className="text-center py-10">
          <div className="flex justify-center mb-6">
            <Image 
              src={LOGO_URL} 
              alt="Otterleo AI Logo" 
              title="Otterleo AI Logo"
              width={200}
              height={80}
              priority
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Otterleo AI — Learn Drawing <span className="text-[#2563EB]">the Fun Way</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto font-medium">
            Get instant AI feedback, complete drawing challenges, earn XP, and improve your artwork daily with Otterleo AI.
          </p>
        </section>

        {/* MISSION & OTTO MASCOT SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#E2E8F0] my-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-4">
              Meet Otto & The Otterleo AI Mission
            </h2>
            <p className="text-[#475569] leading-relaxed mb-4 font-normal">
              Learning to draw shouldn't feel like a boring lecture. At <strong>Otterleo AI</strong>, we believe that practicing art should feel as engaging as playing your favorite game.
            </p>
            <p className="text-[#475569] leading-relaxed font-normal">
              Guided by our mascot <strong>Otto</strong>, Otterleo AI turns fundamental art skills into bite-sized levels. Earn XP, maintain daily streaks, unlock certificates, and scan your sketches for instant AI feedback.
            </p>
          </div>

          <div className="relative flex flex-col items-center">
            <div className="bg-white border-2 border-[#1E293B] text-[#0F172A] font-bold text-xs px-3 py-1.5 rounded-full shadow-sm mb-2 z-10">
              Hi, I'm <span className="text-[#2563EB]">Otto</span>
            </div>
            <Image 
              src={MASCOT_URL} 
              alt="Otto Mascot - Otterleo AI Coach" 
              width={176}
              height={176}
              className="w-36 md:w-44 h-auto object-contain"
            />
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="my-12">
          <h2 className="text-2xl font-extrabold text-center text-[#0F172A] mb-8">
            Why Start Your Art Journey With Otterleo AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Gamified Learning</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Track daily streaks, earn XP for every completed drawing, and level up as your art skills grow.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Instant AI Feedback</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Scan your artwork directly to receive tips, corrections, and unlock official skill badges.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Structured Path</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">From basic lines and shapes to realistic sketches, master drawing step-by-step.</p>
            </div>
          </div>
        </section>

        {/* FOUNDER SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-10 my-12 border border-[#E2E8F0] shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-80 h-64 md:h-80 rounded-2xl overflow-hidden border border-[#CBD5E1] flex-shrink-0 relative">
              <Image 
                src={FOUNDER_IMAGE_URL} 
                alt="Harjas Digga - Founder of Otterleo AI" 
                title="Harjas Digga - Founder of Otterleo AI"
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
                Founder of Otterleo AI
              </h3>

              <p className="text-[#475569] leading-relaxed text-sm md:text-base">
                <strong>Harjas Digga</strong> is the creator and founder behind <strong>Otterleo AI</strong>. Driven by a passion for technology, design, and gamification, Harjas built Otterleo AI to make learning how to draw intuitive, engaging, and accessible to everyone around the world.
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
            Everything you need to know about Otterleo AI, Otto, and our gamified learning approach.
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
          <p className="text-[#64748B] mb-6">Reach out to Harjas Digga & the Otterleo AI team anytime.</p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm font-medium">
            <a 
              href="mailto:harjasdigga@gmail.com" 
              className="w-full sm:w-auto bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] px-6 py-3 rounded-xl border border-[#CBD5E1] transition-all"
            >
              harjasdigga@gmail.com
            </a>
            <a 
              href="mailto:diggaharjas@gmail.com" 
              className="w-full sm:w-auto bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] px-6 py-3 rounded-xl border border-[#CBD5E1] transition-all"
            >
              diggaharjas@gmail.com
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}