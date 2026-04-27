import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice, productImage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ProductCard({ product: p, layout = "grid" }: { product: any; layout?: "grid" | "list" }) {
  const { addToCart, toggleWishlist, wishlistIds, user } = useStore();
  const isWished = wishlistIds.includes(p._id);
  const imgUrl = productImage(p);
  const rating = p.ratingAverage || p.rating || 0;
  const reviewCount = p.ratingCount || p.reviewCount || 0;
  const discount = p.discountPercent || p.discount || 0;

  if (layout === "list") {
    return (
      <div className="card-surface hover-lift flex gap-5 p-4">
        <Link to={`/product/${p.slug}`} className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
          <img src={imgUrl} alt={p.title} className="h-full w-full object-cover" />
        </Link>
        <div className="flex-1">
          <Link to={`/product/${p.slug}`} className="font-bold hover:underline">{p.title}</Link>
          <p className="text-xs text-muted-foreground">{p.vendorName}</p>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <Star className="h-3 w-3 fill-foreground" />{rating} <span className="text-muted-foreground">({reviewCount})</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-bold">{formatPrice(p.price)}</span>
            {p.oldPrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(p.oldPrice)}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface hover-lift group overflow-hidden">
      <Link to={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        <img src={imgUrl} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
        {p.badge && <span className="absolute left-3 top-3 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-bold text-background">{p.badge}</span>}
        {discount > 0 && <span className="absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">-{discount}%</span>}
      </Link>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.vendorName}</p>
        <Link to={`/product/${p.slug}`} className="mt-1 block text-sm font-bold leading-snug hover:underline line-clamp-2">{p.title}</Link>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <Star className="h-3 w-3 fill-foreground" /><span className="font-semibold">{rating}</span>
          <span className="text-muted-foreground">({reviewCount})</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold">{formatPrice(p.price)}</span>
            {p.oldPrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(p.oldPrice)}</span>}
          </div>
          {user && (
            <button onClick={(e) => { e.preventDefault(); toggleWishlist(p._id); }} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
              <Heart className={cn("h-4 w-4", isWished && "fill-accent text-accent")} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
