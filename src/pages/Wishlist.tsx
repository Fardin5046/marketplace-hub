import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice, productImage } from "@/lib/mock-data";
import { EmptyState } from "@/components/marketplace/EmptyState";

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, user } = useStore();

  if (!user) return (
    <div className="container-page py-16">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Wishlist</h1>
      <EmptyState icon={Heart} title="Please log in" body="Log in to view your wishlist." cta={{ label: "Sign in", to: "/login" }} />
    </div>
  );

  if (wishlist.length === 0) return (
    <div className="container-page py-16">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Wishlist</h1>
      <EmptyState icon={Heart} title="Your wishlist is empty" body="Save products you love." cta={{ label: "Browse shop", to: "/shop" }} />
    </div>
  );

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-extrabold tracking-tight">Wishlist</h1>
      <p className="mt-2 text-muted-foreground">{wishlist.length} saved items</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {wishlist.map((p: any) => (
          <div key={p._id} className="card-surface hover-lift overflow-hidden group">
            <Link to={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
              <img src={productImage(p)} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
            </Link>
            <div className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.vendorName}</p>
              <Link to={`/product/${p.slug}`} className="mt-1 block text-sm font-bold leading-snug hover:underline line-clamp-2">{p.title}</Link>
              <p className="mt-2 font-extrabold">{formatPrice(p.price)}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { addToCart(p._id, 1); toggleWishlist(p._id); }} className="flex-1 rounded-full bg-foreground py-2 text-xs font-semibold text-background hover:opacity-90">
                  <ShoppingBag className="inline h-3 w-3 mr-1" /> Move to cart
                </button>
                <button onClick={() => toggleWishlist(p._id)} className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-foreground">
                  <Heart className="h-4 w-4 fill-accent text-accent" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
