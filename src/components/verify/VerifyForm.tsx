"use client";

import { useState, type FormEvent } from "react";
import TurnstileWidget from "@/components/verify/TurnstileWidget";
import type { VerifyResponse } from "@/lib/types/database";
import type { Locale } from "@/lib/types/database";

interface VerifyFormProps {
  locale: Locale;
  initialId?: string;
  onResult: (result: VerifyResponse) => void;
}

// Clé publique Turnstile (sûre côté client). Vide en dev → CAPTCHA désactivé.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/**
 * Formulaire de vérification d'un identifiant de relevé.
 * Utilisé sur la page /verify et /verify/[id] (pré-rempli).
 */
export default function VerifyForm({ locale, initialId = "", onResult }: VerifyFormProps) {
  const [id, setId] = useState(initialId);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const isFrench = locale === "fr";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = id.trim();

    if (!trimmed || trimmed.length < 8) {
      setError(isFrench
        ? "Veuillez saisir un identifiant valide."
        : "Please enter a valid identifier.");
      return;
    }

    // CAPTCHA activé mais jeton absent/expiré → bloquer
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError(isFrench
        ? "Veuillez compléter la vérification anti-robot."
        : "Please complete the bot check.");
      return;
    }

    setError(null);
    setIsVerifying(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trimmed, turnstileToken: turnstileToken ?? undefined }),
      });

      const data: VerifyResponse = await res.json();
      onResult(data);

      // Jeton mono-usage : invalider après chaque tentative.
      // NB: le message d'erreur (ex: captcha_failed) est affiché par
      // VerificationResult — ne pas setError ici (le formulaire est démonté
      // par onResult).
      setTurnstileToken(null);
    } catch {
      setError(isFrench
        ? "Erreur de connexion. Veuillez réessayer."
        : "Connection error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-[520px] mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="verify-id" className="sr-only">
            {isFrench ? "Identifiant du relevé" : "Transcript ID"}
          </label>
          <input
            id="verify-id"
            type="text"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              if (error) setError(null);
            }}
            placeholder={isFrench
              ? "Entrez l'identifiant (UUID)"
              : "Enter the identifier (UUID)"}
            required
            disabled={isVerifying}
            className="w-full h-[50px] px-4 text-base font-sans text-escen-text bg-white border border-escen-border rounded-xl outline-none transition-all duration-160 placeholder:text-escen-text-secondary/60 disabled:cursor-not-allowed focus:border-escen-cyan focus:ring-1 focus:ring-escen-cyan/30"
            aria-describedby="verify-error"
            aria-invalid={!!error}
          />
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="h-[50px] px-6 text-sm font-semibold text-white bg-escen-navy rounded-xl border-none cursor-pointer whitespace-nowrap transition-all duration-160 hover:bg-escen-navy-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-escen-cyan"
        >
          {isVerifying ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {isFrench ? "Vérification..." : "Verifying..."}
            </span>
          ) : (
            isFrench ? "Vérifier" : "Verify"
          )}
        </button>
      </div>

      {error && (
        <p id="verify-error" role="alert" className="mt-2 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      {TURNSTILE_SITE_KEY && (
        <TurnstileWidget
          siteKey={TURNSTILE_SITE_KEY}
          onToken={setTurnstileToken}
          locale={locale}
        />
      )}
    </form>
  );
}
