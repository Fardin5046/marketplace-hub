import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star } from "lucide-react";
import { productApi } from "@/lib/api";

// Use a direct fetch to the public vendors endpoint
const fetchPublicVendors = async () => {
  const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const res = await fetch(`${BASE}/vendors/public`, { credentials: 'include' });
  const data = await res.json();
  return data;
};

export default function Vendors() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchPublicVendors()
      .then((d: any) => setVendors(d.vendors || []))
      .catch(() => {});
  }, []);

  const filtered = vendors.filter((v: any) => !q || v.storeName?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-extrabold tracking-tight">Our vendors</h1>
      <p className="mt-2 text-muted-foreground">Hand-picked independent sellers you can trust.</p>
      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vendors…" className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none focus:border-foreground" />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No vendors found.</p>}
        {filtered.map((v: any) => (
          <div key={v._id} className="card-surface hover-lift overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-muted to-card" />
            <div className="px-5 pb-5">
              <img src={v.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${v.storeName}`} alt={v.storeName} className="-mt-8 h-14 w-14 rounded-2xl border-4 border-card" />
              <h3 className="mt-3 font-bold">{v.storeName}</h3>
              <p className="text-xs text-muted-foreground">{v.tagline || "Independent seller"}</p>
              <div className="mt-3 flex items-center gap-3 text-xs"><Star className="h-3 w-3 fill-foreground" />{(v.ratingAverage || 0).toFixed(1)}<span className="text-muted-foreground">· {v.totalSales || 0} sales</span></div>
              <Link to={`/shop?vendor=${v.user}`} className="mt-4 block rounded-full border border-border py-2 text-center text-xs font-semibold hover:border-foreground">Visit store</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
