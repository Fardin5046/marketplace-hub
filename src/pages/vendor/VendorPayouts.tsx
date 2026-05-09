import { useEffect, useState } from "react";
import { Wallet, TrendingUp, Clock, Download } from "lucide-react";
import { vendorDashApi } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { KpiCard } from "@/components/marketplace/KpiCard";
import { StatusPill } from "@/components/marketplace/StatusPill";
import { toast } from "sonner";

export default function VendorPayouts() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [pending, setPending] = useState(0);

  const load = () => vendorDashApi.payouts().then((d: any) => { setPayouts(d.payouts || []); setPending(d.pendingBalance || 0); }).catch(() => {});
  useEffect(() => { load(); }, []);

  const paidTotal = payouts.filter((p: any) => p.status === "Paid").reduce((s: number, p: any) => s + p.amount, 0);
  const handleRequest = async () => {
    try { await vendorDashApi.requestPayout(); toast.success("Payout requested!"); load(); } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold tracking-tight">Payouts</h1><p className="mt-1 text-sm text-muted-foreground">Track your earnings and bank transfers.</p></div>
        <button onClick={handleRequest} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">Request payout</button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Total paid out" value={formatPrice(paidTotal)} icon={Wallet} accent />
        <KpiCard label="Pending" value={formatPrice(pending)} icon={Clock} />
        <KpiCard label="Next payout" value="On request" icon={TrendingUp} />
      </div>
      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-4">Payout ID</th><th className="p-4">Date</th><th className="p-4">Method</th><th className="p-4">Status</th><th className="p-4 text-right">Amount</th></tr></thead>
          <tbody className="divide-y divide-border">
            {payouts.map((p: any) => (
              <tr key={p._id} className="hover:bg-muted/30">
                <td className="p-4 font-semibold">{p._id.slice(-8).toUpperCase()}</td>
                <td className="p-4 text-muted-foreground">{new Date(p.requestedAt).toLocaleDateString()}</td>
                <td className="p-4">{p.method}</td>
                <td className="p-4"><StatusPill status={p.status} /></td>
                <td className="p-4 text-right font-bold">{formatPrice(p.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
