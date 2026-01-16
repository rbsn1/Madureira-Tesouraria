import { create } from "zustand";
import type { Audit, Filial, Prestacao, Status } from "@/lib/types";
import { calcSplit, filiais, prestacoes } from "@/lib/mockData";

export type PrestacaoFilters = {
  competencia?: string;
  status?: Status | "TODOS";
  filialId?: string | "TODOS";
};

type DataState = {
  filiais: Filial[];
  prestacoes: Prestacao[];
  filters: PrestacaoFilters;
  setFilters: (filters: PrestacaoFilters) => void;
  createPrestacao: (
    data: Omit<Prestacao, "id" | "repasseSede" | "retidoFilial" | "auditoria" | "anexos" | "criadoEm">
  ) => Prestacao;
  updatePrestacao: (id: string, data: Partial<Prestacao>) => void;
  updatePrestacaoStatus: (id: string, status: Status, audit: Audit) => void;
  addAnexo: (id: string, nome: string) => void;
  addAudit: (id: string, audit: Audit) => void;
  getById: (id: string) => Prestacao | undefined;
};

export const useDataStore = create<DataState>((set, get) => ({
  filiais,
  prestacoes,
  filters: {
    competencia: "",
    status: "TODOS",
    filialId: "TODOS"
  },
  setFilters: (filters) => set({ filters }),
  createPrestacao: (data) => {
    const { repasseSede, retidoFilial } = calcSplit(data.totalOfertas);
    const created: Prestacao = {
      ...data,
      id: crypto.randomUUID(),
      repasseSede,
      retidoFilial,
      criadoEm: new Date().toISOString(),
      anexos: [],
      auditoria: []
    };
    set((state) => ({ prestacoes: [created, ...state.prestacoes] }));
    return created;
  },
  updatePrestacao: (id, data) => {
    set((state) => ({
      prestacoes: state.prestacoes.map((item) => (item.id === id ? { ...item, ...data } : item))
    }));
  },
  updatePrestacaoStatus: (id, status, audit) => {
    set((state) => ({
      prestacoes: state.prestacoes.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              enviadoEm: status === "ENVIADO" ? new Date().toISOString() : item.enviadoEm,
              aprovadoEm: status === "APROVADO" ? new Date().toISOString() : item.aprovadoEm,
              pagoEm: status === "PAGO" ? new Date().toISOString() : item.pagoEm,
              conciliadoEm: status === "CONCILIADO" ? new Date().toISOString() : item.conciliadoEm,
              auditoria: [audit, ...item.auditoria]
            }
          : item
      )
    }));
  },
  addAnexo: (id, nome) => {
    set((state) => ({
      prestacoes: state.prestacoes.map((item) =>
        item.id === id
          ? {
              ...item,
              anexos: [{ id: crypto.randomUUID(), nome }, ...item.anexos]
            }
          : item
      )
    }));
  },
  addAudit: (id, audit) => {
    set((state) => ({
      prestacoes: state.prestacoes.map((item) =>
        item.id === id
          ? {
              ...item,
              auditoria: [audit, ...item.auditoria]
            }
          : item
      )
    }));
  },
  getById: (id) => get().prestacoes.find((item) => item.id === id)
}));
