import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { couponApi } from "@/lib/api";
import { formatPrice, productImage } from "@/lib/mock-data";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { toast } from "sonner";

export default function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal, user } = useStore();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);

  const apply = async () => {
    if (!coupon.trim()) return;
    try {
      const d: any = await couponApi.validate(coupon.trim(), cartTotal);
      setApplied({ code: d.code, discount: d.discount });
      toast.success(`Coupon ${d.code} applied!`);
    } catch (err: any) { toast.error(err.message || "Invalid coupon."); }
  };

  const discount = applied ? applied.discount : 0;
  const shipping = cartTotal > 80 || cartTotal === 0 ? 0 : 9;
  const discountedSubtotal = Math.max(0, cartTotal - discount);
  const tax = discountedSubtotal * 0.08;
  const total = discountedSubtotal + shipping + tax;

  if (!user) {
    return (
      <div className="container-page py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Cart</h1>
        <EmptyState icon={ShoppingBag} title="Please log in" body="Log in to view your cart." cta={{ label: "Sign in", to: "/login" }} />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-page py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Cart</h1>
        <EmptyState icon={ShoppingBag} title="Your cart is empty" body="Add products to see them here." cta={{ label: "Continue shopping", to: "/shop" }} />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-extrabold tracking-tight">Cart</h1>
      <p className="mt-2 text-muted-foreground">{cart.length} {cart.length === 1 ? "item" : "items"}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {cart.map((item: any) => {
            const p = item.product;
            if (!p) return null;
            return (
              <div key={p._id} className="card-surface flex flex-col sm:flex-row gap-5 p-5">
                <Link to={`/product/${p.slug}`} className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <img src={productImage(p)} alt={p.title} className="h-full w-full object-cover" />
                </Link>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.vendorName}</p>
                      <Link to={`/product/${p.slug}`} className="font-bold hover:underline">{p.title}</Link>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(p._id)} aria-label="Remove" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-border">
                      <button onClick={() => updateQty(p._id, item.qty - 1)} disabled={item.qty <= 1} className="grid h-9 w-9 place-items-center disabled:opacity-30"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(p._id, item.qty + 1)} className="grid h-9 w-9 place-items-center"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <p className="font-bold">{formatPrice(p.price * item.qty)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <aside className="card-surface h-fit p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order summary</h2>
          <div className="mt-5 space-y-2.5 text-sm">
            <Row label="Subtotal" value={formatPrice(cartTotal)} />
            {applied && <Row label={`Discount (${applied.code})`} value={`-${formatPrice(discount)}`} accent />}
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
            <Row label="Estimated tax" value={formatPrice(tax)} />
          </div>
          <div className="mt-4 border-t border-border pt-4 flex items-baseline justify-between">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-extrabold">{formatPrice(total)}</span>
          </div>
          <div className="mt-5">
            {!applied ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none" />
                </div>
                <button onClick={apply} className="rounded-full bg-foreground px-4 text-sm font-semibold text-background">Apply</button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-full bg-success/10 text-success px-4 py-2 text-xs font-semibold">
                <span>✓ {applied.code} applied</span>
                <button onClick={() => setApplied(null)}><X className="h-3 w-3" /></button>
              </div>
            )}
          </div>
          <Link to="/checkout" className="mt-6 grid place-items-center rounded-full bg-foreground py-3.5 text-sm font-semibold text-background hover:opacity-90">Proceed to checkout</Link>
          <Link to="/shop" className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "font-semibold text-success" : "font-semibold"}>{value}</span>
    </div>
  );
}
