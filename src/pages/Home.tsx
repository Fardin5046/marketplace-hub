import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, Star, Cpu, Shirt, Lamp, Dumbbell, BookOpen } from "lucide-react";
import { productApi, categoryApi } from "@/lib/api";
import { formatPrice, productImage } from "@/lib/mock-data";
import { ProductCard } from "@/components/marketplace/ProductCard";

const iconMap = { Cpu, Shirt, Lamp, Sparkles, Dumbbell, BookOpen } as Record<string, any>;

const testimonials = [
  { name: "Sasha M.", role: "Verified buyer", quote: "Marketly is the only marketplace where I trust every vendor. The curation is unmatched.", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sasha" },
  { name: "Jordan P.", role: "Verified buyer", quote: "I've replaced three apps with this. Checkout is the smoothest I've used in years.", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Jordan" },
  { name: "Elena R.", role: "Vendor since 2022", quote: "My revenue tripled in 8 months. The dashboard tells me exactly what to ship next.", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Elena" },
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    productApi.list({ limit: 8 }).then((d: any) => setProducts(d.products || [])).catch(() => {});
    categoryApi.list().then((cats: any) => setCategories(Array.isArray(cats) ? cats : [])).catch(() => {});
  }, []);

  const trending = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <div>
      {/* HERO */}
      <section className="container-page pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="chip"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Over 12,000 vendors worldwide</div>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight leading-[1.05] sm:text-6xl lg:text-7xl">
              Shop smarter from <span className="font-serif font-normal text-accent">independent</span> sellers.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Marketly is a curated marketplace connecting you to thousands of trusted vendors. Quality you can feel, prices you'll love.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-sm font-semibold text-background hover:opacity-90">Start shopping <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/vendor/onboarding" className="rounded-full border border-border bg-card px-7 py-4 text-sm font-semibold hover:border-foreground">Sell on Marketly</Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <div><div className="text-2xl font-extrabold">12K+</div><div className="text-xs text-muted-foreground">Vendors</div></div>
              <div><div className="text-2xl font-extrabold">2M+</div><div className="text-xs text-muted-foreground">Products</div></div>
              <div><div className="text-2xl font-extrabold flex items-center gap-1">4.9<Star className="h-4 w-4 fill-foreground" /></div><div className="text-xs text-muted-foreground">Avg rating</div></div>
            </div>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-muted">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80" loading="lazy" alt="Fashion" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="aspect-square overflow-hidden rounded-3xl bg-muted">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80" loading="lazy" alt="Audio" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-square rounded-3xl bg-accent text-accent-foreground p-5 flex flex-col justify-between">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">Flash deal</div>
                <div>
                  <div className="text-4xl font-extrabold leading-none">-40%</div>
                  <div className="mt-1 text-xs opacity-90">Limited time offer</div>
                  <Link to="/shop" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold underline">Shop deals <ArrowRight className="h-3 w-3" /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-12">
        <div className="flex items-end justify-between mb-8">
          <div><h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Shop by category</h2><p className="mt-2 text-muted-foreground">Explore curated collections from our top vendors.</p></div>
          <Link to="/shop" className="hidden text-sm font-semibold underline-offset-4 hover:underline sm:inline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c: any) => {
            const Icon = iconMap[c.icon] || Sparkles;
            return (
              <Link key={c._id} to={`/shop?category=${c.slug}`} className="group card-surface hover-lift overflow-hidden">
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  {c.image && <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                </div>
                <div className="p-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <p className="mt-1 text-sm font-bold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{(c.productCount || 0).toLocaleString()} items</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TRENDING */}
      {trending.length > 0 && (
        <section className="container-page py-12">
          <SectionHeader title="Trending now" sub="What shoppers are loving this week" to="/shop" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {trending.map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="container-page py-12">
          <SectionHeader title="New arrivals" sub="Fresh in this week" to="/shop?sort=new" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {newArrivals.map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="container-page py-12">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-center">Loved by <span className="font-serif font-normal text-accent">shoppers</span> & vendors</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="card-surface p-6">
              <div className="flex gap-0.5 text-accent">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full bg-muted" />
                <div><p className="text-sm font-bold">{t.name}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="container-page py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Truck, title: "Free shipping", body: "On orders over $80 worldwide" },
            { icon: ShieldCheck, title: "Buyer protection", body: "Full refund within 30 days" },
            { icon: RotateCcw, title: "Easy returns", body: "No questions asked, ever" },
            { icon: Sparkles, title: "Curated quality", body: "Every vendor reviewed by us" },
          ].map((b) => (
            <div key={b.title} className="card-surface flex gap-4 p-5">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-muted shrink-0"><b.icon className="h-5 w-5" /></div>
              <div><p className="font-bold">{b.title}</p><p className="text-sm text-muted-foreground">{b.body}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, sub, to }: { title: string; sub: string; to: string }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div><h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2><p className="mt-2 text-muted-foreground">{sub}</p></div>
      <Link to={to} className="hidden text-sm font-semibold underline-offset-4 hover:underline sm:inline">View all <ArrowRight className="inline h-3 w-3" /></Link>
    </div>
  );
}
