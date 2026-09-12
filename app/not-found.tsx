import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6FAFF] font-sans px-4">
      <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
        <h1 className="text-6xl font-black text-blue-600">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Page Not Found!</h2>
        <p className="text-xs font-semibold text-slate-500">
          Lagta hai aap galat raste par aa gaye hain. Yeh page exist nahi karta.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block w-full bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md hover:bg-blue-700 transition-all"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}