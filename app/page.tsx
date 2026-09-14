import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const logoUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png';
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO_LANDING_PAGE__1_-removebg-preview.png';

  return (
    <div 
      style={{
        background: 'linear-gradient(to bottom, #ffffff, #f8fafc, rgba(241, 245, 249, 0.8))',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#0F172A',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
      className="relative overflow-hidden selection:bg-[#FFD45A] selection:text-[#0F172A] antialiased min-h-screen flex flex-col justify-between"
    >

      {/* High-Performance Text Animations */}
      <style>{`
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

        {/* Left Column: Headline & Subheading Animations */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-6xl sm:text-7xl font-black text-[#0F172A] leading-[1.08] tracking-tight flex flex-col items-start font-sans">
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

          {/* Animated Subheading */}
          <p className="animate-subheading text-lg sm:text-xl text-[#334155] font-semibold max-w-lg leading-relaxed">
            Get AI feedback, complete challenges, earn XP, and improve your drawing skills every day.
          </p>
        </div>

        {/* Right Column: Card with Mascot & Speech Bubble */}
        <div className="lg:col-span-5 relative pt-14">

          {/* Speech Bubble */}
          <div className="absolute top-1 right-24 z-30">
            <div className="relative bubble-container px-4 py-1.5 rounded-full text-xs font-black text-[#0F172A]">
              Hi, I'm <span className="text-[#2563EB]">Otto</span>
              <div className="bubble-tail"></div>
              <div className="bubble-tail-inner"></div>
            </div>
          </div>

          {/* Mascot Image (Static) */}
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
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-2xl relative z-10 space-y-5 pt-12">
            <Link href="/signup" className="block w-full">
              <button
                style={{ backgroundColor: '#2563EB', boxShadow: '0px 6px 0px #1D4ED8' }}
                className="w-full py-4 rounded-2xl font-extrabold text-base sm:text-lg text-white uppercase tracking-wider cursor-pointer transition-transform active:translate-y-1 active:shadow-none"
              >
                GET STARTED
              </button>
            </Link>

            <Link href="/login" className="block w-full">
              <button
                style={{ backgroundColor: '#FFFFFF', color: '#2563EB', border: '2.5px solid #CBD5E1', boxShadow: '0px 6px 0px #94A3B8' }}
                className="w-full py-4 rounded-2xl font-extrabold text-base sm:text-lg uppercase tracking-wider cursor-pointer transition-transform active:translate-y-1 active:shadow-none"
              >
                I ALREADY HAVE AN ACCOUNT
              </button>
            </Link>

            <div className="text-center pt-2 space-y-1">
              <p className="text-xs text-[#0D9488] font-extrabold tracking-wide">
                Free to start · Ready in 10 seconds
              </p>
              <p className="text-[11px] text-[#475569] font-semibold">
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

      {/* AI SEO Content Section - Boosts Citation Likelihood & Signal-to-Noise Ratio */}
      <section className="max-w-5xl mx-auto px-6 py-6 border-t border-slate-200/60 my-4 z-10">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] text-center mb-6">
          How Otterleo AI Helps You Master Drawing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/80 p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xl font-black text-[#2563EB] mb-1">1. Choose Prompt</div>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Pick a bite-sized daily sketching challenge guided by Otto, your AI mentor.
            </p>
          </div>
          <div className="bg-white/80 p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xl font-black text-[#2563EB] mb-1">2. Scan Sketch</div>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Upload or scan a photo of your paper sketch directly on the web app.
            </p>
          </div>
          <div className="bg-white/80 p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xl font-black text-[#2563EB] mb-1">3. Get AI Critique</div>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Receive real-time feedback on proportions, lines, and earn XP to build streaks.
            </p>
          </div>
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
        <footer className="bg-[#2563EB] w-full py-5 px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-white">
            <p className="text-white">© 2026 Otterleo. All rights reserved.</p>

            <div className="flex items-center gap-3">
              <Link
                href="/about"
                className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
              >
                About Us
              </Link>
              <Link
                href="/terms"
                className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy"
                className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
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