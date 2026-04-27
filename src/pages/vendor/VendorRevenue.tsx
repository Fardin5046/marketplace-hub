import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, ShoppingCart, Percent } from "lucide-react";
import { AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { vendorDashApi } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { KpiCard } from "@/components/marketplace/KpiCard";

export default function VendorRevenue() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { vendorDashApi.revenue().then(setD).catch(() => {}); }, []);
  if (!d) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-extrabold tracking-tight">Revenue</h1><p className="mt-1 text-sm text-muted-foreground">Track your store's earnings over time.</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total revenue" value={formatPrice(d.totalRevenue || 0)} delta={22} icon={DollarSign} accent />
        <KpiCard label="Avg order value" value={`$${d.avgOrderValue || 0}`} delta={6} icon={TrendingUp} />
        <KpiCard label="Total orders" value={String(d.totalOrders || 0)} delta={14} icon={ShoppingCart} />
        <KpiCard label="Refund rate" value={`${d.refundRate || 0}%`} delta={-0.3} icon={Percent} />
      </div>
      <div className="card-surface p-6">
        <h2 className="font-bold mb-4">Revenue trend</h2>
        <div className="h-80">
          <ResponsiveContainer><AreaChart data={d.revenueData || []}>
            <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#rev)" />
          </AreaChart></ResponsiveContainer>
        </div>
      </div>
      <div className="card-surface p-6">
        <h2 className="font-bold mb-4">Sales velocity</h2>
        <div className="h-72">
          <ResponsiveContainer><LineChart data={d.revenueData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
            <Line type="monotone" dataKey="orders" stroke="hsl(var(--foreground))" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
