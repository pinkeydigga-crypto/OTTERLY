import { NextResponse } from 'next/server';

export async function GET() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.otterleo.in/#organization",
        "name": "Otterleo AI",
        "url": "https://www.otterleo.in",
        "logo": "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/output-onlinepngtools%20(6).png",
        "sameAs": [
          "https://www.otterleo.in"
        ],
        "founder": {
          "@type": "Person",
          "name": "Harjas Digga",
          "jobTitle": "Founder & Creator",
          "image": "https://otsiwrtnkzhrztlpcdjx.supabase.co/storage/v1/object/public/DRAW/harjas.jpg"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://www.otterleo.in/#application",
        "name": "Otterleo AI",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        }
      }
    ]
  };

  return NextResponse.json(schemaData);
}