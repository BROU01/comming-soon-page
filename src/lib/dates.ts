/**
 * Utilitaires de dates — fuseau Europe/Paris.
 * Utilisé pour les statistiques "aujourd'hui" du tableau de bord.
 */

/**
 * Décalage (en minutes) entre UTC et Europe/Paris à un instant donné.
 */
function getParisOffsetMinutes(utcDate: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(utcDate);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);

  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  return Math.round((asUTC - utcDate.getTime()) / 60_000);
}

/**
 * Retourne le timestamp UTC correspondant à 00:00 (heure de Paris)
 * du jour courant. Gère correctement l'heure d'été (CEST/CET).
 */
export function startOfTodayParis(): Date {
  const now = new Date();
  const parisDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // Format: YYYY-MM-DD

  const [y, m, d] = parisDate.split("-").map(Number);

  // On utilise midi (12:00 UTC candidate) pour déterminer le décalage
  // du jour, ce qui évite les ambiguïtés aux changements d'heure.
  const noonCandidate = Date.UTC(y, m - 1, d, 12);
  const offsetMin = getParisOffsetMinutes(new Date(noonCandidate));

  return new Date(Date.UTC(y, m - 1, d) - offsetMin * 60_000);
}
