import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

export function FiltersBar({ children }: { children: ReactNode }) {
  return (
    <Card className="border-muted/60 p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {children}
      </div>
    </Card>
  );
}
