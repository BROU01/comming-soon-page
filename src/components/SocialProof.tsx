"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   SocialProof — Deep Cognitive & Mastermind Marketing Hook
   ============================================================ */

export default function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);

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
    <div
      ref={ref}
      className="max-w-[640px] mx-auto text-center transition-all duration-700 ease-out opacity-0 translate-y-3 px-4 py-2"
    >
      {/* Badge d'ancrage psychologique */}
      <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-escen-cyan-50 border border-escen-cyan-100 text-escen-navy text-[0.75rem] font-semibold tracking-widest uppercase">
        <span className="w-2 h-2 rounded-full bg-escen-cyan animate-pulse" />
        La confiance de demain se bâtit aujourd&apos;hui
      </div>

      {/* Accroche cognitive à fort impact humain */}
      <p className="text-lg md:text-2xl font-semibold text-escen-navy leading-snug md:leading-relaxed mb-3 tracking-tight">
        &ldquo;Les plus grandes réussites reposent sur une preuve irréfutable. Nous protégeons votre mérite pour captiver les recruteurs et propulser votre avenir.&rdquo;
      </p>

      {/* Rétention et réassurance marketing */}
      <p className="text-xs sm:text-sm text-escen-text-secondary leading-relaxed max-w-[540px] mx-auto font-normal">
        Une technologie d&apos;authentification de nouvelle génération qui scelle la valeur de votre parcours auprès des leaders et institutions de demain.
      </p>
    </div>
  );
}
