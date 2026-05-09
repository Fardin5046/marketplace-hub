import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const [params] = useSearchParams();
  const isVendor = params.get("role") === "vendor";
  const { signIn } = useStore();
  const nav = useNavigate();
  const [data, setData] = useState({ name: "", email: "", pw: "", store: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name || !data.email || !data.pw) { toast.error("All fields are required."); return; }
    if (isVendor && !data.store) { toast.error("Store name is required."); return; }
    if (data.pw.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      if (isVendor) {
        await authApi.registerVendor({ name: data.name, email: data.email, password: data.pw, storeName: data.store });
      } else {
        await authApi.registerCustomer({ name: data.name, email: data.email, password: data.pw });
      }
      // Use signIn to properly load user + cart + wishlist
      await signIn(data.email, data.pw);
      toast.success("Account created!");
      nav(isVendor ? "/vendor" : "/account");
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden bg-foreground text-background lg:block relative overflow-hidden p-12">
        <Link to="/" className="text-2xl font-extrabold">Marketly<span className="text-accent">.</span></Link>
        <div className="mt-24 max-w-sm">
          <h2 className="text-4xl font-extrabold leading-tight">Join 12,000+ {isVendor ? "vendors" : "shoppers"} on Marketly.</h2>
          <ul className="mt-8 space-y-3 text-sm text-background/80">
            {(isVendor
              ? ["Up to 92% revenue share", "Free analytics dashboard", "Same-day payouts available", "1-on-1 onboarding support"]
              : ["Curated quality from real vendors", "Free shipping over $80", "30-day no-questions returns", "Earn rewards with every order"]
            ).map((b) => (
              <li key={b} className="flex items-center gap-3"><Check className="h-4 w-4 text-accent" />{b}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <Link to="/" className="text-2xl font-extrabold tracking-tight lg:hidden">Marketly<span className="text-accent">.</span></Link>
        <div className="lg:mt-0 mt-12 max-w-md">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">Get started</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{isVendor ? "Open your store" : "Create your account"}</h1>
          <p className="mt-3 text-muted-foreground">It takes less than a minute.</p>

          <form onSubmit={submit} className="mt-10 space-y-4">
            {isVendor && <Field label="Store name" placeholder="Northwind Audio" value={data.store} onChange={(v) => setData({ ...data, store: v })} />}
            <Field label="Full name" placeholder="Maya Kapoor" value={data.name} onChange={(v) => setData({ ...data, name: v })} />
            <Field label="Email" type="email" placeholder="you@example.com" value={data.email} onChange={(v) => setData({ ...data, email: v })} />
            <Field label="Password" type="password" placeholder="At least 6 characters" value={data.pw} onChange={(v) => setData({ ...data, pw: v })} />
            <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" className="mt-0.5 accent-foreground" required />I agree to the <Link to="#" className="underline">Terms</Link> and <Link to="#" className="underline">Privacy Policy</Link>.</label>
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50">{busy ? "Creating…" : isVendor ? "Open store" : "Create account"} <ArrowRight className="h-4 w-4" /></button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-foreground hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = "text", value, onChange }: { label: string; placeholder?: string; type?: string; value: string; onChange: (v: string) => void; }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
