import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function EmptyState({ icon: Icon, title, body, cta }: {
  icon: LucideIcon; title: string; body?: string; cta?: { label: string; to: string };
}) {
  return (
    <div className="card-surface flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {cta && (
        <Link to={cta.to} className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90">{cta.label}</Link>
      )}
    </div>
  );
}
