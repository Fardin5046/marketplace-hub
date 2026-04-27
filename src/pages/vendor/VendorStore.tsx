import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Users, Package } from "lucide-react";
import { vendorDashApi } from "@/lib/api";

export default function VendorStore() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { vendorDashApi.store().then(setD).catch(() => {}); }, []);
  if (!d) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;
  const p = d.profile || {};

  return (
    <div className="space-y-6">
      <div className="card-surface overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-foreground via-muted to-card" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <img src={p.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${p.storeName}`} alt="" className="h-20 w-20 rounded-2xl border-4 border-card bg-foreground" />
              <div className="pb-1"><h1 className="text-2xl font-extrabold">{p.storeName}</h1><p className="text-sm text-muted-foreground">{p.tagline || 'No tagline'}</p></div>
            </div>
            <Link to="/vendor/settings" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">Edit storefront</Link>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 max-w-md">
            <Stat icon={Star} label="Rating" value={(p.ratingAverage || 0).toFixed(1)} />
            <Stat icon={Package} label="Products" value={String(d.productCount || 0)} />
            <Stat icon={Users} label="Sales" value={String(p.totalSales || 0)} />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-surface p-6"><h2 className="font-bold mb-3">Store description</h2><p className="text-sm text-muted-foreground">{p.description || `${p.storeName} is an independent vendor on Marketly.`}</p></div>
        <div className="card-surface p-6"><h2 className="font-bold mb-3">Policies</h2><p className="text-sm text-muted-foreground whitespace-pre-line">{p.policies || '• Free shipping on orders over $80\n• 30-day no-questions returns\n• 2-year manufacturer warranty'}</p></div>
      </div>
    </div>
  );
}
function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return <div className="card-surface p-3 flex items-center gap-3"><Icon className="h-4 w-4 text-muted-foreground" /><div><p className="font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>;
}
