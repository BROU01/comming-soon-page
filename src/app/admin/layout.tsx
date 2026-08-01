import AdminSidebar from "@/components/admin/AdminSidebar";

/**
 * Layout pour toutes les pages d'administration.
 * Inclut la barre latérale de navigation.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex">
      <AdminSidebar />
      <main className="flex-1 bg-escen-bg min-h-dvh md:ml-0 ml-0">
        <div className="p-4 md:p-6 lg:p-8 pt-16 md:pt-6 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
