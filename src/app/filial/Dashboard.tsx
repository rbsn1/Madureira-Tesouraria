import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, CartesianGrid, Tooltip, XAxis, ResponsiveContainer } from "recharts";
import { FilePlus, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatCompetencia } from "@/lib/format";
import { useAuthStore } from "@/stores/authStore";
import { useDataStore } from "@/stores/dataStore";
import type { Prestacao } from "@/lib/types";

export function FilialDashboard() {
  const navigate = useNavigate();
  const filialId = useAuthStore((state) => state.filialId ?? "filial-1");
  const prestacoes = useDataStore((state) => state.prestacoes);

  const filialPrestacoes = useMemo(() => {
    return prestacoes
      .filter((item) => item.filialId === filialId)
      .sort((a, b) => b.competencia.localeCompare(a.competencia));
  }, [prestacoes, filialId]);

  const latest = filialPrestacoes.slice(0, 5);

  const stats = useMemo(() => {
    const pendentes = filialPrestacoes.filter((item) => item.status === "RASCUNHO").length;
    const enviadas = filialPrestacoes.filter((item) => item.status === "ENVIADO").length;
    const aprovadas = filialPrestacoes.filter((item) => ["APROVADO", "PAGO", "CONCILIADO"].includes(item.status)).length;
    return { pendentes, enviadas, aprovadas };
  }, [filialPrestacoes]);

  const chartData = useMemo(
    () =>
      filialPrestacoes
        .slice(0, 6)
        .map((item) => ({
          competencia: formatCompetencia(item.competencia),
          total: item.totalOfertas
        }))
        .reverse(),
    [filialPrestacoes]
  );

  const columns = useMemo(
    () => [
      {
        header: "Competência",
        accessorKey: "competencia",
        cell: ({ row }: { row: { original: Prestacao } }) => formatCompetencia(row.original.competencia)
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
          <h2 className="text-lg font-semibold">Resumo mensal</h2>
          <p className="text-sm text-muted-foreground">Acompanhe seus envios e aprovações.</p>
        </div>
        <Button onClick={() => navigate("/filial/prestacoes/nova")}>Nova Prestação</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Pendências do mês" value={`${stats.pendentes}`} icon={<FilePlus className="h-5 w-5" />} />
        <KpiCard title="Enviadas" value={`${stats.enviadas}`} icon={<Send className="h-5 w-5" />} />
        <KpiCard title="Aprovadas" value={`${stats.aprovadas}`} icon={<CheckCircle className="h-5 w-5" />} />
      </div>
      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Últimos Envios</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={latest} emptyLabel="Nenhuma prestação enviada ainda." />
        </CardContent>
      </Card>
      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Total de Ofertas por mês</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="competencia" />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
