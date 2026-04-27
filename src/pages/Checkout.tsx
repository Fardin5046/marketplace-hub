import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronRight, CreditCard, MapPin, Truck, Apple } from "lucide-react";
import { useStore } from "@/lib/store";
import { orderApi } from "@/lib/api";
import { formatPrice, productImage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const steps = [
  { id: 1, label: "Shipping", icon: MapPin },
  { id: 2, label: "Delivery", icon: Truck },
  { id: 3, label: "Payment", icon: CreditCard },
  { id: 4, label: "Review", icon: Check },
];

export default function Checkout() {
  const { cart, cartTotal, user, refreshCart } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState<"standard" | "express" | "same-day">("standard");
  const [payment, setPayment] = useState<"card" | "apple" | "cod">("card");
  const [busy, setBusy] = useState(false);
  const [shipping, setShipping] = useState({
    fullName: user?.name || "", phone: "", email: user?.email || "",
    address: "", city: "", state: "", zip: "", country: "United States",
  });

  // Guard: redirect if not logged in
  useEffect(() => {
    if (!user) { nav("/login", { replace: true }); }
  }, [user, nav]);

  // Guard: redirect if cart is empty
  useEffect(() => {
    if (user && cart.length === 0) { nav("/cart", { replace: true }); }
  }, [user, cart, nav]);

  const shippingCost = delivery === "express" ? 18 : delivery === "same-day" ? 28 : (cartTotal > 80 ? 0 : 9);
  const tax = Math.max(0, cartTotal * 0.08);
  const total = cartTotal + shippingCost + tax;

  const placeOrder = async () => {
    setBusy(true);
    try {
      const data: any = await orderApi.create({
        shippingAddress: shipping, paymentMethod: payment, deliveryMethod: delivery,
      });
      const orderId = data.orders?.[0]?._id || '';
      // Clear cart on frontend to sync with backend
      await refreshCart();
      toast.success("Order placed successfully!");
      nav(`/order-success?orderId=${orderId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order.");
    } finally { setBusy(false); }
  };

  const validateShipping = (): boolean => {
    const { fullName, phone, email, address, city } = shipping;
    if (!fullName.trim()) { toast.error("Full name is required."); return false; }
    if (!phone.trim()) { toast.error("Phone number is required."); return false; }
    if (!email.trim()) { toast.error("Email is required."); return false; }
    if (!address.trim()) { toast.error("Address is required."); return false; }
    if (!city.trim()) { toast.error("City is required."); return false; }
    return true;
  };

  const next = () => {
    if (step === 1 && !validateShipping()) return;
    step < 4 ? setStep(s => s + 1) : placeOrder();
  };

  if (!user || cart.length === 0) return null;

  return (
    <div className="container-page py-8 lg:py-12">
      <Link to="/cart" className="text-sm text-muted-foreground hover:text-foreground">← Back to cart</Link>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Checkout</h1>
      <ol className="mt-8 flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 shrink-0">
            <div className={cn("flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold transition", step >= s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground")}>
              <div className={cn("grid h-6 w-6 place-items-center rounded-full text-[11px]", step > s.id ? "bg-background text-foreground" : "border border-current")}>
                {step > s.id ? <Check className="h-3 w-3" /> : s.id}
              </div>{s.label}
            </div>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </li>
        ))}
      </ol>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="card-surface p-6 sm:p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold">Shipping address</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Full name *" value={shipping.fullName} onChange={v => setShipping({...shipping, fullName: v})} />
                <Field label="Phone *" value={shipping.phone} onChange={v => setShipping({...shipping, phone: v})} />
                <Field label="Email *" value={shipping.email} onChange={v => setShipping({...shipping, email: v})} className="sm:col-span-2" />
                <Field label="Address *" value={shipping.address} onChange={v => setShipping({...shipping, address: v})} className="sm:col-span-2" />
                <Field label="City *" value={shipping.city} onChange={v => setShipping({...shipping, city: v})} />
                <Field label="State / Region" value={shipping.state} onChange={v => setShipping({...shipping, state: v})} />
                <Field label="Zip / Postal" value={shipping.zip} onChange={v => setShipping({...shipping, zip: v})} />
                <Field label="Country" value={shipping.country} onChange={v => setShipping({...shipping, country: v})} />
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold">Delivery method</h2>
              <div className="mt-6 space-y-3">
                {[
                  { id: "standard", label: "Standard shipping", time: "5–7 business days", price: cartTotal > 80 ? "Free" : "$9.00" },
                  { id: "express", label: "Express", time: "2–3 business days", price: "$18.00" },
                  { id: "same-day", label: "Same-day delivery", time: "Today before 9pm", price: "$28.00" },
                ].map((opt) => (
                  <label key={opt.id} className={cn("flex items-center gap-4 rounded-2xl border p-5 cursor-pointer transition", delivery === opt.id ? "border-foreground bg-muted/40" : "border-border hover:border-foreground")}>
                    <input type="radio" name="ship" checked={delivery === opt.id} onChange={() => setDelivery(opt.id as any)} className="accent-foreground" />
                    <div className="flex-1"><p className="font-bold">{opt.label}</p><p className="text-sm text-muted-foreground">{opt.time}</p></div>
                    <span className="font-bold">{opt.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold">Payment method</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[{ id: "card", label: "Credit / debit", icon: CreditCard }, { id: "apple", label: "Apple Pay", icon: Apple }, { id: "cod", label: "Cash on delivery", icon: Truck }].map((m) => (
                  <button key={m.id} onClick={() => setPayment(m.id as any)} className={cn("rounded-2xl border p-5 text-left transition", payment === m.id ? "border-foreground bg-muted/40" : "border-border hover:border-foreground")}>
                    <m.icon className="h-5 w-5" /><p className="mt-3 font-bold text-sm">{m.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold">Review your order</h2>
              <div className="mt-6 space-y-3">
                {cart.map((item: any) => item.product && (
                  <div key={item.product._id} className="flex items-center gap-4">
                    <img src={productImage(item.product)} alt={item.product.title} className="h-14 w-14 rounded-xl object-cover bg-muted" />
                    <div className="flex-1"><p className="text-sm font-semibold">{item.product.title}</p><p className="text-xs text-muted-foreground">Qty {item.qty}</p></div>
                    <p className="text-sm font-bold">{formatPrice(item.product.price * item.qty)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 1 ? <button onClick={() => setStep(s => s - 1)} className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-foreground">Back</button> : <span />}
            <button onClick={next} disabled={busy} className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50">{busy ? "Placing order…" : step === 4 ? "Place order" : "Continue"}</button>
          </div>
        </div>
        <aside className="card-surface h-fit p-6 lg:sticky lg:top-24">
          <h3 className="font-bold">Summary</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatPrice(tax)}</span></div>
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-bold">Total</span><span className="text-2xl font-extrabold">{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, className }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
