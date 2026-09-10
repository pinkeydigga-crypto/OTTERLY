import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const logoUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/otterly%20logo%20(1).png';
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO%20LANDING%20PAGE.png';

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between relative overflow-hidden selection:bg-[#8B5CF6] selection:text-white">
      
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
          <h1 className="text-5xl sm:text-7xl font-black text-[#1E1B18] leading-[1.15] tracking-tight">
            Learn to{' '}
            <span className="inline-block bg-[#8B5CF6] text-white px-4 py-1 rounded-2xl border-4 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] -rotate-1 transform">
              Draw
            </span>{' '}
            <br />
            Anything.
          </h1>
          <p className="text-lg sm:text-xl text-[#1E1B18]/80 font-medium max-w-lg leading-relaxed">
            Get AI feedback, complete challenges, earn XP, and improve your drawing skills every day.
          </p>
        </div>

        {/* Right Column: Card with Mascot & Speech Bubble */}
        <div className="lg:col-span-5 relative pt-14">
          
          {/* Speech Bubble */}
          <div className="absolute top-1 right-24 z-30">
            <div className="relative bubble-container px-4 py-1.5 rounded-full text-xs font-black text-[#1E1B18] bg-white border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]">
              Hi, I'm <span className="text-[#8B5CF6]">Otto</span>
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
          <div className="bg-white rounded-3xl p-8 border-2 border-[#1E1B18] shadow-[6px_6px_0px_#1E1B18] relative z-10 space-y-4 pt-12">
            <Link href="/signup" className="block w-full">
              <button 
                style={{ backgroundColor: '#8B5CF6', boxShadow: '0px 4px 0px #1E1B18', border: '2px solid #1E1B18' }}
                className="w-full py-4 rounded-2xl font-black text-base sm:text-lg text-white uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-transform"
              >
                GET STARTED
              </button>
            </Link>

            <Link href="/login" className="block w-full">
              <button 
                style={{ backgroundColor: '#FFFFFF', color: '#1E1B18', border: '2px solid #1E1B18', boxShadow: '0px 4px 0px #1E1B18' }}
                className="w-full py-4 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-transform"
              >
                I ALREADY HAVE AN ACCOUNT
              </button>
            </Link>

            <div className="text-center pt-2 space-y-1">
              <p className="text-xs text-[#8B5CF6] font-extrabold">
                Free to start · Ready in 10 seconds
              </p>
              <p className="text-[11px] text-[#1E1B18]/60 font-medium">
                By continuing you agree to our Terms & Privacy Policy.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* 4-Layer Purple Waves Background */}
      <div className="relative w-full z-10">
        <div className="w-full overflow-hidden leading-none">
          <svg 
            className="relative block w-full h-24 sm:h-32" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            {/* Layer 1 - Light Purple */}
            <path 
              d="M0,15 C200,85 400,90 600,65 C800,40 1000,10 1200,30 L1200,120 L0,120 Z" 
              fill="#DDD6FE" 
              opacity="0.6"
            ></path>

            {/* Layer 2 - Medium Light Purple */}
            <path 
              d="M0,35 C180,90 420,95 620,70 C820,45 980,20 1200,40 L1200,120 L0,120 Z" 
              fill="#C4B5FD"
              opacity="0.8"
            ></path>

            {/* Layer 3 - Vivid Purple */}
            <path 
              d="M0,60 C160,95 450,100 650,80 C850,60 1020,35 1200,50 L1200,120 L0,120 Z" 
              fill="#A78BFA"
            ></path>

            {/* Layer 4 - Base Purple */}
            <path 
              d="M0,85 C180,110 480,110 680,95 C880,80 1050,55 1200,70 L1200,120 L0,120 Z" 
              fill="#8B5CF6"
            ></path>
          </svg>
        </div>

        {/* Footer */}
        <footer className="bg-[#8B5CF6] w-full py-5 px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-white">
            <p className="text-white">© 2026 Otterly. All rights reserved.</p>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/about" 
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-full border border-white/30 transition-all duration-200 shadow-sm active:scale-95"
              >
                About Us
              </Link>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}