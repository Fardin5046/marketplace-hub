import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { productApi, categoryApi } from "@/lib/api";
import { toast } from "sonner";

export default function ProductForm() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();
  const [cats, setCats] = useState<any[]>([]);
  const [images, setImages] = useState<{ url: string; alt: string }[]>([]);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([{ name: 'Black', hex: '#0a0a0a' }]);
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [form, setForm] = useState({ title: '', description: '', sku: '', price: '', oldPrice: '', discountPercent: '', stock: '', categoryId: '', status: 'published' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    categoryApi.list().then((c: any) => setCats(Array.isArray(c) ? c : [])).catch(() => {});
    if (editing) {
      productApi.get(id!).then((p: any) => {
        setForm({ title: p.title, description: p.description || '', sku: p.sku || '', price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : '', discountPercent: p.discountPercent ? String(p.discountPercent) : '', stock: String(p.stock), categoryId: p.category?._id || '', status: p.status || 'published' });
        setImages(p.images || []);
        setColors(p.colors || []);
        setSizes(p.sizes || []);
      }).catch(() => {});
    }
  }, [id]);

  const submit = async (status: string) => {
    if (!form.title || !form.price || !form.categoryId) { toast.error("Title, price, and category are required."); return; }
    setBusy(true);
    try {
      const body = { ...form, status, images, colors, sizes, categoryId: form.categoryId };
      if (editing) {
        await productApi.update(id!, body);
        toast.success("Product updated!");
      } else {
        await productApi.create(body);
        toast.success("Product created!");
      }
      nav('/vendor/products');
    } catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <div>
      <Link to="/vendor/products" className="text-sm text-muted-foreground hover:text-foreground">← All products</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">{editing ? "Edit product" : "Add new product"}</h1>
        <div className="flex gap-2">
          <button onClick={() => submit('draft')} disabled={busy} className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:border-foreground">Save draft</button>
          <button onClick={() => submit('published')} disabled={busy} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">{busy ? 'Saving…' : editing ? "Save changes" : "Publish"}</button>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Basic information">
            <div className="space-y-4">
              <Field label="Product title" value={form.title} onChange={(v) => setForm({...form, title: v})} placeholder="e.g. Nordic Pro Wireless Headphones" />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</span><select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground"><option value="">Select…</option>{cats.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
                <Field label="SKU" value={form.sku} onChange={(v) => setForm({...form, sku: v})} placeholder="NRD-001" />
              </div>
              <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</span><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Tell customers what makes this product special…" rows={5} className="w-full rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-foreground resize-none" /></label>
            </div>
          </Card>
          <Card title="Images">
            <p className="text-xs text-muted-foreground mb-3">Add image URLs. First is the main display image.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => setImages(images.filter((_, x) => x !== i))} className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-foreground/80 text-background opacity-0 group-hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
                  {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-foreground text-background px-2 py-0.5 text-[10px] font-bold">Main</span>}
                </div>
              ))}
              <button onClick={() => { const url = prompt("Image URL:"); if (url) setImages([...images, { url, alt: '' }]); }} className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-foreground grid place-items-center text-muted-foreground hover:text-foreground transition">
                <div className="text-center"><Upload className="mx-auto h-5 w-5" /><p className="mt-1 text-xs font-semibold">Add URL</p></div>
              </button>
            </div>
          </Card>
          <Card title="Variants">
            <div className="space-y-5">
              <div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sizes</p><div className="flex flex-wrap gap-2">
                {sizes.map((s, i) => (<span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium">{s}<button onClick={() => setSizes(sizes.filter((_, x) => x !== i))}><X className="h-3 w-3" /></button></span>))}
                <button onClick={() => { const v = prompt("New size"); if (v) setSizes([...sizes, v]); }} className="rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-foreground">+ Add size</button>
              </div></div>
              <div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Colors</p><div className="flex flex-wrap gap-2 items-center">
                {colors.map((c, i) => (<div key={i} className="relative"><span className="block h-8 w-8 rounded-full border-2 border-border" style={{ background: c.hex }} /><button onClick={() => setColors(colors.filter((_, x) => x !== i))} className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-foreground text-background"><X className="h-2.5 w-2.5" /></button></div>))}
                <input type="color" onChange={(e) => setColors([...colors, { name: e.target.value, hex: e.target.value }])} className="h-8 w-8 rounded-full overflow-hidden cursor-pointer" />
              </div></div>
            </div>
          </Card>
        </div>
        <aside className="space-y-6">
          <Card title="Pricing"><div className="space-y-4">
            <Field label="Regular price" type="number" value={form.price} onChange={v => setForm({...form, price: v})} placeholder="0.00" />
            <Field label="Old price" type="number" value={form.oldPrice} onChange={v => setForm({...form, oldPrice: v})} placeholder="0.00" />
            <Field label="Discount %" type="number" value={form.discountPercent} onChange={v => setForm({...form, discountPercent: v})} placeholder="0" />
          </div></Card>
          <Card title="Inventory"><Field label="Stock quantity" type="number" value={form.stock} onChange={v => setForm({...form, stock: v})} placeholder="0" /></Card>
          <Card title="Status">
            <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Visibility</span><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground"><option value="published">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label>
          </Card>
          <Card title="Preview">
            <div className="rounded-xl overflow-hidden bg-muted aspect-square">
              {images[0] ? <img src={images[0].url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="card-surface p-6"><h2 className="font-bold mb-4">{title}</h2>{children}</div>;
}
function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span><input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-foreground" /></label>;
}
