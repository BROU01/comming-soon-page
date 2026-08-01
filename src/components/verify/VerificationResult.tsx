"use client";

import type { VerifyResponse } from "@/lib/types/database";
import type { Locale } from "@/lib/types/database";
import ReleveDisplay from "./ReleveDisplay";

interface VerificationResultProps {
  result: VerifyResponse;
  locale: Locale;
  onReset: () => void;
}

/**
 * Affiche le résultat d'une vérification.
 * Gère tous les cas : succès, annulé, introuvable, rate limité, erreur.
 */
export default function VerificationResult({ result, locale, onReset }: VerificationResultProps) {
  const isFrench = locale === "fr";

  // ── Succès : afficher le relevé ──────────────────────────
  if (result.success && result.data?.releve) {
    return (
      <div className="w-full animate-fade-in">
        <ReleveDisplay
          releve={result.data.releve}
          locale={locale}
          verifiedAt={new Date().toLocaleString(isFrench ? "fr-FR" : "en-GB")}
        />
        <div className="mt-6 text-center">
          <button
            onClick={onReset}
            className="px-6 py-3 text-sm font-semibold text-escen-navy bg-white border border-escen-border rounded-xl hover:border-escen-cyan hover:text-escen-cyan transition-all duration-160"
          >
            ← {isFrench ? "Nouvelle vérification" : "New verification"}
          </button>
        </div>
      </div>
    );
  }

  // ── Relevé annulé ────────────────────────────────────────
  // NB: l'API ne renvoie jamais "cancelled" — un relevé annulé est
  // indistinguable d'un identifiant inconnu (anti-fraude, RLS).
  // Le cas est donc traité par "not_found" ci-dessous.

  // ── Identifiant non trouvé ───────────────────────────────
  if (result.error?.code === "not_found") {
    return (
      <ErrorCard
        icon="🔍"
        title={isFrench ? "Identifiant non reconnu" : "Unrecognized ID"}
        message={isFrench
          ? "Aucun relevé ne correspond à cet identifiant. Vérifiez le code saisi."
          : "No transcript matches this identifier. Please check the entered code."}
        onReset={onReset}
        locale={locale}
      />
    );
  }

  // ── Rate limité ──────────────────────────────────────────
  if (result.error?.code === "rate_limited") {
    return (
      <ErrorCard
        icon="⏳"
        title={isFrench ? "Trop de tentatives" : "Too many attempts"}
        message={isFrench
          ? "Vous avez effectué trop de tentatives. Veuillez réessayer dans quelques minutes."
          : "You have made too many attempts. Please try again in a few minutes."}
        onReset={onReset}
        locale={locale}
      />
    );
  }

  // ── CAPTCHA refusé ───────────────────────────────────────
  if (result.error?.code === "captcha_failed") {
    return (
      <ErrorCard
        icon="🤖"
        title={isFrench ? "Vérification anti-robot" : "Bot check"}
        message={isFrench
          ? "La vérification anti-robot a échoué. Veuillez réessayer."
          : "The bot check failed. Please try again."}
        onReset={onReset}
        locale={locale}
      />
    );
  }

  // ── Erreur serveur ───────────────────────────────────────
  return (
    <ErrorCard
      icon="⚠️"
      title={isFrench ? "Erreur technique" : "Technical error"}
      message={isFrench
        ? "Une erreur est survenue. Veuillez réessayer ou contacter le support."
        : "An error occurred. Please try again or contact support."}
      onReset={onReset}
      locale={locale}
    />
  );
}

function ErrorCard({
  icon,
  title,
  message,
  onReset,
  locale,
}: {
  icon: string;
  title: string;
  message: string;
  onReset: () => void;
  locale: Locale;
}) {
  const isFrench = locale === "fr";

  return (
    <div className="w-full max-w-[480px] mx-auto animate-fade-in">
      <div className="bg-white border border-escen-border rounded-2xl p-8 text-center shadow-[0_10px_30px_rgba(29,43,107,0.08)]">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl font-bold text-escen-navy mb-2">{title}</h2>
        <p className="text-sm text-escen-text-secondary leading-relaxed mb-6">
          {message}
        </p>
        <button
          onClick={onReset}
          className="px-6 py-3 text-sm font-semibold text-white bg-escen-navy rounded-xl hover:bg-escen-navy-500 active:scale-[0.97] transition-all duration-160"
        >
          ← {isFrench ? "Nouvelle vérification" : "New verification"}
        </button>
      </div>
    </div>
  );
}
