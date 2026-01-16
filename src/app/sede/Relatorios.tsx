import { useMemo } from "react";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, CartesianGrid, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCompetencia, formatCurrency, formatDate } from "@/lib/format";
import { useDataStore } from "@/stores/dataStore";
import { sumByMonth } from "@/lib/mockData";
import type { Prestacao } from "@/lib/types";

export function SedeRelatorios() {
  const prestacoes = useDataStore((state) => state.prestacoes);
  const filiais = useDataStore((state) => state.filiais);
  const filters = useDataStore((state) => state.filters);
  const setFilters = useDataStore((state) => state.setFilters);

  const competencias = useMemo(() => {
    const values = prestacoes.map((item) => item.competencia);
    return Array.from(new Set(values)).sort().reverse();
  }, [prestacoes]);

  const filtered = useMemo(() => {
    return prestacoes.filter((item) => {
      if (filters.competencia && item.competencia !== filters.competencia) return false;
      return true;
    });
  }, [prestacoes, filters.competencia]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, item) => {
        acc.totalOfertas += item.totalOfertas;
        acc.repasseSede += item.repasseSede;
        acc.retidoFilial += item.retidoFilial;
        return acc;
      },
      { totalOfertas: 0, repasseSede: 0, retidoFilial: 0 }
    );
  }, [filtered]);

  const dataByFilial = useMemo(() => {
    return filiais.map((filial) => {
      const items = filtered.filter((item) => item.filialId === filial.id);
      const total = items.reduce((acc, item) => acc + item.repasseSede, 0);
      return { name: filial.nome, total };
    });
  }, [filtered, filiais]);

  const repassePorMes = useMemo(() => {
    const totals = sumByMonth(prestacoes);
    return Object.entries(totals)
      .map(([competencia, total]) => ({ competencia: formatCompetencia(competencia), total }))
      .slice(-6);
  }, [prestacoes]);

  const columns = useMemo(
    () => [
      {
        header: "Filial",
        accessorKey: "filialNome"
      },
      {
        header: "Total Ofertas",
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
        header: "Última atualização",
        accessorKey: "criadoEm",
        cell: ({ row }: { row: { original: Prestacao } }) => formatDate(row.original.criadoEm)
      }
    ],
    []
  );

  const handleExportCsv = () => {
    const headers = ["Filial", "Competência", "Total Ofertas", "Repasse Sede", "Status"];
    const rows = filtered.map((item) => [
      item.filialNome,
      item.competencia,
      item.totalOfertas.toString(),
      item.repasseSede.toString(),
      item.status
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-prestacoes.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Relatórios</h2>
          <p className="text-sm text-muted-foreground">Consolide o repasse por filial e competência.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExportCsv}>Exportar CSV</Button>
          <Button variant="outline" onClick={() => toast("Em breve")}>Exportar PDF</Button>
        </div>
      </div>
      <Card className="border-muted/60">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Competência</span>
            <Select
              value={filters.competencia || ""}
              onValueChange={(value) => setFilters({ ...filters, competencia: value === "" ? "" : value })}
            >
              <SelectTrigger className="w-52">
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
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg border border-muted/60 px-3 py-2">
              <p className="text-muted-foreground">Total Ofertas</p>
              <p className="font-semibold">{formatCurrency(totals.totalOfertas)}</p>
            </div>
            <div className="rounded-lg border border-muted/60 px-3 py-2">
              <p className="text-muted-foreground">Repasse Sede</p>
              <p className="font-semibold">{formatCurrency(totals.repasseSede)}</p>
            </div>
            <div className="rounded-lg border border-muted/60 px-3 py-2">
              <p className="text-muted-foreground">Retido Filial</p>
              <p className="font-semibold">{formatCurrency(totals.retidoFilial)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <DataTable columns={columns} data={filtered} emptyLabel="Nenhum registro para o período selecionado." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle>Repasse por filial</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataByFilial}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle>Repasse por mês</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={repassePorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="competencia" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
