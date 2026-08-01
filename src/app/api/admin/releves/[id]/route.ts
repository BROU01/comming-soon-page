import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/releves/[id]
 * Détail d'un relevé (protégé, admin uniquement).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createAdminClient();

    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Workaround: cast pour contourner la limitation de typage Supabase SSR
    const relevesTable = supabase.from("releves") as any;

    const { data: releve, error } = await relevesTable
      .select("*")
      .eq("id", id)
      .single();

    if (error || !releve) {
      return NextResponse.json(
        { success: false, error: "Relevé introuvable." },
        { status: 404 }
      );
    }

    // Récupérer les vérifications pour ce relevé
    const verifTable = supabase.from("verifications") as any;
    const { data: verifications } = await verifTable
      .select("*")
      .eq("releve_id", id)
      .order("timestamp", { ascending: false })
      .limit(50);

    // Log l'action admin
    const adminLogs = supabase.from("admin_logs") as any;
    await adminLogs.insert({
      admin_id: user.id,
      admin_email: user.email ?? "",
      action: "view",
      target_releve_id: id,
      details: {},
    });

    return NextResponse.json({
      success: true,
      data: { releve, verifications: verifications ?? [] },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
