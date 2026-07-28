"use client";

import { useEffect, useState } from "react";

const PROVERBS = [
  {
    text: "L'éducation est l'arme la plus puissante pour changer le monde.",
    author: "Nelson Mandela"
  },
  {
    text: "Le savoir est la seule richesse que l'on puisse diviser sans la diminuer.",
    author: "Alfred Sauvy"
  },
  {
    text: "Le futur appartient à ceux qui croient à la beauté de leurs rêves.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "La confiance est le ciment de toute réussite.",
    author: "Proverbe"
  }
];

export default function SocialProof() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState("out");
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % PROVERBS.length);
        setFadeState("in");
      }, 500); // 500ms fade out
    }, 6000); // change every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[800px] mx-auto pt-10 pb-4 mt-6 md:mt-10 min-h-[110px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        {/* Citation */}
        <p
          className={`text-base sm:text-lg md:text-xl font-medium italic text-escen-navy/80 leading-relaxed transition-all duration-500 ease-in-out ${fadeState === "in" ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
            }`}
        >
          &ldquo;{PROVERBS[currentIndex].text}&rdquo;
        </p>

        {/* Auteur */}
        <span
          className={`text-xs font-bold uppercase tracking-widest text-escen-cyan transition-all duration-500 ease-in-out ${fadeState === "in" ? "opacity-80 translate-y-0" : "opacity-0 -translate-y-1"
            }`}
        >
          {PROVERBS[currentIndex].author}
        </span>
      </div>
    </div>
  );
}
