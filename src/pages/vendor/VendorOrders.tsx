import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { vendorDashApi, orderApi } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { StatusPill } from "@/components/marketplace/StatusPill";
import { toast } from "sonner";

const filters = ["All", "Pending", "Processing", "In Transit", "Delivered", "Cancelled"];

export default function VendorOrders() {
  const [active, setActive] = useState("All");
  const [orders, setOrders] = useState<any[]>([]);
  const [open, setOpen] = useState<any | null>(null);

  useEffect(() => { vendorDashApi.orders(active).then((d: any) => setOrders(d.orders || [])).catch(() => {}); }, [active]);

  const updateStatus = async (id: string, status: string) => {
    try { await orderApi.updateStatus(id, status); toast.success(`Order marked as ${status}`); setOpen(null); vendorDashApi.orders(active).then((d: any) => setOrders(d.orders || [])); } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage and fulfill incoming orders.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (<button key={f} onClick={() => setActive(f)} className={"rounded-full px-4 py-1.5 text-xs font-semibold border " + (active === f ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:border-foreground")}>{f}</button>))}
      </div>
      <div className="card-surface mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4 text-right">Total</th><th className="p-4"></th></tr></thead>
          <tbody className="divide-y divide-border">
            {orders.map((o: any) => (
              <tr key={o._id} className="hover:bg-muted/30">
                <td className="p-4 font-semibold">{o.orderNumber}</td>
                <td className="p-4">{o.customer?.name || 'Customer'}</td>
                <td className="p-4 text-muted-foreground">{new Date(o.placedAt).toLocaleDateString()}</td>
                <td className="p-4"><StatusPill status={o.orderStatus} /></td>
                <td className="p-4 text-right font-bold">{formatPrice(o.total)}</td>
                <td className="p-4"><button onClick={() => setOpen(o)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"><Eye className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-card p-6 overflow-y-auto">
            <div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Order</p><h3 className="text-2xl font-extrabold">{open.orderNumber}</h3></div><button onClick={() => setOpen(null)} className="text-muted-foreground">✕</button></div>
            <StatusPill status={open.orderStatus} className="mt-3" />
            <div className="mt-6 space-y-4 text-sm">
              <Row label="Customer" value={open.customer?.name || 'Customer'} />
              <Row label="Date" value={new Date(open.placedAt).toLocaleDateString()} />
              <Row label="Items" value={String(open.items?.length || 0)} />
              <Row label="Total" value={formatPrice(open.total)} />
            </div>
            <div className="mt-8 space-y-2">
              {open.orderStatus === 'Pending' && (
                <button onClick={() => updateStatus(open._id, 'Processing')} className="w-full rounded-full bg-foreground py-3 text-sm font-semibold text-background">Start processing</button>
              )}
              {(open.orderStatus === 'Pending' || open.orderStatus === 'Processing') && (
                <button onClick={() => updateStatus(open._id, 'In Transit')} className="w-full rounded-full bg-foreground py-3 text-sm font-semibold text-background">Mark as shipped</button>
              )}
              {open.orderStatus === 'In Transit' && (
                <button onClick={() => updateStatus(open._id, 'Delivered')} className="w-full rounded-full border border-border py-3 text-sm font-semibold hover:border-foreground">Mark delivered</button>
              )}
              {open.orderStatus !== 'Cancelled' && open.orderStatus !== 'Delivered' && (
                <button onClick={() => updateStatus(open._id, 'Cancelled')} className="w-full text-sm text-destructive py-2 font-semibold">Cancel order</button>
              )}
              {(open.orderStatus === 'Delivered' || open.orderStatus === 'Cancelled') && (
                <p className="text-center text-sm text-muted-foreground">This order is {open.orderStatus.toLowerCase()}.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>; }
