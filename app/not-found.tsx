import Link from 'next/link';

export const dynamic = 'force-static';
export const revalidate = false;

export default function NotFound() {
  const logoUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png';
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO_LANDING_PAGE__1_-removebg-preview.png';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100/80 flex flex-col justify-between relative overflow-hidden selection:bg-[#FFD45A] selection:text-[#0F172A] antialiased">
      
      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 pt-8 pb-4 flex justify-center items-center z-10">
        <Link href="/">
          <img
            src={logoUrl}
            alt="Otterleo Logo"
            className="h-16 sm:h-20 object-contain cursor-pointer"
          />
        </Link>
      </header>

      {/* Main 404 Section */}
      <main className="max-w-md w-full mx-auto px-6 py-8 flex flex-col items-center justify-center my-auto z-10">
        
        {/* Card Container */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-2xl w-full relative space-y-6 pt-12 text-center">
          
          {/* Speech Bubble */}
          <div className="absolute -top-7 right-1/2 translate-x-1/2 z-30">
            <div className="relative bubble-container px-4 py-1.5 rounded-full text-xs font-black text-[#0F172A]">
              Oops! Page not found <span className="text-[#2563EB]">404</span>
              <div className="bubble-tail"></div>
              <div className="bubble-tail-inner"></div>
            </div>
          </div>

          {/* Mascot Image */}
          <div className="w-24 h-24 mx-auto">
            <img
              src={mascotUrl}
              alt="Otto Mascot"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black text-[#0F172A]">Lost in Space?</h1>
            <p className="text-sm font-semibold text-[#334155]">
              The page or drawing canvas you are looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Back Home Button */}
          <Link href="/" className="block w-full">
            <button
              style={{ backgroundColor: '#2563EB', boxShadow: '0px 6px 0px #1D4ED8' }}
              className="w-full py-4 rounded-2xl font-extrabold text-base text-white uppercase tracking-wider cursor-pointer transition-transform active:translate-y-1 active:shadow-none"
            >
              Back to Home
            </button>
          </Link>
        </div>
      </main>

      {/* 3-Layer Waves Background & Footer */}
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