import Link from 'next/link';

export default function NotFound() {
  const logoUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png';
  const mascotUrl = 'https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/OTTO_LANDING_PAGE__1_-removebg-preview.png';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between items-center px-4 py-8 antialiased">
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-center py-4">
        <Link href="/">
          <img src={logoUrl} alt="Otterleo Logo" className="h-16 object-contain cursor-pointer" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center text-center my-auto max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="w-28 h-28 mx-auto">
          <img src={mascotUrl} alt="Otto Mascot 404" className="w-full h-full object-contain" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-[#0F172A]">404</h1>
          <h2 className="text-xl font-bold text-[#2563EB]">Page Not Found</h2>
          <p className="text-sm font-semibold text-slate-600">
            The canvas you are looking for does not exist or has been moved.
          </p>
        </div>

        <Link href="/" className="w-full block">
          <button className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold rounded-2xl uppercase tracking-wider text-sm transition-all active:scale-95">
            Back to Homepage
          </button>
        </Link>
      </main>

      {/* Footer */}
      <footer className="text-xs text-slate-500 font-medium py-4">
        © 2026 Otterleo. All rights reserved.
      </footer>
    </div>
  );
}