import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Heart, Minus, Plus, Share2, Star, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { productApi, reviewApi } from "@/lib/api";
import { formatPrice, productImage } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProductDetails() {
  const { slug } = useParams();
  const { addToCart, toggleWishlist, wishlistIds, user } = useStore();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productApi.get(slug).then((p: any) => {
      setProduct(p);
      setSize(p.sizes?.[1] || p.sizes?.[0]);
      setColor(p.colors?.[0]?.name);
      setImgIdx(0);
      // Fetch related & reviews
      productApi.related(p._id).then((r: any) => setRelated(Array.isArray(r) ? r : [])).catch(() => {});
      reviewApi.forProduct(p._id).then((d: any) => setReviews(d.reviews || [])).catch(() => {});
    }).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container-page py-24 text-center text-muted-foreground">Loading…</div>;
  if (!product) return (
    <div className="container-page py-24 text-center">
      <p className="text-muted-foreground">Product not found.</p>
      <Link to="/shop" className="mt-4 inline-block underline">Back to shop</Link>
    </div>
  );

  const isWished = wishlistIds.includes(product._id);
  const rating = product.ratingAverage || 0;
  const reviewCount = product.ratingCount || 0;
  const discount = product.discountPercent || 0;

  const handleAddToCart = async () => {
    if (!user) { toast.error("Please log in to add items to cart."); return; }
    try {
      await addToCart(product._id, qty, { size, color });
      toast.success("Added to cart!");
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="container-page py-8 pb-32 lg:pb-12">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /> Back to shop</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl bg-muted">
            <img src={productImage(product, imgIdx)} alt={product.title} className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images.map((img: any, i: number) => (
              <button key={i} onClick={() => setImgIdx(i)} className={cn("aspect-square overflow-hidden rounded-xl border-2 transition", imgIdx === i ? "border-foreground" : "border-transparent hover:border-border")}>
                <img src={typeof img === 'string' ? img : img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        {/* Info */}
        <div>
          <span className="text-sm font-semibold text-accent">{product.vendorName}</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight lg:text-4xl">{product.title}</h1>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-foreground" />{rating}</div>
            <span className="text-muted-foreground">{reviewCount} reviews</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", product.stock > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="text-lg text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>}
            {discount > 0 && <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">-{discount}%</span>}
          </div>
          {product.colors?.length > 0 && (
            <div className="mt-7">
              <p className="mb-3 text-sm font-bold">Color: <span className="font-normal text-muted-foreground">{color}</span></p>
              <div className="flex gap-3">
                {product.colors.map((c: any) => (
                  <button key={c.name} onClick={() => setColor(c.name)} className={cn("h-10 w-10 rounded-full border-2 transition", color === c.name ? "border-foreground" : "border-border")} style={{ background: c.hex }} />
                ))}
              </div>
            </div>
          )}
          {product.sizes?.length > 0 && (
            <div className="mt-7">
              <p className="mb-3 text-sm font-bold">Size: <span className="font-normal text-muted-foreground">{size}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button key={s} onClick={() => setSize(s)} className={cn("min-w-12 rounded-xl border px-4 py-2.5 text-sm font-semibold", size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-7 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} className="grid h-11 w-11 place-items-center"><Plus className="h-4 w-4" /></button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 rounded-full bg-foreground py-3.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-40">
              {product.stock === 0 ? "Out of stock" : "Add to cart"}
            </button>
            {user && <button onClick={() => toggleWishlist(product._id)} className="grid h-12 w-12 place-items-center rounded-full border border-border hover:border-foreground"><Heart className={cn("h-5 w-5", isWished && "fill-accent text-accent")} /></button>}
          </div>
          <div className="mt-7 grid grid-cols-3 gap-3 text-xs">
            {[{ icon: Truck, t: "Free shipping", s: "Over $80" }, { icon: RotateCcw, t: "30-day returns", s: "No questions" }, { icon: ShieldCheck, t: "Buyer protected", s: "Full refund" }].map((b) => (
              <div key={b.t} className="card-surface p-4 text-center"><b.icon className="mx-auto h-5 w-5 text-muted-foreground" /><p className="mt-2 font-bold">{b.t}</p><p className="text-muted-foreground">{b.s}</p></div>
            ))}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="mt-16">
        <div className="flex gap-2 border-b border-border">
          {[{ id: "desc", label: "Description" }, { id: "specs", label: "Specifications" }, { id: "reviews", label: `Reviews (${reviewCount})` }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={cn("px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition", tab === t.id ? "border-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{t.label}</button>
          ))}
        </div>
        <div className="py-8">
          {tab === "desc" && <p className="max-w-3xl text-muted-foreground leading-relaxed">{product.description}</p>}
          {tab === "specs" && product.specs?.length > 0 && (
            <dl className="max-w-2xl divide-y divide-border">
              {product.specs.map((s: any) => (<div key={s.label} className="grid grid-cols-2 py-3 text-sm"><dt className="text-muted-foreground">{s.label}</dt><dd className="font-semibold">{s.value}</dd></div>))}
            </dl>
          )}
          {tab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet.</p> : reviews.map((r: any) => (
                <div key={r._id} className="card-surface p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-muted text-xs font-bold">{(r.customer?.name || "U").slice(0, 2).toUpperCase()}</div>
                      <div><p className="text-sm font-bold">{r.customer?.name || "Anonymous"}</p><p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p></div>
                    </div>
                    <div className="flex gap-0.5 text-accent">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating && "fill-current")} />)}</div>
                  </div>
                  {r.title && <h4 className="mt-3 font-semibold">{r.title}</h4>}
                  {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-extrabold tracking-tight">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {related.map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
