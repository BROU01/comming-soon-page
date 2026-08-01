"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Tableau de bord", href: "/admin/dashboard", icon: "📊" },
  { label: "Relevés", href: "/admin/releves", icon: "📄" },
  { label: "Historique", href: "/admin/logs", icon: "📜" },
];

/**
 * Barre latérale de navigation pour l'espace admin.
 * Mobile-first : s'affiche en hamburger sur mobile.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  async function handleLogout() {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      router.push("/admin/login");
    } catch {
      // Silently fail
    }
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-escen-navy rounded-xl flex items-center justify-center text-white shadow-lg"
        aria-label="Menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-dvh w-[260px] bg-escen-navy flex flex-col z-40
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-escen-cyan rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">ESCEN</p>
              <p className="text-white/50 text-[0.6rem]">Administration</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-160
                  ${isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-160 w-full"
          >
            <span className="text-base">🚪</span>
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
