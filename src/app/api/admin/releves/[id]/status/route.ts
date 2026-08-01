import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * PUT /api/admin/releves/[id]/status
 * Met à jour le statut d'un relevé (annuler, remplacer).
 * Protégé, admin uniquement.
 */
export async function PUT(
  request: Request,
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
    const body = await request.json().catch(() => ({}));
    const { status, replaced_by } = body as {
      status?: "cancelled" | "replaced" | "active";
      replaced_by?: string;
    };

    if (!status || !["cancelled", "replaced", "active"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Statut invalide." },
        { status: 400 }
      );
    }

    // Vérifier que le relevé existe
    const { data: existing } = await (supabase
      .from("releves")
      .select("id, status")
      .eq("id", id)
      .single() as any);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Relevé introuvable." },
        { status: 404 }
      );
    }

    // Mettre à jour le statut
    const relevesTable = supabase.from("releves") as any;
    const { data: updated, error } = await relevesTable
      .update({
        status,
        ...(status === "replaced" && replaced_by ? { replaced_by } : {}),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: "Erreur lors de la mise à jour." },
        { status: 500 }
      );
    }

    // Log l'action admin
    await (supabase.from("admin_logs") as any).insert({
      admin_id: user.id,
      admin_email: user.email ?? "",
      action: status === "cancelled" ? "cancel" : "replace",
      target_releve_id: id,
      details: { previous_status: existing.status, new_status: status, replaced_by },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
