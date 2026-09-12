import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  const logoUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png';
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO_LANDING_PAGE__1_-removebg-preview.png';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100/80 flex flex-col justify-between relative overflow-hidden selection:bg-[#FFD45A] selection:text-[#0F172A] antialiased">
      
      {/* Custom Styles for Speech Bubble */}
      <style>{`
        .bubble-container {
          background-color: #FFFFFF;
          border: 2px solid #E2E8F0;
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
        }

        .bubble-tail, .bubble-tail-inner {
          position: absolute;
          width: 0;
          height: 0;
          border: 6px solid transparent;
        }

        .bubble-tail {
          bottom: -13px;
          right: 20px;
          border-top-color: #E2E8F0;
        }

        .bubble-tail-inner {
          bottom: -10px;
          right: 20px;
          border-top-color: #FFFFFF;
        }
      `}</style>

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 pt-8 pb-4 flex justify-center items-center z-10">
        <Link href="/">
          <Image
            src={logoUrl}
            alt="Otterleo Logo"
            width={192}
            height={80}
            priority
            style={{ width: 'auto' }}
            className="h-16 sm:h-20 object-contain cursor-pointer"
          />
        </Link>
      </header>

      {/* Main 404 Hero Content */}
      <main className="max-w-4xl w-full mx-auto px-6 py-8 flex flex-col items-center justify-center text-center my-auto z-10 pb-16">
        
        {/* Mascot with Speech Bubble */}
        <div className="relative mb-6">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap">
            <div className="relative bubble-container px-4 py-1.5 rounded-full text-xs font-black text-[#0F172A]">
              Oops! Page got lost drawing... <span className="text-[#2563EB]">404</span>
              <div className="bubble-tail"></div>
              <div className="bubble-tail-inner"></div>
            </div>
          </div>

          <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto">
            <Image
              src={mascotUrl}
              alt="Otto Mascot 404"
              width={160}
              height={160}
              priority
              style={{ height: 'auto' }}
              className="w-full object-contain"
            />
          </div>
        </div>

        {/* Big 404 Text & Heading */}
        <h1 className="text-7xl sm:text-8xl font-black text-[#0F172A] tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2563EB] mb-4">
          Page Not Found
        </h2>
        
        <p className="text-base sm:text-lg text-[#334155] font-semibold max-w-md leading-relaxed mb-8">
          The canvas you are looking for doesn't exist or has been moved to another page.
        </p>

        {/* Action Button */}
        <Link href="/">
          <button 
            style={{ backgroundColor: '#2563EB', boxShadow: '0px 6px 0px #1D4ED8' }}
            className="px-8 py-4 rounded-2xl font-extrabold text-base sm:text-lg text-white uppercase tracking-wider cursor-pointer transition-transform active:translate-y-1 active:shadow-none"
          >
            BACK TO HOMEPAGE
          </button>
        </Link>

      </main>

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
            <p>© 2026 Otterleo. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <Link 
                href="/about" 
                className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
              >
                About Us
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