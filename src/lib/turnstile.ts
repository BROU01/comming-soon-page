/**
 * Module Cloudflare Turnstile — protection anti-robot (CAPTCHA invisible).
 *
 * NB : sans TURNSTILE_SECRET_KEY configuré, la vérification est un no-op
 * silencieux : l'app fonctionne en local sans CAPTCHA (mode dev), et le
 * CAPTCHA devient actif dès que les clés sont présentes (production).
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Le CAPTCHA est-il configuré ? (décide l'affichage côté client et
 * l'exigence d'un jeton côté serveur)
 *
 * Exige les DEUX clés : si seule la clé secrète était définie, le serveur
 * exigerait un jeton que le widget client ne peut pas produire → les
 * utilisateurs légitimes seraient bloqués. Une seule clé présente = CAPTCHA
 * inactif (mode dev).
 */
export function isTurnstileEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      process.env.TURNSTILE_SECRET_KEY
  );
}

/**
 * Vérifie un jeton Turnstile côté serveur (siteverify).
 *
 * Retourne true si :
 *  - le CAPTCHA n'est pas configuré (dev/local), ou
 *  - le jeton est présent et valide.
 *
 * Politique de disponibilité : en cas d'erreur réseau vers Cloudflare,
 * on NE bloque PAS l'utilisateur (fail-open) — le rate limiting et la
 * détection de fraude restent actifs en arrière-plan. En revanche un
 * jeton absent ou invalide est toujours rejeté (fail-closed).
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  ip?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // non configuré → pas de blocage (dev)

  if (!token || typeof token !== "string" || token.length === 0) return false;

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body: form });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("[turnstile] Échec de la vérification (fail-open) :", error);
    return true;
  }
}
