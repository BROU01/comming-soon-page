import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { ReleveStatus } from "@/lib/types/database";

/**
 * GET /api/admin/releves
 * Liste des relevés (protégé, admin uniquement).
 * Supporte la recherche par nom, étudiant ID, promo, et la pagination.
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("per_page") ?? "20", 10)));
    const offset = (page - 1) * perPage;

    let dbQuery = supabase
      .from("releves")
      .select("*", { count: "exact" });

    // Filtre par statut (valeur validée par la liste de statuts ci-dessus)
    const VALID_STATUSES: ReleveStatus[] = ["active", "cancelled", "replaced"];
    if (status && (VALID_STATUSES as string[]).includes(status)) {
      dbQuery = dbQuery.eq("status", status as ReleveStatus);
    }

    // Recherche textuelle
    if (query) {
      dbQuery = dbQuery.or(
        `student_name.ilike.%${query}%,student_id.ilike.%${query}%,promo.ilike.%${query}%`
      );
    }

    // Pagination
    const { data, error, count } = await dbQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Erreur lors de la récupération des relevés." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        per_page: perPage,
        total: count ?? 0,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/releves
 * Crée un nouveau relevé de notes (protégé, admin uniquement).
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json().catch(() => ({}));
    const {
      student_name,
      student_id,
      promo,
      notes_data,
      moyenne,
      mention,
    } = body;

    // Validation
    if (!student_name || !student_id) {
      return NextResponse.json(
        { success: false, error: "Nom étudiant et identifiant requis." },
        { status: 400 }
      );
    }

    // Créer le relevé
    const { data: releve, error } = await (supabase
      .from("releves") as any)
      .insert({
        student_name,
        student_id,
        promo: promo ?? "",
        notes_data: notes_data ?? [],
        moyenne: moyenne ?? 0,
        mention: mention ?? "",
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: "Erreur lors de la création du relevé." },
        { status: 500 }
      );
    }

    // Log l'action admin
    await (supabase.from("admin_logs") as any).insert({
      admin_id: user.id,
      admin_email: user.email ?? "",
      action: "create",
      target_releve_id: releve.id,
      details: { student_name, student_id },
    });

    return NextResponse.json({ success: true, data: releve }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
