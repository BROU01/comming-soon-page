/**
 * Script de setup — ESCEN Verification System
 *
 * Exécute le schéma SQL (supabase-schema.sql) sur la base Supabase :
 * - Crée les 4 tables (releves, verifications, admin_logs, rate_limits)
 * - Les types énumérés, index, triggers et RLS
 *
 * Connexion : utilise le pooler Supabase (IPv4) — le host direct db.<ref>
 * est en IPv6-only et souvent injoignable depuis Windows/CI.
 * La région AWS du pooler est détectée automatiquement.
 *
 * Usage :
 *   1. Configurer .env.local :
 *      - NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *      - SUPABASE_DB_PASSWORD=<mot de passe de la base>
 *      - (optionnel) SUPABASE_DB_URL=postgresql://...   # connection string du dashboard
 *      - (optionnel) SUPABASE_DB_HOST=aws-0-xxx.pooler.supabase.com
 *   2. npx tsx scripts/setup-db.ts
 */

import { Client, type ClientConfig } from "pg";
import { readFileSync } from "fs";
import { join } from "path";
import { loadEnv } from "./load-env";

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const dbPassword = process.env.SUPABASE_DB_PASSWORD || "";
const dbUrl = process.env.SUPABASE_DB_URL || "";
const dbHost = process.env.SUPABASE_DB_HOST || "";
const dbPort = Number(process.env.SUPABASE_DB_PORT || "5432");

// Extrait le project ref depuis l'URL (ex: https://xxxx.supabase.co)
const ref = supabaseUrl.replace(/^https?:\/\//, "").split(".")[0];

// Régions AWS les plus courantes pour les projets Supabase
const POOLER_REGIONS = [
  "us-east-1",
  "eu-west-3", // Paris
  "eu-central-1", // Francfort
  "eu-west-1", // Irlande
  "us-west-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "sa-east-1",
];

function sslConfig() {
  return { ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 };
}

/**
 * Teste la connexion à un pooler. Retourne :
 *  - "connected" si OK
 *  - "wrong-region" si le tenant n'est pas trouvé
 *  - "wrong-password" si le mot de passe est refusé
 *  - "unreachable" si le réseau échoue
 */
async function testPooler(
  host: string,
  port: number
): Promise<"connected" | "wrong-region" | "wrong-password" | "unreachable"> {
  const client = new Client({
    host,
    port,
    user: `postgres.${ref}`,
    password: dbPassword,
    database: "postgres",
    ...sslConfig(),
  });

  try {
    await client.connect();
    await client.query("SELECT 1");
    return "connected";
  } catch (err) {
    const msg = (err as Error).message;
    if (/tenant\/user.*not found|ENOTFOUND/i.test(msg)) return "wrong-region";
    if (/password authentication failed|28P01/i.test(msg)) return "wrong-password";
    return "unreachable";
  } finally {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}

// ─── Construction de la configuration de connexion ───────────
async function buildConfig(): Promise<ClientConfig> {
  // 1. URL de connexion complète fournie (recommandé)
  if (dbUrl) {
    return { connectionString: dbUrl, ...sslConfig() };
  }

  // 2. Pooler explicite
  if (dbHost) {
    return {
      host: dbHost,
      port: dbPort,
      user: `postgres.${ref}`,
      password: dbPassword,
      database: "postgres",
      ...sslConfig(),
    };
  }

  // 3. Détection automatique de la région
  console.log("   🔎 Détection de la région du pooler...");
  for (const region of POOLER_REGIONS) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const result = await testPooler(host, 5432);
    if (result === "connected") {
      console.log(`   ✅ Pooler trouvé : ${host}`);
      return {
        host,
        port: 5432,
        user: `postgres.${ref}`,
        password: dbPassword,
        database: "postgres",
        ...sslConfig(),
      };
    }
    if (result === "wrong-password") {
      console.error("\n❌ Mot de passe incorrect pour la région " + region + ".");
      console.error("   Vérifiez SUPABASE_DB_PASSWORD dans .env.local.");
      process.exit(1);
    }
    if (result === "unreachable") {
      console.log(`   ⏩ ${region} : pooler injoignable, essai suivant...`);
    } else {
      console.log(`   ⏩ ${region} : tenant non trouvé, essai suivant...`);
    }
  }

  console.error("\n❌ Impossible de trouver la région du pooler.");
  console.error("   Indiquez SUPABASE_DB_URL (Settings → Database → Connection string → URI)");
  console.error("   ou SUPABASE_DB_HOST dans .env.local.");
  process.exit(1);
}

if (!dbUrl && !dbHost && !dbPassword) {
  console.error("\n❌ Erreur : variables d'environnement manquantes !");
  console.error("   Assurez-vous que .env.local contient :");
  console.error("   SUPABASE_DB_PASSWORD=<mot de passe de la base>");
  console.error("   (ou SUPABASE_DB_URL=<connection string complète>)");
  process.exit(1);
}

async function main() {
  console.log("=".repeat(50));
  console.log("   ESCEN — Setup de la base de données");
  console.log("=".repeat(50));
  if (ref) console.log(`\n📌 Projet : ${ref}`);

  const config = await buildConfig();
  const client = new Client(config);

  try {
    await client.connect();
    console.log("   ✅ Connexion PostgreSQL établie (pooler).");

    const sql = readFileSync(join(__dirname, "..", "supabase-schema.sql"), "utf-8");
    console.log("   📄 Exécution du schéma...");

    await client.query(sql);

    console.log("   ✅ Schéma exécuté avec succès !");

    // ── Vérification des tables ──────────────────────────
    const { rows } = await client.query(
      `SELECT table_name
         FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name`
    );

    console.log("\n📋 Tables créées :");
    for (const r of rows) {
      console.log(`   ✅ ${r.table_name}`);
    }

    // ── Vérification des types enum ──────────────────────
    const enumCheck = await client.query(
      `SELECT typname FROM pg_type
        WHERE typname IN ('releve_status','verification_result','admin_role')
          AND typtype = 'e'`
    );
    if (enumCheck.rows.length > 0) {
      console.log("\n🔤 Types énumérés :");
      for (const r of enumCheck.rows) {
        console.log(`   ✅ ${r.typname}`);
      }
    }

    // ── Synchronisation du rôle admin (RLS is_admin()) ────
    console.log("\n👤 Synchronisation du rôle admin...");

    const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@escen.university";
    const adminRoleResult = await client.query(
      `INSERT INTO admin_roles (user_id, role)
       SELECT id, 'admin' FROM auth.users WHERE email = $1
       ON CONFLICT (user_id) DO NOTHING`,
      [adminEmail]
    );

    if (adminRoleResult.rowCount && adminRoleResult.rowCount > 0) {
      console.log(`   ✅ Rôle admin attribué à ${adminEmail} (admin_roles).`);
    } else {
      console.log(`   ⏩ ${adminEmail} : déjà admin ou compte inexistant (créé par le seed).`);
    }
  } catch (err) {
    console.error("\n❌ Erreur lors du setup :", (err as Error).message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }

  console.log("\n" + "=".repeat(50));
  console.log(process.exitCode ? "   ❌ SETUP ÉCHOUÉ" : "   ✅ SETUP TERMINÉ");
  console.log("=".repeat(50));
}

main().catch((err) => {
  console.error("\n❌ Erreur fatale :", err);
  process.exit(1);
});
