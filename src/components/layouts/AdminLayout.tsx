import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, AlertOctagon, FolderTree, Tag, Bell, Search, LogOut, Menu, X, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import NotificationDropdown from "@/components/NotificationDropdown";

const navLinks = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/vendors", label: "Vendor approvals", icon: Users },
  { to: "/admin/disputes", label: "Disputes", icon: AlertOctagon },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
];

export default function AdminLayout() {
  // Fix #5: All hooks BEFORE any conditional return
  const { user, loading, signOut } = useStore();
  const navigate = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Guard: redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/admin/login", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;
  if (!user || user.role !== "admin") return null;

  const isActive = (to: string, end?: boolean) => (end ? loc.pathname === to : loc.pathname.startsWith(to));

  // Fix #1: Admin search navigation
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    if (q.includes("vendor")) navigate("/admin/vendors");
    else if (q.includes("dispute")) navigate("/admin/disputes");
    else if (q.includes("categ")) navigate("/admin/categories");
    else navigate("/admin/vendors");
    setSearch("");
  };

  // Fix #15: real sign out
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transition-transform lg:static lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight"><Shield className="h-4 w-4 text-accent" />Marketly</Link>
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">Admin</span>
        </div>
        <nav className="space-y-1 p-3">
          {navLinks.map((n) => {
            const active = isActive(n.to, n.end);
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
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
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-md md:flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors, disputes…" className="h-10 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm outline-none focus:border-foreground" />
          </form>
          <div className="ml-auto flex items-center gap-3">
            <NotificationDropdown />
            <div className="flex items-center gap-3 rounded-full border border-border bg-background py-1 pl-1 pr-3">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">AD</div>
              <span className="hidden text-sm font-medium sm:inline">Admin</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
