import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { orderApi } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";

export default function InvoicePreview() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  useEffect(() => { if (id) orderApi.get(id).then(setOrder).catch(() => {}); }, [id]);
  if (!order) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="print:w-full">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link to={`/account/orders/${order._id}`} className="text-sm text-muted-foreground hover:text-foreground">← Back to order</Link>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-foreground"><Printer className="h-4 w-4" />Print invoice</button>
        </div>
      </div>
      <div className="printable-invoice card-surface p-8 sm:p-12 mx-auto max-w-3xl print:p-0 print:m-0 print:max-w-none print:border-none print:shadow-none print:bg-white print:text-black">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border print:border-neutral-300 pb-8">
          <div><p className="text-2xl font-extrabold tracking-tight">Marketly<span className="text-accent">.</span></p><p className="mt-1 text-xs text-muted-foreground print:text-neutral-600">Curated multi-vendor marketplace</p></div>
          <div className="text-right"><p className="text-xs uppercase tracking-wider text-muted-foreground print:text-neutral-600">Invoice</p><p className="text-xl font-extrabold">{order.invoiceNumber || order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground print:text-neutral-600">Issued {new Date(order.placedAt).toLocaleDateString()}</p></div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 mt-8 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground print:text-neutral-600 font-bold">Billed to</p>
            <p className="mt-2 font-semibold text-foreground print:text-neutral-900">{order.shippingAddress?.fullName}</p>
            <p className="text-muted-foreground print:text-neutral-600">
              {order.shippingAddress?.address}<br/>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}<br/>
              {order.shippingAddress?.email}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground print:text-neutral-600 font-bold">Order details</p>
            <p className="mt-2"><span className="text-muted-foreground print:text-neutral-600">Order number: </span><span className="font-semibold text-foreground print:text-neutral-900">{order.orderNumber}</span></p>
            <p><span className="text-muted-foreground print:text-neutral-600">Status: </span><span className="font-semibold text-foreground print:text-neutral-900">{order.orderStatus}</span></p>
            <p><span className="text-muted-foreground print:text-neutral-600">Payment: </span><span className="font-semibold capitalize text-foreground print:text-neutral-900">{order.paymentMethod}</span></p>
            <p><span className="text-muted-foreground print:text-neutral-600">Payment status: </span><span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-success print:text-neutral-900' : 'text-warning print:text-neutral-900'}`}>{order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span></p>
          </div>
        </div>
        <table className="mt-10 w-full text-sm">
          <thead>
            <tr className="border-b border-border print:border-neutral-300 text-xs uppercase tracking-wider text-muted-foreground print:text-neutral-600">
              <th className="text-left py-3 font-bold">Item</th>
              <th className="text-center py-3 font-bold">Qty</th>
              <th className="text-right py-3 font-bold">Price</th>
              <th className="text-right py-3 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((p: any, i: number) => (
              <tr key={i} className="border-b border-border/60 print:border-neutral-200">
                <td className="py-4 font-medium text-foreground print:text-neutral-900">{p.title}</td>
                <td className="text-center text-foreground print:text-neutral-900">{p.qty}</td>
                <td className="text-right text-foreground print:text-neutral-900">{formatPrice(p.price)}</td>
                <td className="text-right font-semibold text-foreground print:text-neutral-900">{formatPrice(p.price * p.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} value={`-${formatPrice(order.discount)}`} accent />}
          <Row label="Shipping" value={order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)} />
          <Row label="Tax" value={formatPrice(order.tax)} />
          <div className="flex justify-between border-t border-border print:border-neutral-300 pt-3 text-lg font-extrabold print:text-neutral-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          {order.paymentStatus !== 'paid' && (
            <p className="text-xs text-warning print:text-neutral-600 font-medium pt-1">Payment pending — Payment will be confirmed upon delivery.</p>
          )}
        </div>
        <p className="mt-12 border-t border-border print:border-neutral-300 pt-6 text-center text-xs text-muted-foreground print:text-neutral-500">Thank you for shopping with Marketly. For support, reach us at hello@marketly.com</p>
      </div>
    </div>
  );
}
function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <div className="flex justify-between"><span className="text-muted-foreground print:text-neutral-600">{label}</span><span className={accent ? "font-semibold text-success print:text-neutral-900" : "font-semibold print:text-neutral-900"}>{value}</span></div>;
}
