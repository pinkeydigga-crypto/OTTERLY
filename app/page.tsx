import Link from 'next/link';
import Image from 'next/image';
import { Scan, Pencil, GraduationCap, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const logoUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png';
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO_LANDING_PAGE__1_-removebg-preview.png';

  const features = [
    {
      num: '1',
      badgeBg: 'bg-[#2563EB]',
      iconBg: 'bg-blue-100 text-[#2563EB]',
      cardBorder: 'border-blue-100',
      icon: Scan,
      title: 'Scan & Feedback',
      description: 'Scan your paper sketches and get instant AI feedback on proportions, line work, and shading.',
    },
    {
      num: '2',
      badgeBg: 'bg-[#FFB800]',
      iconBg: 'bg-amber-100 text-[#D97706]',
      cardBorder: 'border-amber-100',
      icon: Pencil,
      title: 'Challenges & Canvas',
      description: 'Complete daily challenges and build your drawing skills directly on the Otterleo Canvas.',
    },
    {
      num: '3',
      badgeBg: 'bg-[#3B82F6]',
      iconBg: 'bg-sky-100 text-[#0284C7]',
      cardBorder: 'border-sky-100',
      icon: GraduationCap,
      title: 'Learning Path',
      description: 'Follow engaging step-by-step courses, earn XP, and unlock certificates upon completion.',
    },
  ];

  return (
    <div 
      style={{
        background: 'linear-gradient(to bottom, #ffffff, #f8fafc, rgba(241, 245, 249, 0.8))',
        minHeight: '100vh',
      }}
      className="relative overflow-hidden selection:bg-[#FFD45A] selection:text-[#0F172A] antialiased min-h-screen flex flex-col justify-between text-[#0F172A]"
    >

      {/* Font & Animations Style */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900;1000&display=swap');

        .font-rounded {
          font-family: 'Nunito', system-ui, -apple-system, sans-serif !important;
        }

        /* Text Slide In Animation */
        @keyframes slideInStrongShadow {
          0% {
            opacity: 0;
            transform: translate3d(-120px, 0, 0);
            filter: drop-shadow(-35px 0px 20px rgba(37, 99, 235, 0.65));
          }
          60% {
            filter: drop-shadow(-15px 0px 10px rgba(37, 99, 235, 0.35));
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: drop-shadow(0px 0px 0px transparent);
          }
        }

        /* Subheading Soft Fade Up */
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .animate-line {
          opacity: 0;
          will-change: transform, opacity, filter;
          animation: slideInStrongShadow 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-subheading {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 1s forwards;
        }

        .delay-1 { animation-delay: 0s; }
        .delay-2 { animation-delay: 0.35s; }
        .delay-3 { animation-delay: 0.7s; }
      `}</style>

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 pt-8 pb-4 flex justify-center items-center z-10">
        <Image
          src={logoUrl}
          alt="Otterleo Logo"
          width={192}
          height={80}
          priority
          style={{ width: 'auto' }}
          className="h-16 sm:h-20 object-contain"
        />
      </header>

      {/* Main Hero Section */}
      <main className="max-w-6xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto z-10 pb-12">

        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="font-rounded text-6xl sm:text-7xl font-black text-[#0F172A] leading-[1.05] tracking-tight flex flex-col items-start">
            <span className="animate-line delay-1 inline-block">
              Learn
            </span>
            <span className="animate-line delay-2 inline-block">
              drawing
            </span>
            <span className="animate-line delay-3 text-[#2563EB] inline-block">
              the fun way.
            </span>
          </h1>

          <p className="animate-subheading font-rounded text-lg sm:text-xl text-[#334155] font-extrabold max-w-lg leading-relaxed">
            Get AI feedback, complete challenges, earn XP, and improve your drawing skills every day.
          </p>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 relative pt-14">

          {/* Speech Bubble */}
          <div className="absolute top-1 right-24 z-30">
            <div className="relative bubble-container px-4 py-1.5 rounded-full text-xs font-black text-[#0F172A] font-rounded">
              Hi, I'm <span className="text-[#2563EB]">Otto</span>
              <div className="bubble-tail"></div>
              <div className="bubble-tail-inner"></div>
            </div>
          </div>

          {/* Mascot Image */}
          <div className="absolute top-6 right-3 z-20 w-24 h-24 pointer-events-none">
            <Image
              src={mascotUrl}
              alt="Otto Mascot - Otterleo AI Drawing Coach"
              width={96}
              height={96}
              priority
              style={{ height: 'auto' }}
              className="w-full object-contain"
            />
          </div>

          {/* White Card */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200/90 shadow-2xl relative z-10 space-y-5 pt-12">
            <Link href="/signup" className="block w-full">
              <button
                style={{ backgroundColor: '#2563EB', boxShadow: '0px 6px 0px #1D4ED8' }}
                className="font-rounded w-full py-4 rounded-2xl font-black text-base sm:text-lg text-white uppercase tracking-wider cursor-pointer transition-transform active:translate-y-1 active:shadow-none"
              >
                GET STARTED
              </button>
            </Link>

            <Link href="/login" className="block w-full">
              <button
                style={{ backgroundColor: '#FFFFFF', color: '#2563EB', border: '2.5px solid #CBD5E1', boxShadow: '0px 6px 0px #94A3B8' }}
                className="font-rounded w-full py-4 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider cursor-pointer transition-transform active:translate-y-1 active:shadow-none"
              >
                I ALREADY HAVE AN ACCOUNT
              </button>
            </Link>

            <div className="text-center pt-2 space-y-1">
              <p className="text-xs text-[#0D9488] font-black tracking-wide font-rounded">
                Free to start · Ready in 10 seconds
              </p>
              <p className="text-[11px] text-[#475569] font-bold">
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

      {/* DRAWING COACH IN YOUR POCKET - OTTERLEO GAMIFIED AESTHETIC SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-12 my-4 z-10 text-center space-y-10">
        <div className="space-y-2">
          <h2 className="font-rounded text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight uppercase">
            DRAWING COACH IN YOUR POCKET
          </h2>
          <p className="font-rounded text-slate-500 font-bold text-sm sm:text-base">
            Master drawing with smart AI feedback, practice canvas, and structured learning paths.
          </p>
        </div>

        {/* 3 Gamified Otterleo Style Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {features.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-[32px] p-6 border-2 ${item.cardBorder} shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden`}
              >
                {/* Header: Circle Icon + Badge Number */}
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-full ${item.iconBg} flex items-center justify-center font-black shadow-inner`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <span className={`w-7 h-7 rounded-full ${item.badgeBg} text-white font-rounded font-black text-xs flex items-center justify-center shadow-sm`}>
                    {item.num}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-rounded text-xl font-black text-[#0F172A]">
                    {item.title}
                  </h3>
                  <p className="font-rounded text-[#64748B] font-bold text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Arrow */}
                <div className="pt-1">
                  <ArrowRight className="w-5 h-5 text-[#2563EB] font-bold" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3-Layer Waves Background */}
      <div className="relative w-full z-10">
        <div className="w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-24 sm:h-32"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M0,15 C200,85 400,90 600,65 C800,40 1000,10 1200,30 L1200,120 L0,120 Z" fill="#BFDBFE" opacity="0.45"></path>
            <path d="M0,35 C180,90 420,95 620,70 C820,45 980,20 1200,40 L1200,120 L0,120 Z" fill="#93C5FD" opacity="0.75"></path>
            <path d="M0,60 C160,95 450,100 650,80 C850,60 1020,35 1200,50 L1200,120 L0,120 Z" fill="#60A5FA"></path>
          </svg>
        </div>

        {/* Dark Blue Footer */}
        <footer className="bg-[#2563EB] w-full py-5 px-8 font-rounded">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-white">
            <p className="text-white">© 2026 Otterleo. All rights reserved.</p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/about"
                className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
              >
                About Us
              </Link>
              <Link
                href="/terms"
                className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy"
                className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}