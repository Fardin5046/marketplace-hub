import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { orderApi } from "@/lib/api";
import { User, Mail, Phone, MapPin, ShoppingBag, Star } from "lucide-react";

export default function AccountProfile() {
  const { user } = useStore();
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => { orderApi.myOrders().then((d: any) => setOrderCount(d.orders?.length || 0)).catch(() => {}); }, []);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Profile</h1>
      <div className="mt-6 card-surface p-6">
        <div className="flex items-center gap-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-foreground text-background text-xl font-extrabold">{user.name.slice(0, 2).toUpperCase()}</div>
          <div><h2 className="text-xl font-bold">{user.name}</h2><p className="text-sm text-muted-foreground">{user.email}</p></div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="card-surface p-4 flex items-center gap-3"><ShoppingBag className="h-4 w-4 text-muted-foreground" /><div><p className="font-bold">{orderCount}</p><p className="text-xs text-muted-foreground">Orders</p></div></div>
          <div className="card-surface p-4 flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-semibold">{user.email}</p><p className="text-xs text-muted-foreground">Email</p></div></div>
          <div className="card-surface p-4 flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-semibold capitalize">{user.role}</p><p className="text-xs text-muted-foreground">Account type</p></div></div>
        </div>
      </div>
    </div>
  );
}
