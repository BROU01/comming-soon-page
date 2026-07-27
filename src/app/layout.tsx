import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/* ============================================================
   Inter — variable font loaded from Google Fonts via next/font
   ============================================================ */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

/* ============================================================
   Metadata — SEO, Open Graph, Twitter Cards, Icons
   ============================================================ */
const siteUrl = "https://escen.university";
const siteName = "ESCEN";
const description =
  "ESCEN prépare le lancement de sa nouvelle solution numérique de vérification sécurisée de diplômes. Une plateforme académique moderne, transparente et digne de confiance.";
const title = "ESCEN — Nouvelle solution numérique à venir";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s | ESCEN",
  },
  description,
  applicationName: siteName,
  referrer: "strict-origin-when-cross-origin",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "ESCEN",
    "École Supérieure de Commerce",
    "Économie Numérique",
    "vérification diplôme",
    "QR code",
    "solution numérique",
    "éducation",
    "enseignement supérieur",
  ],

  /* --- Open Graph --- */
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: siteName,
    title: title,
    description: description,
    url: siteUrl,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ESCEN — Nouvelle solution numérique à venir",
      },
    ],
  },

  /* --- Twitter Card --- */
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    images: ["/og-image.svg"],
  },

  /* --- Icons --- */
  icons: {
    icon: [
      { url: "/LOGO_ESCEN_WEB.png", sizes: "any" },
    ],
    shortcut: "/LOGO_ESCEN_WEB.png",
  },

  /* --- Theme --- */
  manifest: "/site.webmanifest",

  /* --- Robots --- */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  /* --- Other --- */
  other: {
    "mobile-web-app-capable": "yes",
  },
};

/* ============================================================
   JSON-LD Structured Data
   ============================================================ */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "ESCEN",
  alternateName: "École Supérieure de Commerce et d'Économie Numérique",
  url: siteUrl,
  logo: `${siteUrl}/LOGO_ESCEN_WEB.png`,
  description: "École supérieure de commerce et d'économie numérique. Lancement prochain d'une nouvelle solution de vérification sécurisée de diplômes.",
  knowsAbout: ["Commerce", "Économie numérique", "Vérification de diplômes", "QR Code"],
  address: {
    "@type": "PostalAddress",
    addressCountry: "FR",
  },
};

/* ============================================================
   Root Layout
   ============================================================ */
export const viewport = {
  themeColor: "#1D2B6B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Preconnect to Google Fonts (fallback if next/font needs it) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* CSP Meta (relaxed for Google Fonts + inline styles) */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self' 'unsafe-inline'; base-uri 'none'; form-action 'self'; frame-ancestors 'none';"
        />
      </head>
      <body className="min-h-dvh flex flex-col">
        {children}
      </body>
    </html>
  );
}
