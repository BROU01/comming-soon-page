import Image from "next/image";
import CountdownTimer from "@/components/CountdownTimer";
import SocialProof from "@/components/SocialProof";
import SiteFooter from "@/components/SiteFooter";

/* ============================================================
   Page d'accueil - Coming Soon ESCEN
   Academic Minimalism + Digital Premium
   Architecture : logo → badge → titre → timer → social proof
                  → formulaire email → footer
   ============================================================ */

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-dvh">
      {/* Background Video Spot */}
      <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden bg-escen-bg">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-15 blur-[8px] scale-105"
        >
          <source src="/Spot vidéo ESCEN.mp4" type="video/mp4" />
        </video>
        {/* Subtle overlay overlaying the video */}
        <div className="absolute inset-0 bg-gradient-to-b from-escen-bg/40 via-transparent to-escen-bg/40" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-between w-full max-w-[1280px] mx-auto px-5 py-3 md:py-4 lg:py-6">
        {/* ============================================
           HEADER - Logo
           ============================================ */}
        <header className="w-full flex justify-center pt-2">
          <Image
            src="/LOGO_ESCEN_WEB.png"
            alt="ESCEN - École Supérieure de Commerce et d'Économie Numérique"
            width={220}
            height={80}
            priority
            className="w-[150px] md:w-[220px] h-auto select-none"
          />
        </header>

        {/* ============================================
           HERO - Badge + Titre + Timer + Social Proof + Email
           ============================================ */}
        <section
          className="w-full flex flex-col items-center text-center gap-3 md:gap-4 py-1"
          aria-labelledby="hero-title"
        >
          {/* Mention de lancement */}
          <span
            className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-escen-cyan"
          >
            Bientôt disponible
          </span>

          {/* Titre principal */}
          <h1
            id="hero-title"
            className="text-[clamp(1.5rem,3.2vw,2.25rem)] font-semibold tracking-tight leading-[1.15] text-escen-navy max-w-[840px] mx-auto"
          >
            ESCEN prépare une nouvelle solution
            <br className="hidden sm:block" /> numérique de confiance
          </h1>

          {/* Compte à rebours */}
          <div className="w-full flex justify-center">
            <CountdownTimer />
          </div>

          {/* Proverbe en rotation automatique */}
          <SocialProof />
        </section>

        {/* ============================================
           FOOTER - Now inside main to participate in flex distribution
           ============================================ */}
        <SiteFooter />
      </main>
    </div>
  );
}
