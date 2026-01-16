import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { LayoutGrid, FileText, BarChart3, ShieldCheck } from "lucide-react";

const navItems = {
  FILIAL: [
    { label: "Dashboard", to: "/filial/dashboard", icon: LayoutGrid },
    { label: "Prestações", to: "/filial/prestacoes", icon: FileText },
    { label: "Relatórios", to: "/sede/relatorios", icon: BarChart3, disabled: true },
    { label: "Auditoria", to: "/filial/auditoria", icon: ShieldCheck, disabled: true }
  ],
  SEDE: [
    { label: "Dashboard", to: "/sede/dashboard", icon: LayoutGrid },
    { label: "Prestações", to: "/sede/prestacoes", icon: FileText },
    { label: "Relatórios", to: "/sede/relatorios", icon: BarChart3 },
    { label: "Auditoria", to: "/sede/auditoria", icon: ShieldCheck, disabled: true }
  ]
};

export function Sidebar() {
  const role = useAuthStore((state) => state.role ?? "FILIAL");
  const items = navItems[role];

  return (
    <aside className="hidden w-64 flex-col border-r border-muted/60 bg-card/60 px-4 py-6 lg:flex">
      <div className="flex items-center gap-2 px-2 text-lg font-semibold">
        <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">MC</div>
        <span>Prestação</span>
      </div>
      <nav className="mt-8 flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                  item.disabled && "pointer-events-none opacity-50"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
