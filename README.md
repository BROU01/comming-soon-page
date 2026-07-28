# ESCEN - Coming Soon

Page d'annonce pour la nouvelle solution numérique de vérification sécurisée de diplômes **ESCEN**.

Built with Next.js 16, TypeScript, and Tailwind CSS v4.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Font:** Inter (Google Fonts via next/font)

## Structure

```
src/
├── app/
│   ├── globals.css       # Design system tokens (ESCEN brand)
│   ├── layout.tsx        # Root layout, SEO, JSON-LD
│   ├── page.tsx          # Page principale coming soon
│   ├── robots.ts         # Dynamic robots.txt
│   └── sitemap.ts        # Dynamic sitemap.xml
└── components/
    ├── CountdownTimer.tsx # Compte à rebours 60 jours (localStorage)
    ├── EmailForm.tsx     # Formulaire de notification email
    ├── SocialProof.tsx   # Accroche sociale centrée rétention humaine
    └── SiteFooter.tsx    # Pied de page

public/
├── LOGO_ESCEN_WEB.png    # Logo officiel ESCEN
└── site.webmanifest      # PWA manifest

docs/
└── Cahier_des_charges_QRCode_Verification.md
```

## Dev

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Design

- **Style:** Academic Minimalism + Digital Premium
- **Palette:** Bleu marine (#1D2B6B), Cyan (#00B7D9), gris neutre
- **Typographie:** Inter, sereine et lisible
- **Accessibilité:** WCAG AA, `aria-live`, `prefers-reduced-motion`
