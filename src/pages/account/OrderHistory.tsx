import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { orderApi } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { StatusPill } from "@/components/marketplace/StatusPill";

const filters = ["All", "Pending", "Processing", "In Transit", "Delivered", "Cancelled"];

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [active, setActive] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => { orderApi.myOrders().then((d: any) => setOrders(d.orders || [])).catch(() => {}); }, []);

  const filtered = orders.filter((o: any) => (active === "All" || o.orderStatus === active) && (!q || o.orderNumber?.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
      <p className="mt-2 text-muted-foreground">{orders.length} total orders</p>
      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order ID…" className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-foreground" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (<button key={f} onClick={() => setActive(f)} className={"rounded-full px-4 py-1.5 text-xs font-semibold border " + (active === f ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:border-foreground")}>{f}</button>))}
      </div>
      <div className="mt-6 space-y-3">
        {filtered.map((o: any) => (
          <Link key={o._id} to={`/account/orders/${o._id}`} className="card-surface hover-lift block p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{new Date(o.placedAt).toLocaleDateString()}</p><p className="font-bold">{o.orderNumber}</p></div>
              <StatusPill status={o.orderStatus} />
              <p className="font-bold">{formatPrice(o.total)}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 overflow-x-auto">
              {(o.items || []).map((p: any, i: number) => (
                <img key={i} src={p.image || 'https://placehold.co/56x56?text=•'} alt={p.title} className="h-14 w-14 rounded-xl object-cover bg-muted shrink-0" />
              ))}
              <span className="ml-auto text-xs text-muted-foreground">{o.items?.length || 0} items</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
