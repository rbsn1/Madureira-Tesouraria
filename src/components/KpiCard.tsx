import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

export function KpiCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="border-muted/60 shadow-sm">
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
