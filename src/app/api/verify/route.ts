import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendFraudAlert } from "@/lib/resend";
import crypto from "crypto";

// ─── Configuration rate limiting ─────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_BLOCK_MS = 300_000; // 5 minutes

// ─── Configuration détection fraude ──────────────────────────
const FRAUD_THRESHOLD = 5; // tentatives échouées sur un même identifiant
const FRAUD_WINDOW_MS = 15 * 60_000; // fenêtre de détection : 15 min
const FRAUD_COOLDOWN_MS = 24 * 60 * 60_000; // 1 alerte max / identifiant / 24 h

/**
 * Hash une adresse IP (RGPD).
 */
function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * Vérifie et met à jour le rate limiting pour une IP.
 *
 * Logique :
 * - On récupère la dernière ligne pour cette IP/endpoint (sans filtre
 *   de fenêtre, pour que le blocage de 5 min reste visible après 1 min).
 * - Si bloqué_until est dans le futur → refus.
 * - Sinon on compte les tentatives dans la fenêtre de 1 min (window_start).
 * - Au 5e essai dans la fenêtre → blocage 5 min.
 */
async function checkRateLimit(
  supabase: any,
  ipHash: string
): Promise<{ allowed: boolean }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  const rateLimitTable = supabase.from("rate_limits") as any;
  const { data: recentAttempts } = await rateLimitTable
    .select("attempt_count, blocked_until, window_start")
    .eq("ip_address", ipHash)
    .eq("endpoint", "/api/verify")
    .order("window_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Vérifier si bloqué (indépendant de la fenêtre de 1 min)
  if (recentAttempts?.blocked_until) {
    const blockedUntil = new Date(recentAttempts.blocked_until);
    if (blockedUntil > now) {
      return { allowed: false };
    }
  }

  // La tentative précédente est-elle dans la fenêtre de 1 min ?
  const inWindow =
    recentAttempts?.window_start &&
    new Date(recentAttempts.window_start) >= windowStart;

  const newCount = (inWindow ? (recentAttempts?.attempt_count ?? 0) : 0) + 1;

  if (newCount >= RATE_LIMIT_MAX_ATTEMPTS) {
    const blockedUntil = new Date(
      now.getTime() + RATE_LIMIT_BLOCK_MS
    ).toISOString();

    // Mettre à jour la ligne existante (pas de doublon) ou en créer une
    if (recentAttempts) {
      await rateLimitTable
        .update({
          attempt_count: newCount,
          window_start: now.toISOString(),
          blocked_until: blockedUntil,
        })
        .eq("ip_address", ipHash)
        .eq("endpoint", "/api/verify");
    } else {
      await rateLimitTable.insert({
        ip_address: ipHash,
        endpoint: "/api/verify",
        attempt_count: newCount,
        window_start: now.toISOString(),
        blocked_until: blockedUntil,
      });
    }

    return { allowed: false };
  }

  // Une ligne existe (même hors fenêtre) → la mettre à jour pour éviter
  // les doublons (window_start à now + compteur réinitialisé si hors fenêtre)
  if (recentAttempts) {
    await rateLimitTable
      .update({
        attempt_count: newCount,
        window_start: now.toISOString(),
        blocked_until: null,
      })
      .eq("ip_address", ipHash)
      .eq("endpoint", "/api/verify");
  } else {
    // Première tentative → insérer
    await rateLimitTable.insert({
      ip_address: ipHash,
      endpoint: "/api/verify",
      attempt_count: newCount,
      window_start: now.toISOString(),
    });
  }

  return { allowed: true };
}

/**
 * Log une vérification dans la base.
 */
async function logVerification(
  supabase: any,
  params: {
    releve_id: string | null;
    attempted_id?: string;
    ip_address: string;
    user_agent: string;
    result: "success" | "failed";
    error_type: string;
  }
) {
  await (supabase.from("verifications") as any).insert({
    releve_id: params.releve_id,
    attempted_id: params.attempted_id ?? "",
    ip_address: params.ip_address,
    user_agent: params.user_agent,
    result: params.result,
    error_type: params.error_type,
  });
}

/**
 * Détecte un comportement anormal : trop d'échecs sur un même
 * identifiant dans la fenêtre de détection. Si le seuil est atteint
 * et qu'aucune alerte n'a été envoyée pour cet identifiant dans les
 * 24 dernières heures → envoi d'un email à la scolarité/DSI.
 *
 * Robuste : tout échec est silencieux (jamais bloquant pour la route).
 */
async function detectFraudAndAlert(
  identifier: string,
  ipHash: string
): Promise<void> {
  try {
    const adminSupabase = await createAdminClient();
    const since = new Date(Date.now() - FRAUD_WINDOW_MS).toISOString();

    // Compter les échecs sur cet identifiant dans la fenêtre
    const { count } = await adminSupabase
      .from("verifications")
      .select("id", { count: "exact", head: true })
      .eq("attempted_id", identifier)
      .eq("result", "failed")
      .gte("timestamp", since);

    if (!count || count < FRAUD_THRESHOLD) return;

    // Cooldown : pas plus d'une alerte par identifiant toutes les 24 h
    const cooldownSince = new Date(
      Date.now() - FRAUD_COOLDOWN_MS
    ).toISOString();
    const { data: existing } = await adminSupabase
      .from("fraud_alerts")
      .select("id")
      .eq("identifier", identifier)
      .gte("alerted_at", cooldownSince)
      .maybeSingle();

    if (existing) return;

    await sendFraudAlert({
      identifier,
      ipAddress: ipHash,
      attemptCount: count,
      timeWindowMs: FRAUD_WINDOW_MS,
    });

    await adminSupabase.from("fraud_alerts").insert({
      identifier,
      attempt_count: count,
      ip_address: ipHash,
    });
  } catch (error) {
    // Ne jamais casser la vérification à cause d'un problème d'alerte
    console.error("[fraud] Échec détection/alerte :", error);
  }
}

/**
 * POST /api/verify
 * Vérifie un identifiant de relevé et enregistre la tentative.
 * Protégé par rate limiting.
 * Ajoute un délai fixe pour éviter les timing attacks.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // ── Rate limiting ──────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const ipHash = hashIP(ip);

    const { allowed } = await checkRateLimit(supabase, ipHash);
    if (!allowed) {
      await logVerification(supabase, {
        releve_id: null,
        ip_address: ipHash,
        user_agent: request.headers.get("user-agent") ?? "",
        result: "failed",
        error_type: "rate_limited",
      });

      return NextResponse.json(
        {
          success: false,
          error: { code: "rate_limited", message: "" },
        },
        { status: 429 }
      );
    }

    // ── Valider l'ID ───────────────────────────────────────
    const body = await request.json().catch(() => ({}));
    const { id } = body as { id?: string };

    if (!id || typeof id !== "string" || id.length < 8) {
      await logVerification(supabase, {
        releve_id: null,
        attempted_id: typeof id === "string" ? id : "",
        ip_address: ipHash,
        user_agent: request.headers.get("user-agent") ?? "",
        result: "failed",
        error_type: "invalid_id",
      });

      // Ajouter un délai artificiel pour masquer les timing attacks
      await delay(Math.max(0, 200 - (Date.now() - startTime)));

      return NextResponse.json(
        { success: false, error: { code: "not_found", message: "" } },
        { status: 200 }
      );
    }

    // ── Chercher le relevé ─────────────────────────────────
    const relevesTable = supabase.from("releves") as any;
    const { data: releve, error } = await relevesTable
      .select("*")
      .eq("id", id)
      .single();

    if (error || !releve) {
      await logVerification(supabase, {
        releve_id: null,
        attempted_id: id,
        ip_address: ipHash,
        user_agent: request.headers.get("user-agent") ?? "",
        result: "failed",
        error_type: "invalid_id",
      });

      // Détection fraude : plusieurs échecs sur le même identifiant
      await detectFraudAndAlert(id, ipHash);

      await delay(Math.max(0, 200 - (Date.now() - startTime)));

      return NextResponse.json(
        { success: false, error: { code: "not_found", message: "" } },
        { status: 200 }
      );
    }

    // ── Relevé annulé ──────────────────────────────────────
    // NB: la RLS (releves_select_active) masque déjà les relevés annulés
    // au public : ils retombent dans le cas "not_found" ci-dessus (anti-fraude).
    // Ce relevé est donc TOUJOURS actif ici.

    // ── Succès ─────────────────────────────────────────────
    await logVerification(supabase, {
      releve_id: releve.id,
      ip_address: ipHash,
      user_agent: request.headers.get("user-agent") ?? "",
      result: "success",
      error_type: "",
    });

    return NextResponse.json({ success: true, data: { releve } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "server_error", message: "" } },
      { status: 500 }
    );
  }
}

/**
 * Promise-based delay helper.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
