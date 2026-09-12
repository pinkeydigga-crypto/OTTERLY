import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full space-y-6">
        <h1 className="text-7xl font-black text-[#2563EB]">404</h1>
        <h2 className="text-2xl font-bold text-[#0F172A]">Page Not Found</h2>
        <p className="text-slate-600 font-medium text-sm">
          Oops! The drawing canvas or page you are looking for does not exist.
        </p>
        <Link href="/" className="block w-full">
          <button className="w-full py-3.5 bg-[#2563EB] text-white font-extrabold rounded-2xl shadow-md hover:bg-blue-700 transition-colors uppercase tracking-wider text-sm">
            Back to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
}