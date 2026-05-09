import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [params] = useSearchParams();
  const role = params.get("role") || "customer";
  const { signIn } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) { toast.error("Please enter email and password."); return; }
    setBusy(true);
    try {
      const data = await signIn(email, pw);
      const r = data.user?.role || role;
      toast.success("Welcome back!");
      nav(r === "vendor" ? "/vendor" : r === "admin" ? "/admin" : "/account");
    } catch (err: any) {
      toast.error(err.message || "Login failed.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">Marketly<span className="text-accent">.</span></Link>
        <div className="mt-16 max-w-md">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">Welcome back</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Sign in to your account</h1>
          <p className="mt-3 text-muted-foreground">Continue your premium shopping experience.</p>

          <form onSubmit={submit} className="mt-10 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-foreground" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</span>
              <div className="relative">
                <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className="h-12 w-full rounded-xl border border-border bg-card px-4 pr-12 text-sm outline-none focus:border-foreground" />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-4 top-3.5 text-muted-foreground">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </label>
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50">{busy ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" /></button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground">New to Marketly? <Link to="/register" className="font-semibold text-foreground hover:underline">Create an account</Link></p>
          <p className="mt-2 text-xs text-muted-foreground">Are you a vendor? <Link to="/login?role=vendor" className="underline">Vendor login</Link></p>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-background">
          <p className="font-serif text-3xl leading-snug">"The only marketplace I trust. Every vendor feels hand-picked."</p>
          <p className="mt-3 text-sm opacity-80">— Sasha M., verified buyer</p>
        </div>
      </div>
    </div>
  );
}
