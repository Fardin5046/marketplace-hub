import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, FileText } from "lucide-react";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId") || "";

  return (
    <div className="container-page grid place-items-center py-24 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Order placed</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Thank you! Your order has been received. We've sent a confirmation to your email.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {orderId && <Link to={`/account/orders/${orderId}`} className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">View order <ArrowRight className="h-4 w-4" /></Link>}
        {orderId && <Link to={`/account/orders/${orderId}/invoice`} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-foreground"><FileText className="h-4 w-4" /> View invoice</Link>}
        <Link to="/shop" className="rounded-full px-6 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">Continue shopping</Link>
      </div>
    </div>
  );
}
