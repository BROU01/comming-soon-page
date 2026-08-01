import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/releve/[id]
 * Récupère un relevé de notes par son identifiant unique.
 * Accessible publiquement (uniquement si actif).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id.length < 8) {
      return NextResponse.json(
        { success: false, error: { code: "not_found", message: "" } },
        { status: 404 }
      );
    }

    const supabase = await createClient();

    // Workaround: cast pour contourner la limitation de typage Supabase SSR
    const relevesTable = supabase.from("releves") as any;
    const { data, error } = await relevesTable
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: { code: "not_found", message: "" } },
        { status: 404 }
      );
    }

    // NB: la RLS masque déjà les relevés annulés/remplacés au public.
    // Le cas "cancelled" est donc inatteignable ici (anti-fraude :
    // un relevé annulé est indistinguable d'un identifiant inconnu).

    return NextResponse.json({ success: true, data: { releve: data } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "server_error", message: "" } },
      { status: 500 }
    );
  }
}
