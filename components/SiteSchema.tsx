import React from "react";

const SITE_URL = "https://www.otterleo.in";
const FAVICON_PATH = "/favicon.png";
const LOGO_URL =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/LOGO.png";
const FOUNDER_IMAGE_URL =
  "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg";
const INSTAGRAM_URL = "https://www.instagram.com/harjas_gallery";

export default function SiteSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Otterleo",
        alternateName: "Otterleo AI",
        description:
          "Learn to draw in a fun way with AI feedback, gamified daily challenges, XP, and leaderboards.",
        inLanguage: "en",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Otterleo AI",
        alternateName: "Otterleo",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: LOGO_URL || `${SITE_URL}${FAVICON_PATH}`,
        },
        image: `${SITE_URL}${FAVICON_PATH}`,
        founder: {
          "@type": "Person",
          name: "Harjass Digga",
          alternateName: "Harjas Digga",
          image: FOUNDER_IMAGE_URL,
        },
        sameAs: [INSTAGRAM_URL],
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#webapp`,
        name: "Otterleo",
        url: SITE_URL,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        creator: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}