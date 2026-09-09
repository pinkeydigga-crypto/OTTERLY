import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Otterly - Learn Drawing with Otto | Founder Harjas Digga',
  description: 'Discover Otterly, the gamified platform to learn drawing with Otto! Founded by 15-year-old Harjas Digga, Otterly offers interactive lessons, AI scanning, and fun challenges.',
  keywords: ['Learn Drawing', 'Otterly', 'Harjas Digga', 'Otto', 'Otterly Logo', 'Gamified Drawing Lessons'],
};

export default function AboutPage() {
  const logoUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otterly%20logo%20(1).png";
  const founderImageUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";
  const mascotUrl = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otto%20dahsbaord%20mascot.png";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Otterly",
    "url": "https://your-domain.com",
    "logo": logoUrl,
    "founder": {
      "@type": "Person",
      "name": "Harjas Digga",
      "jobTitle": "Founder",
      "image": founderImageUrl
    }
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
            <img 
              src={logoUrl} 
              alt="Otterly Logo" 
              title="Otterly Logo"
              className="h-16 md:h-20 object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Learn drawing <span className="text-[#2563EB]">the fun way.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto font-medium">
            Get AI feedback, complete challenges, earn XP, and improve your drawing skills every day.
          </p>
        </section>

        {/* MISSION & OTTO MASCOT SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#E2E8F0] my-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-4">
              Meet Otto & Our Mission
            </h2>
            <p className="text-[#475569] leading-relaxed mb-4 font-normal">
              Learning to draw shouldn't feel like a boring lecture. At <strong>Otterly</strong>, we believe that practicing art should feel like playing your favorite video game.
            </p>
            <p className="text-[#475569] leading-relaxed font-normal">
              Guided by our mascot <strong>Otto</strong>, Otterly turns complex art fundamentals into bite-sized levels. Earn XP, maintain daily streaks, unlock certificates, and get feedback on your sketches with our AI scanner.
            </p>
          </div>

          <div className="relative flex flex-col items-center">
            {/* Speech Bubble */}
            <div className="bg-white border-2 border-[#1E293B] text-[#0F172A] font-bold text-xs px-3 py-1.5 rounded-full shadow-sm mb-2 z-10">
              Hi, I'm <span className="text-[#2563EB]">Otto</span>
            </div>
            {/* Mascot Image */}
            <img 
              src={mascotUrl} 
              alt="Otto Mascot" 
              className="w-36 md:w-44 object-contain"
            />
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="my-12">
          <h2 className="text-2xl font-extrabold text-center text-[#0F172A] mb-8">
            Why Start Your Art Journey With Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Gamified Learning</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Track daily streaks, earn XP for every completed drawing, and level up as you improve.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Instant Feedback</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">Scan your artwork to receive instant tips and unlock official skills badges.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
              <h3 className="font-bold text-lg text-[#0F172A] mb-2">Structured Path</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">From basic shapes to advanced hyper-realism, master drawing step-by-step.</p>
            </div>
          </div>
        </section>

        {/* FOUNDER SECTION (LARGE RECTANGULAR CARD) */}
        <section className="bg-white rounded-3xl p-8 md:p-10 my-12 border border-[#E2E8F0] shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Large Rectangular Image */}
            <div className="w-full md:w-80 h-64 md:h-80 rounded-2xl overflow-hidden border border-[#CBD5E1] flex-shrink-0">
              <img 
                src={founderImageUrl} 
                alt="Harjas Digga Founder of Otterly" 
                title="Harjas Digga - Founder of Otterly"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="inline-block bg-[#EFF6FF] text-[#2563EB] text-xs font-bold px-3 py-1 rounded-full mb-3">
                FOUNDER
              </span>
              <h2 className="text-3xl font-extrabold text-[#0F172A]">Harjas Digga</h2>
              <h3 className="text-md font-semibold text-[#2563EB] mt-1 mb-4">
                15-Year-Old Founder of Otterly
              </h3>

              <p className="text-[#475569] leading-relaxed text-sm md:text-base">
                <strong>Harjas Digga</strong> is the 15-year-old visionary founder behind <strong>Otterly</strong>. Passionate about technology and creativity, Harjas created Otterly to make learning drawing affordable, engaging, and accessible to everyone through AI and gamification.
              </p>
            </div>

          </div>
        </section>

        {/* CONTACT US SECTION */}
        <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-[#E2E8F0] text-center">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Have Questions or Ideas?</h2>
          <p className="text-[#64748B] mb-6">We'd love to hear from you! Reach out to Otto & team anytime.</p>
          
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