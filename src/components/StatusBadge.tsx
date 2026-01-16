import { Badge } from "@/components/ui/badge";
import { statusColors, statusLabels } from "@/lib/status";
import type { Status } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={cn("border-0 font-medium", statusColors[status])}>
      {statusLabels[status]}
    </Badge>
  );
}
