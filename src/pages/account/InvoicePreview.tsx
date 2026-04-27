import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, Printer } from "lucide-react";
import { orderApi } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";

export default function InvoicePreview() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  useEffect(() => { if (id) orderApi.get(id).then(setOrder).catch(() => {}); }, [id]);
  if (!order) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link to={`/account/orders/${order._id}`} className="text-sm text-muted-foreground hover:text-foreground">← Back to order</Link>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-foreground"><Printer className="h-4 w-4" />Print</button>
        </div>
      </div>
      <div className="card-surface p-8 sm:p-12 mx-auto max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-8">
          <div><p className="text-2xl font-extrabold tracking-tight">Marketly<span className="text-accent">.</span></p><p className="mt-1 text-xs text-muted-foreground">Curated multi-vendor marketplace</p></div>
          <div className="text-right"><p className="text-xs uppercase tracking-wider text-muted-foreground">Invoice</p><p className="text-xl font-extrabold">{order.invoiceNumber || order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">Issued {new Date(order.placedAt).toLocaleDateString()}</p></div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 mt-8 text-sm">
          <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Billed to</p><p className="mt-2 font-semibold">{order.shippingAddress?.fullName}</p><p className="text-muted-foreground">{order.shippingAddress?.address}<br/>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}<br/>{order.shippingAddress?.email}</p></div>
          <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Order details</p><p className="mt-2"><span className="text-muted-foreground">Order: </span><span className="font-semibold">{order.orderNumber}</span></p><p><span className="text-muted-foreground">Status: </span><span className="font-semibold">{order.orderStatus}</span></p><p><span className="text-muted-foreground">Payment: </span><span className="font-semibold capitalize">{order.paymentMethod}</span></p></div>
        </div>
        <table className="mt-10 w-full text-sm">
          <thead><tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground"><th className="text-left py-3">Item</th><th className="text-center py-3">Qty</th><th className="text-right py-3">Price</th><th className="text-right py-3">Total</th></tr></thead>
          <tbody>
            {(order.items || []).map((p: any, i: number) => (
              <tr key={i} className="border-b border-border"><td className="py-4">{p.title}</td><td className="text-center">{p.qty}</td><td className="text-right">{formatPrice(p.price)}</td><td className="text-right font-semibold">{formatPrice(p.price * p.qty)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          <Row label="Shipping" value={order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)} />
          <Row label="Tax" value={formatPrice(order.tax)} />
          <div className="flex justify-between border-t border-border pt-3 text-lg font-extrabold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
        <p className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">Thank you for shopping with Marketly. For support, reach us at hello@marketly.com</p>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>; }
