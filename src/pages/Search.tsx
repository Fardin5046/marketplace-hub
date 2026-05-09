import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productApi } from "@/lib/api";
import { ProductCard } from "@/components/marketplace/ProductCard";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) { setResults([]); setLoading(false); return; }
    setLoading(true);
    productApi.list({ search: q }).then((d: any) => setResults(d.products || [])).catch(() => setResults([])).finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-extrabold tracking-tight">Search results</h1>
      <p className="mt-2 text-muted-foreground">{results.length} results for "{q}"</p>
      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Searching…</div>
      ) : results.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">No products found. Try a different search term.</div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {results.map((p: any) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
