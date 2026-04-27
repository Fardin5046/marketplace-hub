import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { orderApi } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { StatusPill } from "@/components/marketplace/StatusPill";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => { if (id) orderApi.get(id).then(setOrder).catch(() => {}); }, [id]);
  if (!order) return <div className="py-16 text-center text-muted-foreground">Loading…</div>;

  return (
    <div>
      <Link to="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">← All orders</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-extrabold tracking-tight">{order.orderNumber}</h1><p className="text-sm text-muted-foreground">Placed {new Date(order.placedAt).toLocaleDateString()}</p></div>
        <StatusPill status={order.orderStatus} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card-surface p-6 lg:col-span-2">
          <h2 className="font-bold mb-4">Items</h2>
          <div className="space-y-3">
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <img src={item.image || 'https://placehold.co/56x56?text=•'} alt={item.title} className="h-14 w-14 rounded-xl object-cover bg-muted" />
                <div className="flex-1"><p className="font-semibold">{item.title}</p><p className="text-xs text-muted-foreground">Qty {item.qty}</p></div>
                <p className="font-bold">{formatPrice(item.price * item.qty)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-success">-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-lg font-extrabold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card-surface p-6">
            <h3 className="font-bold mb-3">Shipping address</h3>
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>
          <div className="card-surface p-6">
            <h3 className="font-bold mb-3">Payment</h3>
            <p className="text-sm capitalize">{order.paymentMethod}</p>
            <StatusPill status={order.paymentStatus === 'paid' ? 'Paid' : 'Pending'} className="mt-2" />
          </div>
          <Link to={`/account/orders/${order._id}/invoice`} className="block rounded-full border border-border py-3 text-center text-sm font-semibold hover:border-foreground">View invoice</Link>
        </div>
      </div>
    </div>
  );
}
