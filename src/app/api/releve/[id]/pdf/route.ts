import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRelevePDF } from "@/lib/pdf";

/**
 * GET /api/releve/[id]/pdf
 * Génère le PDF officiel du relevé de notes (avec QR Code intégré).
 * Accessible publiquement pour un relevé actif (RLS), sans session.
 * Nom du fichier basé sur le n° étudiant pour un audit facile.
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
    const relevesTable = supabase.from("releves") as any;
    const { data: releve, error } = await relevesTable
      .select("*")
      .eq("id", id)
      .maybeSingle();

    // RLS : un relevé annulé/remplacé n'est pas visible → not_found (anti-fraude)
    if (error || !releve) {
      return NextResponse.json(
        { success: false, error: { code: "not_found", message: "" } },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateRelevePDF(releve);
    const safeId = (releve.student_id || "releve").replace(/[^a-zA-Z0-9_-]/g, "");

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="releve-${safeId}.pdf"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "server_error", message: "" } },
      { status: 500 }
    );
  }
}
