import { Link, useNavigate } from "react-router-dom";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { categoryApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const { cartCount, wishlist, theme, toggleTheme, user } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const nav = useNavigate();

  useEffect(() => { categoryApi.list().then((cats: any) => setCategories(Array.isArray(cats) ? cats : [])).catch(() => {}); }, []);

  const submit = (e: React.FormEvent) => { e.preventDefault(); nav(`/search?q=${encodeURIComponent(q)}`); };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="hidden bg-foreground py-2 text-center text-xs text-background md:block">
        Free worldwide shipping over $80 · Become a vendor and earn up to 92% revenue share →
      </div>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-1 text-xl font-extrabold tracking-tight">
            Marketly<span className="text-accent">.</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
            <Link to="/shop" className="hover:text-accent">Shop</Link>
            {categories.slice(0, 3).map((c: any) => (
              <Link key={c._id} to={`/shop?category=${c.slug}`} className="text-muted-foreground hover:text-foreground">{c.name}</Link>
            ))}
            <Link to="/vendors" className="text-muted-foreground hover:text-foreground">Vendors</Link>
            <Link to="/vendor/onboarding" className="text-muted-foreground hover:text-foreground">Sell</Link>
          </nav>
        </div>

        <form onSubmit={submit} className="hidden flex-1 max-w-md md:flex">
          <div className="relative flex w-full items-center">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, vendors…" className="h-10 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm outline-none transition focus:border-foreground" />
          </div>
        </form>

        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-muted md:flex">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Link to="/wishlist" className="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-muted md:flex">
            <Heart className="h-4 w-4" />
            {wishlist.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">{wishlist.length}</span>}
          </Link>
          <Link to={user ? "/account" : "/login"} className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-muted md:flex">
            <User className="h-4 w-4" />
          </Link>
          <Link to="/cart" className="relative flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background hover:opacity-90">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">{cartCount}</span>}
          </Link>
          <button onClick={() => setOpen((v) => !v)} className="h-10 w-10 lg:hidden" aria-label="Menu">
            {open ? <X className="mx-auto h-5 w-5" /> : <Menu className="mx-auto h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={cn("border-t border-border bg-card lg:hidden", open ? "block" : "hidden")}>
        <div className="container-page space-y-1 py-3">
          <form onSubmit={submit} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none" />
            </div>
          </form>
          {[{ to: "/shop", label: "Shop" }, ...categories.map((c: any) => ({ to: `/shop?category=${c.slug}`, label: c.name })), { to: "/vendors", label: "Vendors" }, { to: "/vendor/onboarding", label: "Become a Vendor" }, { to: "/wishlist", label: "Wishlist" }, { to: user ? "/account" : "/login", label: user ? "Account" : "Sign in" }].map((l) => (
            <Link key={l.to + l.label} to={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted">{l.label}</Link>
          ))}
        </div>
      </div>
    </header>
  );
}
