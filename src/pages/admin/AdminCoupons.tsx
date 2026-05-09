import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Percent, DollarSign, Calendar, Hash } from "lucide-react";
import { couponApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "", type: "percentage", value: "", minOrderAmount: "",
    maxDiscountAmount: "", validTo: "", usageLimit: "",
  });
  const [busy, setBusy] = useState(false);

  const load = () => couponApi.list().then((data: any) => setCoupons(Array.isArray(data) ? data : [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ code: "", type: "percentage", value: "", minOrderAmount: "", maxDiscountAmount: "", validTo: "", usageLimit: "" });
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value || !form.validTo) {
      toast.error("Code, value, and expiry date are required.");
      return;
    }
    setBusy(true);
    try {
      await couponApi.create({
        code: form.code, type: form.type, value: form.value,
        minOrderAmount: form.minOrderAmount || 0,
        maxDiscountAmount: form.maxDiscountAmount || null,
        validTo: form.validTo, usageLimit: form.usageLimit || null,
      });
      toast.success("Coupon created!");
      resetForm();
      load();
    } catch (err: any) { toast.error(err.message || "Failed to create coupon."); }
    finally { setBusy(false); }
  };

  const toggleActive = async (coupon: any) => {
    try {
      await couponApi.update(coupon._id, { isActive: !coupon.isActive });
      toast.success(coupon.isActive ? "Coupon deactivated." : "Coupon activated.");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon permanently?")) return;
    try {
      await couponApi.remove(id);
      toast.success("Coupon deleted.");
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const isExpired = (d: string) => new Date(d) < new Date();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage discount coupons.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
          <Plus className="h-4 w-4" />{showForm ? "Cancel" : "New coupon"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 card-surface p-6 max-w-3xl">
          <h2 className="font-bold mb-4 flex items-center gap-2"><Tag className="h-5 w-5 text-accent" /> Create new coupon</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Code" placeholder="e.g. SAVE20" value={form.code} onChange={(v) => setForm({ ...form, code: v })} icon={<Hash className="h-4 w-4" />} />
            <div>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</span>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <Field label={form.type === "percentage" ? "Discount %" : "Discount $"} type="number" placeholder="10" value={form.value} onChange={(v) => setForm({ ...form, value: v })} icon={form.type === "percentage" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />} />
            <Field label="Min order ($)" type="number" placeholder="0" value={form.minOrderAmount} onChange={(v) => setForm({ ...form, minOrderAmount: v })} icon={<DollarSign className="h-4 w-4" />} />
            <Field label="Max discount ($)" type="number" placeholder="No limit" value={form.maxDiscountAmount} onChange={(v) => setForm({ ...form, maxDiscountAmount: v })} icon={<DollarSign className="h-4 w-4" />} />
            <Field label="Expires" type="date" value={form.validTo} onChange={(v) => setForm({ ...form, validTo: v })} icon={<Calendar className="h-4 w-4" />} />
            <Field label="Usage limit" type="number" placeholder="Unlimited" value={form.usageLimit} onChange={(v) => setForm({ ...form, usageLimit: v })} icon={<Hash className="h-4 w-4" />} />
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" disabled={busy} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50">
              {busy ? "Creating…" : "Create coupon"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold hover:border-foreground">Cancel</button>
          </div>
        </form>
      )}

      {/* Coupons table */}
      <div className="mt-6 card-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-4">Code</th>
              <th className="p-4">Type</th>
              <th className="p-4">Value</th>
              <th className="p-4">Min order</th>
              <th className="p-4">Expires</th>
              <th className="p-4">Usage</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No coupons yet. Create your first coupon above.</td></tr>
            )}
            {coupons.map((c: any) => {
              const expired = isExpired(c.validTo);
              const active = c.isActive && !expired;
              return (
                <tr key={c._id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-mono text-xs font-bold tracking-wider">
                      <Tag className="h-3 w-3" />{c.code}
                    </span>
                  </td>
                  <td className="p-4 capitalize">{c.type}</td>
                  <td className="p-4 font-semibold">
                    {c.type === "percentage" ? `${c.value}%` : `$${c.value}`}
                    {c.maxDiscountAmount ? <span className="text-xs text-muted-foreground ml-1">(max ${c.maxDiscountAmount})</span> : null}
                  </td>
                  <td className="p-4 text-muted-foreground">{c.minOrderAmount ? `$${c.minOrderAmount}` : "—"}</td>
                  <td className="p-4">
                    <span className={cn("text-xs font-medium", expired ? "text-destructive" : "text-muted-foreground")}>
                      {new Date(c.validTo).toLocaleDateString()}
                      {expired && " (expired)"}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : " / ∞"}
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                      active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    )}>
                      {active ? "Active" : expired ? "Expired" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleActive(c)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" title={c.isActive ? "Deactivate" : "Activate"}>
                        {c.isActive ? <ToggleRight className="h-4 w-4 text-success" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                      </button>
                      <button onClick={() => deleteCoupon(c._id)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted text-destructive" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, icon }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative">
        {icon && <div className="absolute left-3 top-3.5 text-muted-foreground">{icon}</div>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={cn("h-11 w-full rounded-xl border border-border bg-background text-sm outline-none focus:border-foreground", icon ? "pl-9 pr-4" : "px-4")} />
      </div>
    </label>
  );
}
