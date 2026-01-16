export type Status =
  | "RASCUNHO"
  | "ENVIADO"
  | "APROVADO"
  | "REJEITADO"
  | "PAGO"
  | "CONCILIADO";

export type Anexo = { id: string; nome: string };
export type Audit = { id: string; acao: string; por: string; em: string; detalhe?: string };

export type Prestacao = {
  id: string;
  filialId: string;
  filialNome: string;
  competencia: string;
  totalOfertas: number;
  repasseSede: number;
  retidoFilial: number;
  status: Status;
  criadoEm: string;
  enviadoEm?: string;
  aprovadoEm?: string;
  pagoEm?: string;
  conciliadoEm?: string;
  anexos: Anexo[];
  auditoria: Audit[];
  observacoes?: string;
};

export type Filial = { id: string; nome: string; cidade?: string };
