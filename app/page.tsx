'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const logoUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png';
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO_LANDING_PAGE__1_-removebg-preview.png';

  // Carousel images with proper encoded URLs
  const sketches = [
    'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/practice-drawing-1789570157001.png',
    'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/practice-drawing-1789567428738.png',
    'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/practice-drawing-1789567954822%20%281%29.png',
    'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/practice-drawing-1789567813703.png',
    'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/practice-drawing-1789568212852.png',
  ];

  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.75;
      
      carouselRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div 
      style={{
        background: 'radial-gradient(circle at top, #F1F5F9 0%, #F8FAFC 50%, #FFFFFF 100%)',
        minHeight: '100vh',
      }}
      className="relative selection:bg-[#FFD45A] selection:text-[#0F172A] antialiased flex flex-col justify-between text-[#0F172A] overflow-x-hidden"
    >
      <style jsx global>{`
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

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-2 flex justify-center items-center z-10">
        <div className="relative w-44 h-14 sm:w-48 sm:h-16 flex items-center justify-center">
          <img
            src={logoUrl}
            alt="Otterleo Logo"
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
              Learn
            </span>
            <span className="inline-block animate-slide-left-2">
              drawing
            </span>
            <span className="text-[#2563EB] inline-block animate-slide-left-3">
              the fun way.
            </span>
          </h1>

          <p className="font-sans text-base sm:text-xl text-[#334155] font-extrabold max-w-lg leading-relaxed">
            Get AI feedback, complete challenges, earn XP, and improve your drawing skills every day.
          </p>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 relative pt-12 w-full max-w-md mx-auto lg:max-w-none">

          {/* Speech Bubble */}
          <div className="absolute -top-3 right-20 sm:right-24 z-30">
            <div className="relative px-3 py-1 sm:px-3.5 sm:py-1 rounded-full text-xs sm:text-sm font-extrabold text-[#0F172A] font-sans bg-[#F0F7FF] border-[1.8px] border-[#60A5FA] shadow-sm">
              Hi, I'm <span className="text-[#2563EB] font-black">Otto</span>
              <div className="otto-bubble-tail"></div>
              <div className="otto-bubble-tail-inner"></div>
            </div>
          </div>

          {/* Mascot Image */}
          <div className="absolute -top-1 right-0 sm:right-1 z-20 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none drop-shadow-md">
            <img
              src={mascotUrl}
              alt="Otto Mascot"
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
                Join 150+ artists already learning
              </p>
              <p className="text-[11px] sm:text-xs text-[#475569] font-semibold leading-relaxed">
                By continuing you agree to our{' '}
                <Link href="/terms" className="underline hover:text-[#2563EB]">
                  Terms
                </Link>{' '}
                &{' '}
                <Link href="/privacy" className="underline hover:text-[#2563EB]">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* NON-MOVING MANUAL SKETCH CAROUSEL SECTION */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-8 z-10">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Some of the most liked sketches this month
          </h2>
        </div>

        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            aria-label="Previous sketch"
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border-2 border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div
            ref={carouselRef}
            className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
          >
            {sketches.map((url, idx) => (
              <div
                key={idx}
                className="flex-none w-[280px] sm:w-[340px] h-[200px] sm:h-[230px] bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden p-3 flex items-center justify-center relative hover:shadow-md transition-shadow"
              >
                <img
                  src={url}
                  alt={`Liked sketch ${idx + 1}`}
                  className="w-full h-full object-contain block"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            aria-label="Next sketch"
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border-2 border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-all active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 font-medium z-10 mt-auto">
        <div className="flex justify-center items-center gap-4">
          <Link href="/about" className="hover:text-slate-600 transition-colors">About Us</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
        </div>
      </footer>

    </div>
  );
}