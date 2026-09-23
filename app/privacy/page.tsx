import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Database,
  UserCheck,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
  Cpu,
  Share2,
  Cookie,
  UserX,
} from "lucide-react";

const SITE_URL = "https://www.otterleo.in";
const LOGO_URL = "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Privacy Policy",
  description:
    "Read the official Otterleo Privacy Policy. Learn how we protect, process, and secure your personal data, artwork, and account information.",
  keywords: [
    "Otterleo Privacy Policy",
    "Otterleo Data Security",
    "Otterleo Terms and Privacy",
    "Drawing App Privacy Policy",
    "AI Drawing Data Protection",
  ],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy — Otterleo",
    description:
      "Learn how Otterleo protects your personal information, drawings, and account privacy.",
    url: `${SITE_URL}/privacy`,
    siteName: "Otterleo",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: LOGO_URL,
        width: 1200,
        height: 630,
        alt: "Otterleo Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — Otterleo",
    description: "Your privacy & security first. Official Privacy Policy of Otterleo.",
    images: [LOGO_URL],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = "force-static";

export default function PrivacyPolicyPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/privacy/#webpage`,
        "url": `${SITE_URL}/privacy`,
        "name": "Privacy Policy — Otterleo",
        "description": "Official Privacy Policy and Data Security documentation for Otterleo.",
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          "name": "Otterleo",
          "url": SITE_URL
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": SITE_URL
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Privacy Policy",
              "item": `${SITE_URL}/privacy`
            }
          ]
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF] text-[#0F172A] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-black text-slate-600 hover:text-blue-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* SECURED BADGE */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-emerald-700 font-extrabold text-xs shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted & Secured</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Title Banner */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-black text-xs uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Official Privacy Policy
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
            Your Privacy & Security First
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-500 max-w-2xl mx-auto leading-relaxed">
            We prioritize the privacy and security of your personal data. Read below to learn how we collect, process, share, and safeguard your information on Otterleo.
          </p>
          <p className="text-xs font-bold text-slate-400">
            Last Updated: September 2026 • Version 2.5 (Fully Compliant)
          </p>
        </div>

        {/* Sections List */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <ShieldCheck className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                1. Security & Infrastructure Overview
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              Your trust is our top priority. Otterleo is built on industry-standard security infrastructure, utilizing HTTPS/TLS encryption for data in transit and Row-Level Security (RLS) for data at rest. We do not sell, monetize, or trade your personal information.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-black text-emerald-900 uppercase">DPA & Encryption</h3>
                  <p className="text-xs font-bold text-emerald-700">GDPR Compliant Data Processing Agreements</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-black text-blue-900 uppercase">Zero Data Monetization</h3>
                  <p className="text-xs font-bold text-blue-700">We never sell your data to third parties</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Database className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                2. Information We Collect
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              To deliver an interactive AI experience, we collect information across the following categories:
            </p>
            <ul className="space-y-3 text-xs sm:text-sm font-bold text-slate-600">
              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  <strong className="text-[#0F172A]">Account & Credentials:</strong> Full Name, Username, and Email Address for authentication and account management.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  <strong className="text-[#0F172A]">User-Generated Content:</strong> Canvas drawings, sketches, and profile avatars uploaded or submitted to the app.
                </span>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  <strong className="text-[#0F172A]">Derivative & Device Logs:</strong> IP addresses, browser types, device information, and activity logs captured via infrastructure providers.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3: Third Parties */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Share2 className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                3. Third-Party Service Providers
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              We do not share data with ad networks, affiliate programs, or business partners. We only disclose information to reliable service providers required to operate Otterleo:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-bold text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                • <strong>Cloud & Hosting:</strong> Vercel Inc.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                • <strong>Database & Auth:</strong> Supabase Inc.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                • <strong>AI Processing Platforms:</strong> Evaluation API Providers
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                • <strong>Analytics & Performance:</strong> Vercel Analytics
              </div>
            </div>
          </section>

          {/* Section 4: AI & Opt-Out */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Cpu className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                4. AI Processing & Opt-Out Options
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              Our core feature uses AI platforms to evaluate drawings and offer feedback. If you wish to opt out of AI-based personal information processing, you can:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm font-bold text-slate-600 space-y-2">
              <li>Manage your data preferences directly inside your <strong>Account Settings</strong>.</li>
              <li>Submit an opt-out request by emailing us at <strong className="text-blue-600">otterleosupport@gmail.com</strong>.</li>
            </ul>
          </section>

          {/* Section 5: Cookies */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Cookie className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                5. Tracking Technologies & Cookies
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              Otterleo uses standard essential cookies and local storage to keep you logged in securely (via Supabase Auth) and analyze minimal app traffic (via Vercel Analytics). You can disable cookies through your browser settings, though some authentication features may not function properly.
            </p>
          </section>

          {/* Section 6: User Rights */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <UserCheck className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                6. Data Rights & Retention
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              We retain your personal data for as long as your user account remains active. All users worldwide have the right to access, inspect, edit, or delete their personal information at any time.
            </p>
          </section>

          {/* Section 7: Account Deletion */}
          <section className="bg-red-50/60 rounded-[2.5rem] p-6 sm:p-8 border-2 border-red-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-red-950">
                7. Permanent Account & Data Deletion
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-red-900 leading-relaxed">
              You can initiate a complete wipe of your personal record. Go to <strong>"Danger Zone"</strong> in your Profile Settings and click <strong>"DELETE MY ACCOUNT"</strong> to immediately remove all auth records, drawings, XP history, and active sessions.
            </p>
          </section>

          {/* Section 8: DPO & Governance */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <UserX className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                8. Governance & Data Officer Notice
              </h2>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              Otterleo does not maintain a formally appointed Data Protection Officer (DPO). All privacy requests, access inquiries, and legal concerns are managed directly by our technical support team.
            </p>
          </section>

          {/* Section 9: Contact */}
          <section className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Mail className="w-7 h-7" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                9. Contact Us
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-slate-400 uppercase">Support Email</p>
                  <a href="mailto:otterleosupport@gmail.com" className="text-xs sm:text-sm font-black text-blue-600 truncate block hover:underline">
                    otterleosupport@gmail.com
                  </a>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">Contact Number</p>
                  <a href="tel:9991257182" className="text-xs sm:text-sm font-black text-slate-800 hover:text-blue-600">
                    +91 9991257182
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs font-bold text-slate-400">
        <p>© 2026 Otterleo App. All Rights Reserved. Fully Secured.</p>
      </footer>
    </div>
  );
}