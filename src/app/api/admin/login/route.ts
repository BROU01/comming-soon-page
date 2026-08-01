import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/login
 * Authentifie un administrateur via Supabase Auth.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { success: false, error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        session: data.session,
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
 * POST /api/admin/logout
 * Déconnecte l'utilisateur.
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
