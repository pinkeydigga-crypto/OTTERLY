'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Make sure path is correct

const SITE_URL = "https://www.otterleo.in";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
const MASCOT_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO_LANDING_PAGE__1_-removebg-preview.png";

export default function HomePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // AUTO REDIRECT CHECK IF LOGGED IN
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // 1. Supabase Session Check
        const { data: { session } } = await supabase.auth.getSession();
        
        // 2. Fallback check for localStorage flag
        const isLoggedInLocal = localStorage.getItem('isLoggedIn') === 'true';

        if (session || isLoggedInLocal) {
          router.replace('/dashboard');
          return;
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUserSession();

    // Listen to Auth State changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Agar login checking chal rahi ho toh page flick na ho
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // COMPLETE BING AI & GOOGLE STRUCTURED DATA
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#application`,
        "name": "Otterleo",
        "alternateName": "Otterleo AI Drawing Platform",
        "url": SITE_URL,
        "image": LOGO_URL,
        "operatingSystem": "All (Web Browser)",
        "applicationCategory": "EducationalApplication",
        "description": "Otterleo is a free gamified online drawing platform and app that helps beginners learn drawing with instant AI feedback, daily sketch challenges, and XP rewards.",
        "author": {
          "@type": "Person",
          "name": "Harjas Digga"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "150"
        }
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "Otterleo",
        "url": SITE_URL,
        "logo": LOGO_URL,
        "founder": {
          "@type": "Person",
          "name": "Harjas Digga"
        },
        "sameAs": [
          `${SITE_URL}/about`
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "Otterleo - Learn Drawing Online",
        "description": "Free drawing learning fun platform with AI feedback, gamified challenges, and sketch analysis.",
        "publisher": { "@id": `${SITE_URL}/#organization` }
      }
    ]
  };

  return (
    <div 
      style={{
        background: 'radial-gradient(circle at top, #F1F5F9 0%, #F8FAFC 50%, #FFFFFF 100%)',
        minHeight: '100vh',
      }}
      className="relative selection:bg-[#FFD45A] selection:text-[#0F172A] antialiased flex flex-col justify-between text-[#0F172A] overflow-x-hidden"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <style>{`
        @keyframes slideInWithShadow {
          0% {
            opacity: 0;
            transform: translate3d(-60px, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .animate-slide-left-1 {
          animation: slideInWithShadow 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        .animate-slide-left-2 {
          animation: slideInWithShadow 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
          opacity: 0;
          will-change: transform, opacity;
        }
        .animate-slide-left-3 {
          animation: slideInWithShadow 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
          opacity: 0;
          will-change: transform, opacity;
        }

        .otto-bubble-tail {
          position: absolute;
          bottom: -7px;
          right: 12px;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 2px solid transparent;
          border-top: 8px solid #60A5FA;
        }
        .otto-bubble-tail-inner {
          position: absolute;
          bottom: -5px;
          right: 13px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 2px solid transparent;
          border-top: 6px solid #F0F7FF;
        }
      `}</style>

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-2 flex justify-center items-center z-10">
        <div className="relative w-44 h-14 sm:w-48 sm:h-16 flex items-center justify-center">
          <Image
            src={LOGO_URL}
            alt="Otterleo Logo - Learn Drawing Online Platform"
            width={192}
            height={64}
            priority
            className="object-contain max-h-full max-w-full"
          />
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center my-auto z-10 pb-6">

        {/* Left Column */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
          <h1 className="font-sans text-5xl sm:text-7xl font-black text-[#0F172A] leading-[1.08] tracking-tight flex flex-col items-start">
            <span className="inline-block animate-slide-left-1">
              Learn.
            </span>
            <span className="inline-block animate-slide-left-2">
              Practice.
            </span>
            <span className="text-[#2563EB] inline-block animate-slide-left-3">
              Create.
            </span>
          </h1>

          <p className="font-sans text-base sm:text-xl text-[#334155] font-extrabold max-w-lg leading-relaxed">
            Otterleo is a free online drawing platform. Get instant AI feedback, complete gamified practice challenges, earn XP, and improve your art daily.
          </p>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 relative pt-12 w-full max-w-md mx-auto lg:max-w-none">

          {/* Speech Bubble */}
          <div className="absolute -top-3 right-20 sm:right-24 z-30">
            <div className="relative px-3 py-1 sm:px-3.5 sm:py-1 rounded-full text-xs sm:text-sm font-extrabold text-[#0F172A] font-sans bg-[#F0F7FF] border-[1.8px] border-[#60A5FA] shadow-sm">
              Hi, I&apos;m <span className="text-[#2563EB] font-black">Otto</span>
              <div className="otto-bubble-tail"></div>
              <div className="otto-bubble-tail-inner"></div>
            </div>
          </div>

          {/* Mascot Image */}
          <div className="absolute -top-1 right-0 sm:right-1 z-20 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none drop-shadow-md">
            <Image
              src={MASCOT_URL}
              alt="Otto Mascot - Otterleo Drawing Assistant"
              width={112}
              height={112}
              priority
              className="w-full h-full object-contain"
            />
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 border-2 border-slate-200/95 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative z-10 space-y-4 sm:space-y-5 pt-10 sm:pt-12 w-full">
            
            <Link 
              href="/signup" 
              className="font-sans block w-full text-center py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg text-white uppercase tracking-wider transition-transform active:scale-[0.98] bg-[#2563EB] shadow-[0px_6px_0px_#1D4ED8] active:shadow-none"
            >
              GET STARTED
            </Link>

            <Link 
              href="/login" 
              className="font-sans block w-full text-center py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-base uppercase tracking-wider transition-transform active:scale-[0.98] bg-white text-[#2563EB] border-[2.5px] border-[#CBD5E1] shadow-[0px_6px_0px_#94A3B8] active:shadow-none"
            >
              I ALREADY HAVE AN ACCOUNT
            </Link>

            <div className="text-center pt-2 space-y-1.5">
              <p className="text-xs sm:text-sm text-slate-500 font-bold tracking-wide font-sans">
                Join 150+ artists already learning online
              </p>
              <p className="text-[11px] sm:text-xs text-[#475569] font-semibold leading-relaxed">
                By continuing you agree to our{' '}
                <Link href="/terms" className="underline hover:text-[#2563EB]">
                  Terms
                </Link>{' '}
                ,{' '}
                <Link href="/privacy" className="underline hover:text-[#2563EB]">
                  Privacy Policy
                </Link>{' '}
                &{' '}
                <Link href="/cookie-policy" className="underline hover:text-[#2563EB]">
                  Cookie Policy
                </Link>.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 font-medium z-10 mt-auto">
        <div className="flex justify-center items-center gap-4 flex-wrap">
          <Link href="/about" className="hover:text-slate-600 transition-colors">
            About Us
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-slate-600 transition-colors">
            Terms
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">
            Privacy
          </Link>
          <span>•</span>
          <Link href="/cookie-policy" className="hover:text-slate-600 transition-colors">
            Cookie Policy
          </Link>
          <span>•</span>
          <Link 
            href="/blog" 
            className="hover:text-slate-600 transition-colors font-bold text-[#2563EB]"
          >
            Blog
          </Link>
        </div>
      </footer>

    </div>
  );
}