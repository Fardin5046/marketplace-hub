import { useEffect, useState } from "react";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function Addresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "Home", fullName: "", phone: "", address: "", city: "", state: "", zip: "", country: "United States", isDefault: false });

  const load = () => authApi.getAddresses().then((d: any) => setAddresses(d.addresses || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.fullName || !form.address) { toast.error("Full name and address are required."); return; }
    try { await authApi.addAddress(form); toast.success("Address added!"); setShowForm(false); setForm({ label: "Home", fullName: "", phone: "", address: "", city: "", state: "", zip: "", country: "United States", isDefault: false }); load(); }
    catch (err: any) { toast.error(err.message); }
  };

  const remove = async (idx: number) => {
    try { await authApi.deleteAddress(idx); toast.success("Address removed."); load(); }
    catch (err: any) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Addresses</h1>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"><Plus className="h-4 w-4" />New address</button>
      </div>
      {showForm && (
        <div className="mt-6 card-surface p-6">
          <h3 className="font-bold mb-4">Add new address</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label (e.g. Home)" value={form.label} onChange={v => setForm({...form, label: v})} />
            <Field label="Full name *" value={form.fullName} onChange={v => setForm({...form, fullName: v})} />
            <Field label="Address *" value={form.address} onChange={v => setForm({...form, address: v})} className="sm:col-span-2" />
            <Field label="City" value={form.city} onChange={v => setForm({...form, city: v})} />
            <Field label="State / Region" value={form.state} onChange={v => setForm({...form, state: v})} />
            <Field label="Zip / Postal" value={form.zip} onChange={v => setForm({...form, zip: v})} />
            <Field label="Country" value={form.country} onChange={v => setForm({...form, country: v})} />
            <Field label="Phone" value={form.phone} onChange={v => setForm({...form, phone: v})} />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} className="accent-foreground" /> Set as default
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={add} className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-full border border-border px-5 py-2 text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {addresses.map((a: any, i: number) => (
          <div key={i} className="card-surface p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-muted-foreground" /><h3 className="font-bold">{a.label || "Address"}</h3></div>
              {a.isDefault && <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent"><Star className="h-3 w-3 fill-current" />Default</span>}
            </div>
            <div className="mt-4 text-sm text-muted-foreground space-y-0.5">
              <p className="font-semibold text-foreground">{a.fullName}</p>
              <p>{a.address}</p>
              <p>{[a.city, a.state, a.zip].filter(Boolean).join(", ")}</p>
              <p>{a.country}</p>
              {a.phone && <p>{a.phone}</p>}
            </div>
            <div className="mt-5 flex gap-2 text-xs">
              <button onClick={() => remove(i)} className="rounded-full px-3 py-1.5 font-semibold text-muted-foreground hover:text-destructive">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, className }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={className || "block"}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
