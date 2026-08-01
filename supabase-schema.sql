/* ============================================================
   ESCEN — Schéma de la base de données
   Système de vérification de relevés de notes par QR Code
   Supabase / PostgreSQL

   ⚠️ IDEMPOTENT : ce script peut être relancé plusieurs fois
   sans erreur (CREATE ... IF NOT EXISTS, DROP POLICY + CREATE).
   ============================================================ */

-- ─── Enable required extensions ────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";      -- pour gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ─── Types énumérés (idempotent) ───────────────────────────
DO $$ BEGIN
  CREATE TYPE releve_status AS ENUM ('active', 'cancelled', 'replaced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_result AS ENUM ('success', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('admin', 'gestionnaire');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Table : relevés de notes ─────────────────────────────
CREATE TABLE IF NOT EXISTS releves (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name  TEXT NOT NULL,
  student_id    TEXT NOT NULL UNIQUE,          -- numéro étudiant interne
  promo         TEXT NOT NULL DEFAULT '',      -- ex: "Licence 3 2025-2026"
  notes_data    JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{matiere, note, credit, mention}]
  mention       TEXT DEFAULT '',               -- mention obtenue
  moyenne       NUMERIC(4,2) DEFAULT 0,        -- moyenne générale
  pdf_url       TEXT DEFAULT '',
  status        releve_status NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  replaced_by   UUID DEFAULT NULL              -- si remplacé, lien vers le nouveau
);

-- Compatibilité : la table releves peut exister sans la colonne replaced_by
-- (créée avant la fonctionnalité remplacement). Même pattern idempotent que
-- attempted_id ci-dessous.
ALTER TABLE releves ADD COLUMN IF NOT EXISTS replaced_by UUID DEFAULT NULL;

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_releves_student_name ON releves USING gin (to_tsvector('french', student_name));
CREATE INDEX IF NOT EXISTS idx_releves_student_id ON releves (student_id);
CREATE INDEX IF NOT EXISTS idx_releves_status ON releves (status);
CREATE INDEX IF NOT EXISTS idx_releves_created_at ON releves (created_at DESC);

-- ─── Table : vérifications (traçabilité) ─────────────────────
CREATE TABLE IF NOT EXISTS verifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  releve_id     UUID REFERENCES releves(id) ON DELETE SET NULL,
  attempted_id  TEXT DEFAULT '',               -- identifiant saisi (utile pour détecter la fraude)
  ip_address    TEXT NOT NULL DEFAULT '',      -- hashée (RGPD)
  user_agent    TEXT NOT NULL DEFAULT '',
  result        verification_result NOT NULL,
  error_type    TEXT DEFAULT '',               -- 'invalid_id', 'cancelled', 'rate_limited'
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compatibilité : la table verifications peut exister sans la colonne
-- attempted_id (créée avant la version anti-fraude). CREATE TABLE IF NOT
-- EXISTS ne modifie pas une table existante → on ajoute la colonne en
-- idempotent (ne fait rien si elle existe déjà).
ALTER TABLE verifications ADD COLUMN IF NOT EXISTS attempted_id TEXT DEFAULT '';

-- Index pour requêtes d'audit
CREATE INDEX IF NOT EXISTS idx_verifications_releve_id ON verifications (releve_id);
CREATE INDEX IF NOT EXISTS idx_verifications_timestamp ON verifications (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_verifications_result ON verifications (result);
CREATE INDEX IF NOT EXISTS idx_verifications_attempted_id ON verifications (attempted_id);

-- ─── Table : logs administrateur ──────────────────────────────
CREATE TABLE IF NOT EXISTS admin_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email     TEXT NOT NULL DEFAULT '',
  action          TEXT NOT NULL,              -- 'view', 'create', 'cancel', 'replace', 'export'
  target_releve_id UUID REFERENCES releves(id) ON DELETE SET NULL,
  details         JSONB DEFAULT '{}'::jsonb,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs (action);

-- ─── Table : alertes anti-fraude ──────────────────────────────
-- Enregistre le déclenchement des alertes email par identifiant visé,
-- pour éviter d'envoyer un email à chaque tentative (cooldown 24h).
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier     TEXT NOT NULL,               -- identifiant de relevé visé
  attempt_count  INTEGER NOT NULL DEFAULT 1,  -- tentatives à l'instant de l'alerte
  ip_address     TEXT NOT NULL DEFAULT '',    -- hashée (RGPD)
  alerted_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_alerts_identifier ON fraud_alerts (identifier);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_alerted_at ON fraud_alerts (alerted_at DESC);

-- ─── Table : rate limiting (anti-brute-force) ────────────────
CREATE TABLE IF NOT EXISTS rate_limits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address    TEXT NOT NULL,
  endpoint      TEXT NOT NULL DEFAULT '/api/verify',
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits (ip_address, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON rate_limits (blocked_until)
  WHERE blocked_until IS NOT NULL;

-- ─── Table : rôles administrateurs ───────────────────────────
-- Référence qui utilisateur Supabase a quel rôle.
-- Uniquement accessible via is_admin() (SECURITY DEFINER) ou la clé service role.
CREATE TABLE IF NOT EXISTS admin_roles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       admin_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Fonction : mise à jour automatique de updated_at ───────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_releves_updated_at ON releves;
CREATE TRIGGER trg_releves_updated_at
  BEFORE UPDATE ON releves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── Fonction : est-ce un administrateur ? ───────────────────
-- SECURITY DEFINER (exécutée comme postgres) pour contourner la RLS
-- de admin_roles et lire la table en toute sécurité.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()
  );
$$;

-- ─── Row Level Security (RLS) ──────────────────────────────
ALTER TABLE releves ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- RLS : rate limiting — le client public doit pouvoir lire/écrire
-- (les IP sont hachées, pas de donnée personnelle exposée)
DROP POLICY IF EXISTS "rate_limits_select_public" ON rate_limits;
CREATE POLICY "rate_limits_select_public" ON rate_limits
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "rate_limits_insert_public" ON rate_limits;
CREATE POLICY "rate_limits_insert_public" ON rate_limits
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "rate_limits_update_public" ON rate_limits;
CREATE POLICY "rate_limits_update_public" ON rate_limits
  FOR UPDATE
  USING (true);

-- RLS : les relevés actifs sont lisibles par tout le monde (public)
DROP POLICY IF EXISTS "releves_select_active" ON releves;
CREATE POLICY "releves_select_active" ON releves
  FOR SELECT
  USING (status = 'active');

-- RLS : SEULS les administrateurs (table admin_roles) voient tout
DROP POLICY IF EXISTS "releves_select_admin" ON releves;
CREATE POLICY "releves_select_admin" ON releves
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "releves_insert_admin" ON releves;
CREATE POLICY "releves_insert_admin" ON releves
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "releves_update_admin" ON releves;
CREATE POLICY "releves_update_admin" ON releves
  FOR UPDATE
  USING (public.is_admin());

-- RLS : les vérifications sont insérables par le public (traçabilité)
DROP POLICY IF EXISTS "verifications_insert_public" ON verifications;
CREATE POLICY "verifications_insert_public" ON verifications
  FOR INSERT
  WITH CHECK (true);

-- RLS : fraud_alerts — la détection s'exécute avec le client service role
-- (contourne RLS) ; aucune policy publique nécessaire. Lisibles par les
-- admins uniquement.
DROP POLICY IF EXISTS "fraud_alerts_select_admin" ON fraud_alerts;
CREATE POLICY "fraud_alerts_select_admin" ON fraud_alerts
  FOR SELECT
  USING (public.is_admin());

-- RLS : seuls les admins lisent l'historique des vérifications
DROP POLICY IF EXISTS "verifications_select_admin" ON verifications;
CREATE POLICY "verifications_select_admin" ON verifications
  FOR SELECT
  USING (public.is_admin());

-- RLS : logs admin réservés aux admins
DROP POLICY IF EXISTS "admin_logs_select_admin" ON admin_logs;
CREATE POLICY "admin_logs_select_admin" ON admin_logs
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_logs_insert_admin" ON admin_logs;
CREATE POLICY "admin_logs_insert_admin" ON admin_logs
  FOR INSERT
  WITH CHECK (public.is_admin());

-- admin_roles : AUCUNE policy publique — accessible uniquement via
-- la fonction is_admin() (SECURITY DEFINER) ou la clé service role.

-- ─── Nettoyage automatique (cron Supabase) ────────────────────
-- Décision actée : l'historique des vérifications est conservé 5 ans
-- puis purgé automatiquement (conformité RGPD). Les rate_limits sont
-- nettoyées après 24 h.
--
-- NB : nécessite l'extension pg_cron (Dashboard Supabase → Database →
-- Extensions → pg_cron). Le DO block est idempotent et ne crée les jobs
-- que si l'extension est disponible ; sans elle, rien ne casse.
DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Purge RGPD : supprime les vérifications de plus de 5 ans (hebdo, lundi 03:00)
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-verifications-5y') THEN
      PERFORM cron.unschedule('purge-verifications-5y');
    END IF;
    PERFORM cron.schedule('purge-verifications-5y', '0 3 * * 1',
      $job$DELETE FROM verifications WHERE timestamp < now() - interval '5 years'$job$);

    -- Nettoyage des rate_limits toutes les heures (24 h de données max)
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-rate-limits') THEN
      PERFORM cron.unschedule('cleanup-rate-limits');
    END IF;
    PERFORM cron.schedule('cleanup-rate-limits', '0 * * * *',
      $job$DELETE FROM rate_limits WHERE window_start < now() - interval '24 hours'$job$);
  END IF;
END $cron$;
