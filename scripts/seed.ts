/**
 * Script de seed — ESCEN Verification System
 * 
 * Insère des données de test dans Supabase :
 * - 5 étudiants fictifs avec relevés de notes
 * - Un administrateur pour l'espace admin
 * - Quelques vérifications simulées
 *
 * Usage :
 *   1. Configurer .env.local avec les vraies clés Supabase
 *   2. Exécuter le schéma SQL dans l'éditeur Supabase
 *   3. npx tsx scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "./load-env";

// Charge .env.local (le script ne passe pas par Next.js)
loadEnv();

// ─── Configuration ──────────────────────────────────────────
// Lecture des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─── UUIDs déterministes pour les tests ─────────────────────
// Ces IDs peuvent être utilisés pour tester les URLs de vérification
const UUIDS = {
  DUPONT:    "a0000000-0000-4000-8000-000000000001",
  MARTIN:   "a0000000-0000-4000-8000-000000000002",
  LEFEVRE:  "a0000000-0000-4000-8000-000000000003",
  PETIT:    "a0000000-0000-4000-8000-000000000004",
  ROUSSEL:  "a0000000-0000-4000-8000-000000000005",
  BERNARD:  "a0000000-0000-4000-8000-000000000006",  // annulé
  ADMIN:    "b0000000-0000-4000-8000-000000000001",
};

// ─── Données des étudiants ──────────────────────────────────
interface SeedReleve {
  id: string;
  student_name: string;
  student_id: string;
  promo: string;
  notes_data: Array<{
    matiere: string;
    code: string;
    credit: number;
    note: number;
    mention?: string;
  }>;
  mention: string;
  moyenne: number;
  status: "active" | "cancelled" | "replaced";
}

const STUDENTS: SeedReleve[] = [
  {
    id: UUIDS.DUPONT,
    student_name: "Léa Dupont",
    student_id: "ESC2024001",
    promo: "Licence 3 — Commerce International",
    moyenne: 14.75,
    mention: "Bien",
    status: "active",
    notes_data: [
      { matiere: "Marketing Digital", code: "MKT301", credit: 6, note: 15.50 },
      { matiere: "Négociation Internationale", code: "NEG302", credit: 5, note: 14.00 },
      { matiere: "Anglais des Affaires", code: "ANG303", credit: 4, note: 16.00, mention: "TB" },
      { matiere: "Droit Commercial", code: "DRO304", credit: 4, note: 13.50 },
      { matiere: "Comptabilité", code: "CPA305", credit: 5, note: 12.00 },
      { matiere: "Gestion de Projet", code: "GES306", credit: 4, note: 16.50, mention: "TB" },
      { matiere: "Économie Européenne", code: "ECO307", credit: 3, note: 14.00 },
      { matiere: "Techniques de Vente", code: "VEN308", credit: 3, note: 15.00 },
    ],
  },
  {
    id: UUIDS.MARTIN,
    student_name: "Thomas Martin",
    student_id: "ESC2024002",
    promo: "Master 1 — Finance & Banque",
    moyenne: 16.25,
    mention: "Très bien",
    status: "active",
    notes_data: [
      { matiere: "Analyse Financière", code: "FIN401", credit: 6, note: 17.00, mention: "TB" },
      { matiere: "Marchés des Capitaux", code: "FIN402", credit: 5, note: 16.50, mention: "TB" },
      { matiere: "Gestion des Risques", code: "FIN403", credit: 5, note: 15.00 },
      { matiere: "Anglais Financier", code: "ANG404", credit: 3, note: 18.00, mention: "TB" },
      { matiere: "Éthique Bancaire", code: "ETH405", credit: 3, note: 14.00 },
      { matiere: "Mathématiques Financières", code: "MAT406", credit: 5, note: 16.00, mention: "B" },
      { matiere: "Droit des Sociétés", code: "DRO407", credit: 4, note: 17.50, mention: "TB" },
    ],
  },
  {
    id: UUIDS.LEFEVRE,
    student_name: "Camille Lefèvre",
    student_id: "ESC2024003",
    promo: "Bachelor 2 — Ressources Humaines",
    moyenne: 12.33,
    mention: "Assez bien",
    status: "active",
    notes_data: [
      { matiere: "Psychologie du Travail", code: "PSY201", credit: 5, note: 13.00 },
      { matiere: "Droit du Travail", code: "DRO202", credit: 5, note: 11.50 },
      { matiere: "Gestion des Talents", code: "RH203", credit: 4, note: 14.00 },
      { matiere: "Anglais Professionnel", code: "ANG204", credit: 3, note: 15.50, mention: "B" },
      { matiere: "Communication Interne", code: "COM205", credit: 4, note: 12.00 },
      { matiere: "Statistiques RH", code: "STA206", credit: 3, note: 10.00 },
      { matiere: "Séminaire Management", code: "SEM207", credit: 2, note: 16.00, mention: "TB" },
    ],
  },
  {
    id: UUIDS.PETIT,
    student_name: "Hugo Petit",
    student_id: "ESC2024004",
    promo: "Licence 3 — Économie Numérique",
    moyenne: 17.50,
    mention: "Très bien",
    status: "active",
    notes_data: [
      { matiere: "Data Science", code: "DS301", credit: 6, note: 18.00, mention: "TB" },
      { matiere: "Blockchain & Crypto", code: "BLC302", credit: 5, note: 17.00, mention: "TB" },
      { matiere: "Marketing Digital Avancé", code: "MKT303", credit: 5, note: 16.50, mention: "TB" },
      { matiere: "Anglais Technique", code: "ANG304", credit: 3, note: 19.00, mention: "TB" },
      { matiere: "Droit du Numérique", code: "DRO305", credit: 4, note: 15.00 },
      { matiere: "UI/UX Design", code: "UIX306", credit: 4, note: 18.50, mention: "TB" },
      { matiere: "Cybersécurité", code: "SEC307", credit: 3, note: 16.00, mention: "B" },
    ],
  },
  {
    id: UUIDS.ROUSSEL,
    student_name: "Sarah Roussel",
    student_id: "ESC2024005",
    promo: "Master 2 — Entrepreneuriat",
    moyenne: 13.80,
    mention: "Bien",
    status: "active",
    notes_data: [
      { matiere: "Business Model Innovation", code: "ENT501", credit: 6, note: 14.00 },
      { matiere: "Financement de Projets", code: "FIN502", credit: 5, note: 13.00 },
      { matiere: "Leadership", code: "LEA503", credit: 4, note: 15.00 },
      { matiere: "Anglais des Startups", code: "ANG504", credit: 3, note: 16.00, mention: "B" },
      { matiere: "Prototypage Rapide", code: "PRO505", credit: 4, note: 12.00 },
      { matiere: "Projet de Création", code: "CRA506", credit: 8, note: 14.50 },
      { matiere: "Pitch & Négociation", code: "PIT507", credit: 3, note: 15.50, mention: "B" },
    ],
  },
  // ── 6. Étudiant avec relevé annulé (pour tester le flux) ──
  {
    id: UUIDS.BERNARD,
    student_name: "Antoine Bernard",
    student_id: "ESC2024006",
    promo: "Licence 2 — Gestion",
    moyenne: 9.50,
    mention: "",
    status: "cancelled",
    notes_data: [
      { matiere: "Introduction à la Gestion", code: "GES101", credit: 5, note: 10.00 },
      { matiere: "Microéconomie", code: "ECO102", credit: 5, note: 8.50 },
      { matiere: "Anglais", code: "ANG103", credit: 3, note: 12.00 },
      { matiere: "Mathématiques", code: "MAT104", credit: 4, note: 7.50 },
      { matiere: "Comptabilité", code: "CPA105", credit: 5, note: 9.50 },
    ],
  },
];

// ─── Exemples de vérifications simulées ─────────────────────
interface SeedVerification {
  releve_id: string | null;
  ip_address: string;
  user_agent: string;
  result: "success" | "failed";
  error_type: string;
  timestamp: string;
}

function generateVerifications(): SeedVerification[] {
  const now = new Date();
  const verifications: SeedVerification[] = [];

  // 3 vérifications réussies pour Léa Dupont
  for (let i = 0; i < 3; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() - i * 2);
    verifications.push({
      releve_id: UUIDS.DUPONT,
      ip_address: "abc123def456...",
      user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
      result: "success",
      error_type: "",
      timestamp: date.toISOString(),
    });
  }

  // 1 vérification pour Thomas Martin
  verifications.push({
    releve_id: UUIDS.MARTIN,
    ip_address: "789ghi...",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
    result: "success",
    error_type: "",
    timestamp: new Date(now.getTime() - 3600000).toISOString(),
  });

  // 2 tentatives échouées : tentative sur ID inexistant
  verifications.push({
    releve_id: null,
    ip_address: "xyz789...",
    user_agent: "Mozilla/5.0 (Linux; Android 14) SamsungBrowser/22.0",
    result: "failed",
    error_type: "invalid_id",
    timestamp: new Date(now.getTime() - 1800000).toISOString(),
  });

  // 1 autre tentative sur ID inexistant
  verifications.push({
    releve_id: null,
    ip_address: "def456...",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    result: "failed",
    error_type: "invalid_id",
    timestamp: new Date(now.getTime() - 600000).toISOString(),
  });

  // 1 tentative sur relevé annulé (Antoine Bernard)
  // NB: pour le public, un relevé annulé renvoie "not_found" (anti-fraude),
  // donc le log enregistre error_type = "invalid_id" avec releve_id = null,
  // exactement comme le fait l'API réelle (la requête échoue, aucun relevé).
  verifications.push({
    releve_id: null,
    ip_address: "ghi789...",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0",
    result: "failed",
    error_type: "invalid_id",
    timestamp: new Date(now.getTime() - 300000).toISOString(),
  });

  return verifications;
}

// ─── Fonction principale ─────────────────────────────────────
async function seed() {
  console.log("=".repeat(50));
  console.log("   ESCEN — Script de Seed");
  console.log("   Insertion des données de test");
  console.log("=".repeat(50));

  // Vérifier les variables d'environnement
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("\n❌ Erreur : Variables d'environnement manquantes !");
    console.error("   Assurez-vous que .env.local contient :");
    console.error("   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co");
    console.error("   SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("\n📌 Connexion à Supabase établie.\n");

  // ── 1. Insérer les relevés ──────────────────────────────
  console.log("📄 Insertion des relevés de notes...");

  for (const student of STUDENTS) {
    // Vérifier si le relevé existe déjà
    const { data: existing } = await supabase
      .from("releves")
      .select("id")
      .eq("id", student.id)
      .maybeSingle();

    if (existing) {
      console.log(`   ⏩ ${student.student_name} — déjà existant (${student.id.slice(0, 8)}…)`);
      continue;
    }

    const { error } = await supabase.from("releves").insert({
      id: student.id,
      student_name: student.student_name,
      student_id: student.student_id,
      promo: student.promo,
      notes_data: student.notes_data,
      mention: student.mention,
      moyenne: student.moyenne,
      status: student.status,
      pdf_url: "",
    });

    if (error) {
      console.error(`   ❌ ${student.student_name} — Erreur : ${error.message}`);
    } else {
      console.log(`   ✅ ${student.student_name} — ${student.promo} (${student.moyenne}/20, ${student.mention})`);
      console.log(`      🔗 URL test : /verify/${student.id}`);
    }
  }

  // ── 2. Insérer les vérifications simulées ───────────────
  console.log("\n📜 Insertion des vérifications simulées...");

  const verifications = generateVerifications();
  let verifCount = 0;

  for (const v of verifications) {
    const { error } = await supabase.from("verifications").insert({
      releve_id: v.releve_id,
      ip_address: v.ip_address,
      user_agent: v.user_agent,
      result: v.result,
      error_type: v.error_type,
      timestamp: v.timestamp,
    });

    if (!error) verifCount++;
  }

  console.log(`   ✅ ${verifCount} vérifications insérées.`);

  // ── 3. Créer un administrateur ──────────────────────────
  console.log("\n👤 Création de l'administrateur...");

  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@escen.university";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "ESCEN2026!";

  const { data: existingAdmin } = await supabase.auth.admin.listUsers();
  const adminExists = existingAdmin?.users?.some((u) => u.email === adminEmail);

  let adminUserId: string | null = null;

  if (adminExists) {
    console.log(`   ⏩ ${adminEmail} — déjà existant.`);
    const found = existingAdmin?.users?.find((u) => u.email === adminEmail);
    adminUserId = found?.id ?? null;
  } else {
    const { data: newAdmin, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: "admin" },
    });

    if (adminError) {
      console.error(`   ❌ Erreur création admin : ${adminError.message}`);
    } else if (newAdmin?.user) {
      adminUserId = newAdmin.user.id;
      console.log(`   ✅ Administrateur créé : ${adminEmail}`);
      console.log(`      🔑 Mot de passe : ${adminPassword}`);
    }
  }

  // Lier le compte admin à la table admin_roles (utilisée par la RLS is_admin())
  if (adminUserId) {
    const { error: roleError } = await supabase.from("admin_roles").upsert(
      { user_id: adminUserId, role: "admin" },
      { onConflict: "user_id" }
    );
    if (roleError) {
      console.error(`   ❌ Erreur liaison admin_roles : ${roleError.message}`);
    } else {
      console.log(`   ✅ Rôle admin lié dans admin_roles (${adminEmail}).`);
    }
  }

  // ── 4. Résumé final ─────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log("   ✅ SEED TERMINÉ");
  console.log("=".repeat(50));
  console.log("\n📋 RÉSUMÉ :");
  console.log(`   📄 ${STUDENTS.length} relevés de notes`);
  console.log(`   📜 ${verifCount} vérifications simulées`);
  console.log(`   👤 Admin : ${adminEmail}`);
  console.log("\n🔗 LIENS DE TEST :");
  for (const s of STUDENTS) {
    console.log(`   • /verify/${s.id} — ${s.student_name} (${s.moyenne}/20)`);
  }
  console.log("\n🔐 ADMIN :");
  console.log(`   • /admin/login — ${adminEmail}`);
  console.log("\n💡 Conseil : Ouvrez ces URLs dans votre navigateur");
  console.log("   après avoir lancé `npm run dev`.");
}

seed().catch((err) => {
  console.error("\n❌ Erreur fatale :", err);
  process.exit(1);
});
