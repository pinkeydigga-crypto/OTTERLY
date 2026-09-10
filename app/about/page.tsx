import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';

const SITE_URL = "https://otterly-prototype.vercel.app";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otterly%20logo%20(1).png";
const FOUNDER_IMAGE_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";
const MASCOT_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20dahsbaord%20mascot.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Otterly AI - Learn Drawing with Otto | Founder Harjas Digga',
  description: 'Otterly AI is the premier gamified AI drawing platform created by Harjas Digga. Learn drawing with interactive lessons, instant AI sketch feedback, and Otto.',
  keywords: [
    'Otterly',
    'Otterly AI',
    'Otterly Drawing App',
    'Harjas Digga',
    'Harjas Digga Otterly',
    'AI Drawing Coach',
    'Gamified Drawing Lessons',
    'Otto Mascot',
    'Learn Drawing AI'
  ],
  authors: [{ name: 'Harjas Digga' }],
  creator: 'Harjas Digga',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Otterly AI - Gamified Drawing Platform | Harjas Digga',
    description: 'Learn to draw with Otterly AI and Otto. Founded by Harjas Digga to make art education gamified, affordable, and accessible.',
    url: `${SITE_URL}/about`,
    siteName: 'Otterly AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: FOUNDER_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Harjas Digga - Founder of Otterly AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Otterly AI - Learn Drawing with Otto | Founder Harjas Digga',
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
        "name": "Otterly AI",
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
        "name": "Otterly AI",
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
          "description": "Founder of Otterly AI, passionate about AI and gamified creative education."
        }
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/about/#webpage`,
        "url": `${SITE_URL}/about`,
        "name": "About Otterly AI & Founder Harjas Digga",
        "description": "Information about Otterly AI drawing platform, Otto mascot, and founder Harjas Digga.",
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
              alt="Otterly AI Logo" 
              title="Otterly AI Logo"
              width={200}
              height={80}
              priority
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>
          
          {/* OPTIMIZED SEO H1 TAG */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Otterly AI — Learn Drawing <span className="text-[#2563EB]">the Fun Way</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto font-medium">
            Get instant AI feedback, complete drawing challenges, earn XP, and improve your artwork daily with Otterly AI.
          </p>
        </section>

        {/* MISSION & OTTO MASCOT SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#E2E8F0] my-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-4">
              Meet Otto & The Otterly AI Mission
            </h2>
            <p className="text-[#475569] leading-relaxed mb-4 font-normal">
              Learning to draw shouldn't feel like a boring lecture. At <strong>Otterly AI</strong>, we believe that practicing art should feel as engaging as playing your favorite game.
            </p>
            <p className="text-[#475569] leading-relaxed font-normal">
              Guided by our mascot <strong>Otto</strong>, Otterly AI turns fundamental art skills into bite-sized levels. Earn XP, maintain daily streaks, unlock certificates, and scan your sketches for instant AI feedback.
            </p>
          </div>

          <div className="relative flex flex-col items-center">
            {/* Speech Bubble */}
            <div className="bg-white border-2 border-[#1E293B] text-[#0F172A] font-bold text-xs px-3 py-1.5 rounded-full shadow-sm mb-2 z-10">
              Hi, I'm <span className="text-[#2563EB]">Otto</span>
            </div>
            {/* Mascot Image */}
            <Image 
              src={MASCOT_URL} 
              alt="Otto Mascot - Otterly AI Coach" 
              width={176}
              height={176}
              className="w-36 md:w-44 h-auto object-contain"
            />
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="my-12">
          <h2 className="text-2xl font-extrabold text-center text-[#0F172A] mb-8">
            Why Start Your Art Journey With Otterly AI?
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
            
            {/* Large Rectangular Image */}
            <div className="w-full md:w-80 h-64 md:h-80 rounded-2xl overflow-hidden border border-[#CBD5E1] flex-shrink-0 relative">
              <Image 
                src={FOUNDER_IMAGE_URL} 
                alt="Harjas Digga - Founder of Otterly AI" 
                title="Harjas Digga - Founder of Otterly AI"
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
                Founder of Otterly AI
              </h3>

              <p className="text-[#475569] leading-relaxed text-sm md:text-base">
                <strong>Harjas Digga</strong> is the creator and founder behind <strong>Otterly AI</strong>. Driven by a passion for technology, design, and gamification, Harjas built Otterly AI to make learning how to draw intuitive, engaging, and accessible to everyone around the world.
              </p>
            </div>

          </div>
        </section>

        {/* CONTACT US SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-[#E2E8F0] text-center">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Have Questions or Feedback?</h2>
          <p className="text-[#64748B] mb-6">Reach out to Harjas Digga & the Otterly AI team anytime.</p>
          
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