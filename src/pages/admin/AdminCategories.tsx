import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { categoryApi } from "@/lib/api";
import { toast } from "sonner";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newName, setNewName] = useState("");

  const load = () => categoryApi.list().then((cats: any) => setCategories(Array.isArray(cats) ? cats : [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const addCat = async () => {
    if (!newName.trim()) return;
    try { await categoryApi.create({ name: newName.trim() }); setNewName(""); toast.success("Category created!"); load(); } catch (err: any) { toast.error(err.message); }
  };
  const deleteCat = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try { await categoryApi.remove(id); toast.success("Deleted"); load(); } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Categories</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage product categories.</p>
      <div className="mt-6 flex gap-2 max-w-md">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category name…" className="h-10 flex-1 rounded-full border border-border bg-card pl-4 pr-4 text-sm outline-none focus:border-foreground" />
        <button onClick={addCat} className="inline-flex items-center gap-1 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background"><Plus className="h-4 w-4" />Add</button>
      </div>
      <div className="mt-6 card-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-4">Name</th><th className="p-4">Slug</th><th className="p-4">Products</th><th className="p-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-border">
            {categories.map((c: any) => (
              <tr key={c._id} className="hover:bg-muted/30">
                <td className="p-4 font-semibold">{c.name}</td>
                <td className="p-4 text-muted-foreground">{c.slug}</td>
                <td className="p-4">{c.productCount || 0}</td>
                <td className="p-4 text-right"><button onClick={() => deleteCat(c._id)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
