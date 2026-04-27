import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "muted" | "accent";
const styles: Record<Variant, string> = {
  default: "bg-foreground text-background",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground",
  muted: "bg-muted text-muted-foreground border border-border",
  accent: "bg-accent text-accent-foreground",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const v: Variant =
    /deliv|paid|appro|resolv/i.test(status) ? "success" :
    /pend|process|await/i.test(status) ? "warning" :
    /cancel|reject|suspend|open/i.test(status) ? "danger" :
    /transit|ship/i.test(status) ? "accent" : "muted";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", styles[v], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
