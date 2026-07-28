const year = String(new Date().getFullYear());

export default function SiteFooter() {
  return (
    <footer className="relative z-10 w-full text-center py-4 md:py-6 flex flex-col items-center gap-3">
      <a
        href="https://escen.university"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-escen-navy/70 hover:text-escen-cyan transition-colors"
      >
        Découvrez l&apos;université
        <svg
          className="w-3.5 h-3.5 text-escen-cyan"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
      <p className="text-xs sm:text-sm text-escen-text-secondary/65 leading-relaxed">
        &copy; {year} <span className="font-medium text-escen-text-secondary/90">ESCEN</span>
        {" - "}
        École Supérieure de Commerce et d&apos;Économie Numérique
      </p>
    </footer>
  );
}
