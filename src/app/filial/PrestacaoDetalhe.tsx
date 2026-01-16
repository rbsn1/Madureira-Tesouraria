import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { AuditTimeline } from "@/components/AuditTimeline";
import { formatCompetencia, formatCurrency } from "@/lib/format";
import { useDataStore } from "@/stores/dataStore";

export function FilialPrestacaoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const prestacao = useDataStore((state) => (id ? state.getById(id) : undefined));

  const summary = useMemo(
    () =>
      prestacao
        ? [
            { label: "Total Ofertas", value: formatCurrency(prestacao.totalOfertas) },
            { label: "Repasse Sede", value: formatCurrency(prestacao.repasseSede) },
            { label: "Retido Filial", value: formatCurrency(prestacao.retidoFilial) }
          ]
        : [],
    [prestacao]
  );

  if (!prestacao) {
    return (
      <Card className="border-muted/60">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Prestação não encontrada.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{prestacao.filialNome}</h2>
          <p className="text-sm text-muted-foreground">Competência {formatCompetencia(prestacao.competencia)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={prestacao.status} />
          {prestacao.status === "RASCUNHO" && (
            <Button variant="outline" onClick={() => navigate(`/filial/prestacoes/nova?editId=${prestacao.id}`)}>
              Editar
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label} className="border-muted/60">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Anexos</CardTitle>
        </CardHeader>
        <CardContent>
          {prestacao.anexos.length ? (
            <ul className="space-y-2 text-sm">
              {prestacao.anexos.map((anexo) => (
                <li key={anexo.id} className="rounded-md border border-muted/60 px-3 py-2">
                  {anexo.nome}
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-muted p-4 text-center text-sm text-muted-foreground">
              Nenhum anexo enviado.
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditTimeline items={prestacao.auditoria} />
        </CardContent>
      </Card>
    </div>
  );
}
