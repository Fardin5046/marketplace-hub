import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { User, MapPin, Package, Heart, Star, Settings, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/account", label: "Profile", icon: User, end: true },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/orders", label: "Orders", icon: Package },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/reviews", label: "Reviews", icon: Star },
  { to: "/account/settings", label: "Settings", icon: Settings },
];

export default function CustomerLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const { signOut } = useStore();

  const handleSignOut = async () => {
    await signOut();
    nav("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <h2 className="mb-4 text-2xl font-bold">My account</h2>
            <nav className="card-surface overflow-hidden p-2">
              {tabs.map((t) => {
                const active = t.end ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
                return (
                  <Link key={t.to} to={t.to} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                    <t.icon className="h-4 w-4" />{t.label}
                  </Link>
                );
              })}
              <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </nav>
          </aside>
          <div><Outlet /></div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
