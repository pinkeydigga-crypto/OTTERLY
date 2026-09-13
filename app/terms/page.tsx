"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail, Phone, Sparkles } from "lucide-react";

export default function TermsPage() {
  const logoUrl =
    "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/ChatGPT%20Image%20Sep%2011,%202026,%2002_35_53%20PM%20(1).png";

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans tracking-tight text-slate-800 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 backdrop-blur-md bg-white/90">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-extrabold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Back to Home</span>
          </Link>
          <img
            src={logoUrl}
            alt="Otterleo Logo"
            className="h-10 w-auto object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        {/* Banner Title */}
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
            <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A]">
            Terms & Conditions
          </h1>
          <p className="text-xs font-bold text-slate-400">
            Last Updated: September 2026 • Effective for all Otterleo users
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-8 text-sm sm:text-base font-medium leading-relaxed text-slate-600">
          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
              <span className="text-[#2563EB]">1.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or creating an account on **Otterleo** ("Learn to Draw"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please refrain from using our platform and AI evaluation services.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
              <span className="text-[#2563EB]">2.</span> Services Offered & AI Coach "Otto"
            </h2>
            <p>
              Otterleo provides an interactive drawing education platform allowing users to upload artwork for structured evaluation by our AI Coach ("Otto"), participate in art challenges, track XP, and engage with community features.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-3">
            <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
              <span className="text-[#2563EB]">3.</span> Daily Scan Policy & Usage Rules
            </h2>
            <ul className="space-y-2 list-disc pl-5 text-slate-600 font-medium">
              <li>
                <strong className="text-slate-900">24-Hour Scan Limit:</strong> To encourage deliberate physical practice over rapid uploads, users are restricted to <strong>1 artwork scan per 24 hours</strong>.
              </li>
              <li>
                <strong className="text-slate-900">Allowed Content:</strong> You may only upload original hand-drawn sketches, pencil art, digital paintings, or creative illustrations.
              </li>
              <li>
                <strong className="text-slate-900">Prohibited Content:</strong> Photos of real faces, text documents, copyrighted material, offensive, or non-artistic images are strictly forbidden. Accounts violating this policy may be permanently suspended.
              </li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
              <span className="text-[#2563EB]">4.</span> Ownership & Intellectual Property
            </h2>
            <p>
              You retain full ownership and copyrights to all original artwork you upload. Otterleo owns all rights, logos, mascot designs (Otto), trademarks, source code, and user interface designs on the platform.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-2">
            <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
              <span className="text-[#2563EB]">5.</span> Limitation of Liability
            </h2>
            <p>
              AI feedback and art scores provided by Otto are meant solely for educational and practice purposes on an "as-is" basis. Otterleo is not liable for technical glitches or evaluation inaccuracies.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Contact Section */}
          <section className="bg-blue-50/70 border-2 border-blue-100 p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
              <span>Contact Us</span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              If you have any questions, concerns, or support inquiries regarding these Terms and Conditions, feel free to get in touch:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="tel:9991257182"
                className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-blue-200 text-[#2563EB] font-black text-sm shadow-sm hover:bg-blue-600 hover:text-white transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>+91 9991257182</span>
              </a>
              <a
                href="mailto:support@otterleo.com"
                className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-blue-200 text-slate-700 font-black text-sm shadow-sm hover:bg-slate-100 transition-all"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>harjasdigga@gmail.com</span>
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}