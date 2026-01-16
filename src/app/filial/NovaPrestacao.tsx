import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { calcSplit } from "@/lib/mockData";
import { useAuthStore } from "@/stores/authStore";
import { useDataStore } from "@/stores/dataStore";
import type { Prestacao } from "@/lib/types";

const schema = z.object({
  competencia: z.string().min(1, "Selecione a competência"),
  totalOfertas: z.preprocess((value) => Number(value), z.number().positive("Informe um valor válido")),
  observacoes: z.string().optional(),
  confirmacao: z.literal(true, { errorMap: () => ({ message: "Confirme as informações" }) })
});

type FormValues = z.infer<typeof schema>;

const competenciaOptions = ["2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01"];

export function FilialPrestacaoNova() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("editId");
  const filialId = useAuthStore((state) => state.filialId ?? "filial-1");
  const prestacaoEdit = useDataStore((state) => (editId ? state.getById(editId) : undefined));
  const filiais = useDataStore((state) => state.filiais);
  const createPrestacao = useDataStore((state) => state.createPrestacao);
  const updatePrestacao = useDataStore((state) => state.updatePrestacao);
  const addAudit = useDataStore((state) => state.addAudit);
  const addAnexo = useDataStore((state) => state.addAnexo);
  const [step, setStep] = useState("dados");
  const [anexos, setAnexos] = useState<string[]>(prestacaoEdit?.anexos.map((anexo) => anexo.nome) ?? []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      competencia: prestacaoEdit?.competencia ?? "",
      totalOfertas: prestacaoEdit?.totalOfertas ?? 0,
      observacoes: prestacaoEdit?.observacoes ?? "",
      confirmacao: false
    }
  });

  const totalValue = form.watch("totalOfertas");
  const { repasseSede, retidoFilial } = useMemo(() => calcSplit(Number(totalValue || 0)), [totalValue]);

  useEffect(() => {
    if (prestacaoEdit) {
      form.reset({
        competencia: prestacaoEdit.competencia,
        totalOfertas: prestacaoEdit.totalOfertas,
        observacoes: prestacaoEdit.observacoes ?? "",
        confirmacao: false
      });
    }
  }, [prestacaoEdit, form]);

  const handleAddAnexo = (files: FileList | null) => {
    if (!files?.length) return;
    const names = Array.from(files).map((file) => file.name);
    setAnexos((prev) => [...names, ...prev]);
  };

  const handleSave = (status: Prestacao["status"]) => {
    const values = form.getValues();
    if (!values.competencia || !values.totalOfertas) {
      toast.error("Preencha os campos obrigatórios.");
      setStep("dados");
      return;
    }

    const filialNome = prestacaoEdit?.filialNome ?? filiais.find((filial) => filial.id === filialId)?.nome ?? "Filial";
    const payload = {
      filialId,
      filialNome,
      competencia: values.competencia,
      totalOfertas: values.totalOfertas,
      status,
      observacoes: values.observacoes
    } as Omit<Prestacao, "id" | "repasseSede" | "retidoFilial" | "auditoria" | "anexos" | "criadoEm">;

    let prestacao: Prestacao;
    if (prestacaoEdit) {
      updatePrestacao(prestacaoEdit.id, {
        ...payload,
        repasseSede,
        retidoFilial
      });
      prestacao = { ...prestacaoEdit, ...payload, repasseSede, retidoFilial };
    } else {
      prestacao = createPrestacao(payload);
    }

    anexos.forEach((anexo) => addAnexo(prestacao.id, anexo));

    addAudit(prestacao.id, {
      id: crypto.randomUUID(),
      acao: status === "RASCUNHO" ? "Rascunho salvo" : "Prestação enviada",
      por: "Equipe Filial",
      em: new Date().toISOString()
    });

    toast.success(status === "RASCUNHO" ? "Rascunho salvo." : "Prestação enviada para a sede.");
    navigate(`/filial/prestacoes/${prestacao.id}`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>Wizard de Prestação de Contas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={step} onValueChange={setStep}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">1. Dados</TabsTrigger>
              <TabsTrigger value="anexos">2. Anexos</TabsTrigger>
              <TabsTrigger value="revisao">3. Revisão</TabsTrigger>
            </TabsList>

            <TabsContent value="dados">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Competência</label>
                    <Select
                      value={form.watch("competencia")}
                      onValueChange={(value) => form.setValue("competencia", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {competenciaOptions.map((competencia) => (
                          <SelectItem key={competencia} value={competencia}>
                            {competencia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total de Ofertas</label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register("totalOfertas", { valueAsNumber: true })}
                    />
                    {form.formState.errors.totalOfertas && (
                      <p className="text-xs text-destructive">{form.formState.errors.totalOfertas.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Observações</label>
                    <Textarea {...form.register("observacoes")} placeholder="Comentários adicionais" />
                  </div>
                </div>
                <div className="grid gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Repasse para Sede (40%)</p>
                      <p className="mt-2 text-xl font-semibold">{formatCurrency(repasseSede)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Retido na Filial (60%)</p>
                      <p className="mt-2 text-xl font-semibold">{formatCurrency(retidoFilial)}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep("anexos")}>Continuar</Button>
              </div>
            </TabsContent>

            <TabsContent value="anexos">
              <div className="space-y-4">
                <div className="rounded-lg border border-dashed border-muted p-6 text-center">
                  <p className="text-sm text-muted-foreground">Envie comprovantes (simulado)</p>
                  <Input
                    type="file"
                    multiple
                    className="mt-4"
                    onChange={(event) => handleAddAnexo(event.target.files)}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Anexos adicionados</h4>
                  {anexos.length ? (
                    <ul className="space-y-2 text-sm">
                      {anexos.map((anexo) => (
                        <li key={anexo} className="rounded-md border border-muted/60 px-3 py-2">
                          {anexo}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-lg border border-dashed border-muted p-4 text-center text-sm text-muted-foreground">
                      Nenhum anexo adicionado.
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep("dados")}>
                  Voltar
                </Button>
                <Button onClick={() => setStep("revisao")}>Continuar</Button>
              </div>
            </TabsContent>

            <TabsContent value="revisao">
              <div className="space-y-4">
                <Card>
                  <CardContent className="grid gap-4 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Competência</span>
                      <span>{form.getValues("competencia")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total de ofertas</span>
                      <span>{formatCurrency(form.getValues("totalOfertas") || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Repasse Sede</span>
                      <span>{formatCurrency(repasseSede)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Retido Filial</span>
                      <span>{formatCurrency(retidoFilial)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Anexos</span>
                      <span>{anexos.length} arquivos</span>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex items-center gap-2">
                  <input type="hidden" {...form.register("confirmacao")} />
                  <Checkbox
                    checked={form.watch("confirmacao")}
                    onCheckedChange={(value) => form.setValue("confirmacao", value === true)}
                  />
                  <span className="text-sm">Confirmo que as informações são verdadeiras</span>
                </div>
                {form.formState.errors.confirmacao && (
                  <p className="text-xs text-destructive">{form.formState.errors.confirmacao.message}</p>
                )}
              </div>
              <div className="mt-6 flex flex-wrap justify-between gap-3">
                <Button variant="outline" onClick={() => setStep("anexos")}>Voltar</Button>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => handleSave("RASCUNHO")}>
                    Salvar Rascunho
                  </Button>
                  <Button onClick={form.handleSubmit(() => handleSave("ENVIADO"))}>
                    Enviar Prestação
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
