import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

// ─── Configuration ──────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max / minute / IP (même seuil que /api/verify)

/**
 * Hash une adresse IP (RGPD).
 */
function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * POST /api/notify
 * Enregistre l'adresse e-mail d'une personne souhaitant être
 * informée du lancement. Idempotent (email unique), protégé par
 * un rate limiting par IP (table rate_limits, endpoint dédié).
 *
 * Le rate limiting s'applique AVANT la validation email : un
 * spammeur d'emails invalides est lui aussi throttlé.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const ipHash = hashIP(ip);

    const supabase = await createClient();

    // ── Rate limiting par IP (avant validation) ───────────
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

    // NB: `as any` — même convention que les autres routes API du projet
    // (postgrest-js générique ; voir /api/verify).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recent } = await (supabase.from("rate_limits") as any)
      .select("attempt_count, window_start")
      .eq("ip_address", ipHash)
      .eq("endpoint", "/api/notify")
      .order("window_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    const inWindow =
      recent?.window_start && new Date(recent.window_start) >= windowStart;
    const count = (inWindow ? (recent?.attempt_count ?? 0) : 0) + 1;

    if (count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { success: false, error: "Trop de demandes. Réessayez plus tard." },
        { status: 429 }
      );
    }

    if (recent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("rate_limits") as any)
        .update({
          attempt_count: count,
          window_start: now.toISOString(),
        })
        .eq("ip_address", ipHash)
        .eq("endpoint", "/api/notify");
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("rate_limits") as any).insert({
        ip_address: ipHash,
        endpoint: "/api/notify",
        attempt_count: count,
        window_start: now.toISOString(),
      });
    }

    // ── Validation email ───────────────────────────────────
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Adresse e-mail invalide." },
        { status: 400 }
      );
    }

    // ── Enregistrement de l'email (idempotent) ────────────
    // NB : INSERT simple avec return 'minimal'. Un upsert avec on_conflict
    // exigerait des droits SELECT que la policy publique n'accorde pas (RLS,
    // 42501) — et on ne veut PAS exposer la liste des emails au public.
    // L'unicité (contrainte UNIQUE sur email) protège déjà : un doublon
    // renvoie 23505, traité comme un succès (déjà inscrit).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("notify_subscribers") as any).insert(
      { email },
      { return: "minimal" }
    );

    if (error && error.code !== "23505") {
      console.error("[notify] Erreur enregistrement :", error);
      return NextResponse.json(
        { success: false, error: "Erreur serveur." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
