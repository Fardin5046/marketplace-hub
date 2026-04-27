import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card mt-24">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <div>
            <Link to="/" className="text-2xl font-extrabold tracking-tight">Marketly<span className="text-accent">.</span></Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">A premium marketplace connecting shoppers to thousands of independent sellers worldwide.</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex max-w-sm gap-2">
              <input type="email" placeholder="your@email.com" className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-foreground" />
              <button className="h-11 rounded-full bg-foreground px-5 text-sm font-semibold text-background hover:opacity-90">Subscribe</button>
            </form>
          </div>
          {[
            { title: "Shop", links: [["All products", "/shop"], ["New arrivals", "/shop?sort=new"], ["Best sellers", "/shop?sort=best"], ["Vendors", "/vendors"]] },
            { title: "Sell", links: [["Become a vendor", "/vendor/onboarding"], ["Vendor login", "/login?role=vendor"], ["Pricing", "#"], ["Resources", "#"]] },
            { title: "Company", links: [["About", "#"], ["Careers", "#"], ["Press", "#"], ["Contact", "#"]] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wider">{col.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map(([label, to]) => (
                  <li key={label}><Link to={to} className="text-muted-foreground hover:text-foreground">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© 2026 Marketly. A university capstone project.</p>
          <div className="flex gap-5">
            <Link to="#">Privacy</Link><Link to="#">Terms</Link><Link to="#">Cookies</Link>
            <Link to="/admin/login" className="hover:text-foreground">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
