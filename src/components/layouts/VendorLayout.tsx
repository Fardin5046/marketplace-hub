import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, DollarSign, Wallet, Store, Settings, Bell, Search, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/vendor", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/vendor/products", label: "Products", icon: Package },
  { to: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { to: "/vendor/revenue", label: "Revenue", icon: DollarSign },
  { to: "/vendor/payouts", label: "Payouts", icon: Wallet },
  { to: "/vendor/store", label: "Store profile", icon: Store },
  { to: "/vendor/settings", label: "Settings", icon: Settings },
];

export default function VendorLayout() {
  const { user } = useStore();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (to: string, end?: boolean) => end ? loc.pathname === to : loc.pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link to="/" className="text-lg font-extrabold tracking-tight">Marketly<span className="text-accent">.</span></Link>
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">Vendor</span>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((n) => {
            const active = isActive(n.to, n.end);
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="h-4 w-4" /> Exit dashboard
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="relative hidden flex-1 max-w-md md:flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
            <input placeholder="Quick search products, orders…" className="h-10 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm outline-none focus:border-foreground" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
            </button>
            <div className="flex items-center gap-3 rounded-full border border-border bg-background py-1 pl-1 pr-3">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">
                {(user?.name || "NA").slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium sm:inline">{user?.name || "Vendor"}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
