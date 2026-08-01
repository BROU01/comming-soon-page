/**
 * Charge le fichier .env.local dans process.env.
 * Utilisé par les scripts standalone (seed, setup-db) qui ne passent
 * pas par Next.js et donc ne chargent pas automatiquement les .env.
 */
export function loadEnv(): void {
  try {
    // Node 20.6+ : charge le fichier .env.local si présent
    if (typeof process.loadEnvFile === "function") {
      process.loadEnvFile(".env.local");
    }
  } catch {
    // Fichier absent ou API indisponible : on continue
  }
}
