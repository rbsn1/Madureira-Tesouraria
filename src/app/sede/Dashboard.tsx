import { useMemo } from "react";
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import { Building2, ClipboardCheck, Clock, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { formatCompetencia, formatCurrency } from "@/lib/format";
import { sumByMonth } from "@/lib/mockData";
import { useDataStore } from "@/stores/dataStore";

export function SedeDashboard() {
  const prestacoes = useDataStore((state) => state.prestacoes);
  const filiais = useDataStore((state) => state.filiais);

  const currentMonth = useMemo(() => {
    const values = prestacoes.map((item) => item.competencia).sort();
    return values[values.length - 1];
  }, [prestacoes]);

  const totalRepasse = useMemo(() => {
    return prestacoes
      .filter((item) => item.competencia === currentMonth && item.status === "CONCILIADO")
      .reduce((acc, item) => acc + item.repasseSede, 0);
  }, [prestacoes, currentMonth]);

  const pendentesEnvio = useMemo(() => {
    const filiaisComPrestacao = new Set(
      prestacoes.filter((item) => item.competencia === currentMonth).map((item) => item.filialId)
    );
    return filiais.filter((filial) => !filiaisComPrestacao.has(filial.id)).length;
  }, [prestacoes, filiais, currentMonth]);

  const pendentesAprovacao = prestacoes.filter((item) => item.status === "ENVIADO").length;
  const pendentesPagamento = prestacoes.filter((item) => item.status === "APROVADO").length;

  const repassePorMes = useMemo(() => {
    const totals = sumByMonth(prestacoes);
    return Object.entries(totals)
      .map(([competencia, total]) => ({ competencia: formatCompetencia(competencia), total }))
      .slice(-6);
  }, [prestacoes]);

  const topFiliais = useMemo(() => {
    const map = prestacoes
      .filter((item) => item.competencia === currentMonth)
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.filialNome] = (acc[item.filialNome] ?? 0) + item.repasseSede;
        return acc;
      }, {});
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);
  }, [prestacoes, currentMonth]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total repasse no mês" value={formatCurrency(totalRepasse)} icon={<CreditCard className="h-5 w-5" />} />
        <KpiCard title="Pendentes de envio" value={`${pendentesEnvio}`} icon={<Building2 className="h-5 w-5" />} />
        <KpiCard title="Pendentes de aprovação" value={`${pendentesAprovacao}`} icon={<Clock className="h-5 w-5" />} />
        <KpiCard title="Pendentes de pagamento" value={`${pendentesPagamento}`} icon={<ClipboardCheck className="h-5 w-5" />} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-muted/60 lg:col-span-2">
          <CardHeader>
            <CardTitle>Repasse para a sede por mês</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={repassePorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="competencia" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle>Top filiais do mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topFiliais.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg border border-muted/60 px-3 py-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Distribuição de repasse por mês</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={repassePorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="competencia" />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="total" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
