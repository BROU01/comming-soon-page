"use client";

import { useState, useEffect, use } from "react";
import VerifyForm from "@/components/verify/VerifyForm";
import VerificationResult from "@/components/verify/VerificationResult";
import type { VerifyResponse, Locale } from "@/lib/types/database";

/**
 * Page /verify/[id]
 * Accessible directement depuis le scan du QR Code.
 * L'identifiant est pré-rempli dans le formulaire.
 * Lance la vérification automatiquement si l'ID est valide.
 */
export default function VerifyIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [locale, setLocale] = useState<Locale>("fr");
  const [autoVerified, setAutoVerified] = useState(false);

  useEffect(() => {
    const lang = navigator.language?.startsWith("fr") ? "fr" : "en";
    setLocale(lang);
  }, []);

  // Lancer la vérification automatique dès que l'ID est chargé
  useEffect(() => {
    if (id && !autoVerified) {
      setAutoVerified(true);
      const verifyId = async () => {
        try {
          const res = await fetch("/api/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const data: VerifyResponse = await res.json();
          setResult(data);
        } catch {
          setResult({
            success: false,
            error: {
              code: "server_error",
              message: "",
            },
          });
        }
      };
      verifyId();
    }
  }, [id, autoVerified]);

  return (
    <div className="min-h-dvh flex flex-col bg-escen-bg">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-escen-navy rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">E</span>
          </div>
        </div>

        {!result ? (
          <>
            {/* Loading */}
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-8 w-8 text-escen-cyan" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-escen-text-secondary">
                {locale === "fr"
                  ? "Vérification en cours..."
                  : "Verifying..."}
              </p>
            </div>

            {/* Formulaire de secours (si l'auto-vérification échoue) */}
            <div className="mt-8 w-full max-w-[520px]">
              <p className="text-xs text-escen-text-secondary text-center mb-4">
                {locale === "fr"
                  ? "Ou saisissez l'identifiant manuellement :"
                  : "Or enter the ID manually:"}
              </p>
              <VerifyForm
                locale={locale}
                initialId={id}
                onResult={setResult}
              />
            </div>
          </>
        ) : (
          <VerificationResult
            result={result}
            locale={locale}
            onReset={() => setResult(null)}
          />
        )}
      </div>

      <footer className="text-center py-4">
        <p className="text-xs text-escen-text-secondary/60">
          ESCEN University — {locale === "fr" ? "Vérification officielle" : "Official verification"}
        </p>
      </footer>
    </div>
  );
}
