import { Resend } from "resend";

/**
 * Module Resend — envoi des emails d'alerte anti-fraude.
 *
 * NB : sans RESEND_API_KEY configuré, toutes les fonctions sont des
 * no-ops silencieux (l'app reste fonctionnelle en local sans email).
 */

// Instance Resend (lazy : pas de throw si la clé manque)
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
};

/**
 * Échappe les caractères HTML dans une chaîne.
 * Indispensable : l'identifiant d'un relevé est contrôlé par l'attaquant
 * (champ `id` du POST /api/verify) et ne doit jamais injecter de HTML
 * dans l'email reçu par la scolarité/DSI.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface FraudAlertParams {
  /** Identifiant de relevé qui subit les tentatives répétées */
  identifier: string;
  /** IP hachée (RGPD) de l'origine des tentatives */
  ipAddress: string;
  /** Nombre de tentatives échouées sur cet identifiant */
  attemptCount: number;
  /** Fenêtre de détection (ms) */
  timeWindowMs: number;
}

/**
 * Envoie une alerte email de comportement anormal (tentatives répétées
 * sur un même identifiant) à la scolarité / DSI.
 *
 * Silencieux si Resend n'est pas configuré, ou en cas d'erreur d'envoi
 * (l'échec d'alerte ne doit jamais casser la route de vérification).
 */
export async function sendFraudAlert(params: FraudAlertParams): Promise<void> {
  const resend = getResend();
  const from = process.env.RESEND_EMAIL_FROM;
  const to = process.env.RESEND_ALERT_TO;

  if (!resend || !from || !to) return;

  const minutes = Math.round(params.timeWindowMs / 60_000);

  const identifierEscaped = escapeHtml(params.identifier);
  const ipEscaped = escapeHtml(params.ipAddress);

  try {
    await resend.emails.send({
      from,
      to,
      subject: `⚠️ [ESCEN] Alerte sécurité — ${params.attemptCount} tentatives sur un identifiant`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #1D2B6B; margin-top: 0;">Alerte sécurité — ESCEN</h2>
          <p style="color: #334155;">Un comportement anormal a été détecté sur la page de vérification des relevés.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
            <tr>
              <td style="padding: 8px 12px; background: #f1f5f9; font-weight: bold; width: 40%; border-radius: 6px 0 0 6px;">Identifiant visé</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-family: monospace;">${identifierEscaped}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f1f5f9; font-weight: bold;">Tentatives échouées</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0;"><strong>${params.attemptCount}</strong> en ${minutes} min</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f1f5f9; font-weight: bold;">IP d'origine (hash)</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-family: monospace;">${ipEscaped}</td>
            </tr>
          </table>
          <p style="color: #64748b; font-size: 13px;">Il peut s'agir d'une tentative de devinette d'identifiants. Le système a déjà bloqué temporairement l'origine. Consultez l'historique dans l'espace d'administration.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[resend] Échec d'envoi de l'alerte anti-fraude :", error);
  }
}
