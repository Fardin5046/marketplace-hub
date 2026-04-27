import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { adminApi } from "@/lib/api";
import { StatusPill } from "@/components/marketplace/StatusPill";
import { toast } from "sonner";

const filters = ["All", "Open", "Awaiting vendor", "Resolved"];

export default function AdminDisputes() {
  const [f, setF] = useState("All");
  const [disputes, setDisputes] = useState<any[]>([]);
  const [open, setOpen] = useState<any | null>(null);

  useEffect(() => { adminApi.disputes().then((d: any) => { setDisputes(d.disputes || []); if (d.disputes?.length) setOpen(d.disputes[0]); }).catch(() => {}); }, []);

  const filtered = disputes.filter((d: any) => f === "All" || d.status === f);

  const resolve = async (id: string, status: string) => {
    try { await adminApi.updateDispute(id, { status }); toast.success(`Dispute ${status.toLowerCase()}`); adminApi.disputes().then((d: any) => setDisputes(d.disputes || [])); setOpen(null); } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Disputes</h1>
      <p className="mt-1 text-sm text-muted-foreground">Mediate and resolve customer/vendor disputes.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((x) => <button key={x} onClick={() => setF(x)} className={"rounded-full px-4 py-1.5 text-xs font-semibold border " + (f === x ? "bg-foreground text-background border-foreground" : "bg-card border-border")}>{x}</button>)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3">
          {filtered.map((d: any) => (
            <button key={d._id} onClick={() => setOpen(d)} className={"card-surface w-full text-left p-5 transition " + (open?._id === d._id ? "ring-2 ring-foreground" : "hover:border-foreground")}>
              <div className="flex items-center justify-between"><div><p className="font-bold">{d._id.slice(-8).toUpperCase()}</p><p className="text-xs text-muted-foreground">Order {d.order?.orderNumber || 'N/A'} · {new Date(d.createdAt).toLocaleDateString()}</p></div><StatusPill status={d.status} /></div>
              <p className="mt-3 text-sm">{d.reason}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground"><span>{d.customer?.name}</span>↔<span>{d.vendor?.name}</span><span className={"ml-auto font-semibold " + (d.priority === "High" ? "text-destructive" : d.priority === "Medium" ? "text-warning" : "text-muted-foreground")}>{d.priority} priority</span></div>
            </button>
          ))}
        </div>
        {open && (
          <aside className="card-surface p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-xl font-extrabold">{open._id.slice(-8).toUpperCase()}</h2>
            <StatusPill status={open.status} className="mt-2" />
            <dl className="mt-6 space-y-3 text-sm">
              <Row label="Order" value={open.order?.orderNumber || 'N/A'} />
              <Row label="Customer" value={open.customer?.name || 'N/A'} />
              <Row label="Vendor" value={open.vendor?.name || 'N/A'} />
              <Row label="Reason" value={open.reason} />
              <Row label="Priority" value={open.priority} />
            </dl>
            <div className="mt-6 space-y-2">
              <button onClick={() => resolve(open._id, 'Resolved')} className="w-full rounded-full bg-success py-3 text-sm font-semibold text-success-foreground">Refund customer</button>
              <button onClick={() => resolve(open._id, 'Closed')} className="w-full rounded-full bg-foreground py-3 text-sm font-semibold text-background">Side with vendor</button>
              <button onClick={() => resolve(open._id, 'Awaiting vendor')} className="w-full rounded-full border border-border py-3 text-sm font-semibold flex items-center justify-center gap-2"><MessageCircle className="h-4 w-4" />Request more info</button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold text-right">{value}</dd></div>; }
