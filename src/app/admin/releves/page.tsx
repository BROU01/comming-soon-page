"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import CreateReleveForm from "@/components/admin/CreateReleveForm";
import type { Releve, ApiResponse } from "@/lib/types/database";

/**
 * Page de gestion des relevés /admin/releves
 * Liste, recherche, et création de relevés.
 */
export default function AdminRelevesPage() {
  const router = useRouter();
  const [releves, setReleves] = useState<Releve[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createdReleve, setCreatedReleve] = useState<Releve | null>(null);

  const loadReleves = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }

      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("per_page", "50");

      const res = await fetch(`/api/admin/releves?${params}`);
      const data: ApiResponse<Releve[]> = await res.json();

      if (data.success && data.data) {
        setReleves(data.data);
      }
    } catch {
      // Erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, router]);

  useEffect(() => {
    loadReleves();
  }, [loadReleves]);

  const columns = [
    {
      key: "student_name",
      label: "Étudiant",
      render: (r: Releve) => (
        <span className="font-medium text-escen-navy">{r.student_name}</span>
      ),
    },
    {
      key: "student_id",
      label: "ID",
      render: (r: Releve) => (
        <span className="text-xs font-mono text-escen-text-secondary">{r.student_id}</span>
      ),
    },
    {
      key: "promo",
      label: "Promotion",
      render: (r: Releve) => (
        <span className="text-sm text-escen-text">{r.promo}</span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (r: Releve) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
          r.status === "active"
            ? "bg-green-50 text-green-700"
            : r.status === "cancelled"
              ? "bg-red-50 text-red-600"
              : "bg-yellow-50 text-yellow-700"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            r.status === "active" ? "bg-green-500" : r.status === "cancelled" ? "bg-red-500" : "bg-yellow-500"
          }`} />
          {r.status === "active" ? "Actif" : r.status === "cancelled" ? "Annulé" : "Remplacé"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Créé le",
      render: (r: Releve) => (
        <span className="text-xs text-escen-text-secondary">
          {new Date(r.created_at).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-escen-navy">Relevés de notes</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 text-sm font-semibold text-white bg-escen-navy rounded-xl hover:bg-escen-navy-500 transition-all duration-160"
        >
          {showCreateForm ? "Fermer" : "+ Nouveau relevé"}
        </button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <CreateReleveForm
          onCreated={(releve) => {
            setCreatedReleve(releve);
            setShowCreateForm(false);
            loadReleves();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Confirmation de création avec QR Code */}
      {createdReleve && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-white p-2 rounded-xl border border-green-200 shadow-sm">
            {/* QR Code généré automatiquement à la création */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/releve/${createdReleve.id}/qrcode`}
              alt="QR Code du relevé"
              width={120}
              height={120}
              className="w-[120px] h-[120px]"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-green-700 mb-1">
              ✅ Relevé créé — {createdReleve.student_name}
            </p>
            <p className="text-xs text-green-700/80 mb-3 break-all">
              {typeof window !== "undefined"
                ? `${window.location.origin}/verify/${createdReleve.id}`
                : `/verify/${createdReleve.id}`}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <a
                href={`/api/releve/${createdReleve.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
              >
                📄 Télécharger le PDF officiel
              </a>
              <a
                href={`/verify/${createdReleve.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-semibold text-green-700 bg-white border border-green-300 rounded-xl hover:bg-green-50 transition-colors"
              >
                🔗 Page de vérification
              </a>
              <button
                onClick={() => setCreatedReleve(null)}
                className="px-4 py-2 text-xs font-semibold text-green-700/70 hover:text-green-800 transition-colors"
              >
                ✕ Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, identifiant, promotion..."
            className="w-full h-[44px] px-4 text-sm bg-white border border-escen-border rounded-xl outline-none focus:border-escen-cyan focus:ring-1 focus:ring-escen-cyan/30 placeholder:text-escen-text-secondary/60"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-[44px] px-4 text-sm bg-white border border-escen-border rounded-xl outline-none focus:border-escen-cyan"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="cancelled">Annulés</option>
          <option value="replaced">Remplacés</option>
        </select>
      </div>

      {/* Tableau */}
      <DataTable
        columns={columns}
        data={releves}
        keyExtractor={(r) => r.id}
        onRowClick={(r) => router.push(`/admin/releves/${r.id}`)}
        isLoading={isLoading}
        emptyMessage="Aucun relevé trouvé."
      />
    </div>
  );
}
