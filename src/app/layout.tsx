import type { Metadata } from "next";
import "./globals.css";

/* ============================================================
   Metadata - SEO, Open Graph, Twitter Cards, Icons
   ============================================================ */
const siteUrl = "https://escen.university";
const siteName = "ESCEN";
const description =
  "ESCEN prépare le lancement de sa nouvelle solution numérique de vérification sécurisée de diplômes et relevés de notes. Une plateforme académique moderne, transparente et digne de confiance.";
const title = "ESCEN - Vérification des diplômes et relevés en un clic";

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
  ],    /* --- Open Graph --- */
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: siteName,
    title: title,
    description: description,
    url: siteUrl,
    // TODO: Remplacer par une vraie image PNG 1200x630 au lancement
  },

  /* --- Twitter Card --- */
  twitter: {
    card: "summary",
    title: title,
    description: description,
  },

  /* --- Icons --- */
  icons: {
    icon: [
      { url: "/ESECN LOGO (1).png", sizes: "any" },
    ],
    shortcut: "/ESECN LOGO (1).png",
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
    <html lang="fr" className="h-full antialiased">
      <head>
        {/* Preconnect to Google Fonts (fallback if next/font needs it) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* CSP Meta (relaxed for Google Fonts + inline styles + Dev mode unsafe-eval) */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; base-uri 'none'; form-action 'self'; frame-ancestors 'none';"
        />
      </head>
      <body className="min-h-dvh flex flex-col">
        {children}
      </body>
    </html>
  );
}
