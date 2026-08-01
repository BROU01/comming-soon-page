import fr from "./locales/fr";
import en from "./locales/en";
import type { Translations } from "./locales/fr";

import type { Locale } from "../types/database";

const translations: Record<Locale, Translations> = {
  fr,
  en,
};

export const defaultLocale: Locale = "fr";
export const locales: Locale[] = ["fr", "en"];

/**
 * Récupère les traductions pour une locale donnée.
 */
export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations[defaultLocale];
}

/**
 * Hook simplifié pour obtenir les traductions côté client.
 * À utiliser avec useState pour la locale.
 */
export function useTranslations(locale: Locale): Translations {
  return getTranslations(locale);
}

/**
 * Détermine la langue préférée depuis le header Accept-Language.
 */
export function detectLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return defaultLocale;
  if (acceptLanguage.startsWith("fr")) return "fr";
  if (acceptLanguage.startsWith("en")) return "en";
  return defaultLocale;
}

export type { Translations };
