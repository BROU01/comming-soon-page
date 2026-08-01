"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse, DashboardStats, Verification } from "@/lib/types/database";

interface DashboardView extends DashboardStats {
  recentVerifications: Array<{
    id: string;
    result: string;
    timestamp: string;
    releves: { student_name: string } | null;
  }>;
}

interface VerifWithStudent extends Verification {
  releves: { student_name: string } | null;
}

/**
 * Tableau de bord administrateur /admin/dashboard
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Récupérer les stats via les API routes
        const [statsRes, recentRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/verifications?per_page=10"),
        ]);

        const statsData: ApiResponse<DashboardStats> = await statsRes.json();
        const recentData: ApiResponse<VerifWithStudent[]> = await recentRes.json();

        if (!statsData.success) {
          router.push("/admin/login");
          return;
        }

        setStats({
          activeReleves: statsData.data?.activeReleves ?? 0,
          cancelledReleves: statsData.data?.cancelledReleves ?? 0,
          totalVerifications: statsData.data?.totalVerifications ?? 0,
          todayVerifications: statsData.data?.todayVerifications ?? 0,
          recentVerifications: (recentData.data ?? []).map((v) => ({
            id: v.id,
            result: v.result,
            timestamp: v.timestamp,
            releves: v.releves ? { student_name: v.releves.student_name } : null,
          })),
        });
      } catch {
        // Erreur silencieuse
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-escen-cyan" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-escen-text-secondary">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-escen-navy mb-6">Tableau de bord</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Relevés actifs"
          value={stats?.activeReleves ?? 0}
          icon="📄"
          color="bg-green-50 border-green-200 text-green-700"
        />
        <StatCard
          label="Relevés annulés"
          value={stats?.cancelledReleves ?? 0}
          icon="⛔"
          color="bg-red-50 border-red-200 text-red-700"
        />
        <StatCard
          label="Vérifications totales"
          value={stats?.totalVerifications ?? 0}
          icon="✅"
          color="bg-escen-cyan-50 border-escen-cyan-100 text-escen-navy"
        />
        <StatCard
          label="Aujourd'hui"
          value={stats?.todayVerifications ?? 0}
          icon="📅"
          color="bg-blue-50 border-blue-200 text-blue-700"
        />
      </div>

      {/* Dernières vérifications */}
      <div className="bg-white border border-escen-border rounded-xl p-6">
        <h2 className="text-sm font-bold text-escen-navy mb-4">Dernières vérifications</h2>
        {stats?.recentVerifications && stats.recentVerifications.length > 0 ? (
          <div className="space-y-2">
            {stats.recentVerifications.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-escen-cyan-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={v.result === "success" ? "text-green-500" : "text-red-400"}>
                    {v.result === "success" ? "✅" : "❌"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-escen-navy">
                      {v.releves?.student_name ?? "Inconnu"}
                    </p>
                    <p className="text-xs text-escen-text-secondary">
                      {new Date(v.timestamp).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  v.result === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}>
                  {v.result === "success" ? "Succès" : "Échec"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-escen-text-secondary text-center py-4">
            Aucune vérification récente.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className={`border rounded-xl p-4 transition-transform duration-200 hover:scale-[1.02] ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}
