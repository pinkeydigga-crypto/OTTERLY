import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const logoUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otterly%20logo%20(1).png';
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO%20LANDING%20PAGE.png';

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col justify-between relative overflow-hidden selection:bg-[#FFD45A] selection:text-[#0F172A]">
      
      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 pt-8 pb-4 flex justify-center items-center z-10">
        <Image
          src={logoUrl}
          alt="Otterly Logo"
          width={192}
          height={80}
          priority
          className="h-16 sm:h-20 w-auto object-contain"
        />
      </header>

      {/* Main Hero Section */}
      <main className="max-w-6xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto z-10 pb-16">
        
        {/* Left Column: Headline */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-6xl sm:text-7xl font-black text-[#0F172A] leading-[1.08] tracking-tight">
            Learn drawing <br />
            <span className="text-[#2563EB]">the fun way.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#0F172A]/75 font-medium max-w-lg leading-relaxed">
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

          {/* Mascot Floating Image */}
          <div className="absolute top-6 right-3 z-20 w-24 h-24 pointer-events-none">
            <Image
              src={mascotUrl}
              alt="Otto Mascot"
              width={96}
              height={96}
              priority
              className="w-full h-full object-contain"
            />
          </div>

          {/* White Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xl relative z-10 space-y-4 pt-12">
            <Link href="/signup" className="block w-full">
              <button 
                style={{ backgroundColor: '#2563EB', boxShadow: '0px 4px 0px #1D4ED8' }}
                className="w-full py-4 rounded-2xl font-black text-base sm:text-lg text-white uppercase tracking-wider cursor-pointer active:translate-y-0.5"
              >
                GET STARTED
              </button>
            </Link>

            <Link href="/login" className="block w-full">
              <button 
                style={{ backgroundColor: '#FFFFFF', color: '#2563EB', border: '2px solid #E2E8F0', boxShadow: '0px 4px 0px #CBD5E1' }}
                className="w-full py-4 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider cursor-pointer active:translate-y-0.5"
              >
                I ALREADY HAVE AN ACCOUNT
              </button>
            </Link>

            <div className="text-center pt-2 space-y-1">
              <p className="text-xs text-[#0D9488] font-bold">
                Free to start · Ready in 10 seconds
              </p>
              <p className="text-[11px] text-[#0F172A]/70">
                By continuing you agree to our Terms & Privacy Policy.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* 4-Layer Waves Background */}
      <div className="relative w-full z-10">
        <div className="w-full overflow-hidden leading-none">
          <svg 
            className="relative block w-full h-24 sm:h-32" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            {/* 1. Top Lightest Transparent Layer */}
            <path 
              d="M0,15 C200,85 400,90 600,65 C800,40 1000,10 1200,30 L1200,120 L0,120 Z" 
              fill="#BFDBFE" 
              opacity="0.45"
            ></path>

            {/* 2. Soft Light Blue Layer */}
            <path 
              d="M0,35 C180,90 420,95 620,70 C820,45 980,20 1200,40 L1200,120 L0,120 Z" 
              fill="#93C5FD"
              opacity="0.75"
            ></path>

            {/* 3. Medium Blue Layer */}
            <path 
              d="M0,60 C160,95 450,100 650,80 C850,60 1020,35 1200,50 L1200,120 L0,120 Z" 
              fill="#60A5FA"
            ></path>

            {/* 4. Bottom Dark Blue Layer */}
            <path 
              d="M0,85 C180,110 480,110 680,95 C880,80 1050,55 1200,70 L1200,120 L0,120 Z" 
              fill="#2563EB"
            ></path>
          </svg>
        </div>

        {/* Dark Blue Footer with Pill Button Links */}
        <footer className="bg-[#2563EB] w-full py-5 px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-white">
            <p className="text-white">© 2026 Otterly. All rights reserved.</p>
            
            {/* Styled Interactive Pill Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                href="/about" 
                className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
              >
                About Us
              </Link>
              <Link 
                href="/otto" 
                className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
              >
                About Otto
              </Link>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}