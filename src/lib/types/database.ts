/* ============================================================
   Types ESCEN — Modèle de Données
   ============================================================ */

// ─── Statuts ───────────────────────────────────────────────
export type ReleveStatus = "active" | "cancelled" | "replaced";
export type VerificationResult = "success" | "failed";
export type AdminRole = "admin" | "gestionnaire";

// ─── Note individuelle ──────────────────────────────────────
// NB: type alias et non interface — les interfaces n'ont pas d'index
// signature implicite, or postgrest-js v2.111 exige Row/Insert/Update
// assignables à Record<string, unknown> (GenericTable / GenericSchema).
export type ReleveNote = {
  matiere: string;
  code: string;
  credit: number;
  note: number;
  mention?: string;
};

// ─── Relevé de notes ────────────────────────────────────────
export type Releve = {
  id: string;
  student_name: string;
  student_id: string;
  promo: string;
  notes_data: ReleveNote[];
  mention: string;
  moyenne: number;
  pdf_url: string;
  status: ReleveStatus;
  created_at: string;
  updated_at: string;
  replaced_by: string | null;
};

// ─── Vérification ───────────────────────────────────────────
export type Verification = {
  id: string;
  releve_id: string | null;
  attempted_id: string;
  ip_address: string;
  user_agent: string;
  result: VerificationResult;
  error_type: string;
  timestamp: string;
};

// ─── Log administrateur ──────────────────────────────────────
export type AdminLog = {
  id: string;
  admin_id: string | null;
  admin_email: string;
  action: string;
  target_releve_id: string | null;
  details: Record<string, unknown>;
  timestamp: string;
};

// ─── Rôle administrateur (RLS is_admin) ──────────────────────
export type AdminRoleRow = {
  user_id: string;
  role: AdminRole;
  created_at: string;
};

// ─── Rate Limiting ──────────────────────────────────────────
export type RateLimit = {
  id: string;
  ip_address: string;
  endpoint: string;
  attempt_count: number;
  window_start: string;
  blocked_until: string | null;
};

// ─── Alerte anti-fraude ──────────────────────────────────────
export type FraudAlert = {
  id: string;
  identifier: string;
  attempt_count: number;
  ip_address: string;
  alerted_at: string;
};

// ─── Supabase Database type ──────────────────────────────────
export interface Database {
  public: {
    Tables: {
      releves: {
        Row: Releve;
        Insert: Omit<Releve, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Releve, "id">>;
        Relationships: [];
      };
      verifications: {
        Row: Verification;
        Insert: Omit<Verification, "id" | "timestamp">;
        Update: Partial<Omit<Verification, "id">>;
        Relationships: [];
      };
      admin_logs: {
        Row: AdminLog;
        Insert: Omit<AdminLog, "id" | "timestamp">;
        Update: Partial<Omit<AdminLog, "id">>;
        Relationships: [];
      };
      admin_roles: {
        Row: AdminRoleRow;
        Insert: Pick<AdminRoleRow, "user_id" | "role">;
        Update: Partial<Pick<AdminRoleRow, "role">>;
        Relationships: [];
      };
      rate_limits: {
        Row: RateLimit;
        Insert: Omit<RateLimit, "id">;
        Update: Partial<Omit<RateLimit, "id">>;
        Relationships: [];
      };
      fraud_alerts: {
        Row: FraudAlert;
        Insert: Omit<FraudAlert, "id" | "alerted_at">;
        Update: Partial<Omit<FraudAlert, "id">>;
        Relationships: [];
      };
    };
    // NB: l'overload Views de from() est déclarée après celle de Tables,
    // donc un Record<string, never> ne piège pas les noms de tables.
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

// ─── Locale ─────────────────────────────────────────────────

export type Locale = "fr" | "en";

// ─── Types API ───────────────────────────────────────────────

// Réponse de vérification (page publique)
export interface VerifyResponse {
  success: boolean;
  data?: {
    releve: Releve;
  };
  error?: {
    // NB: un relevé annulé renvoie "not_found" (anti-fraude : indistinguable
    // d'un identifiant inconnu pour le public).
    code: "not_found" | "rate_limited" | "server_error";
    message: string;
  };
}

// Réponse API générique
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
  };
}

// Statistiques du tableau de bord
export interface DashboardStats {
  activeReleves: number;
  cancelledReleves: number;
  totalVerifications: number;
  todayVerifications: number;
}

// Session admin
export interface AdminSession {
  id: string;
  email: string;
  role: AdminRole;
}
