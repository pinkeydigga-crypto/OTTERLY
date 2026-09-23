import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | Otterleo',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-static';

export default function NotFound() {
  const logoUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png';
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
    >
      {/* Header */}
      <header style={{ maxWidth: '80rem', width: '100%', margin: '0 auto', padding: '32px 24px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Link href="/">
          <Image
            src={logoUrl}
            alt="Otterleo Logo"
            width={180}
            height={70}
            style={{ objectFit: 'contain', cursor: 'pointer' }}
            priority
          />
        </Link>
      </header>

      {/* Main 404 Card */}
      <main style={{ maxWidth: '28rem', width: '100%', margin: 'auto', padding: '32px 24px' }}>
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '1.5rem',
            padding: '2rem',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            width: '100%',
            position: 'relative',
            paddingTop: '3rem',
            textAlign: 'center'
          }}
        >
          {/* Mascot Image */}
          <div style={{ width: '96px', height: '96px', margin: '0 auto 16px auto', position: 'relative' }}>
            <Image
              src={mascotUrl}
              alt="Otto Mascot"
              width={96}
              height={96}
              style={{ objectFit: 'contain' }}
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
                padding: '16px 0',
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

      {/* Footer */}
      <footer style={{ backgroundColor: '#2563EB', width: '100%', padding: '20px 32px' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#ffffff' }}>
          <p style={{ margin: 0, color: '#ffffff' }}>© 2026 Otterleo. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/about" style={{ backgroundColor: '#1D4ED8', color: '#ffffff', padding: '8px 16px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}>About Us</Link>
            <Link href="/terms" style={{ backgroundColor: '#1D4ED8', color: '#ffffff', padding: '8px 16px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}>Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}