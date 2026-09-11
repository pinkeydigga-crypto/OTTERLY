import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-bold text-slate-800">404 - Page Not Found</h2>
      <p className="text-slate-600 mt-2">The page you are looking for does not exist on Otterleo.</p>
      <Link href="/" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">
        Back to Home
      </Link>
    </div>
  );
}