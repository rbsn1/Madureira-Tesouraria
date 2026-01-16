import { addMonths, format } from "date-fns";
import type { Filial, Prestacao, Status } from "@/lib/types";

export const filiais: Filial[] = [
  { id: "filial-1", nome: "Madureira Alpha", cidade: "São Paulo" },
  { id: "filial-2", nome: "Madureira Beta", cidade: "Rio de Janeiro" },
  { id: "filial-3", nome: "Madureira Gamma", cidade: "Belo Horizonte" },
  { id: "filial-4", nome: "Madureira Delta", cidade: "Curitiba" },
  { id: "filial-5", nome: "Madureira Épsilon", cidade: "Salvador" },
  { id: "filial-6", nome: "Madureira Zeta", cidade: "Brasília" }
];

export const calcSplit = (total: number) => {
  const repasseSede = Number((total * 0.4).toFixed(2));
  const retidoFilial = Number((total * 0.6).toFixed(2));
  return { repasseSede, retidoFilial };
};

const statuses: Status[] = [
  "RASCUNHO",
  "ENVIADO",
  "APROVADO",
  "REJEITADO",
  "PAGO",
  "CONCILIADO"
];

const baseMonth = new Date(2025, 7, 1);
const months = Array.from({ length: 6 }).map((_, index) =>
  format(addMonths(baseMonth, index), "yyyy-MM")
);

export const prestacoes: Prestacao[] = filiais.flatMap((filial, filialIndex) =>
  months.map((competencia, monthIndex) => {
    const totalOfertas = 12000 + filialIndex * 1800 + monthIndex * 950;
    const { repasseSede, retidoFilial } = calcSplit(totalOfertas);
    const status = statuses[(filialIndex + monthIndex) % statuses.length];
    const criadoEm = `${competencia}-05T10:12:00.000Z`;
    return {
      id: `${filial.id}-${competencia}`,
      filialId: filial.id,
      filialNome: filial.nome,
      competencia,
      totalOfertas,
      repasseSede,
      retidoFilial,
      status,
      criadoEm,
      enviadoEm: status !== "RASCUNHO" ? `${competencia}-08T14:30:00.000Z` : undefined,
      aprovadoEm: ["APROVADO", "PAGO", "CONCILIADO"].includes(status)
        ? `${competencia}-10T09:00:00.000Z`
        : undefined,
      pagoEm: ["PAGO", "CONCILIADO"].includes(status)
        ? `${competencia}-12T09:00:00.000Z`
        : undefined,
      conciliadoEm: status === "CONCILIADO" ? `${competencia}-15T09:00:00.000Z` : undefined,
      anexos: status === "RASCUNHO" ? [] : [{ id: `${competencia}-1`, nome: "Comprovante.pdf" }],
      auditoria: [
        {
          id: `${competencia}-audit-1`,
          acao: "Prestação criada",
          por: filial.nome,
          em: criadoEm
        }
      ],
      observacoes: status === "REJEITADO" ? "Enviar comprovantes adicionais." : undefined
    } satisfies Prestacao;
  })
);

export const sumByMonth = (items: Prestacao[]) => {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.competencia] = (acc[item.competencia] ?? 0) + item.repasseSede;
    return acc;
  }, {});
};

export const groupByFilial = (items: Prestacao[]) => {
  return items.reduce<Record<string, Prestacao[]>>((acc, item) => {
    acc[item.filialId] = acc[item.filialId] ?? [];
    acc[item.filialId].push(item);
    return acc;
  }, {});
};
