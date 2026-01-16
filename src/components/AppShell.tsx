import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const titles: Record<string, string> = {
  "/filial/dashboard": "Dashboard Filial",
  "/filial/prestacoes": "Minhas Prestações",
  "/filial/prestacoes/nova": "Nova Prestação",
  "/filial/prestacoes": "Minhas Prestações",
  "/sede/dashboard": "Dashboard Sede",
  "/sede/prestacoes": "Prestações de Contas",
  "/sede/relatorios": "Relatórios"
};

export function AppShell() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const title = useMemo(() => {
    const match = Object.keys(titles).find((path) => location.pathname.startsWith(path));
    return match ? titles[match] : "Prestação de Contas";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar title={title} />
          <main className="flex-1 p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full" />
                <div className="grid gap-4 md:grid-cols-3">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
