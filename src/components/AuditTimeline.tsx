import type { Audit } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export function AuditTimeline({ items }: { items: Audit[] }) {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
        Nenhum registro de auditoria disponível.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="h-3 w-3 rounded-full bg-primary" />
            {index < items.length - 1 && <span className="mt-1 h-full w-px bg-border" />}
          </div>
          <div className="flex-1 rounded-lg border border-muted/50 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">{item.acao}</p>
              <span className="text-xs text-muted-foreground">{formatDateTime(item.em)}</span>
            </div>
            <p className="text-sm text-muted-foreground">{item.por}</p>
            {item.detalhe && <p className="mt-2 text-sm">{item.detalhe}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
