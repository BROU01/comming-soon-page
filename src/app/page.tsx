import Image from "next/image";
import CountdownTimer from "@/components/CountdownTimer";
import EmailForm from "@/components/EmailForm";
import SocialProof from "@/components/SocialProof";
import SiteFooter from "@/components/SiteFooter";

/* ============================================================
   Page d'accueil — Coming Soon ESCEN
   Academic Minimalism + Digital Premium
   Architecture : logo → badge → titre → timer → social proof
                  → formulaire email → footer
   ============================================================ */

export default function Home() {
  return (
    <div className="relative z-10 flex flex-col flex-1">
      <main className="flex-1 flex flex-col items-center justify-between w-full max-w-[1120px] mx-auto px-5 py-16 md:py-24 lg:py-28">
        {/* ============================================
           HEADER — Logo
           ============================================ */}
        <header className="w-full flex justify-center pt-6 md:pt-8 lg:pt-10">
          <Image
            src="/LOGO_ESCEN_WEB.png"
            alt="ESCEN — École Supérieure de Commerce et d'Économie Numérique"
            width={280}
            height={100}
            priority
            className="w-[200px] md:w-[280px] h-auto select-none"
          />
        </header>

        {/* ============================================
           HERO — Badge + Titre + Timer + Social Proof + Email
           ============================================ */}
        <section
          className="w-full flex flex-col items-center text-center gap-10 md:gap-14 py-10 md:py-14 lg:py-16"
          aria-labelledby="hero-title"
        >
          {/* Badge "Bientôt disponible" */}
          <span
            className="inline-block text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-escen-cyan bg-escen-surface border border-escen-border rounded-full px-4 py-1"
          >
            Bientôt disponible
          </span>

          {/* Titre principal */}
          <h1
            id="hero-title"
            className="text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-tight leading-[1.15] text-escen-navy max-w-[720px] mx-auto"
          >
            ESCEN prépare une nouvelle solution
            <br className="hidden sm:block" /> numérique de confiance
          </h1>

          {/* Compte à rebours */}
          <div className="w-full flex justify-center">
            <CountdownTimer />
          </div>

          {/* Social Proof — centrée sur la rétention humaine */}
          <SocialProof />

          {/* Formulaire de notification */}
          <EmailForm />
        </section>

        {/* Spacer pour équilibrer le footer */}
        <div aria-hidden="true" className="h-4" />
      </main>

      {/* ============================================
         FOOTER
         ============================================ */}
      <SiteFooter />
    </div>
  );
}
