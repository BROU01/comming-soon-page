import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { startOfTodayParis } from "@/lib/dates";

/**
 * GET /api/admin/stats
 * Statistiques pour le tableau de bord (protégé, admin uniquement) :
 * - Relevés actifs / annulés
 * - Vérifications totales / aujourd'hui (fuseau Europe/Paris)
 */
export async function GET() {
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

    const relevesTable = supabase.from("releves") as any;
    const verifTable = supabase.from("verifications") as any;

    // Début de la journée en Europe/Paris
    const todayStart = startOfTodayParis();

    const [activeReleves, cancelledReleves, totalVerifications, todayVerifications] =
      await Promise.all([
        relevesTable
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        relevesTable
          .select("*", { count: "exact", head: true })
          .eq("status", "cancelled"),
        verifTable.select("*", { count: "exact", head: true }),
        verifTable
          .select("*", { count: "exact", head: true })
          .gte("timestamp", todayStart.toISOString()),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        activeReleves: activeReleves.count ?? 0,
        cancelledReleves: cancelledReleves.count ?? 0,
        totalVerifications: totalVerifications.count ?? 0,
        todayVerifications: todayVerifications.count ?? 0,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
