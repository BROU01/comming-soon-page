"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   SocialProof

   Deep cognitive brainstorming + mind marketing :
   Cette accroche est conçue pour activer les déclencheurs
   psychologiques de rétention humaine :

   1. SÉCURITÉ IDENTITAIRE → "votre parcours", "votre ambition"
      → Le lecteur se sent personnellement concerné
   2. RECONNAISSANCE → "histoires vraies", "reconnue"
      → Besoin fondamental d'être vu et validé
   3. HÉRITAGE → "chaque diplôme raconte l'histoire"
      → Valeur durable, pas un simple document
   4. CONFIANCE → "confiance", "authenticité"
      → Fondation de la relation institution-étudiant-employeur
   5. APPARTENANCE → "mérite"
      → Justice et équité dans la reconnaissance
   ============================================================ */

export default function SocialProof() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-3");
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <p
      ref={ref}
      className="max-w-[580px] mx-auto text-base md:text-lg leading-relaxed md:leading-[1.7] text-escen-text-secondary text-center transition-all duration-700 ease-out opacity-0 translate-y-3"
    >
      <span className="block mb-3 text-escen-navy font-semibold text-sm uppercase tracking-[0.15em]">
        — Une solution pensée pour l&apos;humain —
      </span>
      <span className="block">
        Chaque diplôme raconte l&apos;histoire d&apos;un parcours, d&apos;une ambition,
        d&apos;une vie qui se construit. Notre future solution de vérification
        garantit que chaque réussite soit reconnue avec l&apos;authenticité
        et la confiance qu&apos;elle mérite.
      </span>
    </p>
  );
}
