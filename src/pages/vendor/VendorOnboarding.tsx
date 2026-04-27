import { Link } from "react-router-dom";
import { ArrowRight, Check, Store, TrendingUp, Users, Wallet } from "lucide-react";

export default function VendorOnboarding() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-extrabold">Marketly<span className="text-accent">.</span></Link>
          <Link to="/login?role=vendor" className="text-sm font-semibold">Vendor login →</Link>
        </div>
      </header>

      <section className="container-page py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent">For independent sellers</p>
            <h1 className="mt-3 text-5xl font-extrabold tracking-tight lg:text-6xl">Sell more. <span className="font-serif font-normal">Stress less.</span></h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-md">Open your store on Marketly in under 5 minutes. We handle the platform, you focus on what you make.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register?role=vendor" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-sm font-semibold text-background">Open my store <ArrowRight className="h-4 w-4" /></Link>
              <Link to="#how" className="rounded-full border border-border px-7 py-4 text-sm font-semibold hover:border-foreground">How it works</Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <div><p className="text-2xl font-extrabold">92%</p><p className="text-xs text-muted-foreground">Revenue share</p></div>
              <div><p className="text-2xl font-extrabold">5 min</p><p className="text-xs text-muted-foreground">To launch</p></div>
              <div><p className="text-2xl font-extrabold">$0</p><p className="text-xs text-muted-foreground">Listing fees</p></div>
            </div>
          </div>
          <div className="card-surface p-8 bg-foreground text-background border-foreground">
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Onboarding in 4 steps</p>
            <ol className="mt-6 space-y-5">
              {["Create your store account", "Add 1+ product with photos", "Set up your payout method", "Get approved & start selling"].map((s, i) => (
                <li key={s} className="flex gap-4">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground text-sm font-bold shrink-0">{i + 1}</div>
                  <div className="pt-1.5"><p className="font-semibold">{s}</p></div>
                </li>
              ))}
            </ol>
            <Link to="/register?role=vendor" className="mt-8 grid place-items-center rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground">Get started — it's free</Link>
          </div>
        </div>
      </section>

      <section id="how" className="container-page py-16">
        <h2 className="text-3xl font-extrabold tracking-tight text-center">Why thousands of vendors choose us</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Store, title: "Beautiful storefront", body: "Your products presented at their best, on every device." },
            { icon: TrendingUp, title: "Built-in analytics", body: "Know what sells, when, and to whom — instantly." },
            { icon: Users, title: "2M+ shoppers", body: "Tap into our active community of curated buyers." },
            { icon: Wallet, title: "Same-day payouts", body: "Get paid the moment your orders ship." },
          ].map((f) => (
            <div key={f.title} className="card-surface p-6">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-muted"><f.icon className="h-5 w-5" /></div>
              <p className="mt-4 font-bold">{f.title}</p><p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
