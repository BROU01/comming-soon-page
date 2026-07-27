const year = String(new Date().getFullYear());

export default function SiteFooter() {
  return (
    <footer className="relative z-10 w-full text-center py-6 md:py-8">
      <p className="text-sm text-escen-text-secondary/70 leading-relaxed">
        &copy; {year} <span className="font-medium text-escen-text-secondary/90">ESCEN</span>
        {" — "}
        École Supérieure de Commerce et d&apos;Économie Numérique
      </p>
    </footer>
  );
}
