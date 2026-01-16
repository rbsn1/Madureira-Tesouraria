import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { AuditTimeline } from "@/components/AuditTimeline";
import { formatCompetencia, formatCurrency } from "@/lib/format";
import { useDataStore } from "@/stores/dataStore";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function SedePrestacaoDetalhe() {
  const { id } = useParams();
  const prestacao = useDataStore((state) => (id ? state.getById(id) : undefined));
  const updateStatus = useDataStore((state) => state.updatePrestacaoStatus);
  const [motivo, setMotivo] = useState("");

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

  const handleAction = (status: typeof prestacao.status, detalhe?: string) => {
    updateStatus(prestacao.id, status, {
      id: crypto.randomUUID(),
      acao: `Status atualizado para ${status}`,
      por: "Equipe Sede",
      em: new Date().toISOString(),
      detalhe
    });
    toast.success("Status atualizado.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{prestacao.filialNome}</h2>
          <p className="text-sm text-muted-foreground">Competência {formatCompetencia(prestacao.competencia)}</p>
        </div>
        <StatusBadge status={prestacao.status} />
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
          <CardTitle>Detalhes e anexos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Observações: {prestacao.observacoes ?? "Nenhuma"}</p>
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
          <CardTitle>Ações da Sede</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {prestacao.status === "ENVIADO" && (
            <>
              <Button onClick={() => handleAction("APROVADO")}>Aprovar</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Rejeitar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Motivo da rejeição</DialogTitle>
                  </DialogHeader>
                  <Textarea value={motivo} onChange={(event) => setMotivo(event.target.value)} />
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleAction("REJEITADO", motivo || "Sem detalhes");
                        setMotivo("");
                      }}
                    >
                      Confirmar rejeição
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          {prestacao.status === "APROVADO" && (
            <Button onClick={() => handleAction("PAGO")}>Marcar como Pago</Button>
          )}
          {prestacao.status === "PAGO" && (
            <Button onClick={() => handleAction("CONCILIADO")}>Marcar como Conciliado</Button>
          )}
          {prestacao.status === "REJEITADO" && (
            <p className="text-sm text-muted-foreground">Aguardando novo envio da filial.</p>
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
