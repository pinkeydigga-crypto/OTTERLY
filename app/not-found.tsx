import Link from 'next/link';

export const dynamic = 'force-static';

export default function NotFound() {
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
        color: '#0F172A'
      }}
      className="relative overflow-hidden antialiased"
    >
      
      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 pt-8 pb-4 flex justify-center items-center z-10">
        <Link href="/">
          <img
            src={logoUrl}
            alt="Otterleo Logo"
            className="h-16 sm:h-20 object-contain cursor-pointer"
            style={{ height: '70px', objectFit: 'contain' }}
          />
        </Link>
      </header>

      {/* Main 404 Card */}
      <main className="max-w-md w-full mx-auto px-6 py-8 flex flex-col items-center justify-center my-auto z-10">
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '1.5rem',
            padding: '2rem',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            position: 'relative',
            paddingTop: '3rem',
            textAlign: 'center'
          }}
        >
          
          {/* Speech Bubble */}
          <div className="absolute -top-7 right-1/2 translate-x-1/2 z-30" style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="bubble-container px-4 py-1.5 rounded-full text-xs font-black text-[#0F172A]" style={{ padding: '6px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: 900 }}>
              Oops! Page not found <span style={{ color: '#2563EB' }}>404</span>
              <div className="bubble-tail"></div>
              <div className="bubble-tail-inner"></div>
            </div>
          </div>

          {/* Mascot Image */}
          <div style={{ width: '96px', height: '96px', margin: '0 auto 16px auto' }}>
            <img
              src={mascotUrl}
              alt="Otto Mascot"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 0' }}>Lost in Space?</h1>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', margin: 0 }}>
              The page or drawing canvas you are looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Back Home Button */}
          <Link href="/" style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
            <button
              style={{
                backgroundColor: '#2563EB',
                boxShadow: '0px 6px 0px #1D4ED8',
                width: '100%',
                paddingTop: '1rem',
                paddingBottom: '1rem',
                borderRadius: '1rem',
                fontWeight: 800,
                fontSize: '1rem',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              Back to Home
            </button>
          </Link>
        </div>
      </main>

      {/* Waves Footer */}
      <div className="relative w-full z-10">
        <div className="w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-24 sm:h-32"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100px' }}
          >
            <path d="M0,15 C200,85 400,90 600,65 C800,40 1000,10 1200,30 L1200,120 L0,120 Z" fill="#BFDBFE" opacity="0.45"></path>
            <path d="M0,35 C180,90 420,95 620,70 C820,45 980,20 1200,40 L1200,120 L0,120 Z" fill="#93C5FD" opacity="0.75"></path>
            <path d="M0,60 C160,95 450,100 650,80 C850,60 1020,35 1200,50 L1200,120 L0,120 Z" fill="#60A5FA"></path>
          </svg>
        </div>

        <footer style={{ backgroundColor: '#2563EB', width: '100%', padding: '20px 32px' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#ffffff' }}>
            <p style={{ margin: 0, color: '#ffffff' }}>© 2026 Otterleo. All rights reserved.</p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link
                href="/about"
                style={{ backgroundColor: '#1D4ED8', color: '#ffffff', padding: '8px 16px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}
              >
                About Us
              </Link>
              <Link
                href="/privacy"
                style={{ backgroundColor: '#1D4ED8', color: '#ffffff', padding: '8px 16px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}
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