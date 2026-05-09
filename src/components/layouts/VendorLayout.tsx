import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, DollarSign, Wallet, Store, Settings, Bell, Search, LogOut, Menu, X, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import NotificationDropdown from "@/components/NotificationDropdown";

const navItems = [
  { to: "/vendor", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/vendor/products", label: "Products", icon: Package },
  { to: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { to: "/vendor/revenue", label: "Revenue", icon: DollarSign },
  { to: "/vendor/payouts", label: "Payouts", icon: Wallet },
  { to: "/vendor/store", label: "Store profile", icon: Store },
  { to: "/vendor/settings", label: "Settings", icon: Settings },
];

export default function VendorLayout() {
  // Fix #5: All hooks BEFORE any conditional return
  const { user, loading, vendorProfile, signOut } = useStore();
  const navigate = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Guard: redirect if not authenticated or not a vendor
  useEffect(() => {
    if (!loading && (!user || user.role !== "vendor")) {
      navigate("/login?role=vendor", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user || user.role !== "vendor") return null;

  const isActive = (to: string, end?: boolean) => end ? loc.pathname === to : loc.pathname.startsWith(to);

  // Fix #8: Check vendor approval status
  const approvalStatus = vendorProfile?.approvalStatus || 'pending';
  const isApproved = approvalStatus === 'approved';

  // Fix #1: Vendor search navigation
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    if (q.includes("product")) navigate("/vendor/products");
    else if (q.includes("order")) navigate("/vendor/orders");
    else if (q.includes("revenue") || q.includes("earning")) navigate("/vendor/revenue");
    else if (q.includes("payout")) navigate("/vendor/payouts");
    else if (q.includes("store") || q.includes("profile")) navigate("/vendor/store");
    else navigate("/vendor/products");
    setSearch("");
  };

  // Fix #15: real sign out
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
          {navItems.map((n) => {
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
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-md md:flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Quick search products, orders…" className="h-10 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm outline-none focus:border-foreground" />
          </form>
          <div className="ml-auto flex items-center gap-3">
            <NotificationDropdown />
            <div className="flex items-center gap-3 rounded-full border border-border bg-background py-1 pl-1 pr-3">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">
                {(user?.name || "NA").slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium sm:inline">{user?.name || "Vendor"}</span>
            </div>
          </div>
        </header>

        {/* Fix #8: Vendor approval banner */}
        {!isApproved && (
          <div className="border-b border-warning/40 bg-warning/10 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <p className="text-sm font-medium">
                {approvalStatus === 'pending' && "Your vendor account is pending approval. An admin will review your application shortly."}
                {approvalStatus === 'rejected' && "Your vendor account has been rejected. Please contact support for more information."}
                {approvalStatus === 'suspended' && "Your vendor account has been suspended. Please contact support."}
              </p>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
