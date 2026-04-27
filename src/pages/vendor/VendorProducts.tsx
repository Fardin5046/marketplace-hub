import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { productApi } from "@/lib/api";
import { formatPrice, productImage } from "@/lib/mock-data";
import { StatusPill } from "@/components/marketplace/StatusPill";
import { toast } from "sonner";

export default function VendorProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = () => productApi.vendorProducts({ search: q }).then((d: any) => setProducts(d.products || [])).catch(() => {});
  useEffect(() => { load(); }, [q]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try { await productApi.remove(id); toast.success("Deleted"); load(); } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold tracking-tight">Products</h1><p className="mt-1 text-sm text-muted-foreground">{products.length} products in your store</p></div>
        <Link to="/vendor/products/new" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"><Plus className="h-4 w-4" />Add product</Link>
      </div>
      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-foreground" />
      </div>
      <div className="card-surface mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-4">Product</th><th className="p-4">Stock</th><th className="p-4">Price</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-border">
            {products.map((p: any) => (
              <tr key={p._id} className="hover:bg-muted/30">
                <td className="p-4"><div className="flex items-center gap-3"><img src={productImage(p)} alt="" className="h-12 w-12 rounded-lg object-cover bg-muted" /><div><p className="font-semibold">{p.title}</p><p className="text-xs text-muted-foreground capitalize">{p.categorySlug}</p></div></div></td>
                <td className="p-4"><span className={p.stock === 0 ? "text-destructive font-semibold" : p.stock < 10 ? "text-warning font-semibold" : ""}>{p.stock}</span></td>
                <td className="p-4 font-semibold">{formatPrice(p.price)} {p.discountPercent > 0 && <span className="ml-1 text-xs text-accent">-{p.discountPercent}%</span>}</td>
                <td className="p-4"><StatusPill status={p.stock === 0 ? "Out of stock" : p.status === 'published' ? "Active" : p.status} /></td>
                <td className="p-4 text-right"><div className="inline-flex gap-1">
                  <Link to={`/vendor/products/${p._id}/edit`} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"><Edit2 className="h-4 w-4" /></Link>
                  <button onClick={() => handleDelete(p._id)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
