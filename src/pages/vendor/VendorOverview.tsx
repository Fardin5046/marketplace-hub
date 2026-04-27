import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DollarSign, ShoppingCart, Package, Wallet, AlertTriangle, ArrowRight } from "lucide-react";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { vendorDashApi } from "@/lib/api";
import { formatPrice, productImage } from "@/lib/mock-data";
import { KpiCard } from "@/components/marketplace/KpiCard";
import { StatusPill } from "@/components/marketplace/StatusPill";

export default function VendorOverview() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { vendorDashApi.overview().then(setD).catch(() => {}); }, []);
  if (!d) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {d.profile?.storeName || 'Vendor'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening in your store today.</p>
        </div>
        <Link to="/vendor/products/new" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">+ Add product</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Revenue" value={formatPrice(d.profile?.totalRevenue || 0)} delta={18} icon={DollarSign} accent />
        <KpiCard label="Orders" value={String(d.recentOrders?.length || 0)} delta={12} icon={ShoppingCart} />
        <KpiCard label="Low stock" value={String(d.lowStock || 0)} delta={-3} icon={AlertTriangle} />
        <KpiCard label="Pending payout" value={formatPrice(d.profile?.pendingPayout || 0)} icon={Wallet} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between"><h2 className="font-bold">Revenue (last 6 months)</h2><span className="text-xs text-muted-foreground">USD</span></div>
          <div className="mt-4 h-72">
            <ResponsiveContainer><LineChart data={d.revenueData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--foreground))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--accent))" }} />
            </LineChart></ResponsiveContainer>
          </div>
        </div>
        <div className="card-surface p-6">
          <h2 className="font-bold">Orders / month</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer><BarChart data={d.revenueData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="orders" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
            </BarChart></ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between"><h2 className="font-bold">Recent orders</h2><Link to="/vendor/orders" className="text-sm font-semibold underline-offset-4 hover:underline">View all <ArrowRight className="inline h-3 w-3" /></Link></div>
          <div className="mt-4 -mx-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="px-2 py-2">Order</th><th className="px-2 py-2">Customer</th><th className="px-2 py-2">Status</th><th className="px-2 py-2 text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-border">
                {(d.recentOrders || []).map((o: any) => (
                  <tr key={o._id} className="hover:bg-muted/30">
                    <td className="px-2 py-3 font-semibold">{o.orderNumber}</td>
                    <td className="px-2 py-3 text-muted-foreground">{o.customer?.name || 'Customer'}</td>
                    <td className="px-2 py-3"><StatusPill status={o.orderStatus} /></td>
                    <td className="px-2 py-3 text-right font-bold">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-surface p-6">
          <h2 className="font-bold">Top selling</h2>
          <div className="mt-4 space-y-3">
            {(d.topProducts || []).slice(0, 4).map((p: any, i: number) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                <img src={productImage(p)} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{p.title}</p><p className="text-xs text-muted-foreground">{p.ratingCount || 0} sold</p></div>
                <p className="text-sm font-bold">{formatPrice(p.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {(d.lowStock || 0) > 0 && (
        <div className="card-surface p-6 border-warning/40 bg-warning/5">
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-warning/20 text-warning"><AlertTriangle className="h-5 w-5" /></div>
            <div className="flex-1"><p className="font-bold">Low stock alert</p><p className="text-sm text-muted-foreground">{d.lowStock} products are running low. <Link to="/vendor/products" className="font-semibold underline">Restock now</Link></p></div>
          </div>
        </div>
      )}
    </div>
  );
}
