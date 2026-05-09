import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function KpiCard({ label, value, delta, icon: Icon, accent }: {
  label: string; value: string; delta?: number; icon: LucideIcon; accent?: boolean;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className={cn("card-surface p-5", accent && "bg-foreground text-background border-foreground")}>
      <div className="flex items-start justify-between">
        <p className={cn("text-xs font-medium uppercase tracking-wider", accent ? "text-background/70" : "text-muted-foreground")}>{label}</p>
        <div className={cn("grid h-9 w-9 place-items-center rounded-full", accent ? "bg-background/10" : "bg-muted")}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight">{value}</p>
      {delta !== undefined && (
        <p className={cn("mt-2 inline-flex items-center gap-1 text-xs font-semibold", positive ? "text-success" : "text-destructive", accent && "text-background/80")}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{Math.abs(delta)}% vs last month
        </p>
      )}
    </div>
  );
}
