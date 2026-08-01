"use client";

interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

/**
 * Tableau de données réutilisable pour l'espace admin.
 * Supporte le tri, le chargement, et les lignes cliquables.
 */
export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading,
  emptyMessage = "Aucune donnée.",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white border border-escen-border rounded-xl p-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-escen-cyan" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-escen-text-secondary">Chargement...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-escen-border rounded-xl p-8 text-center">
        <p className="text-sm text-escen-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-escen-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-escen-border bg-escen-bg">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left py-3 px-4 text-[0.65rem] font-semibold uppercase tracking-wider text-escen-text-secondary ${col.className ?? ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`
                  border-b border-escen-border/50 last:border-b-0
                  ${onRowClick ? "cursor-pointer hover:bg-escen-cyan-50/50" : ""}
                  transition-colors duration-100
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 px-4 ${col.className ?? ""}`}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
