import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FiltersBar } from "@/components/FiltersBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCompetencia, formatCurrency } from "@/lib/format";
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

export function SedePrestacoes() {
  const navigate = useNavigate();
  const prestacoes = useDataStore((state) => state.prestacoes);
  const filiais = useDataStore((state) => state.filiais);
  const filters = useDataStore((state) => state.filters);
  const setFilters = useDataStore((state) => state.setFilters);

  const competencias = useMemo(() => {
    const values = prestacoes.map((item) => item.competencia);
    return Array.from(new Set(values)).sort().reverse();
  }, [prestacoes]);

  const filtered = useMemo(() => {
    return prestacoes
      .filter((item) => {
        if (filters.competencia && item.competencia !== filters.competencia) return false;
        if (filters.status && filters.status !== "TODOS" && item.status !== filters.status) return false;
        if (filters.filialId && filters.filialId !== "TODOS" && item.filialId !== filters.filialId) return false;
        return true;
      })
      .sort((a, b) => b.competencia.localeCompare(a.competencia));
  }, [prestacoes, filters]);

  const columns = useMemo(
    () => [
      {
        header: "Filial",
        accessorKey: "filialNome"
      },
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
        header: "Status",
        accessorKey: "status",
        cell: ({ row }: { row: { original: Prestacao } }) => <StatusBadge status={row.original.status} />
      },
      {
        header: "Ação",
        cell: ({ row }: { row: { original: Prestacao } }) => (
          <Button variant="link" onClick={() => navigate(`/sede/prestacoes/${row.original.id}`)}>
            Revisar
          </Button>
        )
      }
    ],
    [navigate]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Prestações recebidas</h2>
        <p className="text-sm text-muted-foreground">Filtre por filial, competência ou status.</p>
      </div>
      <FiltersBar>
        <div className="grid gap-3 md:grid-cols-3">
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
            <span className="text-xs font-semibold uppercase text-muted-foreground">Filial</span>
            <Select
              value={filters.filialId ?? "TODOS"}
              onValueChange={(value) => setFilters({ ...filters, filialId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas</SelectItem>
                {filiais.map((filial) => (
                  <SelectItem key={filial.id} value={filial.id}>
                    {filial.nome}
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
