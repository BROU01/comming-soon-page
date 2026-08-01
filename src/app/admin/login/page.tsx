"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * Page de connexion administrateur /admin/login
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Identifiants incorrects.");
        return;
      }

      // Rediriger vers le dashboard
      router.push("/admin/dashboard");
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-escen-bg px-5">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-escen-navy rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <h1 className="text-xl font-bold text-escen-navy">
            Administration ESCEN
          </h1>
          <p className="text-sm text-escen-text-secondary mt-1">
            Connectez-vous pour gérer les relevés de notes
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate className="bg-white border border-escen-border rounded-2xl p-6 shadow-[0_10px_30px_rgba(29,43,107,0.08)]">
          <div className="mb-4">
            <label htmlFor="admin-email" className="block text-xs font-semibold uppercase tracking-wider text-escen-text-secondary mb-1.5">
              Adresse e-mail
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom@escen.university"
              required
              disabled={isLoading}
              className="w-full h-[48px] px-4 text-base bg-escen-bg border border-escen-border rounded-xl outline-none transition-all duration-160 focus:border-escen-cyan focus:ring-1 focus:ring-escen-cyan/30 placeholder:text-escen-text-secondary/50"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="admin-password" className="block text-xs font-semibold uppercase tracking-wider text-escen-text-secondary mb-1.5">
              Mot de passe
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full h-[48px] px-4 text-base bg-escen-bg border border-escen-border rounded-xl outline-none transition-all duration-160 focus:border-escen-cyan focus:ring-1 focus:ring-escen-cyan/30"
            />
          </div>

          {error && (
            <p role="alert" className="mb-4 text-sm font-medium text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] text-sm font-semibold text-white bg-escen-navy rounded-xl hover:bg-escen-navy-500 active:scale-[0.98] transition-all duration-160 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {/* Lien retour */}
        <div className="text-center mt-6">
          <a href="/" className="text-xs text-escen-text-secondary hover:text-escen-cyan transition-colors">
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  );
}
