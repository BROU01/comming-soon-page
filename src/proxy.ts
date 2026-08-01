import { type NextRequest, NextResponse } from "next/server";
import { createProxyClient } from "@/lib/supabase/proxy";

/**
 * Proxy Next.js — Rafraîchit la session Supabase
 * et protège les routes admin.
 *
 * NB : dans Next.js 16, la convention `middleware` est dépréciée
 * au profit de `proxy` (même rôle, nouveau nom). Voir
 * node_modules/next/dist/docs/.../proxy.md.
 */
export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createProxyClient(request);

  // Rafraîchir la session (important !)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protéger les routes admin
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Appliquer à toutes les routes sauf statiques et API publiques
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/releve|api/verify|api/notify).*)",
  ],
};
