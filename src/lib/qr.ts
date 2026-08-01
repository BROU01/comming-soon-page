import QRCode from "qrcode";

/**
 * URL de base de l'application (configurable via NEXT_PUBLIC_SITE_URL).
 * Utilisée pour construire les liens encodés dans les QR Codes.
 * Ex: https://verif.escen-university.fr
 */
export function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  // Fallback localhost (développement)
  return "http://localhost:3000";
}

/**
 * URL de vérification publique pour un relevé.
 * C'est exactement ce lien qu'encode le QR Code (page /verify/[id]).
 */
export function getVerifyUrl(releveId: string): string {
  return `${getAppBaseUrl()}/verify/${releveId}`;
}

/**
 * Génère le QR Code en buffer PNG (pour téléchargement et PDF).
 */
export async function generateQRCodeBuffer(
  releveId: string
): Promise<Buffer> {
  return QRCode.toBuffer(getVerifyUrl(releveId), {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}

/**
 * Génère le QR Code en data URL (pour affichage direct dans le navigateur).
 */
export async function generateQRCodeDataUrl(
  releveId: string
): Promise<string> {
  return QRCode.toDataURL(getVerifyUrl(releveId), {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}
