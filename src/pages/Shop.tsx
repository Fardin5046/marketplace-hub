import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Grid3x3, List, SlidersHorizontal, X } from "lucide-react";
import { productApi, categoryApi } from "@/lib/api";
import { ProductCard } from "@/components/marketplace/ProductCard";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get("category") || "";
  const [sort, setSort] = useState(params.get("sort") || "featured");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [price, setPrice] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.list().then((cats: any) => setCategories(Array.isArray(cats) ? cats : [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi.list({
      category: activeCategory, sort, minPrice: price[0] || undefined,
      maxPrice: price[1] < 500 ? price[1] : undefined,
      rating: minRating || undefined, inStock: inStock || undefined,
    }).then((d: any) => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, sort, price, minRating, inStock]);

  const setCategory = (id: string) => {
    const np = new URLSearchParams(params);
    if (id) np.set("category", id); else np.delete("category");
    setParams(np);
  };

  const Filters = () => (
    <div className="space-y-7">
      <FilterGroup title="Categories">
        <button onClick={() => setCategory("")} className={"block w-full text-left text-sm py-1.5 " + (!activeCategory ? "font-bold" : "text-muted-foreground hover:text-foreground")}>All categories</button>
        {categories.map((c: any) => (
          <button key={c._id} onClick={() => setCategory(c.slug)} className={"flex w-full items-center justify-between text-sm py-1.5 " + (activeCategory === c.slug ? "font-bold" : "text-muted-foreground hover:text-foreground")}>
            <span>{c.name}</span><span className="text-xs">{(c.productCount || 0).toLocaleString()}</span>
          </button>
        ))}
      </FilterGroup>
      <FilterGroup title="Price">
        <input type="range" min={0} max={500} value={price[1]} onChange={(e) => setPrice([0, Number(e.target.value)])} className="w-full accent-accent" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>$0</span><span>Up to ${price[1]}</span></div>
      </FilterGroup>
      <FilterGroup title="Rating">
        {[4, 3, 2, 0].map((r) => (
          <label key={r} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
            <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} className="accent-foreground" />
            {r === 0 ? "All ratings" : `${r}★ & up`}
          </label>
        ))}
      </FilterGroup>
      <FilterGroup title="Availability">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-foreground" /> In stock only
        </label>
      </FilterGroup>
    </div>
  );

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Shop / {activeCategory ? categories.find((c: any) => c.slug === activeCategory)?.name : "All products"}</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{activeCategory ? categories.find((c: any) => c.slug === activeCategory)?.name : "All products"}</h1>
        <p className="mt-1 text-muted-foreground">{products.length} products from independent vendors</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block"><Filters /></aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => setDrawerOpen(true)} className="lg:hidden inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <div className="ml-auto flex items-center gap-2">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-full border border-border bg-card px-4 text-sm font-medium outline-none">
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="hidden rounded-full border border-border bg-card p-1 md:flex">
                <button onClick={() => setLayout("grid")} className={"grid h-8 w-8 place-items-center rounded-full " + (layout === "grid" ? "bg-foreground text-background" : "")}><Grid3x3 className="h-4 w-4" /></button>
                <button onClick={() => setLayout("list")} className={"grid h-8 w-8 place-items-center rounded-full " + (layout === "list" ? "bg-foreground text-background" : "")}><List className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="py-16 text-center text-muted-foreground">Loading products…</div>
          ) : products.length === 0 ? (
            <div className="card-surface py-16 text-center">
              <Filter className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-semibold">No products match these filters</p>
              <button onClick={() => { setPrice([0, 500]); setMinRating(0); setInStock(false); setCategory(""); }} className="mt-4 text-sm underline">Clear all filters</button>
            </div>
          ) : layout === "grid" ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">{products.map((p: any) => <ProductCard key={p._id} product={p} />)}</div>
          ) : (
            <div className="space-y-4">{products.map((p: any) => <ProductCard key={p._id} product={p} layout="list" />)}</div>
          )}
        </div>
      </div>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-card p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h3 className="font-bold text-lg">Filters</h3><button onClick={() => setDrawerOpen(false)}><X className="h-5 w-5" /></button></div>
            <Filters />
            <button onClick={() => setDrawerOpen(false)} className="mt-8 w-full rounded-full bg-foreground py-3 text-sm font-semibold text-background">Show {products.length} results</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
