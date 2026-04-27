import { useEffect, useState } from "react";
import { Check, X, Search, Star } from "lucide-react";
import { adminApi } from "@/lib/api";
import { StatusPill } from "@/components/marketplace/StatusPill";
import { toast } from "sonner";

const tabs = ["Pending", "Approved", "Suspended"] as const;

export default function AdminVendors() {
  const [tab, setTab] = useState<typeof tabs[number]>("Pending");
  const [q, setQ] = useState("");
  const [vendors, setVendors] = useState<any[]>([]);
  const [open, setOpen] = useState<any | null>(null);

  useEffect(() => { adminApi.vendors().then((d: any) => setVendors(d.vendors || [])).catch(() => {}); }, []);

  const filtered = vendors.filter((v: any) => {
    const status = v.approvalStatus || 'pending';
    const matchTab = tab === "Pending" ? status === "pending" : tab === "Approved" ? status === "approved" : status === "suspended" || status === "rejected";
    const matchQ = !q || (v.storeName || '').toLowerCase().includes(q.toLowerCase());
    return matchTab && matchQ;
  });

  const handleApprove = async (id: string) => {
    try { await adminApi.approveVendor(id); toast.success("Vendor approved!"); adminApi.vendors().then((d: any) => setVendors(d.vendors || [])); setOpen(null); } catch (err: any) { toast.error(err.message); }
  };
  const handleReject = async (id: string) => {
    try { await adminApi.rejectVendor(id); toast.success("Vendor rejected."); adminApi.vendors().then((d: any) => setVendors(d.vendors || [])); setOpen(null); } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Vendor approvals</h1>
      <p className="mt-1 text-sm text-muted-foreground">Review and approve new vendor applications.</p>
      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vendors…" className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-foreground" />
      </div>
      <div className="mt-4 flex gap-2">
        {tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={"rounded-full px-4 py-1.5 text-xs font-semibold border " + (tab === t ? "bg-foreground text-background border-foreground" : "bg-card border-border")}>{t}</button>)}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v: any) => (
          <div key={v._id} className="card-surface hover-lift overflow-hidden">
            <div className="h-20 bg-gradient-to-br from-muted to-card" />
            <div className="px-5 pb-5">
              <img src={v.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${v.storeName}`} alt={v.storeName} className="-mt-8 h-14 w-14 rounded-2xl border-4 border-card" />
              <h3 className="mt-3 font-bold">{v.storeName}</h3>
              <p className="text-xs text-muted-foreground">{v.tagline || 'No tagline'}</p>
              <div className="mt-3 flex items-center gap-3 text-xs"><Star className="h-3 w-3 fill-foreground" />{v.ratingAverage || 0}<span className="text-muted-foreground">· Joined {new Date(v.createdAt).toLocaleDateString()}</span></div>
              <StatusPill status={v.approvalStatus === "pending" ? "Pending" : v.approvalStatus === "approved" ? "Approved" : "Suspended"} className="mt-3" />
              <div className="mt-4 flex gap-2">
                <button onClick={() => setOpen(v)} className="flex-1 rounded-full border border-border py-2 text-xs font-semibold hover:border-foreground">View</button>
                {v.approvalStatus === "pending" && (<>
                  <button onClick={() => handleApprove(v._id)} className="grid h-9 w-9 place-items-center rounded-full bg-success text-success-foreground"><Check className="h-4 w-4" /></button>
                  <button onClick={() => handleReject(v._id)} className="grid h-9 w-9 place-items-center rounded-full bg-destructive text-destructive-foreground"><X className="h-4 w-4" /></button>
                </>)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-card p-6 overflow-y-auto">
            <button onClick={() => setOpen(null)} className="ml-auto block text-muted-foreground">✕</button>
            <img src={open.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${open.storeName}`} alt={open.storeName} className="h-16 w-16 rounded-2xl mt-2" />
            <h2 className="mt-4 text-2xl font-extrabold">{open.storeName}</h2>
            <p className="text-sm text-muted-foreground">{open.tagline || 'No tagline'}</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Owner</dt><dd className="font-semibold">{open.user?.name || 'N/A'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd className="font-semibold">{open.user?.email || 'N/A'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Rating</dt><dd className="font-semibold">{open.ratingAverage || 0}★</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Sales</dt><dd className="font-semibold">{open.totalSales || 0}</dd></div>
            </dl>
            <div className="mt-8 grid grid-cols-2 gap-2">
              <button onClick={() => handleApprove(open._id)} className="rounded-full bg-success py-3 text-sm font-semibold text-success-foreground">Approve vendor</button>
              <button onClick={() => handleReject(open._id)} className="rounded-full bg-destructive py-3 text-sm font-semibold text-destructive-foreground">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
