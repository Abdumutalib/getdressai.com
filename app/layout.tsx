import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { cookies } from "next/headers";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "@/app/globals.css";
import { absoluteUrl } from "@/lib/utils";
import { supportedLanguages, type SupportedLanguage } from "@/lib/translations";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "GetDressAI | Try Any Outfit on Your Photo in Seconds",
    template: "%s | GetDressAI"
  },
  description:
    "GetDressAI is a premium AI outfit changer and virtual try-on platform for realistic transformations, viral sharing, and conversion-first growth.",
  keywords: [
    "AI outfit changer",
    "virtual try on AI",
    "dress AI",
    "AI clothes changer",
    "change clothes in photo AI"
  ],
  openGraph: {
    title: "GetDressAI | Try Any Outfit on Your Photo in Seconds",
    description:
      "Upload your photo, choose any style, and get realistic AI transformations instantly.",
    url: absoluteUrl("/"),
    siteName: "GetDressAI",
    images: [
      {
        url: absoluteUrl("/hero-demo.webp"),
        width: 1200,
        height: 630,
        alt: "GetDressAI hero demo"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "GetDressAI",
    description: "Try Any Outfit on Your Photo in Seconds",
    images: [absoluteUrl("/hero-demo.webp")]
  },
  alternates: {
    canonical: absoluteUrl("/")
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GetDressAI",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "19",
    priceCurrency: "USD"
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "281"
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get("getdressai-language")?.value as SupportedLanguage | undefined;
  const lang = cookieLanguage && supportedLanguages.includes(cookieLanguage) ? cookieLanguage : "en";

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={inter.className}>
        <LanguageProvider initialLanguage={lang}>
          <AnalyticsProvider />
          <Navbar />
          {children}
          <Footer />
        </LanguageProvider>
        <Script
          id="schema-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
