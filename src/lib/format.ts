import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);

export const formatCompetencia = (value: string) => {
  const date = parseISO(`${value}-01`);
  return format(date, "MMM yyyy", { locale: ptBR });
};

export const formatDateTime = (value: string) => {
  const date = parseISO(value);
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

export const formatDate = (value: string) => {
  const date = parseISO(value);
  return format(date, "dd/MM/yyyy", { locale: ptBR });
};
