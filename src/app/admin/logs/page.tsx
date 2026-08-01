"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import type { Verification, ApiResponse } from "@/lib/types/database";

interface VerificationWithStudent extends Verification {
  releves: { student_name: string; student_id: string } | null;
}

/**
 * Page d'historique des vérifications /admin/logs
 */
export default function AdminLogsPage() {
  const router = useRouter();
  const [verifications, setVerifications] = useState<VerificationWithStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 50;

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", String(perPage));
      if (resultFilter !== "all") params.set("result", resultFilter);

      const res = await fetch(`/api/admin/verifications?${params}`);
      const data: ApiResponse<VerificationWithStudent[]> = await res.json();

      if (data.success && data.data) {
        setVerifications(data.data);
        setTotal(data.pagination?.total ?? 0);
      }
    } catch {
      // Erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  }, [page, resultFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  async function handleExport() {
    try {
      const res = await fetch("/api/admin/verifications/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `verifications-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Erreur silencieuse
    }
  }

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (v: VerificationWithStudent) => (
        <span className="text-xs text-escen-text-secondary whitespace-nowrap">
          {new Date(v.timestamp).toLocaleString("fr-FR")}
        </span>
      ),
    },
    {
      key: "student",
      label: "Étudiant",
      render: (v: VerificationWithStudent) => (
        <span className="text-sm font-medium text-escen-navy">
          {v.releves?.student_name ?? "—"}
        </span>
      ),
    },
    {
      key: "result",
      label: "Résultat",
      render: (v: VerificationWithStudent) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
          v.result === "success"
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-600"
        }`}>
          {v.result === "success" ? "✅ Succès" : "❌ Échec"}
        </span>
      ),
    },
    {
      key: "error_type",
      label: "Type d'erreur",
      render: (v: VerificationWithStudent) => (
        <span className="text-xs text-escen-text-secondary">
          {v.error_type || "—"}
        </span>
      ),
    },
    {
      key: "ip",
      label: "IP (hashée)",
      render: (v: VerificationWithStudent) => (
        <span className="text-xs font-mono text-escen-text-secondary">
          {v.ip_address.slice(0, 12)}...
        </span>
      ),
    },
  ];

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-escen-navy">
          Historique des vérifications
        </h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm font-semibold text-escen-navy bg-white border border-escen-border rounded-xl hover:border-escen-cyan hover:text-escen-cyan transition-all duration-160 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6">
        <select
          value={resultFilter}
          onChange={(e) => {
            setResultFilter(e.target.value);
            setPage(1);
          }}
          className="h-[44px] px-4 text-sm bg-white border border-escen-border rounded-xl outline-none focus:border-escen-cyan"
        >
          <option value="all">Tous les résultats</option>
          <option value="success">Succès uniquement</option>
          <option value="failed">Échecs uniquement</option>
        </select>

        <p className="text-xs text-escen-text-secondary self-center ml-auto">
          {total} vérification{total > 1 ? "s" : ""}
        </p>
      </div>

      {/* Tableau */}
      <DataTable
        columns={columns}
        data={verifications}
        keyExtractor={(v) => v.id}
        isLoading={isLoading}
        emptyMessage="Aucune vérification enregistrée."
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm font-medium text-escen-navy bg-white border border-escen-border rounded-lg hover:border-escen-cyan disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Précédent
          </button>
          <span className="text-sm text-escen-text-secondary">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm font-medium text-escen-navy bg-white border border-escen-border rounded-lg hover:border-escen-cyan disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
