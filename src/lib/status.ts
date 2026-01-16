import type { Status } from "@/lib/types";

export const statusLabels: Record<Status, string> = {
  RASCUNHO: "Rascunho",
  ENVIADO: "Enviado",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
  PAGO: "Pago",
  CONCILIADO: "Conciliado"
};

export const statusColors: Record<Status, string> = {
  RASCUNHO: "bg-muted text-muted-foreground",
  ENVIADO: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  APROVADO: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  REJEITADO: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
  PAGO: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  CONCILIADO: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200"
};
