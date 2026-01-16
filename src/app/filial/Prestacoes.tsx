import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { FiltersBar } from "@/components/FiltersBar";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCompetencia, formatCurrency } from "@/lib/format";
import { useAuthStore } from "@/stores/authStore";
import { useDataStore } from "@/stores/dataStore";
import type { Prestacao, Status } from "@/lib/types";

const statusOptions: (Status | "TODOS")[] = [
  "TODOS",
  "RASCUNHO",
  "ENVIADO",
  "APROVADO",
  "REJEITADO",
  "PAGO",
  "CONCILIADO"
];

export function FilialPrestacoes() {
  const navigate = useNavigate();
  const filialId = useAuthStore((state) => state.filialId ?? "filial-1");
  const prestacoes = useDataStore((state) => state.prestacoes);
  const filters = useDataStore((state) => state.filters);
  const setFilters = useDataStore((state) => state.setFilters);

  const competencias = useMemo(() => {
    const values = prestacoes.map((item) => item.competencia);
    return Array.from(new Set(values)).sort().reverse();
  }, [prestacoes]);

  const filtered = useMemo(() => {
    return prestacoes
      .filter((item) => {
        if (item.filialId !== filialId) return false;
        if (filters.competencia && item.competencia !== filters.competencia) return false;
        if (filters.status && filters.status !== "TODOS" && item.status !== filters.status) return false;
        return true;
      })
      .sort((a, b) => b.competencia.localeCompare(a.competencia));
  }, [prestacoes, filialId, filters]);

  const columns = useMemo(
    () => [
      {
        header: "Competência",
        accessorKey: "competencia",
        cell: ({ row }: { row: { original: Prestacao } }) => formatCompetencia(row.original.competencia)
      },
      {
        header: "Total",
        accessorKey: "totalOfertas",
        cell: ({ row }: { row: { original: Prestacao } }) => formatCurrency(row.original.totalOfertas)
      },
      {
        header: "Repasse Sede",
        accessorKey: "repasseSede",
        cell: ({ row }: { row: { original: Prestacao } }) => formatCurrency(row.original.repasseSede)
      },
      {
        header: "Retido Filial",
        accessorKey: "retidoFilial",
        cell: ({ row }: { row: { original: Prestacao } }) => formatCurrency(row.original.retidoFilial)
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }: { row: { original: Prestacao } }) => <StatusBadge status={row.original.status} />
      },
      {
        header: "Ação",
        cell: ({ row }: { row: { original: Prestacao } }) => (
          <Button variant="link" onClick={() => navigate(`/filial/prestacoes/${row.original.id}`)}>
            Ver
          </Button>
        )
      }
    ],
    [navigate]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Prestações enviadas</h2>
          <p className="text-sm text-muted-foreground">Filtre por competência e status.</p>
        </div>
        <Button onClick={() => navigate("/filial/prestacoes/nova")}>Nova Prestação</Button>
      </div>
      <FiltersBar>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Competência</span>
            <Select
              value={filters.competencia || ""}
              onValueChange={(value) => setFilters({ ...filters, competencia: value === "" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {competencias.map((competencia) => (
                  <SelectItem key={competencia} value={competencia}>
                    {formatCompetencia(competencia)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Status</span>
            <Select
              value={filters.status ?? "TODOS"}
              onValueChange={(value) => setFilters({ ...filters, status: value as Status })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FiltersBar>
      <DataTable columns={columns} data={filtered} emptyLabel="Nenhuma prestação encontrada." />
    </div>
  );
}
