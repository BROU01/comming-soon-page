"use client";

import { useEffect, useRef, useState } from "react";

// API globale exposée par le script Cloudflare Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          language?: string;
        }
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onToken: (token: string | null) => void;
  locale: "fr" | "en";
}

/**
 * Widget CAPTCHA Cloudflare Turnstile (vérification d'intégrité, invisible).
 *
 * - `siteKey` vide (dev sans clés) → ne rend rien.
 * - Le jeton est remonté via `onToken`, remis à null à l'expiration/erreur.
 * - Si le script ne se charge pas (bloqueur de pub, réseau), on affiche un
 *   message clair avec un bouton « Réessayer » plutôt qu'un blocage silencieux
 *   (exigence de disponibilité du cahier des charges).
 */
export default function TurnstileWidget({ siteKey, onToken, locale }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!siteKey) return;

    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    const renderWidget = () => {
      // Garde anti double-render : si un widget existe déjà (ex: retry après
      // échec de chargement, deux scripts onload), on n'en rend pas un second.
      if (cancelled || widgetIdRef.current || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
        theme: "light",
        language: locale === "fr" ? "fr" : "en",
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = renderWidget;
      script.onerror = () => {
        if (!cancelled) setLoadError(true);
      };
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      // Retire le script s'il n'a jamais chargé (évite l'accumulation
      // d'éléments <script> échoués à chaque « Réessayer »)
      script?.remove();
      // Retire le widget Turnstile s'il a été rendu (un seul cleanup
      // gère les deux cas, pas de ref périmée ni de nettoyage partiel)
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, onToken, locale, attempt]);

  if (!siteKey) return null;

  if (loadError) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-red-500" role="alert">
          {locale === "fr"
            ? "Impossible de charger la vérification anti-robot. Vérifiez votre connexion."
            : "Could not load the bot check. Please check your connection."}
        </p>
        <button
          type="button"
          onClick={() => {
            setLoadError(false);
            setAttempt((a) => a + 1);
          }}
          className="text-xs font-semibold text-escen-navy underline underline-offset-2 hover:text-escen-cyan transition-colors"
        >
          {locale === "fr" ? "Réessayer" : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mt-4 flex justify-center"
      aria-label={locale === "fr" ? "Vérification anti-robot" : "Bot protection check"}
    />
  );
}
