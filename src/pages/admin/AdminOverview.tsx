import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Users, AlertOctagon, TrendingUp, Package } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { adminApi } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { KpiCard } from "@/components/marketplace/KpiCard";
import { StatusPill } from "@/components/marketplace/StatusPill";

export default function AdminOverview() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { adminApi.overview().then(setD).catch(() => {}); }, []);
  if (!d) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-extrabold tracking-tight">Platform overview</h1><p className="mt-1 text-sm text-muted-foreground">Key metrics and recent activity.</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Revenue" value={formatPrice(d.totalRevenue || 0)} icon={DollarSign} accent />
        <KpiCard label="Orders" value={String(d.totalOrders || 0)} icon={ShoppingCart} />
        <KpiCard label="Products" value={String(d.totalProducts || 0)} icon={Package} />
        <KpiCard label="Customers" value={String(d.totalUsers || 0)} icon={Users} />
        <KpiCard label="Vendors" value={String(d.totalVendors || 0)} icon={TrendingUp} />
        <KpiCard label="Open disputes" value={String(d.totalDisputes || 0)} icon={AlertOctagon} />
      </div>
      <div className="card-surface p-6">
        <h2 className="font-bold mb-4">Recent orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3 text-right">Total</th></tr></thead>
            <tbody className="divide-y divide-border">
              {(d.recentOrders || []).map((o: any) => (
                <tr key={o._id} className="hover:bg-muted/30">
                  <td className="p-3 font-semibold">{o.orderNumber}</td>
                  <td className="p-3 text-muted-foreground">{o.customer?.name || 'Customer'}</td>
                  <td className="p-3"><StatusPill status={o.orderStatus} /></td>
                  <td className="p-3 text-right font-bold">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
